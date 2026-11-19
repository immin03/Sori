/* Public counts, private email records, explicit consent and bounded writes. */
export function createCommunity({bucket,storyIds,fetcher=fetch,mailKey='',mailFrom='',clock=Date.now}={}){
 const digest=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const random=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
 const read=async key=>{const r=await bucket.get(key);return r?{etag:r.etag,data:await r.json()}:null;};
 async function edit(key,fn){for(let i=0;i<8;i++){const old=await read(key),result=fn(old?.data);if(!result.write)return result.value;const r=await bucket.put(key,JSON.stringify(result.write),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}});if(r)return result.value;}throw Object.assign(Error('Please try again in a moment.'),{status:409});}
 async function budget(peer){const key='sori/v1/public-budget/'+await digest(peer||'unknown');return edit(key,old=>{const b=!old||old.until<=clock()?{count:0,until:clock()+3600000}:old;if(b.count>=30)throw Object.assign(Error('Please try again later.'),{status:429});b.count++;return {write:b,value:true};});}
 const counts=row=>({useful:Object.values(row?.votes||{}).filter(v=>v==='useful').length,curious:Object.values(row?.votes||{}).filter(v=>v==='curious').length});
 return async ({path,method,body={},peer=''})=>{
  if(path==='/newsletter/status'&&method==='GET')return {status:200,data:{emailEnabled:!!(mailKey&&mailFrom),waitlistEnabled:true}};
  const match=path.match(/^\/stories\/([a-z0-9-]{1,80})\/(activity|reaction)$/);
  if(match){if(!storyIds.includes(match[1])){const cached=await read('sori/v1/published-story-ids');let ids=cached?.data.until>clock()?cached.data.ids:null;if(!ids){try{const r=await fetcher('https://sorikorea.com/data/stories.json',{signal:AbortSignal.timeout(5000)}),list=await r.json();ids=Array.isArray(list)?list.filter(s=>s.status==='published').map(s=>s.id):[];await bucket.put('sori/v1/published-story-ids',JSON.stringify({ids,until:clock()+10*60000}));}catch{ids=[];}}if(!ids.includes(match[1]))return {status:404,data:{error:'Story not found.'}};}const key='sori/v1/story-reactions/'+match[1];if(match[2]==='activity'&&method==='GET'){const row=await read(key);return {status:200,data:counts(row?.data)};}
   if(match[2]==='reaction'&&method==='POST'){
    if(!/^[A-Za-z0-9_-]{43}$/.test(body.token||'')||![null,'useful','curious'].includes(body.value))return {status:400,data:{error:'Choose a valid reaction.'}};
    await budget(peer);const actor=await digest(body.token);const data=await edit(key,old=>{const row=old||{votes:{}};if(Object.keys(row.votes).length>=5000&&!row.votes[actor])throw Object.assign(Error('This story has reached its reaction limit.'),{status:409});if(body.value===null)delete row.votes[actor];else row.votes[actor]=body.value;return {write:row,value:counts(row)};});return {status:200,data};
   }
  }
  if(path==='/newsletter/signup'&&method==='POST'){
   if(body.consent!==true||typeof body.email!=='string'||body.email.length>254||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email))return {status:400,data:{error:'Enter a valid email and agree to receive Korea 101.'}};
   await budget(peer);const email=body.email.trim().toLowerCase(),id=await digest(email),key='sori/v1/subscribers/'+id,old=await read(key);
   if(old&&(old.data.status==='confirmed'||(!['unsubscribed','email_failed'].includes(old.data.status)&&old.data.updated>clock()-3600000)))return {status:200,data:{status:mailKey&&mailFrom?'pending':'waitlist',message:mailKey&&mailFrom?'Please check your inbox for a confirmation.':'You are on the email waitlist. Delivery has not started yet.'}};
   const token=random(),tokenHash=await digest(token),enabled=!!(mailKey&&mailFrom);const record={email,status:enabled?'pending':'waitlist',consentAt:new Date(clock()).toISOString(),updated:clock(),tokenHash};
   await bucket.put(key,JSON.stringify(record));await bucket.put('sori/v1/subscription-tokens/'+tokenHash,JSON.stringify({id,expires:clock()+7*86400000}));
   if(enabled){try{const r=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+mailKey,'Content-Type':'application/json','Idempotency-Key':'sori-confirm-'+id+'-'+Math.floor(clock()/3600000)},body:JSON.stringify({from:mailFrom,to:[email],subject:'Confirm your Korea 101 subscription',text:'Please confirm you want Korea 101 by Sori: https://sorikorea.com/#subscribe='+token+'\nIf you did not request this, ignore this message.'}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Email failed');}catch{await bucket.put(key,JSON.stringify({...record,updated:0,status:'email_failed'}));return {status:503,data:{error:'Your confirmation email could not be sent. Please try again later.'}};}}
   return {status:201,data:{status:record.status,cancelToken:token,message:enabled?'Check your inbox and confirm your subscription.':'You are on the email waitlist. Delivery has not started yet; confirmation is required before newsletter emails begin.'}};
  }
  if(['/newsletter/confirm','/newsletter/unsubscribe'].includes(path)&&method==='POST'){
   if(!/^[A-Za-z0-9_-]{43}$/.test(body.token||''))return {status:400,data:{error:'This subscription link is invalid.'}};
   const tokenHash=await digest(body.token),index=await read('sori/v1/subscription-tokens/'+tokenHash);if(!index||(path.endsWith('/confirm')&&index.data.expires<clock()))return {status:410,data:{error:'This link expired. Please subscribe again.'}};
   const key='sori/v1/subscribers/'+index.data.id,data=await edit(key,old=>{if(!old||old.tokenHash!==tokenHash)throw Object.assign(Error('This link is no longer active.'),{status:410});if(path.endsWith('/confirm')&&old.status!=='pending')throw Object.assign(Error('Email delivery is not active. Please confirm again after it opens.'),{status:409});old.status=path.endsWith('/confirm')?'confirmed':'unsubscribed';if(old.status==='unsubscribed')old.email=null;old.updated=clock();return {write:old,value:{status:old.status}};});return {status:200,data};
  }
  return {status:404,data:{error:'Not found.'}};
 };
}
