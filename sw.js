const CACHE='my-rhythm-v7.5.0-settings-preview1';
const ASSETS=[
  "./design-system.css?v=7401",
  "./ui.js?v=7401",
  "./settings.js?v=7501",
  "./fonts/InterVariable.woff2",
  "./",
  "./index.html",
  "./app.css?v=7311",
  "./today.css?v=7311",
  "./modules.css?v=7311",
  "./habits.css?v=7311",
  "./nutrition.css?v=7311",
  "./calendar.css?v=7311",
  "./cleanup.css?v=7311",
  "./energy.css?v=7311",
  "./energy-core.js?v=7311",
  "./energy.js?v=7311",
  "./calendar.js?v=7311",
  "./goals.js?v=7311",
  "./coordination.js?v=7311",
  "./modules.js?v=7311",
  "./dashboard.js?v=7311",
  "./analytics.js?v=7311",
  "./today.js?v=7311",
  "./habits.js?v=7311",
  "./dates.js?v=7311",
  "./storage.js?v=7311",
  "./nutrition.js?v=7311",
  "./body.js?v=7311",
  "./backup.js?v=7311",
  "./app.js?v=7311",
  "./manifest-github.webmanifest",
  "./apple-touch-icon.png",
  "./icon-192-v61.png",
  "./icon-512-v61.png",
  "./favicon-32-v61.png",
  "./aurora-bg.jpg"
];
const ASSET_PATHS=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).pathname));

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE)
    .then(cache=>cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'}))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys
    .filter(k=>(k.startsWith('my-rhythm-v')||k.startsWith('life-tracker-app-'))&&k!==CACHE)
    .map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  // The data vault and unrelated requests never enter the application asset cache.
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!ASSET_PATHS.has(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});
    try{
      const response=await fetch(event.request);
      if(response.ok){
        // Normalize query variants so repeated versions do not grow the cache forever.
        const key=ASSETS.find(path=>new URL(path,self.registration.scope).pathname===url.pathname);
        try{await cache.put(new URL(key,self.registration.scope).href,response.clone())}catch(e){}
        return response;
      }
      return cached||response;
    }catch(e){
      return cached||Response.error();
    }
  })());
});

