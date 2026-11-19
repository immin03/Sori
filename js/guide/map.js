/* The same map surface is used for choosing a stay and exploring a trip. */
export function createJourneyMap(element,{centre,points=[],route=[],airports=[],hotel=null,onSelect=()=>{},onPick=()=>{}}={}){
 if(!window.L){element.innerHTML='<p class="map-fallback">The map could not load. Place details and Google Maps links still work.</p>';return {update(){},select(){},refresh(){},fit(){},pick(){},destroy(){}};}
 const L=window.L,map=L.map(element,{zoomControl:false,scrollWheelZoom:false,tap:true}).setView([centre.lat,centre.lng],11);
 L.tileLayer(window.SoriConfig?.mapTileUrl||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',referrerPolicy:'strict-origin-when-cross-origin'}).addTo(map);
 L.control.zoom({position:'topright'}).addTo(map);
 const layer=L.layerGroup().addTo(map);let markers=[],current=[],airportList=airports,picking=false,selected=null;
 const labelNode=text=>{const n=document.createElement('span');n.textContent=text;return n;};
 const icon=(p,active)=>L.divIcon({className:'sori-map-marker '+(active?'selected ':'')+(p.kind||'stop'),html:'<span>'+(p.kind==='airport'?'Air':p.kind==='hotel'?'Stay':p.kind==='base'?'Start':p.number||'•')+'</span>',iconSize:p.kind==='airport'?[45,32]:[36,36],iconAnchor:[18,18]});
 function draw(){layer.clearLayers();markers=[];
  if(route.length>1)L.polyline(route.map(p=>[p.lat,p.lng]),{color:'#294735',weight:3,dashArray:'6 7',opacity:.8,interactive:false}).addTo(layer);
  const all=[...airportList,...(hotel?[{...hotel,id:'hotel',kind:'hotel'}]:[]),...current];
  const seen=new Set();for(const p of all){if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||seen.has(p.id))continue;seen.add(p.id);const marker=L.marker([p.lat,p.lng],{icon:icon(p,p.id===selected),title:p.label||p.name||'',alt:p.label||p.name||'',keyboard:true}).addTo(layer);marker.getElement()?.setAttribute('aria-label',(p.number?'Stop '+p.number+': ':'')+(p.label||p.name||''));marker.bindTooltip(labelNode((p.number?p.number+'. ':'')+(p.label||p.name||'')));marker.on('click',()=>{if(!picking){select(p.id);onSelect(p.id);}});markers.push({point:p,marker});}
 }
 function select(id){selected=id;for(const {point,marker} of markers)marker.setIcon(icon(point,point.id===id));const p=current.find(p=>p.id===id);if(p&&!map.getBounds().contains([p.lat,p.lng]))map.panTo([p.lat,p.lng],{animate:false});}
 function fit(includeAirports=false){const list=[...current,...route,...(hotel?[hotel]:[]),...(includeAirports?airportList:[])];if(list.length)map.fitBounds(L.latLngBounds(list.map(p=>[p.lat,p.lng])),{padding:[32,32],maxZoom:14,animate:false});}
 function update(next={}){current=next.points||points;route=next.route||route;airportList=next.airports||airportList;if('hotel' in next)hotel=next.hotel;draw();if(next.fit!==false)fit(!!next.includeAirports);if(next.selected)select(next.selected);}
 map.on('click',e=>{if(picking){onPick({lat:Number(e.latlng.lat.toFixed(6)),lng:Number(e.latlng.lng.toFixed(6))});}});
 current=points;draw();fit();
 return {update,select,fit,pick(value){picking=value;element.classList.toggle('picking',value);},refresh(){requestAnimationFrame(()=>{map.invalidateSize({animate:false});fit();});},destroy(){map.remove();}};
}
