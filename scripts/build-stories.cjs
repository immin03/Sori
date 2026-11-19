/* Static share previews for GitHub Pages. Readers open the native Sori view. */
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const stories=JSON.parse(fs.readFileSync(path.join(root,'data/stories.json'),'utf8'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const s of stories.filter(x=>x.status==='published')){
 if(!/^[a-z0-9-]{1,80}$/.test(s.id))throw Error('Invalid public story slug.');
 const dir=path.join(root,'stories',s.id);fs.mkdirSync(dir,{recursive:true});const url='https://sorikorea.com/stories/'+s.id+'/';
 fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.title)} · Korea 101 by Sori</title><meta name="description" content="${esc(s.excerpt)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(s.title)}"><meta property="og:description" content="${esc(s.excerpt)}"><meta property="og:image" content="https://sorikorea.com/${esc(s.photo)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Korea 101 by Sori"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${url}"><style>body{max-width:650px;margin:40px auto;padding:20px;font:17px/1.8 system-ui;color:#202420}img{max-width:100%;height:auto}a{color:inherit}</style></head><body><a href="/#story=${s.id}">Open Korea 101 in Sori</a><article><h1>${esc(s.title)}</h1><p>${esc(s.excerpt)}</p><img src="/${esc(s.photo)}" alt="${esc(s.photoAlt)}">${s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}</article><script>location.replace('/#story=${s.id}');</script></body></html>\n`);
}
console.log('Prepared '+stories.length+' public story previews.');
