const CACHE_NAME = 'idei-trasnite-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalarea service worker-ului
self.addEventListener('install', event => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All files cached');
        return self.skipWaiting();
      })
  );
});

// Activarea service worker-ului
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Interceptarea cererilor
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Returnează din cache dacă există
        if (response) {
          console.log('Service Worker: Found in cache', event.request.url);
          return response;
        }
        
        // Altfel, încearcă să descarce de pe rețea
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then(response => {
          // Verifică dacă răspunsul este valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonează răspunsul pentru cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Dacă nu există conexiune la internet, returnează o pagină offline
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Mesaje de la aplicația principală
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificări push (opțional pentru viitor)
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Ai o nouă lecție de scriere creativă!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explorează',
        icon: './icon-192.png'
      },
      {
        action: 'close',
        title: 'Închide',
        icon: './icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Idei Trăsnite', options)
  );
});

// Gestionarea click-urilor pe notificări
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

