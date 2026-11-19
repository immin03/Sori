export const AREAS={north:'Jongno & Insadong',central:'Myeongdong & central Seoul',east:'Seongsu & Seoul Forest',west:'Hongdae'};
export const PHRASES=[{ko:'안 매운 걸로, 주세요.',en:'Not spicy, please.'},{ko:'얼마예요?',en:'How much is it?'},{ko:'아메리카노 한 잔, 주세요.',en:'One americano, please.'},{ko:'지하철역이 어디예요?',en:'Where is the subway station?'}];
function parseDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))throw Error('Choose valid travel dates.');const d=new Date(s+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==s)throw Error('Choose valid travel dates.');return d;}
export function validatePlan(plan,catalog){
  if(!plan||!Array.isArray(plan.days)||plan.days.length<1||plan.days.length>3)throw Error('V1 supports 1 to 3 days in Seoul.');
  const ids=new Set(catalog.map(p=>p.id));
  for(const day of plan.days){parseDate(day.date);if(!Array.isArray(day.stops)||day.stops.length>6||new Set(day.stops).size!==day.stops.length||day.stops.some(id=>!ids.has(id)))throw Error('Invalid itinerary stops.');}
  if(typeof plan.title!=='string'||plan.title.length>80)throw Error('Use a title under 80 characters.');
  if(typeof plan.food!=='string'||!['local','mild','vegetarian'].includes(plan.food))throw Error('Choose a food preference.');
  return plan;
}
export function generatePlan(input,catalog){
  const start=parseDate(input.start),end=parseDate(input.end);const count=Math.round((end-start)/86400000)+1;
  if(count<1||count>3)throw Error('Choose a trip of 1 to 3 days. Longer trips are coming later.');
  if(!Object.hasOwn(AREAS,input.area))throw Error('Choose your starting area.');
  if(!['relaxed','balanced'].includes(input.pace)||!['local','mild','vegetarian'].includes(input.food))throw Error('Choose your travel preferences.');
  const interests=(Array.isArray(input.interests)?input.interests:[]).filter(x=>['culture','cafes','beauty','design','crafts','parks'].includes(x));
  const rank=Object.keys(AREAS).map((area,index)=>({area,score:(area===input.area?12:0)+catalog.filter(p=>p.area===area&&interests.includes(p.tag)).length*2,index})).sort((a,b)=>b.score-a.score||a.index-b.index);
  const days=[];
  for(let i=0;i<count;i++){
    const date=new Date(+start+i*86400000),area=rank[i].area;
    let candidates=catalog.filter(p=>p.area===area&&!(p.id==='palace'&&date.getUTCDay()===2));
    candidates.sort((a,b)=>Number(interests.includes(b.tag))-Number(interests.includes(a.tag)));
    const meal=candidates.find(p=>p.tag==='food');
    const stops=candidates.filter(p=>p.tag!=='food').slice(0,input.pace==='relaxed'?2:3).map(p=>p.id);
    // A vegetarian preference needs a separately chosen meal, not an assumed-safe venue.
    if(meal&&input.food!=='vegetarian')stops.splice(Math.min(1,stops.length),0,meal.id);
    days.push({date:date.toISOString().slice(0,10),area,stops});
  }
  return validatePlan({title:'Our Seoul, together',food:input.food,pace:input.pace,days},catalog);
}
export function mapLink(place){return 'https://map.naver.com/p/search/'+encodeURIComponent(place.ko+' 서울');}
