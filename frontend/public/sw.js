/**
 * NaamSeva Service Worker — v1.3
 * Strategy:
 *   - App shell (HTML/CSS/JS) → Cache First
 *   - /api/schemes             → Network First, fall back to cache
 *   - /api/voice, /api/query   → Network Only (no offline audio synthesis)
 *   - Everything else          → Network First
 */

const CACHE_NAME     = 'naamseva-v1.3';
const SCHEMES_CACHE  = 'naamseva-schemes-v1';
const AUDIO_CACHE    = 'naamseva-audio-v1';
const MAX_AUDIO_ENTRIES = 3;

const SHELL_URLS = [
  '/',
  '/index.html',
  '/src/main.jsx',
];

// ── Install: pre-cache scheme data ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SCHEMES_CACHE).then(async (cache) => {
      try {
        await cache.add('/api/schemes');
      } catch (_) {
        // Backend may not be running during install — that's OK
      }
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = new Set([CACHE_NAME, SCHEMES_CACHE, AUDIO_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Scheme listing — Network First, cache fallback
  if (url.pathname === '/api/schemes') {
    event.respondWith(networkFirstCache(request, SCHEMES_CACHE));
    return;
  }

  // 2. Static assets — Cache First (handled by Vite in dev, by dist in prod)
  if (url.pathname.match(/\.(js|css|woff2?|png|svg|ico)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3. API voice / query — Network Only (real-time AI, no offline fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // 4. App shell navigation — Cache First → serve index.html if missing
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(request))
    );
    return;
  }
});

// ── Strategy helpers ─────────────────────────────────────────────────────────
async function networkFirstCache(request, cacheName) {
  try {
    const response = await fetch(request.clone());
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline', schemes: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (_) {
    return new Response('', { status: 503 });
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (_) {
    return new Response(
      JSON.stringify({ error: 'offline', detail: 'Network unavailable. Scheme browser works offline.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
