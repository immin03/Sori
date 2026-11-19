const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.json':'application/json'};
const port = Number(process.env.PORT || 4173);
const {createTripsApi}=require('../server/trips.cjs');
const trips=createTripsApi(process.env.SORI_DB_FILE || path.join(root,'.sori-dev.sqlite'));
const server = http.createServer(async (req, res) => {
  if(await trips.handle(req,res))return;
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  const parts = pathname.split('/');
  if (parts.some(p => p.startsWith('.') || p.includes('\\'))) { res.writeHead(403); res.end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  // Serve only checked-in front-end assets; never dev tooling or repository metadata.
  const allowed = pathname === '/' || pathname === '/index.html' || pathname === '/manifest.webmanifest' || pathname === '/data/places.json' || /^\/(css|js|data)\/.+\.(css|js)$/.test(pathname) || pathname === '/debug/auth.html';
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
