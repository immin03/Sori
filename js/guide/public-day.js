import {CITIES,cityForArea} from './planner.js?v=20261119r6';
export const dayPresets = {
  "seoul": {
    "title": "Tea and market lanes",
    "area": "north",
    "stops": [
      "insadong",
      "tea",
      "market"
    ]
  },
  "busan": {
    "title": "A Haeundae seaside walk",
    "area": "haeundae",
    "stops": [
      "haeundae-beach",
      "mipo",
      "haeundae-cafe"
    ]
  }
};
export function readPublicDay(params,catalog){
  const city=params.get('day');
  if(!Object.hasOwn(dayPresets,city))return null;
  const preset=dayPresets[city],stops=params.has('stops')?params.get('stops').split(','):preset.stops.slice();
  if(!stops.length||stops.length>6||new Set(stops).size!==stops.length)return null;
  const places=stops.map(id=>catalog.find(p=>p.id===id));
  if(places.some(p=>!p||cityForArea(p.area)!==city))return null;
  const standard=stops.join(',')===preset.stops.join(',');
  return {city,title:standard?preset.title:'A day in '+CITIES[city],area:places[0].area,stops};
}
export function publicDayUrl(origin,city,stops,catalog){
  const params=new URLSearchParams({day:city,stops:stops.join(',')});
  const day=readPublicDay(params,catalog);
  if(!day)return null;
  if(day.stops.join(',')===dayPresets[city].stops.join(','))params.delete('stops');
  return new URL('/#'+params.toString(),new URL(origin).origin).href;
}
