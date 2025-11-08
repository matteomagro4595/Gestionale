/* eslint-disable no-restricted-globals */

// Nome della cache
const CACHE_NAME = 'gestionale-v1';
const RUNTIME_CACHE = 'gestionale-runtime';

// File da cachare immediatamente durante l'installazione
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - precaching delle risorse statiche
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - pulizia delle vecchie cache
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - strategie di caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignora richieste all'API (usa sempre la rete)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline', message: 'Nessuna connessione disponibile' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }

  // Per risorse statiche: Cache First, poi Network
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              // Cachea solo risposte valide
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }

              // Clona la risposta perché può essere consumata una sola volta
              const responseToCache = response.clone();

              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch((error) => {
              console.error('[Service Worker] Fetch failed:', error);

              // Fallback per pagine HTML
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
              }

              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
});

// Message event - per comunicazione con l'app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.payload))
    );
  }
});

// Background Sync per richieste offline (opzionale)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Qui puoi sincronizzare dati quando torna la connessione
      Promise.resolve()
    );
  }
});

// Push notifications (opzionale per future implementazioni)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Apri',
        icon: '/icons/icon-96.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/icons/icon-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Gestionale', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
