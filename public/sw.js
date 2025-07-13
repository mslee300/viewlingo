const CACHE_NAME = 'viewlingo-v1';
const urlsToCache = [
  '/',
  '/choose-language',
  '/fetching-words',
  '/result',
  '/review-cards',
  '/review-words',
  '/globals.css',
  '/manifest.json',
  '/apple-photo.png',
  '/back-arrow.svg',
  '/dropdown.svg',
  '/file.svg',
  '/globe.svg',
  '/google-icon.svg',
  '/logo-splash.svg',
  '/speaker.svg',
  '/window.svg',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 