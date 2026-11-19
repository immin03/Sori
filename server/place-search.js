/* Explicit public-hotel searches only. Shared CAS gate caps the whole app,
   not each browser; cache avoids repeat upstream geocoding. No auto-complete. */
export function createPlaceSearch({bucket,fetcher=fetch,clock=Date.now,endpoint='https://nominatim.openstreetmap.org/search'}={}){
 const read=async key=>{const value=await bucket.get(key);return value?{etag:value.etag,data:await value.json()}:null;};
 const put=(key,value,prior)=>bucket.put(key,JSON.stringify(value),{onlyIf:prior?{etagMatches:prior.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});
 const answer=(status,error)=>({status,data:{error}});
 return async ({q,city})=>{
  if(typeof q!=='string'||q.trim().length<3||q.length>120||!['seoul','busan'].includes(city))return answer(400,'Enter a public hotel name of 3–120 characters.');
  const query=q.trim().replace(/\s+/g,' '),bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(city+':'+query.toLowerCase()));
  const cacheKey='sori/v1/geocode/'+[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
  const cached=await read(cacheKey);if(cached&&cached.data.until>clock())return {status:200,data:{places:cached.data.places,provider:'OpenStreetMap / Nominatim'}};
  const key='sori/v1/geocode-gate',prior=await read(key),started=clock();
  if(prior&&prior.data.until>started)return answer(429,'Hotel search is busy. Try again shortly, or place a pin on the map.');
  const gate=await put(key,{until:started+10000},prior);if(!gate)return answer(429,'Hotel search is busy. Try again shortly, or place a pin on the map.');
  try{
   const url=new URL(endpoint);url.search=new URLSearchParams({q:query+', '+(city==='seoul'?'Seoul':'Busan')+', South Korea',format:'jsonv2',countrycodes:'kr',limit:'5','accept-language':'en'});
   const response=await fetcher(url.toString(),{headers:{'User-Agent':'Sori/1.0 (+https://sorikorea.com; sori.korea.official@gmail.com)','Accept':'application/json'},signal:AbortSignal.timeout(7500)});
   if(!response.ok)return answer(503,'Hotel search is unavailable. You can still place your hotel on the map.');
   const body=await response.json();if(!Array.isArray(body))return answer(503,'Hotel search is unavailable. Please use the map pin.');
   const places=body.slice(0,5).map(p=>({label:String(p.name||p.display_name||query).slice(0,120),address:String(p.display_name||'').slice(0,240),lat:Number(p.lat),lng:Number(p.lon)})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&p.lat>=33&&p.lat<=39.5&&p.lng>=124&&p.lng<=132);
   await bucket.put(cacheKey,JSON.stringify({until:clock()+7*86400000,places}),{httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});
   return {status:200,data:{places,provider:'OpenStreetMap / Nominatim'}};
  }catch{return answer(503,'Hotel search is unavailable. You can still place a hotel pin on the map.');}
  finally{await bucket.put(key,JSON.stringify({until:Math.max(started+1500,clock())}),{onlyIf:{etagMatches:gate.etag}});}
 };
}
