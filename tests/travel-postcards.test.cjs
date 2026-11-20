const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const places = require('../data/places.json');
const root = path.join(__dirname, '..');
const origin = 'https://sorikorea.com';

function followPreview(href) {
  const link = new URL(href);
  const html = fs.readFileSync(path.join(root, link.pathname, 'index.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  let target;
  vm.runInNewContext(script, {URLSearchParams, location:{search:link.search, replace:href=>{target=new URL(href, origin);}}});
  assert.equal(target.origin, origin);
  assert.match(html, /property="og:image" content="https:\/\/sorikorea\.com\/assets\/photos\//);
  return {params:new URLSearchParams(target.hash.slice(1)), html};
}

test('all six share cards open their exact itinerary and have their own photo and title', async () => {
  const {routes, itineraryShareUrl, readPublicItinerary} = await import('../js/guide/public-day.js');
  for (const route of routes) {
    const url = itineraryShareUrl(origin, route.city, [{stops:route.stops}], places);
    const {params, html} = followPreview(url);
    const plan = readPublicItinerary(params, places);
    assert.equal(plan.title, route.title);
    assert.deepEqual(plan.days[0].stops, route.stops);
    assert.ok(html.includes(route.title));
    assert.ok(html.includes('/assets/photos/' + route.photo + '.jpg'));
    assert.ok(fs.existsSync(path.join(root, 'assets/photos', route.photo + '.jpg')));
  }
});

test('a multi-day share opens in order, retains free days and excludes personal trip fields', async () => {
  const {itineraryShareUrl, readPublicItinerary} = await import('../js/guide/public-day.js');
  const days = [{stops:['market','tea'],date:'2026-11-24'},{stops:[]},{stops:['forest','coffee']}];
  const link = itineraryShareUrl(origin + '/?name=Traveller#invite=secret', 'seoul', days, places);
  assert.ok(!/invite|secret|2026|Traveller/.test(link));
  const {params} = followPreview(link);
  assert.deepEqual(readPublicItinerary(params,places).days.map(d=>d.stops),days.map(d=>d.stops));
  for(const data of [[], [{stops:[]}], [{stops:['market','market']}], [{stops:['market']},{stops:['mipo']}], [...days,days[0]]]) {
    assert.equal(itineraryShareUrl(origin,'seoul',data,places),null);
  }
});

test('custom days use interest-based areas, dated private copies and English Maps for every stop', async () => {
  const {mapLink,placeEmbed,generatePlan} = await import('../js/guide/planner.js');
  const {googleLeg} = await import('../js/guide/geo.js');
  const {datedDays} = await import('../js/guide/public-day.js');
  const plan=generatePlan({area:'auto',city:'busan',start:'2026-11-30',end:'2026-12-02',food:'local',pace:'relaxed',interests:['shopping']},places);
  assert.equal(plan.days[0].area,'nampo');
  assert.deepEqual(datedDays(plan.days,'2026-12-31').map(d=>d.date), ['2026-12-31','2027-01-01','2027-01-02']);
  assert.throws(()=>datedDays(plan.days,'2026-02-30'));
  for(const p of places){
    const link=new URL(mapLink(p)), embed=new URL(placeEmbed(p));
    assert.equal(link.searchParams.get('hl'),'en');assert.equal(embed.searchParams.get('hl'),'en');
    assert.equal(embed.hostname,'www.google.com');assert.equal(embed.searchParams.get('output'),'embed');
    assert.doesNotMatch(link.searchParams.get('query'),/[가-힣]/);
    assert.equal(embed.searchParams.get('q'),link.searchParams.get('query'));
    assert.equal(new URL(googleLeg(null,p)).searchParams.get('hl'),'en');
  }
});
