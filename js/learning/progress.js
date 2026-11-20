import {scenes} from './scenes.js?v=20261120ux1';
function readSession(raw, ids) {
 if (!raw || !Array.isArray(raw.ids) || !raw.ids.length || raw.ids.length > 5 ||
     raw.ids.some(id => !ids.has(id)) || new Set(raw.ids).size !== raw.ids.length ||
     !Number.isInteger(raw.index) || raw.index < 0 || raw.index > raw.ids.length) return null;
 const kind = raw.kind ?? 'daily';
 if (!['daily', 'review', ...Object.keys(scenes)].includes(kind)) return null;
 return {kind, ids: [...raw.ids], index: raw.index};
}
/* Local, account-scoped self-assessment. Listening is not pronunciation grading. */
export function dayKey(time){const d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export class PracticeProgress{
 constructor({storage,ids,clock=Date.now}){this.storage=storage;this.ids=new Set(ids);this.clock=clock;this.setUser(null);}
 setUser(uid){this.key='sori:practice:v1:'+(uid||'device');let raw;try{raw=JSON.parse(this.storage.getItem(this.key)||'null');}catch{}this.data={reviews:{},activity:{},last:null,session:null,paused:{}};if(raw&&typeof raw==='object'){
  for(const [id,r] of Object.entries(raw.reviews||{}))if(this.ids.has(id)&&r&&Number.isFinite(r.due)&&[1,3,7,14].includes(r.interval))this.data.reviews[id]={due:r.due,interval:r.interval};
  for(const [day,values] of Object.entries(raw.activity||{}).slice(-90))if(/^\d{4}-\d{2}-\d{2}$/.test(day)&&Array.isArray(values))this.data.activity[day]=[...new Set(values.filter(id=>this.ids.has(id)))];
  if(this.ids.has(raw.last))this.data.last=raw.last;
  this.data.session=readSession(raw.session,this.ids);
  for (const value of Object.values(raw.paused || {})) {
   const s=readSession(value,this.ids);
   if(s && s.index < s.ids.length && s.kind !== this.data.session?.kind) this.data.paused[s.kind]=s;
  }
 }return this;}
 save(){try{this.storage.setItem(this.key,JSON.stringify(this.data));this.error=false;}catch{this.error=true;}return !this.error;}
 setLast(id){if(this.ids.has(id)){this.data.last=id;this.save();}}
 due(pool=[...this.ids]){return pool.filter(id=>this.ids.has(id)&&this.data.reviews[id]?.due<=this.clock()).sort((a,b)=>this.data.reviews[a].due-this.data.reviews[b].due);}
 sessionFor(kind){const s=this.active();return s?.kind===kind?s:this.data.paused[kind]||null;}
 start(pool,{kind='daily',fresh=false}={}){
  if(!['daily','review',...Object.keys(scenes)].includes(kind))throw Error('Unknown practice.');
  const active=this.active();
  if(active?.kind===kind&&!fresh)return active;
  if(active&&active.kind!==kind)this.data.paused[active.kind]=active;
  const parked=this.data.paused[kind];delete this.data.paused[kind];
  if(parked&&!fresh){this.data.session=parked;this.save();return parked;}
  if(Object.hasOwn(scenes,kind)){const ids=[...new Set(pool.filter(id=>this.ids.has(id)))].slice(0,5);this.data.session={kind,ids,index:0};this.save();return this.data.session;}
  const due=this.due(pool),unseen=pool.filter(id=>this.ids.has(id)&&!this.data.reviews[id]),later=pool.filter(id=>this.ids.has(id)&&!due.includes(id)&&!unseen.includes(id)).sort((a,b)=>(this.data.reviews[a]?.due||0)-(this.data.reviews[b]?.due||0));const ids=[...new Set([...due,...unseen,...later])].slice(0,5);this.data.session={kind,ids,index:0};this.save();return this.data.session;}
 active(){const s=this.data.session;return s&&s.index<s.ids.length?s:null;}
 answer(rating){const s=this.active();if(!s||!['again','remembered'].includes(rating))return false;const id=s.ids[s.index],old=this.data.reviews[id],interval=rating==='again'?1:old?({1:3,3:7,7:14,14:14}[old.interval]||1):1;
  this.data.reviews[id]={interval,due:this.clock()+(rating==='again'?10*60000:interval*86400000)};this.data.last=id;const day=dayKey(this.clock());this.data.activity[day]=[...new Set([...(this.data.activity[day]||[]),id])];for(const key of Object.keys(this.data.activity).sort().slice(0,-90))delete this.data.activity[key];s.index++;this.save();return true;}
 stats(){const today=this.data.activity[dayKey(this.clock())]||[];return {today:today.length,due:this.due().length,practiced:Object.keys(this.data.reviews).length,last:this.data.last};}
}
