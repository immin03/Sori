const {test}=require('node:test');const assert=require('node:assert/strict');const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {createTripsApi}=require('../server/trips.cjs');const catalog=require('../data/places.json');
const load=()=>import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(path.join(__dirname,'../js/guide/planner.js'))).toString('base64'));
const tripPlan={title:'Test Seoul trip',food:'mild',pace:'balanced',days:[{date:'2026-12-01',area:'central',stops:['myeongdong','noodles']}]};
async function harness(fn,clock=Date.now){const api=createTripsApi(':memory:',clock);const server=http.createServer(async(req,res)=>{if(!await api.handle(req,res)){res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;async function call(route,method='GET',body,token){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}try{await fn(call);}finally{await new Promise(r=>server.close(r));api.close();}}
test('planner validates dates, respects base area, excludes Tuesday palace, and leaves vegetarian meals open',async()=>{
 const {generatePlan}=await load();const input={start:'2026-12-01',end:'2026-12-03',area:'north',food:'vegetarian',pace:'relaxed',interests:['culture','cafes']};const plan=generatePlan(input,catalog);assert.equal(plan.days.length,3);assert.equal(plan.days[0].area,'north');assert.ok(!plan.days[0].stops.includes('palace'));for(const d of plan.days){assert.ok(d.stops.length<=2);assert.ok(d.stops.every(id=>catalog.find(p=>p.id===id).tag!=='food'));}
 assert.throws(()=>generatePlan({...input,start:'2026-02-30'},catalog));assert.throws(()=>generatePlan({...input,end:'2026-12-08'},catalog));
});
test('guide Korean phrases are connected to actual learning data',async()=>{const {PHRASES}=await load();const c={window:{},console:{log(){}}};vm.createContext(c);for(const name of ['daily','travel','drama','trendy','numbers','dataindex'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../data/'+name+'.js'),'utf8'),c);const text=new Set(Object.values(c.window.SoriDataIndex).flat().map(x=>x.k));for(const p of PHRASES)assert.ok(text.has(p.ko),p.ko);});
test('two participants share edits and comments; unrelated visitors cannot read; invites are single-use',()=>harness(async call=>{
 const owner=(await call('trips','POST',{name:'Owner',plan:tripPlan})).data;assert.equal(owner.trip.members.length,1);const route='trips/'+owner.trip.id;
 assert.equal((await call(route)).status,401);const invite=(await call(route+'/invites','POST',{},owner.memberToken)).data.invite;
 assert.equal((await call('invitation','POST',{invite})).data.tripId,owner.trip.id);
 const guest=(await call('join','POST',{invite,name:'Friend'})).data;assert.equal(guest.trip.members.length,2);assert.equal((await call('join','POST',{invite,name:'Other'})).status,410);
 assert.equal((await call(route+'/invites','POST',{},guest.memberToken)).status,403);
 const next=structuredClone(guest.trip.plan);next.days[0].stops.pop();const updated=await call(route,'PATCH',{version:guest.trip.version,plan:next},guest.memberToken);assert.equal(updated.status,200);
 const seen=(await call(route,'GET',null,owner.memberToken)).data;assert.deepEqual(seen.plan.days[0].stops,['myeongdong']);
 const note=await call(route+'/comments','POST',{body:'Let’s try a cafe!'},guest.memberToken);assert.equal(note.status,201);assert.equal(note.data.comments[0].name,'Friend');
 const removed=await call(route+'/members/'+guest.memberId,'DELETE',null,owner.memberToken);assert.equal(removed.status,200);assert.equal(removed.data.members.length,1);assert.equal((await call(route,'GET',null,guest.memberToken)).status,401);
 assert.ok(!JSON.stringify(seen).includes('token_hash'));assert.ok(!JSON.stringify(seen).includes(owner.memberToken));
}));
test('stale changes fail without overwriting another participant and invalid IDs/dates are rejected',()=>harness(async call=>{
 const owner=(await call('trips','POST',{name:'Owner',plan:tripPlan})).data,route='trips/'+owner.trip.id;
 const first=await call(route,'PATCH',{version:1,plan:{...tripPlan,title:'Changed'}},owner.memberToken);assert.equal(first.status,200);
 assert.equal((await call(route,'PATCH',{version:1,plan:tripPlan},owner.memberToken)).status,409);
 assert.equal((await call(route,'GET',null,owner.memberToken)).data.plan.title,'Changed');
 for(const bad of [{...tripPlan,days:[{date:'2026-02-30',stops:['noodles']}]},{...tripPlan,days:[{date:'2026-12-01',stops:['unknown']}]}])assert.equal((await call(route,'PATCH',{version:2,plan:bad},owner.memberToken)).status,400);
 assert.equal((await call(route+'/comments','POST',{body:'x'.repeat(501)},owner.memberToken)).status,400);
}));
test('bad and expired invitations fail safely; guest cap is enforced',()=>harness(async call=>{
 assert.equal((await call('join','POST',{invite:'not-a-token',name:'Guest'})).status,410);
 const owner=(await call('trips','POST',{name:'Owner',plan:tripPlan})).data,route='trips/'+owner.trip.id;
 for(let i=0;i<8;i++){const invite=(await call(route+'/invites','POST',{},owner.memberToken)).data.invite;const join=await call('join','POST',{invite,name:'Friend '+i});assert.equal(join.status,i===7?409:201);}
}));

test('expired invitations are rejected by the server clock',async()=>{
 let now=Date.now();await harness(async call=>{const owner=(await call('trips','POST',{name:'Owner',plan:tripPlan})).data;const invite=(await call('trips/'+owner.trip.id+'/invites','POST',{},owner.memberToken)).data.invite;now+=8*86400000;assert.equal((await call('invitation','POST',{invite})).status,410);assert.equal((await call('join','POST',{invite,name:'Late friend'})).status,410);},()=>now);
});

test('creator can revoke outstanding invitations without removing current members',()=>harness(async call=>{
 const owner=(await call('trips','POST',{name:'Owner',plan:tripPlan})).data,route='trips/'+owner.trip.id;
 const invite=(await call(route+'/invites','POST',{},owner.memberToken)).data.invite;
 assert.equal((await call(route+'/invites','DELETE',null,owner.memberToken)).status,200);
 assert.equal((await call('join','POST',{invite,name:'Friend'})).status,410);
 assert.equal((await call(route,'GET',null,owner.memberToken)).data.members.length,1);
}));
