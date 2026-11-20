// Offline baseline checks: no Firebase writes, TTS calls or analytics requests.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const html = read('index.html');
const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let compiled = 0;
for (const [,attrs,inline] of scriptTags) {
  const src = attrs.match(/\bsrc=["']([^"']+)/i)?.[1];
  if (src && /^https?:/.test(src)) continue;
  const file = src ? src.split('?')[0].replace(/^\//,'') : null;
  if (file) assert.ok(fs.existsSync(path.join(root,file)), `Missing script: ${file}`);
  const result = spawnSync(process.execPath, ['--check', ...( /type=["']module/.test(attrs) ? ['--input-type=module'] : [])], {input:file ? read(file) : inline, encoding:'utf8'});
  assert.equal(result.status,0, `${file || 'inline script'}: ${result.stderr}`);
  compiled++;
}
// Check all source files too, including modules imported transitively.
for (const dir of ['js','data','server','supabase/functions']) for (const file of fs.readdirSync(path.join(root,dir),{recursive:true}).filter(x=>/\.(js|cjs)$/.test(x))) {
  const text=read(dir+'/'+file);
  const result=spawnSync(process.execPath,['--check',...(/^(import|export)\b/m.test(text)?['--input-type=module']:[])],{input:text,encoding:'utf8'});
  assert.equal(result.status,0,`${dir}/${file}: ${result.stderr}`);
}
const sandbox = {window:{}, console:{log(){}}};
vm.createContext(sandbox);
for (const cat of ['daily','travel','drama','trendy','numbers']) vm.runInContext(read(`data/${cat}.js`),sandbox);
vm.runInContext(read('data/dataindex.js'),sandbox);
const ids = new Set(); const counts = {};
for (const [category,rows] of Object.entries(sandbox.window.SoriDataIndex)) {
  assert.ok(rows.length>0, `Empty category: ${category}`); counts[category]=rows.length;
  for (const item of rows) {
    for (const field of ['id','k','e','p']) assert.ok(typeof item[field] === 'string' && item[field].trim(), `${category}: missing ${field}`);
    assert.ok(!ids.has(item.id), `Duplicate normalized ID: ${item.id}`); ids.add(item.id);
  }
}
JSON.parse(read('manifest.webmanifest'));
for (const [,href] of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)/gi)) {
  if (/^(https?:|data:|#)/.test(href)) continue;
  assert.ok(fs.existsSync(path.join(root,href.split('?')[0].replace(/^\//,''))), `Missing linked asset: ${href}`);
}
async function checkServer() {
  process.env.PORT='0'; process.env.SORI_DB_FILE=':memory:'; const server=require('./dev-server.cjs');
  try {
    await new Promise((resolve,reject) => { server.once('listening',resolve); server.once('error',reject); });
    const base=`http://127.0.0.1:${server.address().port}`;
    for (const [url,status,type] of [['/',200,'text/html'],['/js/auth.js',200,'text/javascript'],['/assets/fonts/sori-noto.woff',200,'font/woff'],['/data/daily.js?v=1',200,'text/javascript'],['/missing',404],['/.git/config',403],['/.env',403],['/scripts/check.cjs',404]]) {
      const response=await fetch(base+url); assert.equal(response.status,status,url);
      if (type) assert.ok(response.headers.get('content-type').startsWith(type),url);
    }
    assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
    console.log(JSON.stringify({status:'PASS',scripts:compiled,phrases:ids.size,categories:counts,http:'PASS'},null,2));
  } finally { await new Promise(resolve => server.close(resolve)); }
}
checkServer().catch(error => { console.error(error); process.exitCode=1; });
