export function validateTrip(value, catalog) {
 const ids=new Set(catalog.map(p=>p.id));
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.title!=='string'||value.title.length>80||!['local','mild','vegetarian'].includes(value.food)||!Array.isArray(value.days)||value.days.length<1||value.days.length>3)throw Error('Invalid trip.');
 for(const day of value.days){
  if(!day||!/^\d{4}-\d{2}-\d{2}$/.test(day.date||'')||!Array.isArray(day.stops)||day.stops.length>6||new Set(day.stops).size!==day.stops.length||day.stops.some(id=>!ids.has(id))||!Number.isFinite(Date.parse(day.date+'T12:00:00Z'))||new Date(day.date+'T12:00:00Z').toISOString().slice(0,10)!==day.date)throw Error('Invalid trip stops.');
 }
 return {title:value.title,food:value.food,pace:value.pace==='relaxed'?'relaxed':'balanced',days:value.days.map(d=>({date:d.date,area:String(d.area||'').slice(0,40),stops:d.stops}))};
}
