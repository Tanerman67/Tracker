const CACHE='my-rhythm-v7.0.0';
const ASSETS=[
  "./",
  "./index.html",
  "./app.css?v=7000",
  "./today.css?v=7000",
  "./modules.css?v=7000",
  "./habits.css?v=7000",
  "./nutrition.css?v=7000",
  "./goals.js?v=7000",
  "./coordination.js?v=7000",
  "./modules.js?v=7000",
  "./dashboard.js?v=7000",
  "./today.js?v=7000",
  "./habits.js?v=7000",
  "./dates.js?v=7000",
  "./storage.js?v=7000",
  "./nutrition.js?v=7000",
  "./app.js?v=7000",
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
