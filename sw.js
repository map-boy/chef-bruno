// Chef Bruno - Service Worker
// Skips Firebase Storage and Firebase API requests - lets them go straight to network

const CACHE_NAME = 'chef-bruno-v1';

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Skip ALL Firebase requests - never intercept these
  if (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com')
  ) {
    return; // Let the browser handle it normally
  }

  // For everything else, try cache first then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});