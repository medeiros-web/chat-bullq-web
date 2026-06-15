// Chat BullQ Service Worker
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `chatbullq-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `chatbullq-runtime-${CACHE_VERSION}`;

// Static assets to pre-cache
const PRECACHE_ASSETS = ['/offline'];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls — always go to network
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 503 })),
    );
    return;
  }

  // Skip Next.js internal routes
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })),
    );
    return;
  }

  // Navigation requests: network first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline')),
        ),
    );
    return;
  }

  // Other requests: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
      return cached || networkFetch;
    }),
  );
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Chat BullQ', {
        body: data.body || 'Nova mensagem recebida',
        icon: '/icon',
        badge: '/apple-icon',
        tag: data.tag || 'chatbullq',
        data: data.url ? { url: data.url } : undefined,
      }),
    );
  } catch {
    // Ignore malformed push payloads
  }
});

// Notification click: focus or open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/inbox';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      }),
  );
});
