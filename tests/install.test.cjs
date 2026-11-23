const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const source=readFileSync(require.resolve('../js/install.js'),'utf8');
const week=7*86400000;
function browser({store=new Map(),now=week*2,phone=true,standalone=false,ua='Android',hash=''}={}){
  function target(){
    const listeners=new Map();
    return {hidden:true,addEventListener(name,fn){listeners.set(name,fn);},emit(name,event={}){return listeners.get(name)?.(event);}};
  }
  const win=target(),doc=target(),banner=target(),menu=target(),later=target(),help=target(),steps={},button={closest:()=>null};
  Object.assign(help,{querySelector:()=>steps,showModal(){this.open=true;},close(){this.open=false;return this.emit('close');}});
  const elements={'#installBanner':banner,'.install-menu':menu,'#installHelp':help,'[data-install-later]':later,'#menuToggle':{focus(){}}};
  doc.querySelector=key=>elements[key];
  const location={hash};
  vm.runInNewContext(source,{window:win,document:doc,navigator:{userAgent:ua},location,Date:{now:()=>now},
    localStorage:{getItem:key=>store.get(key)??null,setItem:(key,val)=>store.set(key,String(val))},
    matchMedia:q=>Object.assign(target(),{matches:q.includes('standalone')?standalone:phone})});
  return {win,banner,menu,later,help,steps,store,location,click:()=>doc.emit('click',{target:{closest:()=>button}})};
}
test('install banner first visit, dismissal, weekly return and quiet practice',()=>{
  const a=browser();
  assert.equal(a.banner.hidden,false);
  a.later.emit('click');assert.equal(a.banner.hidden,true);assert.equal(a.menu.hidden,false);
  assert.equal(browser({store:a.store,now:3*week-1}).banner.hidden,true);
  assert.equal(browser({store:a.store,now:3*week}).banner.hidden,false);
  const b=browser({hash:'#practice=vocabulary&view=round'});
  assert.equal(b.banner.hidden,true);b.location.hash='#home';b.win.emit('hashchange');assert.equal(b.banner.hidden,false);
  assert.equal(browser({phone:false}).banner.hidden,true);
});
test('native installation is requested only after a tap and success hides both entry points',async()=>{
  const a=browser();let prompted=0,prevented=false;
  a.win.emit('beforeinstallprompt',{preventDefault(){prevented=true;},prompt:async()=>{prompted++;},userChoice:Promise.resolve({outcome:'accepted'})});
  assert.ok(prevented);assert.equal(prompted,0);
  await a.click();assert.equal(prompted,1);assert.equal(a.help.open,undefined);assert.equal(a.menu.hidden,true);
  assert.equal(browser({store:a.store}).banner.hidden,true);
  assert.equal(browser({standalone:true}).menu.hidden,true);
});
test('a dismissed native prompt snoozes the banner and manual installation explains the current browser',async()=>{
  const a=browser();
  a.win.emit('beforeinstallprompt',{preventDefault(){},prompt:async()=>{},userChoice:Promise.resolve({outcome:'dismissed'})});
  await a.click();assert.equal(a.menu.hidden,false);assert.equal(a.banner.hidden,true);
  for(const [ua,steps] of [['iPhone','Share'],['Android','(⋮)'],['SamsungBrowser','Add page to']]){
    const b=browser({ua});await b.click();assert.ok(b.help.open);assert.ok(b.steps.textContent.includes(steps));b.help.close();assert.equal(b.banner.hidden,true);
  }
});
