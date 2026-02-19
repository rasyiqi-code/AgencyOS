/**
 * Service Worker untuk AgencyOS PWA.
 *
 * Strategi caching:
 * - Pre-cache: Halaman offline
 * - Cache-first: Aset statis (gambar, font, CSS, JS)
 * - Network-first: Halaman HTML & API calls
 * - Offline fallback: Redirect ke /offline.html jika network gagal
 *
 * @version CACHE_V1
 */

// ============================================================
// Konfigurasi Cache
// ============================================================

/** Versi cache — increment untuk invalidasi cache lama */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

/** Daftar resource yang di-pre-cache saat install */
const PRE_CACHE_URLS = ["/offline.html"];

/**
 * Pattern URL yang TIDAK boleh di-cache.
 * Termasuk API, auth, admin, dan resource dinamis.
 */
const NO_CACHE_PATTERNS = [
    /\/api\//,
    /\/admin/,
    /\/handler\//,
    /\/dashboard/,
    /\/_next\/webpack-hmr/,
    /\/stack-auth/,
    /chrome-extension/,
];

/**
 * Extension file statis yang menggunakan cache-first strategy.
 */
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

// ============================================================
// Event: Install
// ============================================================

self.addEventListener("install", (event) => {
    console.log("[SW] Installing Service Worker...");

    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => {
                console.log("[SW] Pre-caching offline page");
                return cache.addAll(PRE_CACHE_URLS);
            })
            .then(() => {
                // Skip waiting agar SW baru langsung aktif
                return self.skipWaiting();
            })
    );
});

// ============================================================
// Event: Activate
// ============================================================

self.addEventListener("activate", (event) => {
    console.log("[SW] Activating Service Worker...");

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            // Hapus cache lama yang tidak sesuai versi
                            return (
                                (name.startsWith("static-") && name !== STATIC_CACHE) ||
                                (name.startsWith("dynamic-") && name !== DYNAMIC_CACHE)
                            );
                        })
                        .map((name) => {
                            console.log("[SW] Deleting old cache:", name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                // Claim semua tab yang terbuka
                return self.clients.claim();
            })
    );
});

// ============================================================
// Event: Fetch
// ============================================================

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Hanya handle request GET
    if (request.method !== "GET") return;

    // Hanya handle request dari origin yang sama atau CDN
    if (url.origin !== self.location.origin) return;

    // Jangan cache URL yang masuk pattern exclusion
    const shouldSkip = NO_CACHE_PATTERNS.some((pattern) =>
        pattern.test(url.pathname)
    );
    if (shouldSkip) return;

    // Tentukan strategi berdasarkan tipe resource
    if (isStaticAsset(url.pathname)) {
        // Cache-first untuk aset statis
        event.respondWith(cacheFirst(request));
    } else {
        // Network-first untuk halaman HTML
        event.respondWith(networkFirst(request));
    }
});

// ============================================================
// Strategi Caching
// ============================================================

/**
 * Cache-first strategy.
 * Cek cache dulu, jika tidak ada baru fetch dari network.
 * Cocok untuk aset statis yang jarang berubah.
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        // Hanya cache response yang sukses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch {
        // Jika network gagal dan tidak ada cache, return offline page
        return caches.match("/offline.html");
    }
}

/**
 * Network-first strategy.
 * Coba fetch dari network dulu, jika gagal ambil dari cache.
 * Cocok untuk halaman HTML yang sering berubah.
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache response yang sukses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch {
        // Coba ambil dari cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Jika request adalah navigasi (halaman), tampilkan offline page
        if (request.mode === "navigate") {
            return caches.match("/offline.html");
        }

        // Untuk resource lain, return generic error response
        return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
        });
    }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Cek apakah URL adalah aset statis berdasarkan extension.
 * @param {string} pathname - Path URL yang dicek
 * @returns {boolean}
 */
function isStaticAsset(pathname) {
    return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

// ============================================================
// Event: Message
// ============================================================

/**
 * Handle pesan dari client.
 * Digunakan untuk trigger skip waiting dari UI
 * saat ada update SW baru.
 */
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        console.log("[SW] Skip waiting triggered by client");
        self.skipWaiting();
    }
});
