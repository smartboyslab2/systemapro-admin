const CACHE_NAME = 'systemapro-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-monogram.jpg',
  '/default-business-logo.png',
  '/avatar-admin.jpg',
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return from cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return a simple offline response for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>SystemaPro - Sin Conexion</title>
                  <style>
                    body { background: #0B0E14; color: #F1F5F9; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                    .container { text-align: center; }
                    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                    p { color: #94A3B8; font-size: 0.875rem; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Sin Conexion</h1>
                    <p>Estas en modo sin conexion. Algunos datos pueden no estar actualizados.</p>
                  </div>
                </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          return new Response('Sin conexion', { status: 503 });
        });
      })
  );
});
