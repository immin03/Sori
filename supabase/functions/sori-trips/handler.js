import {validateTrip} from './validation.js';
const allowedOrigins=new Set(['https://sorikorea.com','https://www.sorikorea.com','http://127.0.0.1:4173','http://localhost:4173']);
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const secret=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
export function createHandler({url,key,catalog,fetcher=fetch}){
 return async request=>{
  const origin=request.headers.get('origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
  if(origin&&allowedOrigins.has(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS','Access-Control-Allow-Headers':'content-type,authorization','Access-Control-Max-Age':'600'});
  const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
  try{
   if(origin&&!allowedOrigins.has(origin))return reply(403,{error:'This origin is not allowed.'});
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
   const path=new URL(request.url).pathname.replace(/^\/functions\/v1\/sori-trips/,'');
   if(path==='/health'&&request.method==='GET')return reply(200,{collaboration:true,mode:'production'});
   let body={};
   if(!['GET','HEAD'].includes(request.method)){
    const reader=request.body?.getReader();let size=0;const chunks=[];
    if(reader){while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>24000){await reader.cancel();fail(413,'Request too large.');}chunks.push(value);}}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    try{body=JSON.parse(new TextDecoder().decode(bytes)||'{}');}catch{fail(400,'Invalid JSON.');}
    if(!body||typeof body!=='object'||Array.isArray(body))fail(400,'Invalid request.');
   }
   let action,trip=null,token='',newToken=null,newHash='';
   const auth=request.headers.get('authorization')||'';
   if(path==='/trips'&&request.method==='POST')action='create';
   else if(path==='/invitation'&&request.method==='POST')action='preview';
   else if(path==='/join'&&request.method==='POST')action='join';
   else{
    const match=path.match(/^\/trips\/([a-f0-9-]{36})(?:\/(invites|comments|members)(?:\/([a-f0-9-]{36}))?)?$/);
    if(!match||!uuid.test(match[1]))fail(404,'Not found.');
    trip=match[1];token=auth.startsWith('Bearer ')?auth.slice(7):'';
    if(!/^[A-Za-z0-9_-]{43}$/.test(token))fail(401,'This trip needs a valid invitation or membership.');
    const [, ,resource,target]=match;
    if(!resource&&request.method==='GET')action='read';
    if(!resource&&request.method==='PATCH')action='update';
    if(resource==='invites'&&!target&&request.method==='POST')action='invite';
    if(resource==='invites'&&!target&&request.method==='DELETE')action='cancel_invites';
    if(resource==='comments'&&!target&&request.method==='POST')action='comment';
    if(resource==='members'&&target&&uuid.test(target)&&request.method==='DELETE'){action='remove_member';body={target};}
    if(!action)fail(405,'Method not allowed.');
   }
   if(['preview','join'].includes(action)){token=body.invite;if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))fail(410,'This invitation expired or was already used. Ask for a new link.');}
   if(['create','join'].includes(action)&&(typeof body.name!=='string'||!body.name.trim()||body.name.length>40))fail(400,'Enter a name of 1–40 characters.');
   if(['create','update'].includes(action)){
    try{body.plan=validateTrip(body.plan,catalog);}catch(e){fail(400,e.message);}
    if(action==='update'&&(!Number.isSafeInteger(body.version)||body.version<1))fail(400,'Invalid trip version.');
   }
   if(action==='comment'&&(typeof body.body!=='string'||!body.body.trim()||body.body.length>500))fail(400,'Write a comment of 1–500 characters.');
   if(['create','join','invite'].includes(action)){newToken=secret();newHash=await hash(newToken);}
   // Hash the gateway-provided peer key, avoiding stored raw addresses. A missing
   // peer header shares one fallback bucket, rather than disabling limits.
   const peer=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown-peer';
   const rpcBody={p_action:action,p_trip:trip,p_token_hash:token?await hash(token):'',p_body:body,p_new_hash:newHash,p_rate_bucket:action==='create'?await hash(peer):''};
   const rpcHeaders={'Content-Type':'application/json',apikey:key};
   if(key?.startsWith('eyJ'))rpcHeaders.Authorization='Bearer '+key;
   const response=await fetcher(url+'/rest/v1/rpc/sori_trip_request',{method:'POST',headers:rpcHeaders,body:JSON.stringify(rpcBody),signal:AbortSignal.timeout(12000)});
   if(!response.ok)fail(503,'Trip storage is temporarily unavailable. Please try again.');
   const result=await response.json();
   if(!result||!Number.isInteger(result.status)||result.status<200||result.status>599||!result.data)fail(503,'Trip storage is temporarily unavailable. Please try again.');
   if(result.status<300&&newToken){if(action==='invite')result.data.invite=newToken;else result.data.memberToken=newToken;}
   return reply(result.status,result.data);
  }catch(error){return reply(error.status||500,{error:error.status?error.message:'Server error. Please try again.'});}
 };
}
