// Keep the installation artwork available between launches.
const cacheName='sori-install-art-v2';
const icons=['/apple-touch-icon.png','/assets/icons/sori-mark-192.png','/assets/icons/sori-mark-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(icons)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('sori-install-art-')&&key!==cacheName).map(key=>caches.delete(key)))));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.search||!icons.includes(url.pathname))return;
  event.respondWith(caches.open(cacheName).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
