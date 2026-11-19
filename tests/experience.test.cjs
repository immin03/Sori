const {test}=require('node:test');const assert=require('node:assert/strict');const {createDevBucket}=require('../server/dev-bucket.cjs');const catalog=require('../data/places.json');
test('the legacy lesson enhancer preserves translation, context and one separate pronunciation line',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const nodes={context:{textContent:'Order'},english:{textContent:'"One americano, please"'},pronunciation:{textContent:'amerikano han jan, juseyo',style:{display:'none',removeProperty(name){delete this[name];}}},korean:{textContent:'아메리카노 한 잔, 주세요.'}};
 const c={window:{},document:{getElementById:id=>nodes[id]||null,addEventListener(){}},setTimeout(fn){fn();}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../data/data-processor.js'),'utf8'),c);
 c.window.applyOnce();c.window.applyOnce();
 assert.equal(nodes.context.textContent,'Order');assert.equal(nodes.english.textContent,'"One americano, please"');assert.equal(nodes.pronunciation.textContent,'amerikano han jan, juseyo');assert.equal(nodes.pronunciation.style.display,undefined);
});
test('trip bases survive storage validation without storing a device location',async()=>{
 const {validateTrip}=await import('../supabase/functions/sori-trips/validation.js');const base={title:'Our map',food:'local',days:[{date:'2026-11-26',area:'north',stops:['palace']}],journey:{arrival:'gmp',origin:'current',hotel:{label:'A public hotel',lat:37.56,lng:126.98},currentLocation:{lat:37.5,lng:127},returnToHotel:true}};
 const p=validateTrip(base,catalog);assert.equal(p.journey.hotel.label,'A public hotel');assert.equal(p.journey.currentLocation,undefined);assert.equal(p.journey.origin,'current');
 for(const bad of [{...base.journey,arrival:'unknown'},{...base.journey,hotel:{label:'Bad',lat:1,lng:2}},{...base.journey,hotel:{label:'Bad',lat:NaN,lng:127}}])assert.throws(()=>validateTrip({...base,journey:bad},catalog));
 assert.equal(validateTrip({...base,journey:undefined},catalog).journey,undefined);
});
test('map route starts at the stay, returns there, and shortest pin order is a true permutation',async()=>{
 const {routePoints,nearbyOrder,kmBetween,googleLeg}=await import('../js/guide/geo.js');const hotel={label:'Stay',lat:37.56,lng:126.98},day={stops:['palace','market','ddp']},journey={hotel,origin:'hotel',returnToHotel:true};
 const points=routePoints(day,catalog,journey);assert.equal(points[0].label,'Stay');assert.equal(points.at(-1).label,'Stay');
 const sorted=nearbyOrder(day.stops,catalog,hotel,hotel);assert.deepEqual(new Set(sorted),new Set(day.stops));const total=ids=>{const p=routePoints({stops:ids},catalog,journey);return p.slice(1).reduce((n,x,i)=>n+kmBetween(p[i],x),0);};assert.ok(total(sorted)<=total(day.stops));
 const url=new URL(googleLeg(hotel,catalog[0],'transit'));assert.equal(url.searchParams.get('origin'),'37.56,126.98');assert.equal(url.searchParams.get('travelmode'),'transit');assert.equal(url.searchParams.has('waypoints'),false);
});
test('hotel search uses an app-wide conditional gate and cache, not autocomplete',async()=>{
 const {createPlaceSearch}=await import('../server/place-search.js');const bucket=createDevBucket();let now=10000,calls=0,release;const gate=new Promise(r=>release=r);const search=createPlaceSearch({bucket,clock:()=>now,fetcher:async(url,options)=>{calls++;assert.ok(url.includes('countrycodes=kr'));assert.ok(options.headers['User-Agent'].includes('sorikorea.com'));await gate;return Response.json([{name:'Example Hotel',lat:'37.56',lon:'126.98',display_name:'Example Hotel, Seoul'}]);}});
 const first=search({q:'Example Hotel',city:'seoul'});await new Promise(r=>setImmediate(r));assert.equal((await search({q:'Another Hotel',city:'seoul'})).status,429);release();assert.equal((await first).data.places.length,1);assert.equal((await search({q:'Example Hotel',city:'seoul'})).status,200);assert.equal(calls,1);assert.equal((await search({q:'x',city:'seoul'})).status,400);
});
test('practice is resumable, spaced, unique per day and isolated across accounts',async()=>{
 const {PracticeProgress}=await import('../js/learning/progress.js');let now=Date.parse('2026-11-19T02:00:00Z');const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};const p=new PracticeProgress({storage,ids:['a','b','c','d','e','f'],clock:()=>now});p.start(['a','b','c','d','e']);assert.equal(p.answer('remembered'),true);assert.equal(p.stats().today,1);assert.equal(p.active().index,1);
 const restored=new PracticeProgress({storage,ids:['a','b','c','d','e','f'],clock:()=>now});assert.equal(restored.active().index,1);restored.answer('again');assert.equal(restored.stats().due,0);now+=11*60000;assert.deepEqual(restored.due(),['b']);restored.setUser('other');assert.equal(restored.stats().today,0);assert.equal(restored.active(),null);restored.setUser(null);assert.equal(restored.stats().today,2);assert.equal(restored.stats().practiced,2);
});
test('community reactions toggle without exposing voters; waitlist never sends mail or claims confirmation',async()=>{
 const {createCommunity}=await import('../server/community.js');const bucket=createDevBucket();let requests=0;const service=createCommunity({bucket,storyIds:['one-story'],fetcher:async()=>{requests++;throw Error('Must not send');}}),token='a'.repeat(43);
 let r=await service({path:'/stories/one-story/reaction',method:'POST',body:{token,value:'useful'},peer:'test'});assert.equal(r.data.useful,1);r=await service({path:'/stories/one-story/reaction',method:'POST',body:{token,value:'curious'},peer:'test'});assert.deepEqual(r.data,{useful:0,curious:1});assert.equal(JSON.stringify([...bucket.rows||[]]).includes(token),false);
 const joined=await service({path:'/newsletter/signup',method:'POST',body:{email:'reader@example.com',consent:true},peer:'test'});assert.equal(joined.data.status,'waitlist');assert.equal(requests,0);assert.ok(joined.data.cancelToken);const removed=await service({path:'/newsletter/unsubscribe',method:'POST',body:{token:joined.data.cancelToken}});assert.equal(removed.data.status,'unsubscribed');
 assert.equal((await service({path:'/newsletter/signup',method:'POST',body:{email:'bad',consent:true},peer:'test'})).status,400);
});
test('email subscriptions require a sent confirmation before becoming active',async()=>{
 const {createCommunity}=await import('../server/community.js');const bucket=createDevBucket();let now=10000000,request;const service=createCommunity({bucket,clock:()=>now,storyIds:[],mailKey:'private-test-key',mailFrom:'Sori <newsletter@example.com>',fetcher:async(url,init)=>{request={url,init};return Response.json({id:'mail'});}});
 const joined=await service({path:'/newsletter/signup',method:'POST',body:{email:'reader@example.com',consent:true},peer:'test'});assert.equal(joined.data.status,'pending');assert.equal(request.url,'https://api.resend.com/emails');assert.equal(JSON.stringify(joined).includes('private-test-key'),false);
 const confirm=await service({path:'/newsletter/confirm',method:'POST',body:{token:joined.data.cancelToken}});assert.equal(confirm.data.status,'confirmed');now+=30*86400000;const unsub=await service({path:'/newsletter/unsubscribe',method:'POST',body:{token:joined.data.cancelToken}});assert.equal(unsub.data.status,'unsubscribed');
});
test('published stories use unique public URLs, real learning phrases and existing local photos',async()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),stories=require('../data/stories.json');const c={window:{},console:{log(){}}};vm.createContext(c);for(const name of ['daily','travel','drama','trendy','numbers','dataindex'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../data/'+name+'.js'),'utf8'),c);const korean=new Set(Object.values(c.window.SoriDataIndex).flat().map(p=>p.k));assert.equal(new Set(stories.map(s=>s.id)).size,stories.length);
 for(const s of stories){assert.match(s.id,/^[a-z0-9-]{1,80}$/);assert.ok(korean.has(s.phrase));assert.ok(fs.existsSync(path.join(__dirname,'..',s.photo)));assert.ok(s.paragraphs.length>=3);assert.ok(s.sources.every(x=>x.url.startsWith('https://')));}
});
test('the actual packaged Worker initializes and serves health without Node build-time helpers',async()=>{
 const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');const cwd=path.join(__dirname,'../hosting/trips-api');const build=spawnSync(process.execPath,['scripts/build.mjs'],{cwd,encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const source=fs.readFileSync(path.join(cwd,'dist/server/index.js'),'utf8');const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));const r=await worker.fetch(new Request('https://example.com/api/health'),{BUCKET:createDevBucket()});assert.equal(r.status,200);assert.equal((await r.json()).collaboration,true);
});
