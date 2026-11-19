const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=file=>fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8');
const load=file=>import('data:text/javascript;base64,'+Buffer.from(source(file)).toString('base64'));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const user=uid=>({uid,getIdToken:async()=> 'token-'+uid});
function setup(adapter,initial={}) {
  const data=new Map(Object.entries(initial)); const changes=[],status=[];
  return load('js/saved-store.js').then(({SavedStore})=>({store:new SavedStore({storage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},adapter,onChange:x=>changes.push(x),onStatus:x=>status.push(x)}),data,changes,status}));
}
test('legacy cache is preserved without assigning it to a new account; logout clears visible data',async()=>{
  const {store,data}=await setup({read:async()=>['cloud'],update:async()=>{}},{soriSaved:'["legacy"]'});
  await store.setUser(user('A'));
  assert.deepEqual(store.list,['cloud']); assert.equal(data.get('soriSaved:legacy-backup'),'["legacy"]');
  await store.setUser(null); assert.deepEqual(store.list,[]); assert.equal(data.get('soriSaved'),'[]');
});
test('a late read cannot replace the next account data',async()=>{
  const slow=deferred();const {store}=await setup({read:u=>u.uid==='A'?slow.promise:Promise.resolve(['B-item']),update:async()=>{}});
  const first=store.setUser(user('A'));await store.setUser(user('B'));slow.resolve(['A-item']);await first;
  assert.deepEqual(store.list,['B-item']);
});
test('a successful edit during a slow initial read survives that stale read',async()=>{
  const slow=deferred(); const {store}=await setup({read:()=>slow.promise,update:async()=>{}});
  const ready=store.setUser(user('A'));store.toggle('new');await store.queue;
  slow.resolve(['existing']);await ready;
  assert.deepEqual(new Set(store.list),new Set(['existing','new']));
});
test('failed removal stays pending and is replayed without resurrecting the removed phrase',async()=>{
  let fail=true;const writes=[];
  const {store,data}=await setup({read:async()=>['old'],update:async(u,id,saved)=>{writes.push([u.uid,id,saved]);if(fail)throw new Error('offline');}});
  await store.setUser(user('A')); store.toggle('old');await store.queue;
  assert.deepEqual(store.list,[]);assert.equal(JSON.parse(data.get('soriSaved:user:A')).pending.old.saved,false);
  fail=false; await store.setUser(user('A'));await store.queue;
  assert.deepEqual(store.list,[]);assert.deepEqual(JSON.parse(data.get('soriSaved:user:A')).pending,{});assert.equal(writes.length,2);
});
test('switching account cancels queued writes for the old account',async()=>{
  const gate=deferred(),writes=[];const {store}=await setup({read:async()=>[],update:async(u,id)=>{writes.push([u.uid,id]);await gate.promise;}});
  await store.setUser(user('A'));store.toggle('one');store.toggle('two');await tick();
  await store.setUser(user('B'));gate.resolve();await tick();assert.deepEqual(writes,[['A','one']]);assert.deepEqual(store.list,[]);
});
test('Supabase adapter uses Firebase token and refuses operations after account switch',async()=>{
  const {createSupabaseAdapter}=await load('js/supabase-adapter.js');const calls=[];const u=user('A');const auth={currentUser:u};
  const adapter=createSupabaseAdapter({supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'public'},auth,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>[{phrase_id:'daily:test'}]};});
  assert.deepEqual(await adapter.read(u),['daily:test']);await adapter.update(u,'daily:test',false);
  assert.equal(calls[0].options.headers.Authorization,'Bearer token-A');assert.equal(calls[1].options.method,'DELETE');
  auth.currentUser=user('B');await assert.rejects(adapter.update(u,'x',true),/Account changed/);assert.equal(calls.length,2);
});
test('Supabase HTTP errors propagate instead of reporting saved',async()=>{
  const {createSupabaseAdapter}=await load('js/supabase-adapter.js');const u=user('A');
  const adapter=createSupabaseAdapter({supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'public'},{currentUser:u},async()=>({ok:false,status:403}));
  await assert.rejects(adapter.update(u,'x',true),/403/);
});
function audioHarness(request) {
  const audios=[],revoked=[],timers=[];
  class Audio {constructor(){audios.push(this);}pause(){}play(){return Promise.resolve();}}
  const context={window:{},Audio,AbortController,fetch:request,URL:{createObjectURL:()=> 'blob:audio-'+audios.length,revokeObjectURL:x=>revoked.push(x)},setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){}};
  vm.runInNewContext(source('js/tts.js'),context);return {tts:context.window.SORI.TTS,audios,revoked,timers};
}
const audioResponse={ok:true,blob:async()=>({size:5,type:'audio/mpeg'})};
test('audio resolves at playback end, cleans up URL and preserves native speech APIs',async()=>{
  const h=audioHarness(async()=>audioResponse);let complete=false;const p=h.tts.speak('안녕',{rate:0.7}).then(()=>{complete=true;});await tick();
  assert.equal(complete,false);assert.equal(h.audios[0].playbackRate,0.7);h.audios[0].onended();await p;assert.equal(complete,true);assert.equal(h.revoked.length,1);
});
test('new playback cancels old request and ignores late audio',async()=>{
  const slow=deferred();let calls=0;const h=audioHarness(()=>++calls===1?slow.promise:Promise.resolve(audioResponse));
  const first=h.tts.speak('one');const rejected=assert.rejects(first,e=>e.name==='AbortError');const second=h.tts.speak('two');await rejected;
  slow.resolve(audioResponse);await tick();assert.equal(h.audios[0].src,undefined);h.audios[1].onended();await second;
});
test('repeat listening reuses the validated audio and preserves natural pitch at slower speeds',async()=>{
 let requests=0;const h=audioHarness(async()=>{requests++;return audioResponse;});let starts=0;
 const first=h.tts.speak('반복',{rate:1,onPlaying(){starts++;}});await tick();h.audios[0].onended();await first;
 const again=h.tts.speak('반복',{rate:0.65,onPlaying(){starts++;}});await tick();assert.equal(requests,1);assert.equal(h.audios[1].preservesPitch,true);assert.equal(h.audios[1].playbackRate,0.65);h.audios[1].onended();await again;assert.equal(starts,2);assert.equal(h.revoked.length,2);
});
test('HTTP error, invalid content, playback rejection and timeout all reject',async()=>{
  for(const response of [{ok:false,status:500},{ok:true,blob:async()=>({size:1,type:'application/json'})}]) {
    const h=audioHarness(async()=>response);await assert.rejects(h.tts.speak('test'));
  }
  const h=audioHarness(async()=>audioResponse);const p=h.tts.speak('test');h.audios[0].play=()=>Promise.reject(new Error('blocked'));await assert.rejects(p,/blocked/);assert.equal(h.revoked.length,1);
  const slow=audioHarness(()=>new Promise(()=>{}));const pending=slow.tts.speak('test');slow.timers[0]();await assert.rejects(pending,/timed out/);
});
test('authentication API deduplicates login and falls back only on popup-blocked',async()=>{
  const gate=deferred();let popup=0,redirect=0,logout=0;
  const context={window:{dispatchEvent(){}},CustomEvent:class{},auth:{currentUser:null},provider:{},authReady:Promise.resolve(),signInWithPopup:()=>{popup++;return gate.promise;},signInWithRedirect:async()=>{redirect++;},getRedirectResult:async()=>null,signOut:async()=>{logout++;},onAuthStateChanged:()=>()=>{}};
  vm.runInNewContext(source('js/auth.js').replace(/^import .*;$/gm,''),context);
  const a=context.window.SoriUser.login(),b=context.window.SoriUser.login();assert.equal(a,b);await tick();assert.equal(popup,1);
  gate.reject(Object.assign(new Error('blocked'),{code:'auth/popup-blocked'}));await a;assert.equal(redirect,1);await context.window.SoriUser.logout();assert.equal(logout,1);
});
test('local module graph never initializes one file under two different query URLs',()=>{
  const html=source('index.html');const paths=new Map(),seen=new Set();
  function visit(url) {
    if(seen.has(url.href))return;seen.add(url.href);
    const previous=paths.get(url.pathname);assert.ok(!previous||previous===url.href,'Duplicate module identity: '+url.pathname);paths.set(url.pathname,url.href);
    const text=source(url.pathname.slice(1));
    for(const match of text.matchAll(/^import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/gm)){
      const child=new URL(match[1],url);if(child.origin===url.origin)visit(child);
    }
  }
  for(const match of html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g))visit(new URL(match[1],'https://sori.test/'));
  assert.ok(paths.has('/js/state.js'));assert.ok(paths.has('/js/saved-store.js'));
});

test('analytics page views omit private invitation fragments and query strings',()=>{
  const html=source('index.html');const block=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function buildPath()'));
  const events=[],handlers={};
  const context={window:{},location:{href:'https://sorikorea.com/?private=hidden#invite=private-invitation',origin:'https://sorikorea.com',pathname:'/'},document:{title:'Sori',visibilityState:'visible',querySelector:()=>({id:'dailyBtn'}),getElementById:()=>null,addEventListener:(n,f)=>{handlers[n]=f;}},badge:{textContent:'Shopping'},prog:{textContent:'1 / 100'},nextBtn:null,prevBtn:null,speed:null,setTimeout:f=>f(),gtag:(...args)=>events.push(args)};
  vm.runInNewContext(block,context);handlers.DOMContentLoaded();handlers.visibilitychange();
  const pageViews=events.filter(e=>e[1]==='page_view');assert.equal(pageViews.length,2);
  for(const event of pageViews)assert.equal(event[2].page_location,'https://sorikorea.com/');
});
