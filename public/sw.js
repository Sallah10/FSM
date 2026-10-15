// QuickSet service worker.
// Strategy:
//   - Static assets (Next chunks, icons, fonts, styles) -> stale-while-revalidate.
//   - Page navigations -> network-first, and only fall back to the offline page.
//   - API/auth traffic -> never cached (always hits the network).
// We deliberately do NOT cache rendered HTML, so a signed-in page is never
// served from cache to a different session.

const CACHE = 'quickset-v1';
const OFFLINE_URL = '/offline';
const PRECACHE = [
  OFFLINE_URL,
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

async function networkFirstNavigate(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE);
    const offline = await cache.match(OFFLINE_URL);
    return offline || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    ['style', 'script', 'font', 'image'].includes(request.destination)
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
