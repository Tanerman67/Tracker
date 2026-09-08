const CACHE='my-rhythm-v6.6.2-internal-cleanup-github-pages';
const ASSETS=[
  './',
  './index.html',
  './manifest-github.webmanifest',
  './apple-touch-icon.png',
  './icon-192-v61.png',
  './icon-512-v61.png',
  './favicon-32-v61.png',
  './aurora-bg.jpg'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(k=>(k.startsWith('my-rhythm-v') || k.startsWith('life-tracker-app-')) && k!==CACHE)
          .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
