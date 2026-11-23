// Calendar days are local to the learner. Store each date separately so a second tab
// cannot replace an earlier month's attendance when it saves today's check-in.
const DAY=86400000;
const numberOfDay=date=>Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/DAY;
const dayName=n=>new Intl.DateTimeFormat('en',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(n*DAY);
export class Attendance {
  constructor(storage,user,activity={},clock=Date.now){
    this.storage=storage;this.clock=clock;this.key='sori:attendance:1:'+(user||'device')+':';
    this.days=new Map();
    for(const [n,items] of Object.entries(activity))if(items.length)this.days.set(Number(n),new Set(items));
    this.load(this.key);
    if(user){
      const claim='sori:attendance:guest-owner';
      try{
        if(!storage.getItem(claim)){
          storage.setItem(claim,user);this.load('sori:attendance:1:device:');
          for(const n of this.days.keys())this.persist(n);
        }
      }catch{}
    }
    this.monthOffset=0;
  }
  load(prefix){
    try{for(let i=0;i<this.storage.length;i++){
      const key=this.storage.key(i);if(!key?.startsWith(prefix))continue;
      const n=Number(key.slice(prefix.length));if(!Number.isInteger(n))continue;
      this.merge(n,this.storage.getItem(key));
    }}catch{}
  }
  merge(n,text){
    try{const values=JSON.parse(text);if(Array.isArray(values))this.days.set(n,new Set([...(this.days.get(n)||[]),...values]));}catch{}
  }
  today(){return numberOfDay(new Date(this.clock()));}
  persist(n){try{this.merge(n,this.storage.getItem(this.key+n));this.storage.setItem(this.key+n,JSON.stringify([...this.days.get(n)]));}catch{}}
  stamp(item){
    const n=this.today(),items=this.days.get(n)||new Set();if(item)items.add(item);
    this.days.set(n,items);this.persist(n);
  }
  stats(){
    const today=this.today(),dates=[...this.days.keys()].filter(n=>n<=today).sort((a,b)=>a-b);
    let n=this.days.has(today)?today:today-1,current=0,longest=0,run=0,last;
    while(this.days.has(n--))current++;
    for(const d of dates){run=d===last+1?run+1:1;longest=Math.max(longest,run);last=d;}
    return {current,longest,total:dates.length,first:dates[0],count:this.days.get(today)?.size||0,checked:this.days.has(today)};
  }
  markup(open=false){
    const today=this.today(),s=this.stats(),now=new Date(today*DAY);
    const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+this.monthOffset,1)),year=start.getUTCFullYear(),month=start.getUTCMonth();
    const count=new Date(Date.UTC(year,month+1,0)).getUTCDate(),first=start.getTime()/DAY;
    const monthName=new Intl.DateTimeFormat('en',{year:'numeric',month:'long',timeZone:'UTC'}).format(start);
    let cells='<span></span>'.repeat(start.getUTCDay());
    for(let i=0;i<count;i++){
      const date=first+i,items=this.days.get(date),goal=(items?.size||0)>=5;
      cells+=`<span class="attendance-day" data-checked="${!!items}" data-goal="${goal}" aria-label="${dayName(date)}${goal?', daily goal met':items?', checked in':''}" ${date===today?'aria-current="date"':''}>${i+1}${items?'<b aria-hidden="true">'+(goal?'★':'✓')+'</b>':''}</span>`;
    }
    return `<section class="attendance"><div class="attendance-top"><div><strong>Daily check-in</strong><small>${s.current} day streak · ${Math.min(s.count,5)}/5 practised today</small></div><button type="button" data-check-in ${s.checked?'disabled':''}>${s.checked?'✓ Checked in':'Check in'}</button></div>
      <details ${open?'open':''}><summary>Attendance calendar</summary>
      <div class="attendance-month"><button type="button" data-month="-1" aria-label="Previous month">‹</button><strong>${monthName}</strong><button type="button" data-month="1" aria-label="Next month" ${this.monthOffset>=0?'disabled':''}>›</button></div>
      <div class="attendance-grid">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>'<small>'+d+'</small>').join('')}${cells}</div>
      <p>✓ Checked in · ★ Practised five questions</p><p>${s.total} days attended · Longest streak: ${s.longest}${s.first===undefined?'':' · Since '+dayName(s.first)}</p></details></section>`;
  }
}
