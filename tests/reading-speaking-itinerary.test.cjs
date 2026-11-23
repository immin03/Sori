const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const places=require('../data/places.json');
const stories=require('../data/stories.json');

test('all conversation turns lead to exact Korean lessons', async()=>{
 const {scenes}=await import('../js/learning/scenes.js');
 const ctx=vm.createContext({window:{},console:{log(){}}});
 for(const n of ['daily','travel','drama','trendy','numbers','dataindex'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../data',n+'.js'),'utf8'),ctx);
 const rows=Object.values(ctx.window.SoriDataIndex).flat();
 for(const s of Object.values(scenes)){
   assert.equal(s.turns.length,3);assert.equal(new Set(s.turns.map(t=>t[3])).size,3);
   for(const [ko,en,intent,reply,hint] of s.turns){assert.match(ko,/[가-힣]/);assert.ok(en&&intent&&hint);assert.ok(rows.some(p=>p.k===reply));}
 }
});

test('legacy daily practice and different conversations resume on the correct turn',async()=>{
 const {PracticeProgress}=await import('../js/learning/progress.js');
 const raw=new Map([['sori:practice:v1:device',JSON.stringify({session:{ids:['a','b','c'],index:1}})]]),storage={getItem:k=>raw.get(k),setItem:(k,v)=>raw.set(k,v)};
 const options={storage,ids:['a','b','c','d','e']},p=new PracticeProgress(options);
 assert.equal(p.sessionFor('daily').index,1);p.start(['d','c','a'],{kind:'cafe'});p.answer('again');p.start(['b','a','e'],{kind:'market'});p.answer('remembered');
 const reopened=new PracticeProgress(options);
 assert.equal(reopened.sessionFor('market').index,1);assert.deepEqual(reopened.start(['a'],{kind:'cafe'}),{kind:'cafe',ids:['d','c','a'],index:1});
 assert.equal(reopened.start(['e'],{kind:'daily'}).index,1);
 reopened.setUser('other');assert.equal(reopened.sessionFor('cafe'),null);reopened.setUser(null);assert.equal(reopened.sessionFor('cafe').index,1);
});

test('public itinerary links contain only the ordered public stops of one city',async()=>{
 const {readPublicDay,publicDayUrl}=await import('../js/guide/public-day.js');
 const from=s=>readPublicDay(new URLSearchParams(s),places);
 assert.equal(from('day=seoul').stops.length,3);assert.equal(from('day=busan').stops[0],'haeundae-beach');
 const link=publicDayUrl('https://example.com/?code=secret#invite=secret','seoul',['market','tea'],places);
 assert.equal(link,'https://example.com/#day=seoul&stops=market%2Ctea');assert.deepEqual(from(new URL(link).hash.slice(1)).stops,['market','tea']);
 for(const bad of ['day=tokyo','day=seoul&stops=market,market','day=seoul&stops=mipo','day=seoul&stops=','day=seoul&stops=private','day=toString'])assert.equal(from(bad),null);
});

test('archive search combines topic, saved entries and Korean or English terms',async()=>{
 const {matchingStories,nextStory}=await import('../js/stories/archive.js');
 const story=stories[0],saved=[story.id];assert.deepEqual(matchingStories(stories,'Saved',story.phrase,saved),[story]);assert.deepEqual(matchingStories(stories,'Saved','',[]),[]);
 assert.ok(matchingStories(stories,'All',story.title.toUpperCase(),[]).includes(story));assert.equal(matchingStories(stories,'All','xxxxxyyyyy',[]).length,0);
 assert.notEqual(nextStory(stories,story.id).id,story.id);assert.equal(nextStory([story],story.id),null);
});

function voiceFixture(getMic){
 const compare={hidden:true},record={},player={hidden:true,addEventListener(){},pause(){},removeAttribute(){delete this.src;}},status={};
 const container={querySelector:k=>k==='audio'?player:k==='[role=status]'?status:k==='[data-compare-reply]'?compare:record};
 let timer=null,ended=0,revoked=0;
 const stream={getTracks:()=>[{stop(){ended++;}}]};
 class MediaRecorder{
   constructor(){this.state='inactive';this.mimeType='audio/webm';}
   start(){this.state='recording';}
   stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable({data:new Blob(['example'])});this.onstop();});}
 }
 const env={navigator:{mediaDevices:{getUserMedia:getMic||(()=>Promise.resolve(stream))}},MediaRecorder,URL:{createObjectURL:()=>'blob:example',revokeObjectURL(){revoked++;}},setTimeout:fn=>(timer=fn),clearTimeout(){timer=null;}};
 return {container,env,record,compare,player,status,stream,timeOut:()=>timer(),stats:()=>({ended,revoked})};
}

test('a local reply stops at the time limit and releases its clip on exit',async()=>{
 const {attachVoiceReply}=await import('../js/learning/voice-reply.js'),f=voiceFixture(),take=attachVoiceReply(f.container,f.env);
 await f.record.onclick();assert.equal(f.record.textContent,'Stop recording');f.timeOut();await new Promise(r=>setImmediate(r));
 assert.equal(f.player.src,'blob:example');assert.equal(f.player.hidden,false);assert.equal(f.stats().ended,1);
 take.dispose();assert.equal(f.stats().revoked,1);assert.equal(f.player.hidden,true);
});

test('permission denial, a late grant and navigating away leave the microphone idle',async()=>{
 const {attachVoiceReply}=await import('../js/learning/voice-reply.js');
 let done;const f=voiceFixture(()=>new Promise(r=>done=r)),v=attachVoiceReply(f.container,f.env),pending=f.record.onclick();v.onModel();done(f.stream);await pending;assert.equal(f.stats().ended,1);assert.equal(f.player.hidden,true);
 const g=voiceFixture(async()=>{throw Object.assign(Error(),{name:'NotAllowedError'});});const other=attachVoiceReply(g.container,g.env);await g.record.onclick();assert.match(g.status.textContent,/Microphone access is off/);assert.equal(g.record.disabled,false);other.dispose();
 const h=voiceFixture(()=>new Promise(r=>done=r)),old=attachVoiceReply(h.container,h.env),waiting=h.record.onclick();old.dispose();done(h.stream);await waiting;assert.equal(h.stats().ended,1);
});

test('comparison plays the model before the local reply and discards interrupted comparisons',async()=>{
 const {attachVoiceReply}=await import('../js/learning/voice-reply.js'),f=voiceFixture(),calls=[];
 let finish;f.env.SORI={TTS:{cancel(){},speak(text){calls.push(text);return new Promise(r=>finish=r);}}};
 f.player.play=async()=>{calls.push('own reply');};
 const take=attachVoiceReply(f.container,f.env);
 await f.record.onclick();f.timeOut();await new Promise(r=>setImmediate(r));assert.equal(f.compare.hidden,true);
 take.allowModel('안녕하세요.');assert.equal(f.compare.hidden,false);
 const first=f.compare.onclick();assert.deepEqual(calls,['안녕하세요.']);finish();await first;assert.equal(calls.at(-1),'own reply');
 const second=f.compare.onclick();take.dispose();finish();await second;assert.deepEqual(calls,['안녕하세요.','own reply','안녕하세요.']);
});

test('all original phrase situations remain discoverable at all levels', async()=>{
 const {situationGroups,matchingLevel}=await import('../js/learning/categories.js');
 const c=vm.createContext({window:{},console:{log(){}}});
 for(const n of ['daily','travel','drama','trendy','numbers','dataindex'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../data',n+'.js'),'utf8'),c);
 const groups=situationGroups(c.window.SoriDataIndex);
 const rows=groups.flatMap(g=>g.topics.flatMap(t=>t.rows));
 assert.equal(groups.length,5);assert.equal(rows.length,504);
 assert.equal(groups.reduce((n,g)=>n+g.topics.length,0),69);
 assert.equal(groups[0].topics[0].name,'Greeting');
 assert.equal(['essentials','intermediate','nuance'].reduce((n,l)=>n+matchingLevel(rows,l).length,0),rows.length);
 assert.ok(rows.every(r=>r.p&&r.e));
 for(const group of groups.filter(g=>['daily','travel','numbers','trendy'].includes(g.id))) for(const topic of group.topics) for(const level of ['essentials','intermediate','nuance']) assert.ok(matchingLevel(topic.rows,level).length>0,group.id+':'+topic.name+':'+level);
});
