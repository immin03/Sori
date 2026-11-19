import fs from 'node:fs/promises';
const read=p=>fs.readFile(p,'utf8');
const validation=(await read('src/validation.js')).replace('export function','function');
const repository=(await read('src/object-trips.js')).replace('export function','function');
const handler=(await read('src/handler.js')).replace(/^import .*;\n/,'').replace('export function','function');
const catalog=JSON.stringify(JSON.parse(await read('src/catalog.json')));
const entry=`\nconst catalog=${catalog};\nexport default {async fetch(request,env){
 if(new URL(request.url).pathname==='/')return Response.redirect('https://sorikorea.com',302);
 if(!env.BUCKET)return Response.json({error:'Trip storage is unavailable.'},{status:503});
 const rpc=createObjectTripRpc(env.BUCKET);
 const headers=new Headers(request.headers);headers.set('x-forwarded-for',request.headers.get('cf-connecting-ip')||'unknown-peer');
 const trusted=new Request(request,{headers});
 return createHandler({url:'https://internal.invalid',key:'server-binding',catalog,fetcher:async(_,init)=>Response.json(await rpc(JSON.parse(init.body)))})(trusted);
}};\n`;
await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/.openai',{recursive:true});
await fs.writeFile('dist/server/index.js',validation+'\n'+repository+'\n'+handler+entry);
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built Sori API Worker.');
