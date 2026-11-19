/* Durable whole-trip documents. ETag conditions make each edit atomic.
   The bucket is server-only; every read and edit checks a membership hash. */
const repoFail=(status,message)=>{throw Object.assign(Error(message),{status});};
const tripKey=id=>'sori/v1/trips/'+id;
const inviteKey=hash=>'sori/v1/invites/'+hash;
function publicTrip(t){return {id:t.id,plan:t.plan,version:t.version,members:t.members.filter(m=>m.active).map(({id,name,role})=>({id,name,role})),comments:t.comments.slice(-60).reverse().map(c=>({id:c.id,body:c.body,created:c.created,name:t.members.find(m=>m.id===c.member)?.name||'Former member'}))};}
export function createObjectTripRpc(bucket,{clock=Date.now}={}){
 const read=async key=>{const r=await bucket.get(key);return r?{etag:r.etag,data:await r.json()}:null;};
 async function save(key,data,prior){return bucket.put(key,JSON.stringify(data),{onlyIf:prior?{etagMatches:prior.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});}
 async function edit(key,fn,{missing=401}={}){
  for(let attempt=0;attempt<8;attempt++){
   const prior=await read(key);if(!prior&&missing)repoFail(missing,'This trip needs a valid invitation or membership.');
   const data=prior?prior.data:null;const result=fn(data);
   if(!result.write)return result.value;
   if(await save(key,result.write,prior))return result.value;
  }
  repoFail(409,'This trip is being updated. Please try again.');
 }
 async function budget(key,max){
  return edit('sori/v1/rate/'+key,old=>{
   const now=clock(),data=!old||old.until<=now?{count:0,until:now+3600000}:old;
   if(data.count>=max)repoFail(429,'Too many trips. Please try later.');
   data.count++;return {write:data,value:true};
  },{missing:0});
 }
 return async p=>{
  try{
   const action=p.p_action,body=p.p_body||{},now=clock(),newId=()=>crypto.randomUUID();
   let data,status=200;
   if(action==='create'){
    await budget('global-create',200);await budget(p.p_rate_bucket,20);
    const id=newId(),mid=newId(),trip={id,plan:body.plan,version:1,members:[{id:mid,name:body.name.trim(),role:'owner',token_hash:p.p_new_hash,active:true}],invites:{},comments:[]};
    if(!await save(tripKey(id),trip,null))repoFail(503,'Could not create a trip. Please try again.');
    status=201;data={trip:publicTrip(trip),memberId:mid};
   }else if(action==='preview'||action==='join'){
    const index=await read(inviteKey(p.p_token_hash));
    if(!index||index.data.expires<=now)repoFail(410,'This invitation expired or was already used. Ask for a new link.');
    const id=index.data.tripId;
    data=await edit(tripKey(id),trip=>{
     const invite=trip?.invites[p.p_token_hash];
     if(!invite||invite.used||invite.expires<=now)repoFail(410,'This invitation expired or was already used. Ask for a new link.');
     if(action==='preview')return {value:{tripId:id}};
     if(trip.members.filter(m=>m.active).length>=8)repoFail(409,'This trip already has eight people.');
     if(trip.members.length>=100)repoFail(409,'This trip has reached its membership history limit.');
     const mid=newId();invite.used=true;
     trip.members.push({id:mid,name:body.name.trim(),role:'guest',token_hash:p.p_new_hash,active:true});trip.version++;
     return {write:trip,value:{trip:publicTrip(trip),memberId:mid}};
    },{missing:410});
    if(action==='join')status=201;
   }else{
    const id=p.p_trip;
    data=await edit(tripKey(id),trip=>{
     const me=trip.members.find(m=>m.active&&m.token_hash===p.p_token_hash);
     if(!me)repoFail(401,'This trip needs a valid invitation or membership.');
     if(['invite','cancel_invites','remove_member'].includes(action)&&me.role!=='owner')repoFail(403,'Only the trip creator can manage invitations and members.');
     if(action==='read')return {value:publicTrip(trip)};
     if(action==='update'){
      if(trip.version!==body.version)repoFail(409,'A friend changed this trip. Reload and try your change again.');
      trip.plan=body.plan;trip.version++;return {write:trip,value:publicTrip(trip)};
     }
     if(action==='invite'){
      trip.invites=Object.fromEntries(Object.entries(trip.invites).filter(([,i])=>!i.used&&i.expires>now));
      if(Object.keys(trip.invites).length>=20)repoFail(409,'There are already enough active invitations for this trip.');
      trip.invites[p.p_new_hash]={expires:now+7*86400000,used:false};
      return {write:trip,value:{}};
     }
     if(action==='cancel_invites'){
      trip.invites={};return {write:trip,value:{ok:true}};
     }
     if(action==='comment'){
      if(typeof body.body!=='string'||!body.body.trim()||body.body.length>500)repoFail(400,'Write a comment of 1–500 characters.');
      if(trip.comments.length>=200)repoFail(409,'Comment limit reached for this trip.');
      trip.comments.push({id:newId(),member:me.id,body:body.body.trim(),created:new Date(now).toISOString()});trip.version++;
      return {write:trip,value:publicTrip(trip)};
     }
     if(action==='remove_member'){
      const guest=trip.members.find(m=>m.id===body.target&&m.active&&m.role==='guest');
      if(!guest)repoFail(404,'Guest not found.');guest.active=false;trip.version++;
      return {write:trip,value:publicTrip(trip)};
     }
     repoFail(405,'Method not allowed.');
    });
    if(action==='invite'){
     // Publish the lookup only after the trip CAS commits. An index never grants
     // access on its own: redemption rechecks the trip's current invitation.
     if(!await save(inviteKey(p.p_new_hash),{tripId:id,expires:now+7*86400000},null))repoFail(503,'Could not create an invitation. Please try again.');
     status=201;
    }
    if(action==='comment')status=201;
   }
   return {status,data};
  }catch(e){return {status:e.status||503,data:{error:e.status?e.message:'Trip storage is temporarily unavailable. Please try again.'}};}
 };
}
