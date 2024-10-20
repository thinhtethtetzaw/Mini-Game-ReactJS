const CACHE_NAME = 'catch-the-drop-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/index.js',
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
