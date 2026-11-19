const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFile}=require('node:fs/promises');
const {PGlite}=require('@electric-sql/pglite');
const catalog=require('../data/places.json');

test('production trip API against real embedded Postgres',async t=>{
 const pg=new PGlite();
 try{
  await pg.exec('create role anon;create role authenticated;create role service_role bypassrls;');
  await pg.exec(await readFile(require.resolve('../supabase/trip-storage.sql'),'utf8'));
  await pg.exec('set role service_role');
  const {createHandler}=await import('../supabase/functions/sori-trips/handler.js');
  const plan={title:'Our Seoul',food:'local',pace:'balanced',days:[{date:'2026-11-26',area:'north',stops:['palace','insadong']}]};
  let calls=0;
  const handler=createHandler({url:'https://database.example',key:'sb_secret_test_only',catalog,fetcher:async(url,init)=>{
   assert.equal(url,'https://database.example/rest/v1/rpc/sori_trip_request');
   assert.equal(init.headers.apikey,'sb_secret_test_only');assert.equal(init.headers.Authorization,undefined);
   const p=JSON.parse(init.body);calls++;
   const q=await pg.query('select public.sori_trip_request($1,$2::uuid,$3,$4::jsonb,$5,$6) as result',[p.p_action,p.p_trip,p.p_token_hash,JSON.stringify(p.p_body),p.p_new_hash,p.p_rate_bucket]);
   return Response.json(q.rows[0].result);
  }});
  async function api(path,method='GET',body,token,origin='https://sorikorea.com'){
   const response=await handler(new Request('https://project.supabase.co/functions/v1/sori-trips'+path,{method,headers:{origin,'x-forwarded-for':'192.0.2.10',...(token?{authorization:'Bearer '+token}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})}));
   const data=await response.json();return {status:response.status,data,headers:response.headers};
  }
  let owner,guest,tripId;
  await t.test('creates durable records and returns capabilities only to the creator',async()=>{
   owner=await api('/trips','POST',{name:'Owner',plan});assert.equal(owner.status,201);tripId=owner.data.trip.id;
   assert.equal(owner.data.memberToken.length,43);assert.equal(owner.data.trip.members.length,1);
   const read=await api('/trips/'+tripId,'GET',undefined,owner.data.memberToken);assert.equal(read.status,200);
   assert.equal(read.data.memberToken,undefined);assert.equal(JSON.stringify(read.data).includes(owner.data.memberToken),false);
   assert.equal(owner.headers.get('access-control-allow-origin'),'https://sorikorea.com');
  });
  await t.test('single-use invitations add members and reject reuse',async()=>{
   const inv=await api('/trips/'+tripId+'/invites','POST',{},owner.data.memberToken);assert.equal(inv.status,201);
   const preview=await api('/invitation','POST',{invite:inv.data.invite});assert.deepEqual(preview.data,{tripId});
   guest=await api('/join','POST',{name:'Friend',invite:inv.data.invite});assert.equal(guest.status,201);assert.equal(guest.data.trip.members.length,2);
   const reused=await api('/join','POST',{name:'Stranger',invite:inv.data.invite});assert.equal(reused.status,410);
  });
  await t.test('shared comments and version checks prevent lost changes',async()=>{
   const note=await api('/trips/'+tripId+'/comments','POST',{body:'Coffee after the palace?'},guest.data.memberToken);assert.equal(note.status,201);
   const read=await api('/trips/'+tripId,'GET',undefined,owner.data.memberToken);assert.equal(read.data.comments[0].body,'Coffee after the palace?');
   const stale=await api('/trips/'+tripId,'PATCH',{version:1,plan},owner.data.memberToken);assert.equal(stale.status,409);
   const edited={...plan,title:'Seoul with friends'};
   const update=await api('/trips/'+tripId,'PATCH',{version:read.data.version,plan:edited},guest.data.memberToken);assert.equal(update.status,200);assert.equal(update.data.plan.title,edited.title);
  });
  await t.test('membership is required; guests cannot manage invitations',async()=>{
   assert.equal((await api('/trips/'+tripId)).status,401);
   assert.equal((await api('/trips/'+tripId,'GET',undefined,'a'.repeat(43))).status,401);
   assert.equal((await api('/trips/'+tripId+'/invites','POST',{},guest.data.memberToken)).status,403);
   assert.equal((await api('/trips/'+tripId+'/members/'+owner.data.memberId,'DELETE',{},guest.data.memberToken)).status,403);
  });
  await t.test('revocation immediately blocks prior capabilities and unused invites',async()=>{
   const inv=await api('/trips/'+tripId+'/invites','POST',{},owner.data.memberToken);
   assert.equal((await api('/trips/'+tripId+'/invites','DELETE',{},owner.data.memberToken)).status,200);
   assert.equal((await api('/join','POST',{name:'Late',invite:inv.data.invite})).status,410);
   assert.equal((await api('/trips/'+tripId+'/members/'+guest.data.memberId,'DELETE',{},owner.data.memberToken)).status,200);
   assert.equal((await api('/trips/'+tripId,'GET',undefined,guest.data.memberToken)).status,401);
  });
  await t.test('expired invites and concurrent single-use joins are handled in Postgres',async()=>{
   const inv=await api('/trips/'+tripId+'/invites','POST',{},owner.data.memberToken);
   const joins=await Promise.all([api('/join','POST',{name:'First',invite:inv.data.invite}),api('/join','POST',{name:'Second',invite:inv.data.invite})]);
   assert.deepEqual(joins.map(j=>j.status).sort(),[201,410]);
   const toExpire=await api('/trips/'+tripId+'/invites','POST',{},owner.data.memberToken);
   await pg.query("update sori_private.invites set expires_at=now()-interval '1 second' where trip_id=$1",[tripId]);
   assert.equal((await api('/invitation','POST',{invite:toExpire.data.invite})).status,410);
  });
  await t.test('rejects malformed bodies, invalid plans, oversized input and unknown origins',async()=>{
   const before=calls;
   assert.equal((await api('/trips','POST',null)).status,400);
   assert.equal((await api('/trips','POST',[])).status,400);
   assert.equal((await api('/trips','POST',{name:'Bad',plan:{...plan,days:[{date:'2026-02-31',stops:['palace']}]}})).status,400);
   assert.equal((await api('/trips','POST',{name:'Bad',plan:{...plan,days:[{date:'2026-11-26',stops:['invented']}]}})).status,400);
   assert.equal((await api('/trips','POST',{name:'x'.repeat(25000),plan})).status,413);
   assert.equal((await api('/trips','POST',{name:'Bad',plan},undefined,'https://other.example')).status,403);
   assert.equal(calls,before);
  });
  await t.test('service-role-only RPC and private tables deny browser roles',async()=>{
   const r=await pg.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='sori_private' and c.relkind='r' and c.relrowsecurity");assert.equal(r.rows[0].n,5);
   await pg.exec('reset role;set role anon');
   await assert.rejects(pg.query('select * from sori_private.trips'),/permission denied/);
   await assert.rejects(pg.query("select public.sori_trip_request('read')"),/permission denied/);
   await pg.exec('reset role;set role authenticated');
   await assert.rejects(pg.query('select * from sori_private.members'),/permission denied/);
   await assert.rejects(pg.query("select public.sori_trip_request('read')"),/permission denied/);
   await pg.exec('reset role;set role service_role');
  });
  await t.test('the participant cap and creation budget are enforced in the database',async()=>{
   for(let i=0;i<6;i++){
    const inv=await api('/trips/'+tripId+'/invites','POST',{},owner.data.memberToken);
    assert.equal((await api('/join','POST',{name:'Friend '+i,invite:inv.data.invite})).status,201);
   }
   const extra=await api('/trips/'+tripId+'/invites','POST',{},owner.data.memberToken);
   assert.equal((await api('/join','POST',{name:'Ninth',invite:extra.data.invite})).status,409);
   for(let i=0;i<19;i++)assert.equal((await api('/trips','POST',{name:'Rate test',plan})).status,201);
   assert.equal((await api('/trips','POST',{name:'Rate test',plan})).status,429);
  });
  await t.test('server catalog is the same as the planner collection',async()=>{
   assert.deepEqual(JSON.parse(await readFile(require.resolve('../supabase/functions/sori-trips/catalog.json'),'utf8')),catalog);
  });
 }finally{await pg.close();}
});
