// Service Worker for "Бочка Здоровья" PWA
const CACHE_NAME = 'bochka-pwa-v5';

const STATIC_PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// Install: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Precache non-critical warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for static assets + Offline navigation fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests with HTTP/HTTPS schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML document loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: serve cached index.html or root
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('./index.html') || await cache.match('./') || await cache.match('/index.html') || await cache.match('/');
          if (cachedIndex) {
            return cachedIndex;
          }
          return new Response('Offline: Бочка Здоровья', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Static assets & media (cache-first / stale-while-revalidate)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.url.includes('/assets/') ||
    request.url.includes('/icons/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default network pass-through with cache fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).catch(() => cachedResponse);
    })
  );
});
