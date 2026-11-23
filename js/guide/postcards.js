import {icon} from '../ui-icons.js';
import {AREAS, CITIES, cityForArea, mapLink, placeEmbed} from './planner.js?v=20261121trip';
import {cityPicks, matchRoute, routes} from './public-day.js?v=20261121polish';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[c]);
export const koreaDate = () => new Date().toLocaleDateString('sv-SE', {timeZone:'Asia/Seoul'});

const cityLines = {
  seoul: 'Tea, craft shops & market stalls',
  busan: 'Painted hillside lanes & seafood'
};

export function areaChoices(city) {
  return Object.entries(AREAS).filter(([id]) => cityForArea(id) === city).map(([id, name]) =>
    `<label><input type="checkbox" name="areas" value="${id}"><span>${esc(name)}</span></label>`).join('');
}

export function chooser(lastTrip) {
  const cards = Object.entries(cityPicks).map(([city, route]) => `
    <article class="city-option"><button type="button" class="city-postcard" data-route="${route.slug}">
      <img src="assets/photos/${route.photo}.jpg" alt="" width="700" height="470">
      <span class="city-card-text"><strong>${CITIES[city]}</strong><span>${cityLines[city]}</span></span>
    </button><div class="city-durations" aria-label="${CITIES[city]} itinerary length">${[1,2,3].map(n=>`<button type="button" data-city-preset="${city}" data-length="${n}" aria-label="${CITIES[city]}, ${n} ${n===1?'day':'days'}">${n} ${n===1?'day':'days'}</button>`).join('')}</div></article>`).join('');
  return `<header class="city-intro"><h1>Where to in Korea?</h1>
    <p>Choose your city and trip length.</p></header>
    <div class="city-postcards">${cards}</div>
    <details class="custom-plan"><summary>Customize my trip</summary>
      <form id="tripForm" class="quick-form">
        <div class="plan-fields"><label>City<select name="city"><option value="seoul">Seoul</option><option value="busan">Busan</option></select></label>
        <label>Length<select name="length"><option value="1">1 day</option><option value="2">2 days</option><option value="3">3 days</option></select></label>
        <label>First day<input type="date" name="start" value="${koreaDate()}" required></label></div>
        <details class="trip-preferences"><summary>More preferences</summary>
          <fieldset><legend>Interests</legend><div class="plan-chips">
          ${Object.entries({culture:'Culture',cafes:'Coffee & tea',food:'Local food',shopping:'Shopping',beauty:'Beauty',design:'Design',crafts:'Crafts',parks:'Parks & sea'}).map(([id,label]) =>
            `<label><input type="checkbox" name="interests" value="${id}"><span>${label}</span></label>`).join('')}</div></fieldset>
          <fieldset><legend>Neighbourhoods</legend><div id="areaChoices" class="plan-chips">${areaChoices('seoul')}</div></fieldset>
          <div class="plan-fields"><label>Pace<select name="pace"><option value="relaxed">Room to wander</option><option value="balanced">A fuller day</option></select></label>
          <label>Food<select name="food"><option value="local">Local food</option><option value="mild">Keep it mild</option><option value="vegetarian">Leave meal stops open</option></select></label></div>
        </details><button type="submit" class="sori-primary">See my itinerary</button>
      </form></details>
      ${lastTrip ? '<button type="button" class="text-button last-trip" data-resume-trip>Return to my saved trip</button>' : ''}`;
}

export function cover(plan, city, catalog) {
  const total = plan.days.reduce((count, d) => count + d.stops.length, 0);
  const theme = plan.days.length === 1 && matchRoute(city, plan.days[0].stops);
  const first = catalog.find(p => p.id === plan.days.find(d => d.stops.length)?.stops[0]);
  const photo = theme ? 'assets/photos/' + theme.photo + '.jpg' : first?.photo || 'assets/photos/' + cityPicks[city].photo + '.jpg';
  const label = CITIES[city] + ' · ' + (plan.days.length === 1 ? '1 day' : plan.days.length + ' days') + ' · ' + total + (total === 1 ? ' stop' : ' stops');
  return `<button type="button" class="text-button trip-back" data-new-trip>Explore cities</button><header class="trip-cover">
    <img src="${esc(photo)}" alt="" width="960" height="480">
    <div><span>${label}</span><h1 id="tripTitle" tabindex="-1">${esc(plan.title)}</h1></div>
  </header>
  <div class="postcard-actions">
    ${total ? '<button type="button" class="sori-primary" data-share-itinerary>Share itinerary</button>' : ''}
    ${total ? '<button type="button" class="sori-secondary" data-open-map>View map</button>' : ''}
  </div><div id="dayShareStatus" class="share-feedback" role="status" aria-live="polite"></div>`;
}

export function stopList(day, catalog, selected, city, inline = false) {
  if (!day.stops.length) return '<h2 id="stopsHeading" tabindex="-1">Your stops</h2><p>Add a place to start this day.</p>';
  const rows = day.stops.map((id, i) => {
    const p = catalog.find(place => place.id === id);
    return `<li data-stop-row="${p.id}"><div class="stop-row-main"><button type="button" data-select-stop="${p.id}" aria-pressed="${selected === id}"${inline?' aria-expanded="false"':''}>
      <span class="stop-number">${i + 1}</span><span class="stop-words"><strong>${esc(p.name)}</strong>
      <small>${inline?esc(p.ko):esc(p.description)}</small></span><img src="${esc(p.photo)}" alt="" width="68" height="64" loading="lazy"></button>${inline?`<a class="stop-map" href="${esc(mapLink(p))}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(p.name)} in Google Maps">${icon('map')}</a>`:''}</div></li>`;
  }).join('');
  return `<section class="postcard-stops"><h2 id="stopsHeading" tabindex="-1">Your stops in ${CITIES[city]}</h2><ol>${rows}</ol></section>`;
}

export function moreDays(city, days) {
  const selected = days.length === 1 && matchRoute(city, days[0].stops);
  return `<details class="more-days"><summary>Other day trips in ${CITIES[city]}</summary><div>${routes
    .filter(r => r.city === city && r !== selected).map(r =>
      `<button type="button" data-route="${r.slug}"><img src="assets/photos/${r.photo}.jpg" alt="" width="80" height="62" loading="lazy"><strong>${r.title}</strong></button>`).join('')}</div></details>`;
}

export function placeMap(day, catalog, selectedId) {
  if (!day.stops.length) return '';
  const p = catalog.find(place => place.id === selectedId) || catalog.find(place => place.id === day.stops[0]);
  const tabs = day.stops.map((id, i) => {
    const stop = catalog.find(place => place.id === id);
    return `<button type="button" data-map-stop="${id}" aria-pressed="${id===p.id}">${i+1}. ${esc(stop.name)}</button>`;
  }).join('');
  return `<details class="english-map" id="placeMap"><summary>View stops on Google Maps</summary>
    <div class="map-stop-picks" role="group" aria-label="Choose a place on the map">${tabs}</div>
    <div class="google-map-canvas" data-embed="${esc(placeEmbed(p))}" data-title="${esc(p.name)}"></div>
    <a class="google-map-link" href="${esc(mapLink(p))}" target="_blank" rel="noopener noreferrer">Open ${esc(p.name)} in Google Maps</a>
  </details>`;
}

export function mountPlaceMap(panel) {
  if (!panel?.open) return;
  const host = panel.querySelector('.google-map-canvas');
  if (host.childElementCount) return;
  const iframe = document.createElement('iframe');
  iframe.title = host.dataset.title + ' on Google Maps in English';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.src = host.dataset.embed;
  host.append(iframe);
}
