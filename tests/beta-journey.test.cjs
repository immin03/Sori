const {test}=require('node:test');
const assert=require('node:assert/strict');
test('diagnosis and progress survive reload, advance levels, and count one expression once per day',async()=>{
 const {Journey,placement}=await import('../js/learning/journey.js');
 const mem=new Map(),storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
 let now=new Date(2026,10,23,12).getTime();
 const rows=['essentials','intermediate','nuance'].map((level,i)=>({id:String(i),level}));
 const j=new Journey(storage,null,rows,()=>now);
 j.testing=true;j.answer(-1);assert.equal(new Journey(storage,null,rows).data.hits.length,1);
 for(let i=1;i<5;i++)j.answer(-1);
 assert.equal(j.data.level,'essentials');
 assert.equal(placement([true,true,true,true,true]),'nuance');assert.equal(placement([true,true,true,false,false]),'intermediate');
 j.complete('0');j.complete('0');assert.equal(j.data.level,'intermediate');assert.equal(j.stats().xp,10);
 now+=86400000;j.complete('1');assert.equal(j.data.level,'nuance');assert.equal(j.stats().streak,2);
 const signed=new Journey(storage,'first',rows,()=>now);assert.equal(signed.stats().xp,20);
 const other=new Journey(storage,'second',rows,()=>now);assert.equal(other.stats().xp,0);
});
test('a wrong syllable leaves subsequent matches visible and unspoken syllables pending',async()=>{
 const {syllableFeedback}=await import('../js/learning/speech-highlight.js');
 assert.deepEqual(syllableFeedback('밥 먹었어요?','빵 먹었어요',true),['miss','match','match','match','match']);
 assert.deepEqual(syllableFeedback('밥 먹었어요?','밥 먹'),['match','match','pending','pending','pending']);
 assert.deepEqual(syllableFeedback('밥 먹었어요?','밥 먹'),syllableFeedback('밥 먹었어요?','밥먹'));
});
test('member visits deduplicate, survey stays private, and only the verified administrator can list records',async()=>{
 const {createMembers}=await import('../hosting/trips-api/src/members.js');
 const {createDevBucket}=require('../server/dev-bucket.cjs'),bucket=createDevBucket();bucket.list=async()=>({objects:[{key:'sori/beta/members/test-id'}]});
 let now=Date.now(),email='member@example.test';
 const fakePayload=Buffer.from(JSON.stringify({sub:'test-id',aud:'sori-533fc',iss:'https://securetoken.google.com/sori-533fc',firebase:{sign_in_provider:'google.com'}})).toString('base64url');
 const request=new Request('https://example.test/api/member/visit',{headers:{Authorization:'Bearer test.'+fakePayload+'.test'}});
 const svc=createMembers({bucket,adminEmail:'admin@example.test',clock:()=>now,fetcher:async()=>Response.json({users:[{localId:'test-id',email,emailVerified:true,createdAt:String(now-86400000)}]})});
 const visit=()=>svc({request,path:'/member/visit',method:'POST',body:{}});
 assert.equal((await visit()).data.answered,false);await visit();now+=31*60000;await visit();
 await svc({request,path:'/member/feedback',method:'POST',body:{features:['Offline travel maps'],goal:'Study',information:'',idea:''}});
 const read=()=>svc({request,path:'/admin/members',method:'GET',body:{}});
 await assert.rejects(read,e=>e.status===403);email='admin@example.test';const {data}=await read();
 assert.equal(data.members[0].visits,2);assert.equal(data.members[0].feedback.goal,'Study');
 await assert.rejects(()=>svc({request:new Request('https://example.test'),path:'/admin/members',method:'GET'}),e=>e.status===401);
});
