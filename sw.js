// Chef Bruno - Service Worker
const CACHE_NAME = 'chef-bruno-v2';

// Static assets worth caching
const STATIC_ASSETS = [
  '/index.html',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // ── Never intercept these – let browser handle directly ──

  // Firebase / Google APIs
  if (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('googleapis.com')
  ) return;

  // Daily.co video calls
  if (url.includes('daily.co') || url.includes('daily-js')) return;

  // Sentry / analytics
  if (url.includes('sentry.io') || url.includes('ingest.sentry')) return;

  // External domains (YouTube, TikTok, etc.)
  if (!url.startsWith(self.location.origin)) return;

  // Dynamic app routes – never cache these, always fetch fresh
  const dynamicRoutes = [
    '/classes/',
    '/classroom/',
    '/rooms/',
    '/events/',
    '/admin',
    '/book',
    '/contact',
  ];
  const pathname = new URL(url).pathname;
  if (dynamicRoutes.some(route => pathname.startsWith(route))) return;

  // ── For everything else: cache-first, fall back to network ──
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache valid GET responses for static assets
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.png') ||
           url.endsWith('.jpg') || url.endsWith('.svg') || url.endsWith('.ico'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for page navigations only
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});