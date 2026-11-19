/* Navigation shared by learning, guide, quiz and newsletter. */
(function(){
  const views={home:'homeView',guide:'guideView',listen:'mainContent',quiz:'quizView',newsletter:'newsletterView'};
  const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebarOverlay');
  function close(){sidebar.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow='';}
  function show(view){
    if(!Object.hasOwn(views,view))view='home';window.SORI?.TTS?.cancel();
    for(const [name,id] of Object.entries(views)){const element=document.getElementById(id);if(element)element.style.display=name===view?'block':'none';}
    document.querySelectorAll('[data-view],.sori-nav [data-go]').forEach(b=>b.classList.toggle('active',(b.dataset.view||b.dataset.go)===view));
    try{sessionStorage.setItem('currentView',view);}catch{}close();
  }
  window.SoriNav={show};
  document.getElementById('shareSori')?.addEventListener('click',async()=>{
    const url=location.origin+location.pathname;
    try { if(navigator.share)await navigator.share({title:'Sori · Learn Korean and plan Seoul together',url});
      else {await navigator.clipboard.writeText(url);let note=document.getElementById('shareStatus');if(!note){note=document.createElement('p');note.id='shareStatus';note.setAttribute('role','status');document.querySelector('.header').after(note);}note.textContent='Sori link copied. Your private trip invitation was not included.';}
    } catch(error){if(error.name!=='AbortError'){let note=document.getElementById('shareStatus');if(!note){note=document.createElement('p');note.id='shareStatus';document.querySelector('.header').after(note);}note.textContent='Share this service: '+url;}}
  });
  document.getElementById('menuToggle').addEventListener('click',()=>{sidebar.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden';});
  document.getElementById('sidebarClose').addEventListener('click',close);overlay.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-go],[data-view],[data-category],.logo-home');if(!button)return;
    if(button.dataset.category){show('listen');window.SoriLearn?.openCategory(button.dataset.category);}
    else show(button.classList.contains('logo-home')?'home':button.dataset.go||button.dataset.view);
  });
  function restore(){let view='home';try{view=sessionStorage.getItem('currentView')||'home';}catch{}show(view);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore);else restore();
})();
