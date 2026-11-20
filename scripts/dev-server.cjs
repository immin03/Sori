const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.json':'application/json', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff':'font/woff'};
const port = Number(process.env.PORT || 4173);
const {createTripsApi}=require('../server/trips.cjs');
const {createDevBucket}=require('../server/dev-bucket.cjs');
const searchReady=import('../server/place-search.js').then(({createPlaceSearch})=>createPlaceSearch({bucket:createDevBucket()}));
const communityReady=import('../server/community.js').then(({createCommunity})=>createCommunity({bucket:createDevBucket(),storyIds:require('../data/stories.json').map(x=>x.id)}));
const trips=createTripsApi(process.env.SORI_DB_FILE || path.join(root,'.sori-dev.sqlite'));
const server = http.createServer(async (req, res) => {
  if(req.method==='GET'&&new URL(req.url,'http://localhost').pathname==='/api/places/search'){const u=new URL(req.url,'http://localhost');const search=await searchReady;const result=await search({q:u.searchParams.get('q'),city:u.searchParams.get('city')});res.writeHead(result.status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(result.data));return;}
  if(/^\/api\/(stories\/|newsletter\/)/.test(new URL(req.url,'http://localhost').pathname)){
   try{let body={};if(req.method!=='GET'){let raw='';for await(const c of req){raw+=c;if(Buffer.byteLength(raw)>24000)throw Object.assign(Error('Request too large.'),{status:413});}body=JSON.parse(raw||'{}');}const service=await communityReady,result=await service({path:new URL(req.url,'http://localhost').pathname.slice(4),method:req.method,body,peer:req.socket.remoteAddress});res.writeHead(result.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result.data));}catch(error){res.writeHead(error.status||400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.status?error.message:'Invalid request.'}));}return;
  }
  if(await trips.handle(req,res))return;
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  const parts = pathname.split('/');
  if (parts.some(p => p.startsWith('.') || p.includes('\\'))) { res.writeHead(403); res.end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : /^\/(?:stories|explore)\/[a-z0-9-]+\/$/.test(pathname)?pathname+'index.html':pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  // Serve only checked-in front-end assets; never dev tooling or repository metadata.
  const allowed = pathname === '/assets/fonts/sori-noto.woff' || /^\/(?:stories|explore)\/[a-z0-9-]+\/(?:index.html)?$/.test(pathname) || /^\/assets\/vendor\/leaflet\/leaflet\.(js|css)$/.test(pathname) || /^\/assets\/photos\/[a-z0-9-]+\.(jpg|webp)$/.test(pathname) || pathname === '/' || pathname === '/index.html' || pathname === '/manifest.webmanifest' || ['/data/places.json','/data/stories.json'].includes(pathname) || /^\/(css|js|data)\/.+\.(css|js)$/.test(pathname) || ['/debug/auth.html','/debug/mobile.html'].includes(pathname);
  if (!allowed) { res.writeHead(404); res.end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, {'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Sori development: http://127.0.0.1:${server.address().port}`));
module.exports = server;

server.on("close",()=>trips.close());
