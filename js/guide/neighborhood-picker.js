import {centers} from './neighborhoods.js';
import {kmBetween} from './geo.js?v=20261121trip';

export function mountNeighborhoodPicker(root,onFilter){
 const panel=root.querySelector('.neighborhood-picker'),select=root.querySelector('#discoverArea');
 const canvas=panel.querySelector('.atlas-map'),note=panel.querySelector('[role=status]');
 const areas=Array.from(select.options,o=>o.value).filter(name=>centers[name]);
 const point=name=>({lat:centers[name][0],lng:centers[name][1]});
 let map,disposed=false;
 function choose(name){
  select.value=name;
  note.textContent=name?'Showing places in '+name+'.':'Showing all neighborhoods.';
  if(map&&name)map.setView(centers[name],14);
  onFilter();
 }
 function draw(){
  if(!window.L){note.textContent='Choose a neighborhood in Filters or use your location.';return;}
  if(map){map.invalidateSize();return;}
  const L=window.L;
  map=L.map(canvas,{scrollWheelZoom:false,dragging:true});
  L.tileLayer(window.SoriConfig?.mapTileUrl||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  for(const name of areas){
   const title=document.createElement('span');title.textContent=name;
   const pin=L.marker(centers[name],{title:name,alt:name,icon:L.divIcon({className:'district-dot',html:'<i></i>',iconSize:[24,24]})}).addTo(map);
   pin.bindTooltip(title);pin.on('click',()=>choose(name));
  }
  if(areas.length)map.fitBounds(areas.map(a=>centers[a]),{padding:[15,15],maxZoom:14});else map.setView([37.56,126.98],11);
 }
 panel.ontoggle=()=>{if(panel.open)draw();};
 panel.querySelector('[data-clear-area]').onclick=()=>{choose('');if(map&&areas.length)map.fitBounds(areas.map(a=>centers[a]),{padding:[15,15],maxZoom:14});};
 const nearby=panel.querySelector('[data-nearby]');
 nearby.onclick=()=>{
  if(!navigator.geolocation){note.textContent='Location is unavailable. Select a pin or use Filters.';return;}
  nearby.disabled=true;note.textContent='Finding your nearest neighborhood…';
  navigator.geolocation.getCurrentPosition(({coords})=>{
   if(disposed)return;nearby.disabled=false;
   const here={lat:coords.latitude,lng:coords.longitude};
   const nearest=areas.map(name=>({name,km:kmBetween(here,point(name))})).sort((a,b)=>a.km-b.km)[0];
   if(!nearest||nearest.km>35){note.textContent='You appear to be outside this area. Choose a neighborhood on the map.';return;}
   choose(nearest.name);note.textContent=nearest.name+' · about '+nearest.km.toFixed(1)+' km to the neighborhood center.';
  },()=>{if(disposed)return;nearby.disabled=false;note.textContent='Location is unavailable. Choose a pin or select a neighborhood in Filters.';},{maximumAge:60000,timeout:10000});
 };
 select.addEventListener('change',()=>{if(panel.open)choose(select.value);});
 return ()=>{disposed=true;map?.remove();};
}
