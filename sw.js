// Hunter System service worker.
// Only handles caching of app files for offline use.
// Never touches localStorage — game progress and diet data live there,
// completely outside anything this file can see or affect.
const CACHE='hunter-system-v11';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-32.png',
  './css/app.css','./fonts/archivo.woff2','./fonts/plex-mono-400.woff2','./fonts/plex-mono-500.woff2','./fonts/plex-mono-600.woff2',
  './js/data.js','./js/recipes.js','./js/util.js','./js/state.js','./js/engine.js','./js/demos.js','./js/views.js','./js/nutrition.js',
  './js/workout.js','./js/timer.js','./js/awaken.js','./js/menu.js','./js/card.js','./js/items.js','./js/shadows.js','./js/feats.js','./js/dungeons.js','./js/report.js','./js/main.js'];

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
// the cache is the offline fallback. cache:'no-cache' makes the browser
// revalidate with the server instead of reusing GitHub Pages' 10-minute HTTP cache.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(
    fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return res;
    }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
  );
});
