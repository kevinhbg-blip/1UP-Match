const CACHE="1up-ryder-merged-v3";
const ASSETS=["./","./index.html","./core.js","./app.js","./styles.css","./icon.svg","./manifest.webmanifest","./merged.css","./club-bridge.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith("ryder-cup-")||k.startsWith("1up-rebuild-")||k.startsWith("1up-ryder-"))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin||!new URL(event.request.url).pathname.startsWith(new URL(self.registration.scope).pathname))return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response}).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==="navigate"?caches.match("./index.html"):Response.error()))))});


