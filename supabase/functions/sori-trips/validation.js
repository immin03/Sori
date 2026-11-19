export function normalizeJourney(value){
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value)||!['none','icn1','icn2','gmp','pus'].includes(value.arrival)||!['hotel','airport','current'].includes(value.origin))throw Error('Choose valid arrival and starting point settings.');
 let hotel=null;
 if(value.hotel!=null){const h=value.hotel;if(!h||typeof h.label!=='string'||!h.label.trim()||h.label.length>120||typeof h.lat!=='number'||typeof h.lng!=='number'||!Number.isFinite(h.lat)||!Number.isFinite(h.lng)||h.lat<33||h.lat>39.5||h.lng<124||h.lng>132)throw Error('Choose a hotel pin in Korea.');hotel={label:h.label.trim(),lat:h.lat,lng:h.lng};}
 return {arrival:value.arrival,origin:value.origin,hotel,returnToHotel:value.returnToHotel!==false};
}
export function validateTrip(value, catalog) {
 const ids=new Set(catalog.map(p=>p.id));
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.title!=='string'||value.title.length>80||!['local','mild','vegetarian'].includes(value.food)||!Array.isArray(value.days)||value.days.length<1||value.days.length>3)throw Error('Invalid trip.');
 for(const day of value.days){
  if(!day||!/^\d{4}-\d{2}-\d{2}$/.test(day.date||'')||!Array.isArray(day.stops)||day.stops.length>6||new Set(day.stops).size!==day.stops.length||day.stops.some(id=>!ids.has(id))||!Number.isFinite(Date.parse(day.date+'T12:00:00Z'))||new Date(day.date+'T12:00:00Z').toISOString().slice(0,10)!==day.date)throw Error('Invalid trip stops.');
 }
 const journey=normalizeJourney(value.journey);
 return {title:value.title,food:value.food,pace:value.pace==='relaxed'?'relaxed':'balanced',days:value.days.map(d=>({date:d.date,area:String(d.area||'').slice(0,40),stops:d.stops})),...(journey?{journey}:{})};
}
