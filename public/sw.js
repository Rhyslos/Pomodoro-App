// cache variables
const CACHE_NAME = 'pomodoro-cache-v1';
const CORE_ASSETS = [
    '/',
    '/manifest.json',
    '/styling/base.css',
    '/styling/components.css',
    '/styling/features.css',
    '/styling/layout.css',
    '/styling/main.css',
    '/styling/responsive.css',
    '/styling/themes.css',
    '/app.mjs',
    '/modules/auth.mjs',
    '/modules/network.mjs',
    '/modules/roomClient.mjs',
    '/modules/sanitize.mjs',
    '/modules/state.mjs',
    '/modules/ui.mjs',
    '/modules/userWidget.mjs',
    '/lang/client_i18n.mjs',
    '/locales/client.json',
    '/api/views/login',
    '/api/views/dashboard',
    '/api/views/room',
    '/api/views/privacy',
    '/api/views/tos'
];

// lifecycle functions
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting();
});

// lifecycle functions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// network routing functions
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const acceptHeader = event.request.headers.get('Accept') || '';
    if (event.request.url.includes('/api/sessions') && acceptHeader.includes('text/event-stream')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                if (!event.request.url.includes('/api/')) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }

                return new Response("Network error occurred", { status: 408, headers: { 'Content-Type': 'text/plain' } });
            });
        })
    );
});
