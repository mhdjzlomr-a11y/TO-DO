const CACHE_NAME = 'oneday-pwa-v5';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/cloud.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = event.request.url || '';
  if (
    reqUrl.includes('googleapis.com') ||
    reqUrl.includes('accounts.google.com') ||
    reqUrl.includes('firebaseapp.com') ||
    reqUrl.includes('firebaseio.com') ||
    reqUrl.includes('script.google.com') ||
    reqUrl.includes('script.googleusercontent.com')
  ) {
    return;
  }
  // Network-first so latest updates always show immediately when online
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
