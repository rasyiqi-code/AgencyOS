/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Menyuntikkan daftar aset precache otomatis dari build workbox
precacheAndRoute(self.__WB_MANIFEST || []);

// Konfigurasi Cache Dinamis & Statis
const CACHE_VERSION = "v2";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Pattern URL pengecualian
const NO_CACHE_PATTERNS = [
    /\/api\//,
    /\/admin/,
    /\/handler\//,
    /\/dashboard/,
    /\/_next\/webpack-hmr/,
    /\/stack-auth/,
    /chrome-extension/,
];

// Ekstensi aset statis
const STATIC_EXTENSIONS = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
];

// Event: Fetch Interceptor
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Hanya tangani metode GET
    if (request.method !== "GET") return;

    // Hanya tangani asal domain yang sama
    if (url.origin !== self.location.origin) return;

    // Abaikan jika masuk pattern eksklusi
    const shouldSkip = NO_CACHE_PATTERNS.some((pattern) =>
        pattern.test(url.pathname)
    );
    if (shouldSkip) return;

    // Jalankan strategi caching
    if (STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

async function cacheFirst(request: Request): Promise<Response> {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        const offlineResponse = await caches.match("/offline.html");
        return offlineResponse || new Response("Offline", { status: 503 });
    }
}

async function networkFirst(request: Request): Promise<Response> {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        if (request.mode === "navigate") {
            const offlineResponse = await caches.match("/offline.html");
            return offlineResponse || new Response("Offline", { status: 503 });
        }

        return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
        });
    }
}

// Event: Push Notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: data.icon || '/icons/icon-192x192.png',
                badge: data.badge || '/icons/icon-72x72.png',
                data: { url: data.url || '/' },
                actions: data.actions || []
            };
            event.waitUntil(self.registration.showNotification(data.title, options));
        } catch (e) {
            console.error('Error parsing push data:', e);
            const text = event.data.text();
            event.waitUntil(
                self.registration.showNotification('AgencyOS Notification', {
                    body: text,
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                })
            );
        }
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// Event: Message
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
