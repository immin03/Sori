const {test}=require('node:test');const assert=require('node:assert/strict');const catalog=require('../data/places.json');
class Bucket{
 constructor(){this.rows=new Map();this.serial=0;}
 async get(k){const row=this.rows.get(k);return row?{etag:row.etag,json:async()=>JSON.parse(row.body)}:null;}
 async put(k,body,options={}){const prior=this.rows.get(k),condition=options.onlyIf||{};if(condition.etagMatches&&prior?.etag!==condition.etagMatches)return null;if(condition.etagDoesNotMatch==='*'&&prior)return null;const etag=String(++this.serial);this.rows.set(k,{etag,body});return {etag};}
}
test('durable document storage preserves collaboration under conditional writes',async t=>{
 const {createObjectTripRpc}=await import('../server/object-trips.js');const {createHandler}=await import('../supabase/functions/sori-trips/handler.js');
 let now=Date.now();const bucket=new Bucket(),rpc=createObjectTripRpc(bucket,{clock:()=>now});
 const handler=createHandler({url:'https://internal.invalid',key:'server-binding',catalog,fetcher:async(_,init)=>Response.json(await rpc(JSON.parse(init.body)))});
 const plan={title:'A Seoul day',food:'local',pace:'balanced',days:[{date:'2026-11-26',area:'north',stops:['palace']}]};
 async function api(path,method='GET',body,token){const r=await handler(new Request('https://api.example/api'+path,{method,headers:{origin:'https://sorikorea.com',...(token?{authorization:'Bearer '+token}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})}));return {status:r.status,data:await r.json()};}
 const owner=await api('/trips','POST',{name:'Owner',plan}),id=owner.data.trip.id,ownerToken=owner.data.memberToken;
 const invitation=async()=>{const r=await api('/trips/'+id+'/invites','POST',{},ownerToken);assert.equal(r.status,201);return r.data.invite;};
 let friend;
 await t.test('persists trips with hash-only membership and no unauthenticated reads',async()=>{
  assert.equal(owner.status,201);assert.equal((await api('/trips/'+id)).status,401);
  assert.equal([...bucket.rows.values()].some(r=>r.body.includes(ownerToken)),false);
  assert.equal((await api('/trips/'+id,'GET',undefined,ownerToken)).data.id,id);
 });
 await t.test('concurrent redemption of one invitation adds exactly one member',async()=>{
  const invite=await invitation();const results=await Promise.all([api('/join','POST',{invite,name:'A'}),api('/join','POST',{invite,name:'B'})]);
  assert.deepEqual(results.map(r=>r.status).sort(),[201,410]);friend=results.find(r=>r.status===201).data;
  assert.equal(friend.trip.members.length,2);
 });
 await t.test('concurrent notes survive CAS retries and stale edits do not overwrite',async()=>{
  const before=(await api('/trips/'+id,'GET',undefined,ownerToken)).data.version;
  const results=await Promise.all([api('/trips/'+id+'/comments','POST',{body:'First idea'},ownerToken),api('/trips/'+id+'/comments','POST',{body:'Second idea'},friend.memberToken)]);assert.ok(results.every(r=>r.status===201));
  const snapshot=(await api('/trips/'+id,'GET',undefined,ownerToken)).data;assert.equal(snapshot.comments.length,2);assert.equal(snapshot.version,before+2);
  assert.equal((await api('/trips/'+id,'PATCH',{version:before,plan},ownerToken)).status,409);
  assert.equal((await api('/trips/'+id,'PATCH',{version:snapshot.version,plan:{...plan,title:'Together'}},friend.memberToken)).status,200);
 });
 await t.test('revocation and expiry reject old links and memberships',async()=>{
  const invite=await invitation();assert.equal((await api('/trips/'+id+'/invites','DELETE',{},friend.memberToken)).status,403);
  await api('/trips/'+id+'/invites','DELETE',{},ownerToken);assert.equal((await api('/join','POST',{invite,name:'Late'})).status,410);
  const expired=await invitation();now+=8*86400000;assert.equal((await api('/invitation','POST',{invite:expired})).status,410);
  await api('/trips/'+id+'/members/'+friend.memberId,'DELETE',{},ownerToken);assert.equal((await api('/trips/'+id,'GET',undefined,friend.memberToken)).status,401);
 });
 await t.test('the stored document never leaks hashes in returned snapshots',async()=>{
  const snapshot=(await api('/trips/'+id,'GET',undefined,ownerToken)).data;
  assert.equal(JSON.stringify(snapshot).includes('token_hash'),false);assert.equal(snapshot.invites,undefined);
 });
});
