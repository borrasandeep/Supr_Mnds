const CACHE = 'supr-mnds-v2';   // ← Bump version to force old cache to be cleared
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './style.css',
  './app.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // NETWORK-FIRST — always try server, fall back to cache only when offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Refresh cache with the latest version
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});