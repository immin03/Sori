import {routes, readPublicItinerary, itineraryParams, itineraryShareUrl, datedDays, presetDays} from './public-day.js?v=20261121polish';
import {esc, chooser, areaChoices, cover, stopList, moreDays, placeMap, mountPlaceMap, koreaDate} from './postcards.js?v=20261121editorial';
import {sharePublic} from '../share-public.js?v=20261121trip';
import {generatePlan, AREAS, PHRASES, mapLink, placeEmbed, naverLink, phraseForPlace, CITIES, cityForArea} from './planner.js?v=20261121trip';
import {AIRPORTS, CITY_CENTRES, isKoreaPoint, kmBetween, googleLeg, basePoint, routePoints, nearbyOrder, transferHint} from './geo.js?v=20261121trip';
import {createJourneyMap} from './map.js?v=20261121polish';
import {discoverMarkup,refreshDiscover} from './discover.js?v=20261121editorial';
const root = document.getElementById('guideView');
const storage={get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}}};
let mapOpen = false, activeDay = 0, selectedStop = null, map = null;
let catalog = [], current = null, identity = null, joinInvite = null, busy = false;
let journeyDraft = null, hotelResults = [], devicePoint = null, picking = false, travelMode = 'transit';
const cityNow = () => current ? cityForArea(current.plan.days[0].area) : root.querySelector('[name=city]')?.value || 'seoul';
const defaultJourney=city=>({arrival:city==='busan'?'pus':'icn1',origin:'hotel',hotel:null,returnToHotel:true});
const message=s=>{const target=document.getElementById('guideMessage');if(target)target.textContent=s;};
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {...options, signal:controller.signal});
  } catch (error) {
    if (controller.signal.aborted) throw Error('The request timed out. Please try again.');
    throw error;
  }
  finally {clearTimeout(timer);}
}
async function api(path,method='GET',body,token=identity?.token){
 const response=await fetchWithTimeout((window.SoriConfig?.tripsApiBase||'/api')+'/'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 let data;try{data=await response.json();}catch{throw Error('The shared service could not respond. Please try again.');}
 if(!response.ok)throw Object.assign(Error(data.error||'Could not save this change.'),{status:response.status});return data;
}
async function safe(fn){if(busy)return;busy=true;root.setAttribute('aria-busy','true');try{message('');await fn();}catch(e){message(e.message);}finally{busy=false;root.removeAttribute('aria-busy');}}
function destroyMap(){map?.destroy();map=null;picking=false;}
function discover(){destroyMap();current=identity=joinInvite=null;root.className='map-guide discover-home';root.querySelector('#tripContent').innerHTML=discoverMarkup(location.hash);message('');refreshDiscover(root);window.SoriNav?.show('guide');window.scrollTo({top:0,behavior:'instant'});}
root.addEventListener('input',e=>{if(e.target.id==='discoverSearch')refreshDiscover(root);});
root.addEventListener('change',e=>{if(e.target.id==='discoverType')refreshDiscover(root);});
function remember(data){identity={token:data.memberToken,id:data.memberId};current=data.trip;mapOpen=false;storage.set('sori:last-trip',current.id);const saved=storage.set('sori:trip:'+current.id,identity);history.replaceState(null,'','#trip='+current.id);activeDay=0;selectedStop=null;renderTrip();window.SoriNav?.refresh();window.scrollTo({top:0,behavior:'instant'});if(!saved)message('Keep this page open. This browser could not remember your trip access.');}
function stayEditor(editing=false){return `<div class="stay-editor" data-stay-editor><label>Your hotel or accommodation<input id="hotelQuery" name="hotelQuery" type="search" maxlength="120" autocomplete="off" placeholder="e.g. Lotte Hotel Seoul" value="${esc(journeyDraft.hotel?.label||'')}"></label><div class="stay-search-actions"><button type="button" class="sori-secondary" data-hotel-search>Search hotels</button><button type="button" class="text-button" data-pick-hotel>Place on map</button></div><p class="stay-search-note">Search a public hotel name. OpenStreetMap / Nominatim supplies search results.</p><div id="hotelResults" role="status" aria-live="polite"></div><div class="stay-confirmed" id="chosenStay">${journeyDraft.hotel?`<strong>${esc(journeyDraft.hotel.label)}</strong><span>Stay pin ready · confirm its position on the map.</span>`:'No hotel yet? You can add it later.'}</div><label>Arrival airport<select name="arrival">${[['none','Already in Korea'],...Object.values(AIRPORTS).map(a=>[a.id,a.label])].map(([id,label])=>`<option value="${id}" ${journeyDraft.arrival===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="check-row"><input name="returnHotel" type="checkbox" ${journeyDraft.returnToHotel?'checked':''}>Return to the hotel after each day</label><p class="small-note">${editing?'Saving shares your hotel pin and arrival choice with the people in this trip.':'Your hotel pin is shared only with people you invite to this trip.'}</p></div>`;}
function shell() {
  destroyMap();
  current = identity = devicePoint = joinInvite = null;
  mapOpen = false;
  hotelResults = [];
  root.className = 'map-guide travel-home';
  root.querySelector('#tripContent').innerHTML = chooser(storage.get('sori:last-trip'));
  message('');
  if (window.SoriNav && root.style.display === 'block') window.SoriNav.show('guide');
}
function readJourney(){const el=root.querySelector('[name=arrival]');if(el)journeyDraft.arrival=el.value;const returnBox=root.querySelector('[name=returnHotel]');if(returnBox)journeyDraft.returnToHotel=returnBox.checked;return journeyDraft;}
function refreshStay(){const s=root.querySelector('#chosenStay');if(s)s.innerHTML=journeyDraft.hotel?`<strong>${esc(journeyDraft.hotel.label)}</strong><span>Stay pin ready · check its position.</span>`:'No hotel selected.';updateTripMap(false);renderSelected();}
function chooseHotelPin(point){if(!isKoreaPoint(point)){message('Place your accommodation pin in Korea.');return;}journeyDraft.hotel={...point,label:root.querySelector('#hotelQuery')?.value.trim().slice(0,120)||'My accommodation'};picking=false;map?.pick(false);message('Hotel pin added. Check the position before saving.');refreshStay();}
function selectedPlace(){return catalog.find(p=>p.id===selectedStop);}
function updateTripMap(fit=true){if(!current||!map)return;const day=current.plan.days[activeDay],points=routePoints(day,catalog,journeyDraft,devicePoint),base=basePoint(journeyDraft,devicePoint);const visible=day.stops.map((id,i)=>({...catalog.find(p=>p.id===id),number:i+1}));if(base&&!journeyDraft.hotel||base&&journeyDraft.origin!=='hotel')visible.unshift({...base,id:'start',kind:'base',label:base.label||'This device'});map.update({points:visible,route:points,hotel:journeyDraft.hotel,airports:current.id?Object.values(AIRPORTS).filter(a=>a.city===cityNow()):[],selected:selectedStop,fit});}
function selectStop(id){
 const wasAirport=Boolean(AIRPORTS[selectedStop]);
 if(current&&!current.id&&selectedStop!==id){
   const panel=root.querySelector('#selectedPlace');if(panel)panel.hidden=true;
   root.querySelectorAll('[data-select-stop]').forEach(b=>b.setAttribute('aria-expanded','false'));
 }
 syncEnglishMap(id);
 selectedStop=id;map?.select(id);root.querySelectorAll('[data-select-stop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.selectStop===id)));
 if(wasAirport&&!AIRPORTS[id])updateTripMap(true);
 if(map&&AIRPORTS[id]&&journeyDraft.hotel){const day=current.plan.days[activeDay];map.update({points:day.stops.map((pid,i)=>({...catalog.find(p=>p.id===pid),number:i+1})),route:[AIRPORTS[id],journeyDraft.hotel],hotel:journeyDraft.hotel,fit:true});map.select(id);}
 renderSelected();
}
function renderAnchor(){const anchor=AIRPORTS[selectedStop]||(selectedStop==='hotel'?journeyDraft.hotel:basePoint(journeyDraft,devicePoint)),el=root.querySelector('#selectedPlace');if(!anchor){el.innerHTML='<div class="empty-day"><h2>Choose your starting point.</h2><button class="sori-secondary" data-open-stay>Add your accommodation</button></div>';return;}const airport=AIRPORTS[selectedStop],hint=airport?transferHint(selectedStop,cityNow()):null,first=catalog.find(p=>p.id===current.plan.days[activeDay].stops[0]),destination=airport?journeyDraft.hotel:first;
 el.innerHTML=`<article class="selected-place"><span class="eyebrow">${airport?'Your arrival':'Your starting point'}</span><h2>${esc(anchor.label||'This device')}</h2><p class="transit-hint">${airport?esc(hint.text):'Your shared hotel anchors the plan. Compare each journey before setting off.'}</p>${destination?`<a class="sori-primary full-width" href="${googleLeg(anchor,destination)}" target="_blank" rel="noopener noreferrer">${airport?'Airport to hotel':'To the first stop'} · Google Maps</a>`:'<button class="sori-primary" data-open-stay>Add your hotel to connect the journey</button>'}${hint?`<a class="text-button" href="${hint.source}" target="_blank" rel="noopener noreferrer">Airport transport information</a>`:''}${first?`<button class="text-button" data-select-stop="${first.id}">Back to the day’s places</button>`:''}</article>`;
}
function stopConversation(place){
 const key=/market|jagalchi/.test(place.id)?'market':place.tag==='cafes'?'cafe':place.tag==='food'?'restaurant':null;
 if(!key)return '';
 const label={market:'Try the market conversation',cafe:'Try the café conversation',restaurant:'Try the restaurant conversation'}[key];
 return '<button type="button" class="text-button" data-scene="'+key+'">'+label+'</button>';
}
function renderSelected(){const el=root.querySelector('#selectedPlace'),place=selectedPlace();if(AIRPORTS[selectedStop]||['hotel','start'].includes(selectedStop)){renderAnchor();return;}if(!place){el.innerHTML='<div class="empty-day"><h2>A day with room for anything.</h2><p>Add a place to see it on the map.</p></div>';return;}const day=current.plan.days[activeDay],index=day.stops.indexOf(place.id),before=index>0?catalog.find(p=>p.id===day.stops[index-1]):basePoint(journeyDraft,devicePoint),phrase=phraseForPlace(place),distance=before?kmBetween(before,place):null;
 if(!current.id){
   el.innerHTML=`<article class="inline-stop"><p>${esc(place.description)}</p><a class="sori-primary" href="${googleLeg(before,place,travelMode)}" target="_blank" rel="noopener noreferrer">Directions</a>
     <details class="stop-tools"><summary>More about this stop</summary><p>${esc(place.note)}</p><p>${esc(place.transitHint)}</p><div class="travel-modes" role="group" aria-label="Transport mode">${[['transit','Transit'],['walking','Walk'],['driving','Car / taxi']].map(([id,label])=>`<button type="button" data-travel-mode="${id}" aria-pressed="${travelMode===id}">${label}</button>`).join('')}</div><a class="google-map-link" href="${esc(place.source)}" target="_blank" rel="noopener noreferrer">Place information</a><div class="place-language"><strong lang="ko">${esc(phrase.ko)}</strong><p>${esc(phrase.en)}</p><button type="button" class="sori-secondary" data-audio="${esc(phrase.ko)}">Listen</button> <button type="button" class="text-button" data-phrase="${PHRASES.indexOf(phrase)}">Practice</button>${stopConversation(place)}</div></details></article>`;
   return;
 }
 el.innerHTML=`<article class="selected-place"><div class="selected-heading"><img src="${esc(place.photo)}" alt="${esc(place.photoAlt)}" width="120" height="120"><div><span class="eyebrow">Stop ${index+1} · ${esc(place.tag)}</span><h2>${esc(place.name)}</h2><p lang="ko">${esc(place.ko)}</p></div></div><a class="google-map-link" href="${esc(mapLink(place))}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a><details class="stop-tools"><summary>Travel options</summary><div class="leg-summary"><span>${before?'From '+esc(before.label||before.name):'From your current location in Google Maps'}</span>${distance!==null?`<strong>${distance<1?(distance*1000).toFixed(0)+' m':distance.toFixed(1)+' km'} apart <small>straight-line</small></strong>`:''}</div><div class="travel-modes" role="group" aria-label="Transport mode">${[['transit','Transit'],['walking','Walk'],['driving','Car / taxi']].map(([id,label])=>`<button type="button" data-travel-mode="${id}" aria-pressed="${travelMode===id}">${label}</button>`).join('')}</div><a class="sori-primary full-width" href="${googleLeg(before,place,travelMode)}" target="_blank" rel="noopener noreferrer">See ${travelMode==='transit'?'transit':travelMode==='walking'?'walking':'driving'} options in Google Maps</a></details><p class="transit-hint">${esc(place.transitHint)}</p><details class="place-more"><summary>Place details & photo</summary><figure class="stop-photo"><img src="${esc(place.photo)}" alt="${esc(place.photoAlt)}" width="960" height="640" loading="lazy"><figcaption>${place.photoContext?'Area / atmosphere photo · ':''}<a href="${esc(place.photoSource)}" target="_blank" rel="noopener noreferrer">${esc(place.photoCredit)} / Unsplash</a></figcaption></figure><p>${esc(place.description)}</p><p class="small-note">${esc(place.note)}</p><p class="small-note">${place.pinAccuracy==='area'?'This is a neighbourhood / flexible stop pin.':'Pin positions are approximate; confirm the entrance in your map app.'}</p><div class="stop-links"><a href="${naverLink(place)}" target="_blank" rel="noopener noreferrer">Naver Map</a><a href="${mapLink(place)}" target="_blank" rel="noopener noreferrer">Google Maps place</a><a href="${esc(place.source)}" target="_blank" rel="noopener noreferrer">Source</a></div></details><details class="stop-tools"><summary>Korean for this stop</summary><div class="place-language"><strong lang="ko">${esc(phrase.ko)}</strong><p>${esc(phrase.en)}</p><div><button type="button" class="sori-secondary" data-audio="${esc(phrase.ko)}">Listen</button><button type="button" class="text-button" data-phrase="${PHRASES.indexOf(phrase)}">Practice</button></div>${stopConversation(place)}</div></details>${current.id?`<div class="stop-actions"><button data-move="${activeDay}:${index}:-1" ${index===0?'disabled':''}>Earlier</button><button data-move="${activeDay}:${index}:1" ${index===day.stops.length-1?'disabled':''}>Later</button><button data-remove="${activeDay}:${index}" aria-label="Remove ${esc(place.name)}">Remove stop</button></div>`:''}<button class="text-button" type="button" data-back-stops>Back to itinerary</button></article>`;
}
function focusArea(id){
  const n=root.querySelector('#'+id);if(!n)return;n.focus({preventScroll:true});n.scrollIntoView({block:'start',behavior:'instant'});
}

function dateLabel(date){return new Date(date+'T12:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});}

function pinEditor() {
  return `<details class="day-map-panel"${mapOpen ? ' open' : ''}><summary>Edit route pins & airport</summary>
    <div class="trip-map-wrap"><div id="tripMap" class="journey-map trip-map" role="region" aria-label="Edit your route pins"></div>
    <div class="map-tools"><button type="button" data-map-fit>Fit day</button><button type="button" data-map-airports>Airports</button><button type="button" data-device-location>My location</button></div></div>
    <div class="map-caption"><span>Pins in visit order</span><button type="button" class="text-button" data-map-size>Expand map</button></div></details>`;
}

function previewControls() {
  return `<details class="trip-setup-panel"><summary>Save & edit with friends</summary><form id="copyDayForm">
    <label>First travel day<input type="date" name="date" value="${esc(current.plan.days[0].date || koreaDate())}" required></label>
    <label>Your name<input name="name" maxlength="40" autocomplete="nickname" required></label>
    <p class="small-note">Add a hotel, change stops and invite friends to edit your trip.</p>
    <button type="submit" class="sori-primary">Save editable trip</button></form></details>`;
}

function openPreview(preview, draft = {}) {
  destroyMap();
  identity = devicePoint = selectedStop = null;
  mapOpen = false;
  activeDay = 0;
  const journey = {arrival:'none', origin:'hotel', hotel:null, returnToHotel:false};
  current = {plan:{food:'local', pace:'relaxed', ...draft, title:preview.title, days:draft.days || preview.days, journey}, members:[], comments:[]};
  renderTrip();
  window.SoriNav?.show('guide');
  root.querySelector('#tripTitle').focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
}

function recentDays() {
  const saved=storage.get('sori:recent-days');
  return (Array.isArray(saved)?saved:[]).filter(x=>typeof x?.hash==='string' && x.hash.startsWith('#day=') &&
    readPublicItinerary(new URLSearchParams(x.hash.slice(1)),catalog)).slice(0,6);
}
function itineraries() {
  destroyMap();current=identity=devicePoint=joinInvite=null;mapOpen=false;message('');
  root.className='map-guide travel-home';
  const saved=recentDays(), shared=storage.get('sori:last-trip');
  const entries=saved.map(x=>{
    const day=readPublicItinerary(new URLSearchParams(x.hash.slice(1)),catalog);
    return `<a class="section-row" href="${esc(x.hash)}"><strong>${esc(day.title)}</strong><span>${day.days.length} ${day.days.length===1?'day':'days'}</span></a>`;
  }).join('');
  root.querySelector('#tripContent').innerHTML=`<h1 class="section-page-title">My itineraries</h1><div class="section-rows">${shared?'<button type="button" class="section-row" data-resume-trip><strong>My shared trip</strong><span>Open the trip saved on this browser</span></button>':''}${entries}</div>
    ${shared||saved.length?'':'<p class="empty-note">Choose a city in the trip planner. The itinerary you build will appear here.</p>'}<a class="section-back" href="#guide">Open trip planner</a>`;
  window.SoriNav?.show('guide');window.scrollTo({top:0,behavior:'instant'});
}
function showPreview(city, days, draft) {
  const params = itineraryParams(city, days);
  const preview = readPublicItinerary(params, catalog);
  if (!preview) throw Error('This itinerary could not open. Choose another day.');
  const hash = '#' + params;
  const state = draft ? {soriPreview:{hash, firstDay:draft.days[0].date, pace:draft.pace, food:draft.food}} : null;
  storage.set('sori:recent-days',[{hash,state:state?.soriPreview || null},...recentDays().filter(x=>x.hash!==hash)].slice(0,6));
  if (location.hash !== hash) history.pushState(state, '', hash);
  else history.replaceState(state, '', hash);
  openPreview(preview, draft);
}

function shareItinerary() {
  if (!current) return;
  const city = cityNow(), days = current.plan.days;
  const url = itineraryShareUrl(location.origin, city, days, catalog);
  if (!url) { message('Add a stop before sharing your itinerary.'); return; }
  const publicPlan = readPublicItinerary(itineraryParams(city, days), catalog);
  const lines = days.map((d, i) => {
    const names = d.stops.map(id => catalog.find(p => p.id === id).name).join(' → ') || 'Free day';
    return days.length > 1 ? 'Day ' + (i + 1) + ' · ' + names : names;
  });
  return sharePublic({title:publicPlan.title + ' · Sori', text:[publicPlan.title, ...lines].join('\n'), url}, root.querySelector('#dayShareStatus'), {copied:'Itinerary copied. Paste it into a message.', linkLabel:'Open shared itinerary'});
}

function syncEnglishMap(id) {
  const panel = root.querySelector('#placeMap');
  const place = catalog.find(p => p.id === id);
  if (!panel || !place) return;
  panel.querySelectorAll('[data-map-stop]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mapStop === id)));
  const host = panel.querySelector('.google-map-canvas'), src = placeEmbed(place);
  if (host.dataset.embed === src) return;
  host.dataset.embed = src;
  host.dataset.title = place.name;
  const link = panel.querySelector('a');
  link.href = mapLink(place);
  link.textContent = 'Open ' + place.name + ' in Google Maps';
  host.replaceChildren();
  mountPlaceMap(panel);
}

function tripEditors(day,p,city,hint,owner){return `<details class="trip-setup-panel" data-edit-stay><summary>Your stay & departure</summary><form id="journeyForm">${stayEditor(true)}<label>Start each day from<select name="origin"><option value="hotel" ${journeyDraft.origin==='hotel'?'selected':''}>My accommodation</option><option value="airport" ${journeyDraft.origin==='airport'?'selected':''}>Arrival airport</option><option value="current" ${journeyDraft.origin==='current'?'selected':''}>This device’s location</option></select></label><p class="small-note">Device location stays on this page and is never saved to the group. Tap My location to set it.</p><button class="sori-primary" type="submit">Save trip base</button></form>${hint?`<p class="airport-hint">${esc(hint.text)} <a href="${hint.source}" target="_blank" rel="noopener noreferrer">Airport transport details</a></p>`:''}${journeyDraft.hotel&&AIRPORTS[journeyDraft.arrival]?`<a class="text-button" href="${googleLeg(AIRPORTS[journeyDraft.arrival],journeyDraft.hotel)}" target="_blank" rel="noopener noreferrer">Airport to hotel · Google Maps</a>`:''}</details>
 <details class="day-edit"><summary>Edit the day’s places</summary><p class="small-note">${esc(AREAS[day.area])} · ${day.stops.length} stops. You can change this with your group.</p><button type="button" class="sori-secondary" data-optimize ${!basePoint(p.journey,devicePoint)?'disabled':''}>Order nearby stops from my base</button><p class="small-note">Uses straight-line pin distance, not traffic or transit time.</p><form class="add-place" data-day="${activeDay}"><label for="addPlace">Add a place<select id="addPlace" name="place">${catalog.filter(x=>cityForArea(x.area)===city&&!day.stops.includes(x.id)).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label><button class="sori-secondary" ${day.stops.length>=6?'disabled':''}>Add stop</button></form></details>
 <details class="group-panel"><summary>${current.members.length} ${current.members.length===1?'traveler':'travelers'} & group notes</summary><div class="member-stack">${current.members.map(m=>`<span>${esc(m.name)}${owner&&m.role==='guest'?`<button type="button" data-remove-member="${m.id}" aria-label="Remove ${esc(m.name)}">Remove</button>`:''}</span>`).join('')}</div><form id="commentForm"><label for="tripComment">Your note<textarea id="tripComment" name="body" maxlength="500" required placeholder="A meeting point, a cafe, an idea…"></textarea></label><button class="sori-secondary">Post note</button></form><div class="comment-list">${current.comments.map(c=>`<article><strong>${esc(c.name)}</strong><p>${esc(c.body)}</p></article>`).join('')||'<p class="small-note">Invite a friend and make this day together.</p>'}</div></details>`;}
function renderTrip(){
  destroyMap();root.className='map-guide exploring';
  const p=current.plan,city=cityNow(),privateTrip=Boolean(current.id),me=current.members.find(m=>m.id===identity?.id);
  if(privateTrip&&!me){current=null;message('Ask the creator for a fresh invitation.');return;}
  const owner=me?.role==='owner';
  activeDay=Math.min(activeDay,p.days.length-1);const day=p.days[activeDay];
  if(!day.stops.includes(selectedStop))selectedStop=day.stops[0]||null;
  journeyDraft=structuredClone(p.journey||defaultJourney(city));const hint=transferHint(journeyDraft.arrival,city);
  const dayTabs = p.days.length > 1 ? `<div class="day-tabs" role="group" aria-label="Choose day">${p.days.map((d,i) =>
    `<button type="button" data-day-tab="${i}" aria-pressed="${activeDay===i}"><strong>Day ${i+1}</strong>${d.date?`<span>${dateLabel(d.date)}</span>`:''}</button>`).join('')}</div>` : '';
  const tools = privateTrip ? `<div class="trip-controls"><button type="button" class="stay-shortcut" data-open-stay>
      <span>Your stay</span><strong>${esc(journeyDraft.hotel?.label || 'Add your hotel')}</strong></button>
      ${owner ? '<button type="button" class="sori-secondary" data-invite>Invite to edit</button>' : `<span>${current.members.length} travelers</span>`}</div>
      <div id="inviteResult"></div>` : '';
  root.querySelector('#tripContent').innerHTML = `${cover(p, city, catalog)}${dayTabs}
    <div class="travel-columns${privateTrip?'':' simple-route'}"><div class="travel-route">${privateTrip?'':placeMap(day,catalog,selectedStop)}${stopList(day, catalog, selectedStop, city,!privateTrip)}
      ${privateTrip?placeMap(day,catalog,selectedStop):''}</div><div class="travel-details"><div tabindex="-1" id="selectedPlace"${privateTrip?'':' hidden'}></div></div></div>
    ${tools}${privateTrip ? tripEditors(day,p,city,hint,owner) + pinEditor() : previewControls() + moreDays(city,p.days)}`;
  const englishMap = root.querySelector('#placeMap');
  englishMap?.addEventListener('toggle', () => {
    mountPlaceMap(englishMap);
    const control=root.querySelector('[data-open-map]');
    if(control){control.textContent=englishMap.open?'Hide map':'View map';control.setAttribute('aria-expanded',String(englishMap.open));}
  });
  const panel = root.querySelector('.day-map-panel');
  if (panel) {
    function mountPins() {
      if (!panel.open || !panel.isConnected) return;
      if (!map) {
        map=createJourneyMap(root.querySelector('#tripMap'), {centre:CITY_CENTRES[city],
          onSelect:id=>{selectStop(id);focusArea('selectedPlace');}, onPick:chooseHotelPin});
        updateTripMap();
      }
      map.refresh();
    }
    panel.addEventListener('toggle', () => {if(panel.isConnected){mapOpen=panel.open;mountPins();}});
    mountPins();
  }
  renderSelected();
}
window.SoriGuide = {
  hasTrip: () => Boolean(current),
  route: () => current?.id ? '#trip=' + current.id : current ? '#' + itineraryParams(cityNow(), current.plan.days) : '#guide',
  share: shareItinerary
};
async function mutate(plan){if(!current?.id)return;try{current=await api('trips/'+current.id,'PATCH',{version:current.version,plan});renderTrip();message('Saved for everyone in this trip.');}catch(e){if(e.status===409){current=await api('trips/'+current.id);renderTrip();}throw e;}}
async function resume(id){mapOpen=false;identity=storage.get('sori:trip:'+id);if(!identity)throw Error('Open a fresh invitation on this browser.');current=await api('trips/'+id);history.replaceState(null,'','#trip='+id);renderTrip();window.SoriNav?.show('guide');}
async function deviceLocation(){if(!navigator.geolocation)throw Error('This browser cannot locate you. Use your hotel or a map pin.');message('Your location is used only on this page and is not shared with the trip.');await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(position=>{const point={lat:position.coords.latitude,lng:position.coords.longitude,label:'My current location'};if(!isKoreaPoint(point)){reject(Error('This location is outside Korea. Choose your hotel or arrival airport for this plan.'));return;}devicePoint=point;journeyDraft.origin='current';if(current){const day=current.plan.days[activeDay];map.update({points:[{...point,id:'start',kind:'base'},...day.stops.map((id,i)=>({...catalog.find(p=>p.id===id),number:i+1}))],route:routePoints(day,catalog,journeyDraft,devicePoint),hotel:journeyDraft.hotel});const selector=root.querySelector('[name=origin]');if(selector)selector.value='current';renderSelected();}else{map.update({points:[{...point,id:'start',kind:'base'}],hotel:journeyDraft.hotel,fit:true});}message('Location ready on this page only. It is not shared with your friends.');resolve();},()=>reject(Error('Location was not available. You can still use your hotel or place a pin.')),{enableHighAccuracy:false,timeout:10000,maximumAge:60000}));}
root.addEventListener('submit',e=>{e.preventDefault();safe(async()=>{const data=new FormData(e.target);
 if (e.target.id === 'copyDayForm' && current && !current.id) {
   const plan = {...current.plan, days:datedDays(current.plan.days, data.get('date'))};
   const btn = e.target.querySelector('[type=submit]');
   btn.disabled = true; btn.textContent = 'Saving trip…';
   try { remember(await api('trips','POST',{name:data.get('name'),plan},null)); }
   finally { if(btn.isConnected){btn.disabled=false;btn.textContent='Save editable trip';} }
   return;
 }
 if (e.target.id === 'tripForm') {
   const input = Object.fromEntries(data);
   input.end = datedDays(Array(Number(input.length)).fill({}), input.start).at(-1).date;
   input.areas = data.getAll('areas');
   input.interests = data.getAll('interests');
   input.area = input.areas[0] || 'auto';
   const plan = generatePlan(input, catalog);
   showPreview(input.city, plan.days, plan);
   return;
 }
 if(e.target.id==='journeyForm'){readJourney();journeyDraft.origin=data.get('origin');await mutate({...current.plan,journey:structuredClone(journeyDraft)});}
 if(e.target.id==='joinForm')remember(await api('join','POST',{invite:joinInvite,name:data.get('name')},null));
 if(e.target.id==='commentForm'){current=await api('trips/'+current.id+'/comments','POST',{body:data.get('body')});renderTrip();root.querySelector('.group-panel').open=true;message('Note saved for your group.');}
 if(e.target.classList.contains('add-place')){const plan=structuredClone(current.plan);plan.days[activeDay].stops.push(data.get('place'));await mutate(plan);}
 });});
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if (b.hasAttribute('data-retry-catalog')) { loadGuide(); return; }
 if (b.dataset.cityPreset) {
   const days=presetDays(b.dataset.cityPreset,Number(b.dataset.length));
   if(days)showPreview(b.dataset.cityPreset,days);
   return;
 }
 if (b.dataset.route) {
   const route = routes.find(r => r.slug === b.dataset.route);
   if (route) showPreview(route.city, [{stops:route.stops}]);
   return;
 }
 if (b.hasAttribute('data-open-map')) {
   let panel = root.querySelector('#placeMap');
   if (!panel) {
     activeDay=current.plan.days.findIndex(d=>d.stops.length);
     selectedStop=null;renderTrip();panel=root.querySelector('#placeMap');
   }
   if (panel) {
     panel.open=!panel.open;
     if(panel.open)mountPlaceMap(panel);
     if(current.id && panel.open){panel.querySelector('summary').focus({preventScroll:true});panel.scrollIntoView({block:'start'});}
   }
   return;
 }
 if (b.hasAttribute('data-share-itinerary')) {shareItinerary();return;}
 if (b.dataset.mapStop) {selectStop(b.dataset.mapStop);return;}
 if (b.dataset.dayTab !== undefined) {
   activeDay=Number(b.dataset.dayTab);selectedStop=null;renderTrip();
   root.querySelector('[data-day-tab][aria-pressed=true]')?.focus({preventScroll:true});
   return;
 }
 if (b.hasAttribute('data-new-trip')) {
   history.pushState(null,'','#guide');shell();
   root.querySelector('.city-intro h1').setAttribute('tabindex','-1');
   root.querySelector('.city-intro h1').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
   return;
 }
 if(b.hasAttribute('data-back-stops')){
   if(!current.id){root.querySelector('#selectedPlace').hidden=true;root.querySelectorAll('[data-select-stop]').forEach(button=>button.setAttribute('aria-expanded','false'));return;}
   focusArea('stopsHeading');return;
 }
 if(b.dataset.selectStop){
   if(!current.id){
     const panel=root.querySelector('#selectedPlace'),expanded=b.getAttribute('aria-expanded')==='true';
     root.querySelectorAll('[data-select-stop]').forEach(button=>button.setAttribute('aria-expanded','false'));
     if(expanded){panel.hidden=true;return;}
     selectStop(b.dataset.selectStop);b.closest('[data-stop-row]').append(panel);panel.hidden=false;b.setAttribute('aria-expanded','true');
   }else{selectStop(b.dataset.selectStop);focusArea('selectedPlace');}
   return;
 }
 if(b.dataset.travelMode){travelMode=b.dataset.travelMode;renderSelected();const mode=root.querySelector('[data-travel-mode][aria-pressed=true]');mode.closest('details').open=true;mode.focus({preventScroll:true});return;}
 if(b.dataset.phrase!==undefined){window.SoriLearn?.openKorean(PHRASES[Number(b.dataset.phrase)].ko);window.SoriNav?.show('listen');document.getElementById('lessonCard')?.scrollIntoView({block:'start'});return;}
 if(b.hasAttribute('data-map-fit')){if(current){selectStop(current.plan.days[activeDay].stops[0]||(journeyDraft.hotel?'hotel':null));updateTripMap(true);}else map?.fit();return;}if(b.hasAttribute('data-map-airports')){if(current&&AIRPORTS[journeyDraft.arrival])selectStop(journeyDraft.arrival);map?.fit(true);return;}
 if(b.hasAttribute('data-map-size')){root.classList.toggle('expanded-map');b.textContent=root.classList.contains('expanded-map')?'Smaller map':'Expand map';map?.refresh();return;}
 if(b.hasAttribute('data-open-stay')){root.querySelector('[data-edit-stay]').open=true;root.querySelector('[data-edit-stay]').scrollIntoView({block:'center',behavior:'instant'});return;}
 if(b.hasAttribute('data-pick-hotel')){const panel=root.querySelector('.day-map-panel');if(panel&&!panel.open){panel.open=true;panel.dispatchEvent(new Event('toggle'));}picking=true;map?.pick(true);message('Tap your accommodation’s position on the map. Use + to zoom in first.');root.querySelector('.journey-map').scrollIntoView({block:'center',behavior:'instant'});return;}
 safe(async()=>{
  if(b.hasAttribute('data-device-location'))await deviceLocation();
  if(b.hasAttribute('data-hotel-search')){const query=root.querySelector('#hotelQuery').value;root.querySelector('#hotelResults').textContent='Finding public hotel locations…';let result;try{result=await api('places/search?'+new URLSearchParams({q:query,city:cityNow()}),'GET',null,null);}catch(error){root.querySelector('#hotelResults').textContent='Search unavailable. Place on map still works.';throw error;}hotelResults=result.places;root.querySelector('#hotelResults').innerHTML=hotelResults.length?hotelResults.map((p,i)=>`<button type="button" class="hotel-result" data-hotel-result="${i}"><strong>${esc(p.label)}</strong><span>${esc(p.address)}</span></button>`).join(''):'No matching hotel found. Use Place on map instead.';}
  if(b.dataset.hotelResult!==undefined){const result=hotelResults[Number(b.dataset.hotelResult)];journeyDraft.hotel={label:result.label,lat:result.lat,lng:result.lng};root.querySelector('#hotelQuery').value=result.label;root.querySelector('#hotelResults').textContent='Hotel selected. Check its pin on the map.';refreshStay();}
  if(b.hasAttribute('data-resume-trip'))await resume(storage.get('sori:last-trip'));
  if(b.hasAttribute('data-optimize')){const next=structuredClone(current.plan),base=basePoint(next.journey,devicePoint);next.days[activeDay].stops=nearbyOrder(next.days[activeDay].stops,catalog,base,next.journey?.returnToHotel?next.journey.hotel:null);await mutate(next);}
  if(b.dataset.remove){const [d,pos]=b.dataset.remove.split(':').map(Number),next=structuredClone(current.plan);next.days[d].stops.splice(pos,1);await mutate(next);}
  if(b.dataset.move){const [d,pos,step]=b.dataset.move.split(':').map(Number),next=structuredClone(current.plan),stops=next.days[d].stops;[stops[pos],stops[pos+step]]=[stops[pos+step],stops[pos]];await mutate(next);}
  if(b.hasAttribute('data-invite')){const data=await api('trips/'+current.id+'/invites','POST',{}),link=location.origin+location.pathname+'#invite='+data.invite;root.querySelector('#inviteResult').innerHTML='<label>Private single-use invitation<input id="inviteLink" readonly></label><p class="small-note">Your friend can see the hotel, edit the plan and add notes. Send this privately. Expires in seven days.</p><button type="button" class="sori-secondary" data-copy-invite>Copy invitation</button> <button type="button" class="text-button" data-revoke-invites>Cancel unused invites</button>';root.querySelector('#inviteLink').value=link;}
  if(b.hasAttribute('data-copy-invite')){const field=root.querySelector('#inviteLink');try{await navigator.clipboard.writeText(field.value);message('Invitation copied.');}catch{field.focus();field.select();message('Select and copy the invitation.');}}
  if(b.hasAttribute('data-revoke-invites')){await api('trips/'+current.id+'/invites','DELETE');root.querySelector('#inviteResult').innerHTML='';message('Unused invitations cancelled.');}
  if(b.dataset.removeMember){current=await api('trips/'+current.id+'/members/'+b.dataset.removeMember,'DELETE');renderTrip();message('Guest removed.');}
 });
});
root.addEventListener('keydown',e=>{if(e.target.id==='hotelQuery'&&e.key==='Enter'){e.preventDefault();root.querySelector('[data-hotel-search]')?.click();}});
root.addEventListener('change', e => {
  if (e.target.name === 'city') root.querySelector('#areaChoices').innerHTML = areaChoices(e.target.value);
});
window.addEventListener('sori-view',e=>{if(e.detail.view==='guide')map?.refresh();});
async function restore(){if(location.hash==='#itineraries'){itineraries();return;}const params=new URLSearchParams(location.hash.slice(1));if(params.has('discover')){discover();return;}if(params.has('day')){const day=readPublicItinerary(params,catalog);if(!day){shell();window.SoriNav?.show('guide');message('That itinerary link is incomplete. Choose a city to explore.');return;}const saved=history.state?.soriPreview || recentDays().find(x=>x.hash===location.hash)?.state;
 if(saved?.hash===location.hash){
   try {const days=datedDays(day.days,saved.firstDay);openPreview(day,{days,pace:saved.pace,food:saved.food});return;} catch {}
 }
 openPreview(day);return;}if(location.hash==='#guide'){shell();window.SoriNav?.show('guide');return;}if(params.has('trip')){window.SoriNav?.show('guide');await resume(params.get('trip'));return;}if(params.has('invite')){joinInvite=params.get('invite');if(!/^[A-Za-z0-9_-]{43}$/.test(joinInvite))throw Error('This invitation is not valid.');window.SoriNav?.show('guide');const preview=await api('invitation','POST',{invite:joinInvite},null);const existing=storage.get('sori:trip:'+preview.tripId);if(existing){try{await resume(preview.tripId);return;}catch{}}
 destroyMap();root.querySelector('#tripContent').innerHTML='<div class="join-panel"><span class="eyebrow">You’re invited</span><h1>Make this day together.</h1><p>Join to see the group’s hotel and places, edit the itinerary and leave notes.</p><form id="joinForm"><label>Your name<input name="name" maxlength="40" required autocomplete="nickname"></label><button class="sori-primary">Join trip</button></form><p class="small-note">Guest access stays in this browser. No email is sent.</p></div>';}}
root.innerHTML = '<div id="guideMessage" class="guide-message" role="status" aria-live="polite"></div><div id="tripContent"></div>';
async function loadGuide() {
  const content = root.querySelector('#tripContent');
  content.innerHTML = '<p role="status">Opening your travel guide…</p>';
  try {
    const response = await fetchWithTimeout('data/places.json?v=20261119r6');
    if (!response.ok) throw Error();
    catalog = await response.json();
    shell();
  } catch {
    content.innerHTML = '<p>The itineraries could not load.</p><button type="button" class="sori-primary" data-retry-catalog>Try again</button>';
    return;
  }
  try {await restore();} catch(e) {message(e.message);}
}
window.addEventListener('hashchange', () => {if(catalog.length) restore().catch(e=>message(e.message));});
loadGuide();
setInterval(async()=>{if(!current?.id||busy||picking||document.hidden||root.style.display==='none'||root.querySelector('[data-edit-stay][open]')||document.activeElement?.closest('input,textarea,select'))return;try{const id=current.id,next=await api('trips/'+id);if(current?.id!==id)return;if(next.version!==current.version){current=next;renderTrip();message('A friend updated the trip.');}}catch(e){if(current?.id)message(e.message);}},7000);
