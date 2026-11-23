// Keep native install prompts behind a user gesture. On other browsers show their menu path.
(() => {
  const banner = document.querySelector('#installBanner');
  const menu = document.querySelector('.install-menu');
  const help = document.querySelector('#installHelp');
  const standalone = matchMedia('(display-mode: standalone)');
  const smallScreen = matchMedia('(max-width: 768px)');
  const week = 7 * 86400000;
  const get = key => { try { return localStorage.getItem('sori:install:'+key); } catch { return null; } };
  const set = (key,value) => { try { localStorage.setItem('sori:install:'+key,value); } catch {} };
  let nativePrompt, shown = false, snoozed = false;
  let installed = standalone.matches || navigator.standalone === true || get('done') === 'yes';
  if(standalone.matches || navigator.standalone === true)set('done','yes');
  if('serviceWorker' in navigator && window.isSecureContext)navigator.serviceWorker.register('/icon-worker.js').catch(()=>{});
  function render() {
    const landing = ['', '#home', '#conversations', '#review', '#read', '#guide', '#discover', '#itineraries'].includes(location.hash) || location.hash.startsWith('#discover=');
    const eligible = !installed && !snoozed && smallScreen.matches && landing;
    banner.hidden = !(eligible && (shown || Date.now() - Number(get('last') || 0) >= week));
    menu.hidden = installed;
    if (!banner.hidden && !shown) { shown = true; set('last',Date.now()); }
  }
  function later() { snoozed = true; set('last',Date.now()); render(); }
  function finish() { installed = true; nativePrompt = null; set('done','yes'); if(help.open)help.close(); render(); }
  function instructions() {
    const ua=navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1))
      return 'Open Share. Scroll down, choose Add to Home Screen, then tap Add. If the option is missing, open Sori in Safari.';
    if (/SamsungBrowser/i.test(ua)) return 'Open the browser menu, choose Add page to, then Home screen. Confirm Add.';
    if (/Android/i.test(ua)) return 'Open the browser menu (⋮), then choose Add to Home screen or Install app. Confirm to add Sori.';
    return 'On a phone, open the browser’s Share or menu button and choose Add to Home Screen. On a computer, look for Install Sori in the address bar or browser menu.';
  }
  window.addEventListener('beforeinstallprompt',event => {
    event.preventDefault(); nativePrompt = event; installed = false; set('done',''); render();
  });
  window.addEventListener('appinstalled',finish);
  standalone.addEventListener('change',() => { if(standalone.matches)finish(); });
  smallScreen.addEventListener('change',render);
  window.addEventListener('hashchange',render);
  document.querySelector('[data-install-later]').addEventListener('click',later);
  document.addEventListener('click',async event => {
    const trigger=event.target.closest('[data-install]');
    if(!trigger || installed)return;
    const inMenu=trigger===menu;
    if(inMenu)document.querySelector('#sidebarClose').click();
    if(nativePrompt){
      const pending=nativePrompt; nativePrompt=null;
      try {
        await pending.prompt();
        const {outcome}=await pending.userChoice;
        if(outcome==='accepted') finish(); else later();
        return;
      }catch { /* Browser menu installation remains available. */ }
    }
    help.querySelector('[data-install-steps]').textContent=instructions();
    help.showModal();
    help.addEventListener('close',() => {
      later();
      if(inMenu || trigger.closest('[hidden]'))document.querySelector('#menuToggle').focus({preventScroll:true});
    },{once:true});
  });
  render();
})();
