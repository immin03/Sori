/* Process-local cache for development searches; never production trip storage. */
function createDevBucket(){const values=new Map();let seq=0;return {async get(key){const x=values.get(key);return x?{etag:x.etag,json:async()=>JSON.parse(x.body)}:null;},async put(key,body,options={}){const x=values.get(key),c=options.onlyIf;if(c?.etagMatches&&x?.etag!==c.etagMatches)return null;if(c?.etagDoesNotMatch==='*'&&x)return null;const etag=String(++seq);values.set(key,{etag,body});return {etag};}};}
module.exports={createDevBucket};
