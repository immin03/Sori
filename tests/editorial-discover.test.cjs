const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('Korea 101 has substantial edited articles, seasonal issues, three learning expressions and a complete original archive',()=>{
 const stories=require('../data/stories.json'),originals=require('../data/original-issues.json');
 assert.equal(stories.length,2);assert.equal(originals.length,6);
 assert.deepEqual(stories.slice(0,2).map(s=>s.id),['first-snow-seoul','christmas-in-korea']);
 for(const s of stories){
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
test('Seoul directory covers the original guide, groups actual restaurants and opens English maps',async()=>{
 const {places,filterPlaces,googleMap,dayRoutes,discoverMarkup}=await import('../js/guide/discover.js');
 assert.equal(places.length,22);assert.equal(filterPlaces('christmas').length,6);assert.equal(filterPlaces('food').length,10);assert.equal(filterPlaces('culture').length,6);
 assert.equal(filterPlaces('food','Noodles').length,2);
 assert.equal(filterPlaces('food','','우래옥')[0].id,'wooraeok');
 assert.equal(filterPlaces('food','','yeouido')[0].id,'jinjujip');
 for(const p of places){const u=new URL(googleMap(p));assert.equal(u.hostname,'www.google.com');assert.equal(u.searchParams.get('hl'),'en');assert.ok(u.searchParams.get('query').includes(p.address));}
 assert.equal(dayRoutes.length,5);for(const d of dayRoutes)for(const id of d.ids)assert.ok(places.find(p=>p.id===id));
 assert.match(discoverMarkup('#discover=food'),/data-discover-category="food"/);
 assert.doesNotMatch(discoverMarkup('#discover=food'),/data-category=/);
});
