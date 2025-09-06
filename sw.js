const CACHE_NAME = 'povesti-magice-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalarea service worker-ului
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache deschis');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptarea cererilor de rețea
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Returnează din cache dacă există, altfel face cererea la rețea
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Actualizarea cache-ului
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Ștergere cache vechi:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

