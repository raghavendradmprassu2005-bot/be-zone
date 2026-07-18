// Be-Zone Service Worker v1
// Handles offline caching and performance optimisation

const STATIC_CACHE = 'be-zone-static-v1';
const DYNAMIC_CACHE = 'be-zone-dynamic-v1';

// Core shell assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase — always fresh from network
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.io')
  ) {
    return;
  }

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    // Cache First — versioned assets (JS/CSS bundles, images, fonts)
    event.respondWith(cacheFirst(request));
  } else if (request.mode === 'navigate') {
    // Network First for navigation; fall back to cached index.html (SPA)
    event.respondWith(networkFirst(request));
  } else {
    // Stale-While-Revalidate for everything else
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ─── Strategies ───────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — resource not cached', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached =
      (await caches.match(request)) || (await caches.match('/index.html'));
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || networkFetch;
}

// ─── Messages ─────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ─── Push Notifications (Firebase Cloud Messaging) ────────────────────────
// Handles background push events sent by api/send-push-notification.js via
// the Firebase Admin SDK. No firebase-messaging-sw.js needed — FCM delivers
// via the standard Web Push protocol; we handle display here.
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Malformed payload — ignore silently
    return;
  }

  const notif   = payload.notification || {};
  const webpush = payload.webpush?.notification || {};
  const data    = payload.data || webpush.data || {};

  const title = notif.title || webpush.title || 'Be-Zone';
  const body  = notif.body  || webpush.body  || 'Your order has been updated.';
  const icon  = notif.icon  || webpush.icon  || '/icons/icon-192x192.png';
  const badge = webpush.badge || '/icons/icon-192x192.png';
  const tag   = webpush.tag || 'be-zone-order';

  const options = {
    body,
    icon,
    badge,
    tag,
    renotify:            true,
    requireInteraction:  false,
    data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Navigate to the customer's profile/orders page when the notification is tapped
  const url = event.notification.data?.url || '/profile';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an already-open tab if available
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
