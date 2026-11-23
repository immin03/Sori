const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('Korea 101 preserves approved seasonal issues and the complete original archive',()=>{
 const stories=require('../data/stories.json'),originals=require('../data/original-issues.json');
 const approved=stories.filter(s=>['first-snow-seoul','christmas-in-korea'].includes(s.id));
 assert.ok(stories.length>=2);assert.equal(originals.length,6);
 assert.deepEqual(approved.map(s=>s.id),['first-snow-seoul','christmas-in-korea']);
 for(const s of approved){
  assert.ok(s.wordCount>=800,s.id);assert.ok(s.headings.length>=4,s.id);assert.equal(s.expressions.length,3);assert.equal(s.figures.length,2);
  for(const f of s.figures)assert.ok(fs.existsSync(path.join(__dirname,'..',f.photo)));
  assert.ok(s.sources.length>=2,s.id);
  assert.ok(fs.existsSync(path.join(__dirname,'../stories',s.id,'index.html')));
 }
 for(const id of ['matjip-secret','seongsu-old-and-new','hongdae-street-stage','small-bow-korean-hello','one-coffee-in-korean','seoul-cafe-table','tteokguk-seollal','busan-two-kinds-of-day','airport-first-journey']){
  const page=fs.readFileSync(path.join(__dirname,'../stories',id,'index.html'),'utf8');
  assert.match(page,/noindex/);assert.match(page,/location.replace\("\/#read"\)/);assert.doesNotMatch(page,/<article>/);
 }
});
test('new Korea 101 stories meet the long-form publication contract and retain working social previews',()=>{
 const stories=require('../data/stories.json');
 const added=stories.filter(s=>!s.bodyFile&&!['first-snow-seoul','christmas-in-korea'].includes(s.id));
 const categories=['Useful Korean','Everyday culture','Food & traditions','Places','Getting around'];
 for(const s of added){
  const words=s.paragraphs.join(' ').trim().split(/\s+/).length;
  assert.ok(words>=825&&s.minutes>=5,s.id);
  assert.ok(categories.includes(s.category),s.id);
  assert.equal(s.author,'Korea 101 by Sori');assert.equal(s.status,'published');
  assert.match(s.published,/^\d{4}-\d{2}-\d{2}$/);assert.equal(s.updated,s.published);
  assert.ok(s.photoContext&&s.photoAlt);assert.ok(s.expressions.some(e=>e.ko===s.phrase));
  assert.ok(s.sources.length>=1&&s.sources.length<=3);
  assert.ok(!JSON.stringify(s).includes('\u2014'),s.id);
  const page=fs.readFileSync(path.join(__dirname,'../stories',s.id,'index.html'),'utf8');
  assert.ok(page.includes('https://sorikorea.com/stories/'+s.id+'/'));
  assert.ok(page.includes('https://sorikorea.com/'+s.photo));
  assert.ok(page.includes("location.replace('/#story="+s.id+"')"));
 }
});
test('Seoul directory covers the original guide, groups actual restaurants and opens English maps',async()=>{
 const {places,filterPlaces,googleMap,dayRoutes,discoverMarkup}=await import('../js/guide/discover.js');
 assert.equal(places.length,191);assert.equal(filterPlaces('christmas').length,26);assert.equal(filterPlaces('food').length,91);assert.equal(filterPlaces('culture').length,15);
 assert.equal(new Set(places.map(p=>p.id)).size,191);assert.equal(filterPlaces('christmas','Christmas markets').length,7);assert.equal(filterPlaces('indoor').length,32);
 assert.equal(filterPlaces('food','Noodles').length,8);
 assert.equal(filterPlaces('food','','우래옥')[0].id,'wooraeok');
 assert.equal(filterPlaces('food','','yeouido')[0].id,'jinjujip');
 for(const p of places){const u=new URL(googleMap(p));assert.equal(u.hostname,'www.google.com');assert.equal(u.searchParams.get('hl'),'en');assert.ok(u.searchParams.get('query').includes(p.address));}
 assert.equal(dayRoutes.length,5);for(const d of dayRoutes)for(const id of d.ids)assert.ok(places.find(p=>p.id===id));
 assert.match(discoverMarkup('#discover=food'),/data-discover-category="food"/);
 assert.doesNotMatch(discoverMarkup('#discover=food'),/data-category=/);
});
