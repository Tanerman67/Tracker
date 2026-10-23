const CACHE='my-rhythm-v7.2.1';
const ASSETS=[
  "./",
  "./index.html",
  "./app.css?v=7200",
  "./today.css?v=7200",
  "./modules.css?v=7200",
  "./habits.css?v=7200",
  "./nutrition.css?v=7200",
  "./calendar.css?v=7200",
  "./cleanup.css?v=7200",
  "./energy.css?v=7200",
  "./energy-core.js?v=7200",
  "./energy.js?v=7200",
  "./calendar.js?v=7200",
  "./goals.js?v=7200",
  "./coordination.js?v=7200",
  "./modules.js?v=7200",
  "./dashboard.js?v=7200",
  "./analytics.js?v=7200",
  "./today.js?v=7200",
  "./habits.js?v=7200",
  "./dates.js?v=7200",
  "./storage.js?v=7200",
  "./nutrition.js?v=7200",
  "./app.js?v=7200",
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
