// Hunter System service worker.
// Only handles caching of app files for offline use.
// Never touches localStorage — game progress and diet data live there,
// completely outside anything this file can see or affect.
const CACHE='hunter-system-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
  './css/app.css','./fonts/inter.woff2','./fonts/space-grotesk.woff2',
  './js/data.js','./js/util.js','./js/state.js','./js/engine.js','./js/views.js',
  './js/workout.js','./js/awaken.js','./js/menu.js','./js/main.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

// Network first so an update is never served as a mix of old and new files;
// the cache is the offline fallback.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return res;
    }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
  );
});
