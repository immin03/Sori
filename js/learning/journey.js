import {phraseLevel,levelNames} from './categories.js?v=20261123levels';
export const stages=['essentials','intermediate','nuance'];
const check=[
 ['처음 뵙겠습니다.','cheoeum boepgetseumnida','What is happening?',['Someone is meeting you for the first time.','Someone is ordering lunch.','Someone is leaving work.'],0],
 ['여기 앉아도 돼요?','yeogi anjado dwaeyo?','What are they asking?',['Is this your stop?','May I sit here?','Are you coming here?'],1],
 ['비가 그치면 출발해요.','biga geuchimyeon chulbalhaeyo.','When will they leave?',['Before it rains.','While it is raining.','When the rain stops.'],2],
 ['갈 뻔했어요.','gal ppeonhaesseoyo.','Which meaning fits?',['I almost went.','I have to go.','I go often.'],0],
 ['미리 알았더라면 좋았을 텐데요.','miri aratdeoramyeon joasseul tendeyo.','What does the speaker wish?',['That they could leave early.','That they had known beforehand.','That they could find out tomorrow.'],1]
];
export function placement(hits) { return hits.filter(Boolean).length>=4 && hits[4]?'nuance':hits.filter(Boolean).length>=2?'intermediate':'essentials'; }
const dayNumber=time=>{const d=new Date(time);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);};
export class Journey {
 constructor(storage,uid,rows,clock=Date.now) {
  this.storage=storage;this.clock=clock;this.rows=rows;this.key='sori:path:1:'+(uid||'device');
  const read=k=>{try{return JSON.parse(storage.getItem(k));}catch{return null;}};
  let prior=read(this.key);
  if(uid && !prior && !read('sori:path:claimed-device')){
   const guest=read('sori:path:1:device');
   if(guest){try{storage.setItem('sori:path:claimed-device','true');storage.setItem(this.key,JSON.stringify(guest));prior=guest;}catch{}}
  }
  this.data=prior||{level:null,mastered:{},activity:{},hits:[]};
 }
 save(){try{this.storage.setItem(this.key,JSON.stringify(this.data));}catch{}}
 select(level){this.data.level=level;this.data.hits=[];this.save();}
 answer(index){const hits=this.data.hits;hits.push(index===check[hits.length][4]);if(hits.length===check.length)this.select(placement(hits));else this.save();}
 pool(){return this.rows.filter(r=>phraseLevel(r)===this.data.level);}
 remaining(){return this.pool().filter(r=>!this.data.mastered[r.id]);}
 complete(id, word=false){
  if(!id)return;
  if(!word)this.data.mastered[id]=true;
  const d=dayNumber(this.clock()),today=this.data.activity[d]||=[];
  const item=(word?'word:':'phrase:')+id;if(!today.includes(item))today.push(item);
  while(this.data.level && this.remaining().length===0 && stages.indexOf(this.data.level)<2)
    this.data.level=stages[stages.indexOf(this.data.level)+1];
  this.save();
 }
 stats(){
  const day=dayNumber(this.clock()),active=this.data.activity;
  let at=active[day]?.length?day:day-1,streak=0;
  while(active[at--]?.length)streak++;
  const xp=Object.values(active).reduce((s,a)=>s+a.length*10,0);
  return {today:active[day]?.length||0,streak,xp,rank:xp>=1000?'Storyteller':xp>=300?'Conversationalist':xp>=100?'Explorer':'New voice',week:Array.from({length:7},(_,i)=>active[day-6+i]?.length||0)};
 }
 markup(){
  const {level,hits}=this.data,stats=this.stats();
  if(!level){
   if(!this.testing && !hits.length)return '<section class="path-card"><small>Your speaking path</small><h2>Find your starting point</h2><p>Try five short Korean questions. Sori will choose your first speaking lesson.</p><div><button class="sori-primary" data-path-test>Take the level check</button> <button class="text-button" data-path-begin>Start as a beginner</button></div></section>';
   const [ko,roman,prompt,options]=check[hits.length];
   return '<section class="path-card"><small>Level check · '+(hits.length+1)+' of '+check.length+'</small><h2 lang="ko">'+ko+'</h2><p>'+roman+'</p><button class="text-button" data-audio="'+ko+'">Listen in Korean</button><h3>'+prompt+'</h3><div class="path-choices">'+options.map((s,i)=>'<button data-path-answer="'+i+'">'+s+'</button>').join('')+'<button data-path-answer="-1">I don’t know yet</button></div></section>';
  }
  const pool=this.pool(),left=this.remaining().length,done=pool.length-left;
  return '<section class="path-card"><small>Your speaking path · '+levelNames[level]+'</small><h2>'+(left?'Continue your Korean':'You finished the speaking path!')+'</h2><p>'+done+' of '+pool.length+' expressions learned in this level</p><progress max="'+Math.max(1,pool.length)+'" value="'+done+'"></progress><div class="path-metrics"><strong>'+stats.streak+'<small>day streak</small></strong><strong>'+stats.xp+'<small>XP · '+stats.rank+'</small></strong><strong>'+Math.min(stats.today,5)+'/5<small>daily goal</small></strong></div><div class="path-week" aria-label="Practice over the last seven days">'+stats.week.map((n,i)=>'<span title="'+n+' practised" data-active="'+!!n+'">'+(i===6?'Today':new Intl.DateTimeFormat("en",{weekday:"short"}).format(new Date(this.clock()-86400000*(6-i))))+'</span>').join('')+'</div>'+(left?'<button class="sori-primary" data-path-continue>Start my next lesson</button>':'<a class="sori-primary" href="#review">Open review</a>')+'</section>';
 }
}
