const CACHE = 'pg-guia-v1.3.1';
const ASSETS = [
  './','./index.html?v=1.3.1','./styles.css?v=1.3.1','./data.js?v=1.3.1','./store-media.js?v=1.3.1','./catalogo-pesquisa-v2.js?v=1.3.1','./search-engine-v2.js?v=1.3.1','./app.js?v=1.3.1','./manifest.webmanifest',
  './assets/mapa-oficial-piso--2.png','./assets/mapa-oficial-piso--1.png','./assets/mapa-oficial-piso-p0.png','./assets/mapa-oficial-piso-0.png','./assets/mapa-oficial-piso-1.png','./assets/mapa-oficial-piso-2.png','./assets/mapa-oficial-piso-3.png',
  './assets/diretorio-fotografado.png','./assets/brand/palacio-do-gelo.svg','./assets/icons/palacio-do-gelo.webp'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const isAppAsset = requestUrl.origin === self.location.origin;
  if (event.request.mode === 'navigate' || isAppAsset) {
    // Force a fresh fetch by adding a cache-busting query parameter to the network request
    const bustUrl = new URL(event.request.url);
    bustUrl.searchParams.set('_sw_cb', Date.now());
    
    event.respondWith(fetch(new Request(bustUrl.toString(), { cache: 'no-store' })).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html?v=1.3.1'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return response;
  })));
});
