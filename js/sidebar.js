/* Navigation shared by learning, guide, quiz and newsletter. */
(function(){
  const views={home:'homeView',guide:'guideView',listen:'mainContent',quiz:'quizView',newsletter:'newsletterView'};
  const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebarOverlay');
  const {services,locate} = window.SoriSections;
  const toggle = document.getElementById('menuToggle'), sectionNav = document.getElementById('sectionNav');
  const menu = sidebar.querySelector('.sidebar-menu');
  const links = service => service.children.map(([id,title,hash]) =>
    `<a data-section-link="${id}" href="${hash}">${title}</a>`).join('');
  menu.innerHTML = services.map(s => `<section class="menu-group" data-service-group="${s.id}"><h3><a data-section-home href="${s.children[0][2]}">${s.title}</a></h3><div>${links(s)}</div></section>`).join('');
  let visibleView;
  function close(restoreFocus = false) {
    const wasOpen = sidebar.classList.contains('open');
    sidebar.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow='';
    sidebar.inert=true; toggle.setAttribute('aria-expanded','false');
    if (wasOpen && restoreFocus) toggle.focus();
  }
  function updateNavigation() {
    const [serviceId,child] = locate(location.hash,window.SoriPractice?.roundKind?.());
    const p = new URLSearchParams(location.hash.slice(1));
    const exercise = location.hash === '#quiz' || p.has('phrase') ||
      (p.has('practice') && !['topics','topic','words'].includes(p.get('view')));
    document.body.dataset.service = serviceId;
    document.body.classList.toggle('focus-exercise',exercise);
    const service = services.find(s => s.id === serviceId);
    if (sectionNav.dataset.service !== serviceId) {
      sectionNav.dataset.service = serviceId;
      sectionNav.setAttribute('aria-label',service.title + ' sections');
      sectionNav.innerHTML = `<span class="section-parent">${service.title}</span><div>${links(service)}</div>`;
    }
    for (const a of document.querySelectorAll('[data-section-link]')) {
      if (a.dataset.sectionLink === child) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    }
    for (const group of menu.querySelectorAll('[data-service-group]')) group.classList.toggle('menu-current',group.dataset.serviceGroup === serviceId);
    for (const b of document.querySelectorAll('.sori-nav [data-go],.mobile-nav [data-go]')) {
      const active=b.dataset.go===service.view; b.classList.toggle('active',active);
      if (active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    }
  }
  function show(view) {
    if (!Object.hasOwn(views,view)) view='home';
    if (visibleView !== view) window.SORI?.TTS?.cancel();
    visibleView=view;
    for (const [name,id] of Object.entries(views)) {
      const element=document.getElementById(id); if(element) element.style.display=name===view?'block':'none';
    }
    const shareButton=document.getElementById('shareSori');
    if (shareButton) {
      const label=view==='guide'&&window.SoriGuide?.hasTrip()?'Share itinerary':'Share Sori';
      shareButton.textContent=label;shareButton.title=label;
    }
    const bridge=document.querySelector('.learning-trip-bridge');
    if(bridge)bridge.hidden=view!=='listen'||new URLSearchParams(location.hash.slice(1)).get('from')!=='trip'||!window.SoriGuide?.hasTrip();
    updateNavigation(); close(); window.dispatchEvent(new CustomEvent('sori-view',{detail:{view}}));
  }
  function go(hash) {
    if (hash !== location.hash) location.hash=hash;
    else window.dispatchEvent(new Event('hashchange'));
  }
  window.SoriNav={show,go,refresh:updateNavigation};
  document.getElementById('shareSori')?.addEventListener('click',async()=>{
    if(document.getElementById(views.guide).style.display==='block' && window.SoriGuide?.hasTrip()){await window.SoriGuide.share();return;}
    const url=location.origin+location.pathname;
    try { if(navigator.share)await navigator.share({title:'Sori · Everyday Korean, with places to use it',url});
      else {await navigator.clipboard.writeText(url);let note=document.getElementById('shareStatus');if(!note){note=document.createElement('p');note.id='shareStatus';note.setAttribute('role','status');document.querySelector('.header').after(note);}note.textContent='Sori link copied. Your private trip invitation was not included.';}
    } catch(error){if(error.name!=='AbortError'){let note=document.getElementById('shareStatus');if(!note){note=document.createElement('p');note.id='shareStatus';document.querySelector('.header').after(note);}note.textContent='Share this service: '+url;}}
  });
  toggle.addEventListener('click',()=>{
    sidebar.inert=false;sidebar.classList.add('open');overlay.classList.add('open');
    document.body.style.overflow='hidden';toggle.setAttribute('aria-expanded','true');document.getElementById('sidebarClose').focus();
  });
  document.getElementById('sidebarClose').addEventListener('click',()=>close(true));overlay.addEventListener('click',()=>close(true));
  document.addEventListener('keydown',e=>{
    if(!sidebar.classList.contains('open'))return;
    if(e.key==='Escape'){close(true);return;}
    if(e.key==='Tab'){
      const controls=sidebar.querySelectorAll('button,a[href]'), first=controls[0], last=controls[controls.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  document.addEventListener('click',e=>{
    const link=e.target.closest('#sidebar a[href],#sectionNav a[href]');if(!link)return;
    if(e.ctrlKey||e.shiftKey||e.metaKey||e.altKey)return;
    close();
    if(link.hash===location.hash){e.preventDefault();go(link.hash);}
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-go],[data-view],[data-category],[data-korean],.logo-home');if(!button)return;
    if(button.dataset.korean){
      const row=Object.values(window.SoriDataIndex||{}).flat().find(p=>p.k===button.dataset.korean);
      if(row&&window.SoriPractice?.openPhrase){window.SoriPractice.openPhrase(row.id,true,button.closest('#guideView')?'trip':'');return;}
      show('listen');window.SoriLearn?.openKorean(button.dataset.korean);
    }
    else if(button.dataset.category){if(button.closest('#quizView'))return;show('listen');window.SoriLearn?.openCategory(button.dataset.category,button.dataset.situation);}
    else {
      const view=button.classList.contains('logo-home')?'home':button.dataset.go||button.dataset.view;
      const hash=({home:'#home',listen:'#phrases',newsletter:'#read',quiz:'#quiz',guide:'#discover'})[view];
      if(hash)go(button.closest('.learning-trip-bridge') ? window.SoriGuide?.route() || '#itineraries' : hash);
    }
    if(button.dataset.korean)document.getElementById('lessonCard')?.scrollIntoView({block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  });
  function restore(){show(locate(location.hash,window.SoriPractice?.roundKind?.())[2]);}
  window.addEventListener('hashchange',restore);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore);else restore();
})();
