// The public site sends a Firebase ID token. Google validates it for the Sori project.
const memberFeatures=['Offline speaking lessons','Personal pronunciation coaching','Practice with a partner','K-drama listening challenges','Weekly progress by email','Offline travel maps','Live transit alerts','Other'];
export function createMembers({bucket,adminEmail='',fetcher=fetch,clock=Date.now,publicKey}) {
 const prefix='sori/beta/members/';
 const deny=(status,message)=>{throw Object.assign(Error(message),{status});};
 async function identity(request){
  const header=request.headers.get('Authorization')||'';
  if(!header.startsWith('Bearer '))deny(401,'Sign in with Google to continue.');
  const token=header.slice(7);
  let payload;
  try{const parts=token.split('.');if(parts.length!==3||token.length>8192)throw Error();payload=JSON.parse(atob(parts[1].replaceAll('-','+').replaceAll('_','/')));}
  catch{deny(401,'Please sign in again.');}
  if(payload.aud!=='sori-533fc'||payload.iss!=='https://securetoken.google.com/sori-533fc'||payload.firebase?.sign_in_provider!=='google.com')deny(401,'Please sign in to Sori with Google.');
  const r=await fetcher('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+publicKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),signal:AbortSignal.timeout(8000)});
  if(!r.ok)deny(r.status>=500?503:401,'Google sign-in could not be verified.');
  const u=(await r.json()).users?.[0];
  if(!u?.emailVerified || !u.email || !u.localId || u.localId!==payload.sub || u.disabled)deny(401,'Sign in with a verified Google account.');
  return u;
 }
 function answers(b){
  if(!Array.isArray(b.features)||b.features.length>memberFeatures.length||b.features.some(x=>!memberFeatures.includes(x)))deny(400,'Choose a listed feature.');
  for(const field of ['goal','information','idea'])if(typeof b[field]!=='string'||b[field].length>600)deny(400,'Keep each answer under 600 characters.');
  return {features:[...new Set(b.features)],goal:b.goal.trim(),information:b.information.trim(),idea:b.idea.trim(),updated:clock()};
 }
 return async({request,path,method,body})=>{
  const u=await identity(request),isAdmin=!!adminEmail && u.email.toLowerCase()===adminEmail.toLowerCase();
  if(path==='/admin/members' && method==='GET'){
   if(!isAdmin)deny(403,'Administrator access is required.');
   const cursor=new URL(request.url).searchParams.get('cursor');
   const page=await bucket.list({prefix,limit:30,...(cursor?{cursor}:{})});
   const records=await Promise.all(page.objects.map(async o=>{const row=await bucket.get(o.key);return row?row.json():null;}));
   return {status:200,data:{members:records.filter(Boolean),cursor:page.truncated?page.cursor:null}};
  }
  if(!['/member/visit','/member/feedback'].includes(path)||method!=='POST')deny(404,'Not found.');
  const feedback=path.endsWith('feedback')?answers(body):null;
  const now=clock(),day=new Date(now).toISOString().slice(0,10);
  const key=prefix+encodeURIComponent(u.localId);
  for(let attempt=0;attempt<6;attempt++){
   const old=await bucket.get(key),row=old?await old.json():{joined:Number(u.createdAt)||now,firstSeen:now,visits:0,activeDays:0,lastSeen:0};
   if(!row.lastSeen || row.lastSeen<=now-30*60000)row.visits++;
   if(row.lastDay!==day){row.activeDays++;row.lastDay=day;}
   row.name=(u.displayName||'').slice(0,120);row.email=u.email;row.lastSeen=now;
   if(feedback)row.feedback=feedback;
   const saved=await bucket.put(key,JSON.stringify(row),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}});
   if(saved)return {status:200,data:{answered:!!row.feedback,feedback:row.feedback||null,isAdmin}};
  }
  deny(409,'Please try again.');
 };
}
