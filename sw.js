const CACHE = 'pg-guia-v1.0.0';
const ASSETS = [
  './','./index.html','./styles.css','./data.js','./app.js','./manifest.webmanifest',
  './assets/mapa-piso--2.jpg','./assets/mapa-piso--1.jpg','./assets/mapa-piso-0.jpg','./assets/mapa-piso-1.jpg','./assets/mapa-piso-2.jpg','./assets/mapa-piso-3.jpg',
  './assets/diretorio-fotografado.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return response;
  }).catch(()=>caches.match('./index.html'))));
});
