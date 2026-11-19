/* Geographic hints, not a traffic or transit routing engine. */
export const CITY_CENTRES={seoul:{lat:37.5665,lng:126.978},busan:{lat:35.1587,lng:129.06}};
export const AIRPORTS={
 icn1:{id:'icn1',label:'Incheon Airport · T1',short:'ICN T1',lat:37.4475,lng:126.4527,city:'seoul',kind:'airport'},
 icn2:{id:'icn2',label:'Incheon Airport · T2',short:'ICN T2',lat:37.4688,lng:126.433,city:'seoul',kind:'airport'},
 gmp:{id:'gmp',label:'Gimpo Airport',short:'GMP',lat:37.5585,lng:126.802,city:'seoul',kind:'airport'},
 pus:{id:'pus',label:'Gimhae Airport · Busan',short:'PUS',lat:35.1795,lng:128.9382,city:'busan',kind:'airport'}
};
export const isKoreaPoint=p=>p&&typeof p.lat==='number'&&typeof p.lng==='number'&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&p.lat>=33&&p.lat<=39.5&&p.lng>=124&&p.lng<=132;
export function kmBetween(a,b){if(!a||!b)return 0;const r=Math.PI/180,dlat=(b.lat-a.lat)*r,dlng=(b.lng-a.lng)*r,x=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function googleLeg(from,to,mode='transit'){
 const point=p=>p?(p.lat!=null?`${p.lat},${p.lng}`:p.label||p.name):'';
 const q=new URLSearchParams({api:'1',destination:point(to),travelmode:['walking','driving','transit'].includes(mode)?mode:'transit'});if(from)q.set('origin',point(from));
 return 'https://www.google.com/maps/dir/?'+q;
}
export function basePoint(journey={},currentPoint=null){if(journey.origin==='current')return currentPoint;if(journey.origin==='airport')return AIRPORTS[journey.arrival]||journey.hotel||null;return journey.hotel||null;}
export function routePoints(day,catalog,journey={},currentPoint=null){const base=basePoint(journey,currentPoint),stops=day.stops.map(id=>catalog.find(p=>p.id===id)).filter(Boolean);return [...(base?[{...base,id:'start',label:base.label||'Starting point',kind:'base'}]:[]),...stops,...(journey.returnToHotel&&journey.hotel&&stops.length?[{...journey.hotel,id:'return',kind:'hotel'}]:[])];}
export function nearbyOrder(ids,catalog,base,returnPoint=null){
 if(!base||ids.length<2||ids.length>6)return ids.slice();const places=ids.map(id=>catalog.find(p=>p.id===id));if(places.some(p=>!p))return ids.slice();
 let best=ids.slice(),distance=Infinity;
 function visit(rest,order,last,total){if(total>distance)return;if(!rest.length){const n=total+(returnPoint?kmBetween(last,returnPoint):0);if(n<distance){distance=n;best=order;}return;}for(const p of rest)visit(rest.filter(x=>x.id!==p.id),[...order,p.id],p,total+kmBetween(last,p));}
 visit(places,[],base,0);return best;
}
export function transferHint(airport,city){
 if(!airport||airport==='none')return null;
 const same=(airport==='pus')===(city==='busan');
 if(!same)return {text:'This airport is in another region. Plan an intercity train or flight before starting this day.',source:'https://www.letskorail.com/ebizbf/EbizBfTicketSearch.do'};
 if(airport==='pus')return {text:'Light rail connects the airport with Sasang (Metro 2) and Daejeo (Metro 3). Compare the onward trip to your hotel.',source:'https://www.airport.co.kr/gimhaeeng/cms/frCon/index.do?CONTENTS_NO=3&MENU_ID=110'};
 if(airport==='gmp')return {text:'Gimpo connects to AREX and Metro 5 / 9. Compare a metro connection or taxi to your stay.',source:'https://www.airport.co.kr/gimpo/cms/frCon/index.do?CONTENTS_NO=4&MENU_ID=1290'};
 return {text:'AREX connects Incheon Airport to Seoul Station. All-stop services also connect at Hongik University and Gimpo. Check the last connection to your stay.',source:'https://www.airportrailroad.com/train/normal/introduce'};
}
