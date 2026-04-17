// ── Service Worker — Calculador Palibex 2026 ──────────────────
const CACHE_NAME = 'calculador-palibex-v1';

// Archivos que se guardan en caché para funcionar sin internet
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-32.png',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
];

// ── Instalación: guarda todos los archivos en caché ──────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// ── Activación: elimina cachés antiguas ──────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: sirve desde caché, actualiza en segundo plano ─────
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Siempre intenta actualizar desde la red en segundo plano
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(() => cached); // Si no hay red, usa caché

      // Devuelve caché inmediatamente si existe, si no espera la red
      return cached || networkFetch;
    })
  );
});

// ── Mensaje para forzar actualización ───────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
