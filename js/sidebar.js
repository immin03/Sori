/* Navigation shared by learning, guide, quiz and newsletter. */
(function(){
  const views={home:'homeView',guide:'guideView',listen:'mainContent',quiz:'quizView',newsletter:'newsletterView'};
  const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebarOverlay');
  function close(){sidebar.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow='';sidebar.inert=true;}
  function show(view){
    if(!Object.hasOwn(views,view))view='home';window.SORI?.TTS?.cancel();
    for(const [name,id] of Object.entries(views)){const element=document.getElementById(id);if(element)element.style.display=name===view?'block':'none';}
    const bridge=document.querySelector('.learning-trip-bridge');if(bridge)bridge.hidden=!window.SoriGuide?.hasTrip();
    document.querySelectorAll('[data-view],.sori-nav [data-go],.mobile-nav [data-go]').forEach(b=>{const active=(b.dataset.view||b.dataset.go)===view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    try{sessionStorage.setItem('currentView',view);}catch{}close();window.dispatchEvent(new CustomEvent('sori-view',{detail:{view}}));
  }
  window.SoriNav={show};
  document.getElementById('shareSori')?.addEventListener('click',async()=>{
    const url=location.origin+location.pathname;
    try { if(navigator.share)await navigator.share({title:'Sori · Everyday Korean, with places to use it',url});
      else {await navigator.clipboard.writeText(url);let note=document.getElementById('shareStatus');if(!note){note=document.createElement('p');note.id='shareStatus';note.setAttribute('role','status');document.querySelector('.header').after(note);}note.textContent='Sori link copied. Your private trip invitation was not included.';}
    } catch(error){if(error.name!=='AbortError'){let note=document.getElementById('shareStatus');if(!note){note=document.createElement('p');note.id='shareStatus';document.querySelector('.header').after(note);}note.textContent='Share this service: '+url;}}
  });
  document.getElementById('menuToggle').addEventListener('click',()=>{sidebar.inert=false;sidebar.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden';});
  document.getElementById('sidebarClose').addEventListener('click',close);overlay.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-go],[data-view],[data-category],[data-korean],.logo-home');if(!button)return;
    if(button.dataset.korean){show('listen');window.SoriLearn?.openKorean(button.dataset.korean);}
    else if(button.dataset.category){show('listen');window.SoriLearn?.openCategory(button.dataset.category,button.dataset.situation);}
    else {
      const view=button.classList.contains('logo-home')?'home':button.dataset.go||button.dataset.view;
      if(view==='listen')window.SoriPractice?.library();
      if(view==='newsletter')window.SoriReader?.openFeed();
      const hash=view==='guide'?(window.SoriGuide?.route?.()||'#guide'):({home:'#home',listen:'#speak',newsletter:'#read',quiz:'#quiz'})[view];
      if(hash&&location.hash!==hash)history.pushState(null,'',hash);
      show(view);
    }
    if(button.dataset.korean)document.getElementById('lessonCard')?.scrollIntoView({block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  });
  function routeView(){
  const p=new URLSearchParams(location.hash.slice(1));
  if(p.has('practice')||location.hash==='#speak')return 'listen';
  if(p.has('story')||p.has('subscribe')||p.has('unsubscribe')||location.hash==='#read')return 'newsletter';
  if(p.has('day')||p.has('trip')||p.has('invite')||location.hash==='#guide')return 'guide';
  return ({'#home':'home','#quiz':'quiz'})[location.hash]||null;
}
  window.addEventListener('hashchange',()=>{const v=routeView();if(v)show(v);});
  function restore(){const v=routeView();if(v){show(v);return;}let view='home';try{view=sessionStorage.getItem('currentView')||'home';}catch{}show(view);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore);else restore();
})();
