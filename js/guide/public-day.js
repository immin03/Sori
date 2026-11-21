import {CITIES, cityForArea} from './planner.js?v=20261121trip';

export const routes = [
  {
    slug: 'seoul-tea-and-markets', city: 'seoul', title: 'Tea and market lanes',
    intro: 'Wander through Insadong’s craft shops, pause for tea in a courtyard, then find lunch under the lights of Gwangjang Market.',
    photo: 'insadong', stops: ['insadong', 'tea', 'market']
  },
  {
    slug: 'seoul-forest-coffee', city: 'seoul', title: 'Coffee by Seoul Forest',
    intro: 'Start under the trees, stop for a coffee by the park, then wander into Seongsu’s old factory streets.',
    photo: 'forest', stops: ['forest', 'coffee', 'seongsu']
  },
  {
    slug: 'seoul-after-dark', city: 'seoul', title: 'Seoul after dark',
    intro: 'Catch the curves of Dongdaemun Design Plaza, follow the lights through Myeongdong, then look back over the city from Namsan.',
    photo: 'ddp', stops: ['ddp', 'myeongdong', 'namsan']
  },
  {
    slug: 'busan-haeundae-walk', city: 'busan', title: 'A Haeundae seaside walk',
    intro: 'Walk the sand at Haeundae, follow the shore toward Mipo, then find a café where you can linger by the water.',
    photo: 'haeundae', stops: ['haeundae-beach', 'mipo', 'haeundae-cafe']
  },
  {
    slug: 'busan-colour-and-markets', city: 'busan', title: 'Hillside lanes to the fish market',
    intro: 'Wind between the painted houses of Gamcheon, head down to Jagalchi for seafood, then browse the little shops in Nampo.',
    photo: 'gamcheon', stops: ['gamcheon', 'jagalchi', 'nampo']
  },
  {
    slug: 'busan-gwangalli-at-dusk', city: 'busan', title: 'Gwangalli at dusk',
    intro: 'Pick a café with a sea view, walk the sand as the bridge lights come on, then settle in for dinner near the beach.',
    photo: 'gwangalli', stops: ['gwangalli-cafe', 'gwangalli-beach', 'gwangalli-food']
  }
];

export const cityPicks = {seoul: routes[0], busan: routes[4]};
const legacyDays = {seoul: routes[0], busan: routes[3]};

export function presetDays(city, length) {
  if (!Object.hasOwn(cityPicks,city) || !Number.isInteger(length) || length<1 || length>3) return null;
  const first=cityPicks[city];
  return [first,...routes.filter(r=>r.city===city && r!==first)].slice(0,length).map(r=>({stops:[...r.stops]}));
}

export function matchRoute(city, stops) {
  return routes.find(route => route.city === city && route.stops.join(',') === stops.join(','));
}

// Only public catalogue IDs cross the share boundary, including for private group trips.
export function readPublicItinerary(params, catalog) {
  const city = params.get('day');
  if (!Object.hasOwn(CITIES, city)) return null;
  const entries = params.getAll('stops');
  if (!entries.length) entries.push(legacyDays[city].stops.join(','));
  if (entries.length > 3) return null;
  const days = [];
  const byId = new Map(catalog.filter(p => cityForArea(p.area) === city).map(p => [p.id, p]));
  for (const entry of entries) {
    const stops = entry ? entry.split(',') : [];
    if (stops.length > 6 || new Set(stops).size !== stops.length || stops.some(id => !byId.has(id))) return null;
    days.push({area: byId.get(stops[0])?.area || (city === 'seoul' ? 'north' : 'haeundae'), stops});
  }
  if (!days.some(day => day.stops.length)) return null;
  const theme = days.length === 1 && matchRoute(city, days[0].stops);
  const title = theme?.title || (days.length === 1 ? 'A day in ' : days.length + ' days in ') + CITIES[city];
  return {city, title, days};
}

export function itineraryParams(city, days) {
  const params = new URLSearchParams({day: city});
  if (days.length === 1 && legacyDays[city]?.stops.join(',') === days[0].stops.join(',')) return params;
  for (const day of days) params.append('stops', day.stops.join(','));
  return params;
}

export function readPublicDay(params, catalog) {
  const plan = readPublicItinerary(params, catalog);
  if (!plan || plan.days.length !== 1) return null;
  return {city: plan.city, title: plan.title, ...plan.days[0]};
}

export function publicDayUrl(origin, city, stops, catalog) {
  const params = itineraryParams(city, [{stops}]);
  if (!readPublicDay(params, catalog)) return null;
  return new URL('/#' + params, new URL(origin).origin).href;
}

export function itineraryShareUrl(origin, city, days, catalog) {
  if (!Array.isArray(days) || !days.length || days.length > 3) return null;
  const plan = readPublicItinerary(itineraryParams(city, days), catalog);
  if (!plan) return null;
  const theme = days.length === 1 && matchRoute(city, days[0].stops);
  const url = new URL('/explore/' + (theme?.slug || city) + '/', new URL(origin).origin);
  if (!theme) for (const day of days) url.searchParams.append('stops', day.stops.join(','));
  return url.href;
}

export function datedDays(days, firstDate) {
  const start = new Date(firstDate + 'T12:00:00Z');
  if (!Number.isFinite(+start) || start.toISOString().slice(0, 10) !== firstDate) throw Error('Choose a valid first day.');
  return days.map((day, index) => ({...day, date: new Date(+start + index * 86400000).toISOString().slice(0, 10)}));
}
