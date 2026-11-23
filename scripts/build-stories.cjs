/* Static share previews for GitHub Pages. Readers open the native Sori view. */
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const old=JSON.parse(fs.readFileSync(path.join(root,'data/stories.json'),'utf8'));
const {issues,originals}=require('../content/korea101.cjs');
const stories=issues.map(({body,...issue})=>{
 const paragraphs=[],headings=[];
 for(const block of body.trim().split(/\n\n+/)){if(block.startsWith('## '))headings.push({before:paragraphs.length,title:block.slice(3)});else paragraphs.push(block);}
 const prev=old.find(s=>s.id===issue.id)||{};
 const words=paragraphs.join(' ').split(/\s+/).length+issue.expressions.map(e=>Object.values(e).join(' ')).join(' ').split(/\s+/).length;
 return {...prev,...issue,photoContext:issue.photoContext||(prev.photoContext===true?'Context photograph; not necessarily the specific place or event described.':typeof prev.photoContext==='string'?prev.photoContext:''),author:prev.author||'Korea 101 by Sori',status:'published',updated:issue.updated||issue.published,minutes:Math.max(1,Math.ceil(words/165)),paragraphs,headings,figures:issue.figures.map(f=>({...f,after:Math.min(f.after,paragraphs.length-1)})),wordCount:words};
});
for(const issue of require('../content/newsletters/index.json')){
 const {id,title,date,minutes,url,photo,excerpt,category,paragraphs,wordCount}=issue;
 stories.push({id,title,published:date,updated:date,minutes,photo,photoAlt:title,excerpt,category,paragraphs,wordCount,
   bodyFile:'content/newsletters/'+id+'.html',author:'Korea 101 by Sori',status:'published',sources:[],expressions:[],phrase:'',question:'What stood out to you?'});
}
stories.sort((a,b)=>b.published.localeCompare(a.published));
fs.writeFileSync(path.join(root,'data/stories.json'),JSON.stringify(stories,null,2)+'\n');
fs.writeFileSync(path.join(root,'data/original-issues.json'),JSON.stringify(originals,null,2)+'\n');
// Retired articles must not be readable via previously shared static links.
const retired=['matjip-secret','seongsu-old-and-new','hongdae-street-stage','small-bow-korean-hello','one-coffee-in-korean','seoul-cafe-table','tteokguk-seollal','busan-two-kinds-of-day','airport-first-journey'];
for(const id of retired.filter(id=>!stories.some(s=>s.id===id))){
 const dir=path.join(root,'stories',id);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/#read"><title>Korea 101 by Sori</title></head><body><a href="/#read">Browse Korea 101</a><script>location.replace("/#read");</script></body></html>\n');
}
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const s of stories.filter(x=>x.status==='published')){
 if(!/^[a-z0-9-]{1,80}$/.test(s.id))throw Error('Invalid public story slug.');
 const dir=path.join(root,'stories',s.id);fs.mkdirSync(dir,{recursive:true});const url='https://sorikorea.com/stories/'+s.id+'/';
 fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.title)} · Korea 101 by Sori</title><meta name="description" content="${esc(s.excerpt)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(s.title)}"><meta property="og:description" content="${esc(s.excerpt)}"><meta property="og:image" content="${esc(new URL(s.photo,'https://sorikorea.com/').href)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Korea 101 by Sori"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${url}"><style>body{max-width:650px;margin:40px auto;padding:20px;font:17px/1.8 system-ui;color:#202420}img{max-width:100%;height:auto}a{color:inherit}</style></head><body><a href="/#story=${s.id}">Open Korea 101 in Sori</a><article><h1>${esc(s.title)}</h1><time datetime="${esc(s.published)}">${esc(s.published)}</time><p>${esc(s.excerpt)}</p><img src="${esc(s.photo.startsWith('https://')?s.photo:'/'+s.photo)}" alt="${esc(s.photoAlt)}">${s.bodyFile?fs.readFileSync(path.join(root,s.bodyFile),'utf8'):s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}</article><script>location.replace('/#story=${s.id}');</script></body></html>\n`);
}
console.log('Prepared '+stories.length+' public story previews.');
