# 14 — Progressive Web App (PWA)

---

## Overview

Be-Zone is built as a **Progressive Web App (PWA)**, meaning it can be installed on a phone's home screen and work like a native app — including offline support, push notifications, and an app-like experience without an app store.

---

## PWA Manifest

**File:** `public/manifest.json`

The manifest tells the browser about the app:

```json
{
  "name": "Be-Zone",
  "short_name": "Be-Zone",
  "description": "Discover Your Perfect Style — Curated premium beauty, skincare, makeup & fashion at unbeatable prices.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#C4921A",
  "background_color": "#FAF7F4",
  "lang": "en",
  "categories": ["shopping", "lifestyle", "beauty"],
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "prefer_related_applications": false
}
```

| Property | Value | Meaning |
|----------|-------|---------|
| `display: "standalone"` | Opens like a native app (no browser UI bar) |
| `theme_color: "#C4921A"` | Gold — colors the phone's status bar |
| `background_color: "#FAF7F4"` | Cream — shown while app loads (splash screen) |
| `orientation: "portrait-primary"` | App prefers portrait mode |
| `prefer_related_applications: false` | Don't show "install from Play Store" prompt instead |

**Linked in `index.html`:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#C4921A" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Be-Zone" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

---

## Service Worker

**File:** `public/sw.js`

The service worker is a JavaScript file that runs in the background in the browser (separate from the main page). It intercepts network requests and manages caching.

### Registration
The service worker is registered by the browser automatically when linked in `index.html` (via the manifest). It can also be explicitly registered in `main.tsx` if needed.

### Lifecycle

**1. Install Phase**
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('be-zone-static-v1').then((cache) =>
      cache.addAll(['/', '/index.html', '/manifest.json', 
                    '/icons/icon-192x192.png', '/icons/icon-512x512.png'])
    )
  );
  self.skipWaiting(); // Activates immediately without waiting
});
```
When the service worker first installs, it caches the core "shell" files so the app can load even without internet.

**2. Activate Phase**
```javascript
self.addEventListener('activate', (event) => {
  // Delete old caches from previous versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== 'be-zone-static-v1' && k !== 'be-zone-dynamic-v1')
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // Take control of all open tabs immediately
});
```

---

## Offline Cache Strategy

Three caching strategies are used depending on the type of request:

### Strategy 1: Cache First (for static assets)
Used for: images, CSS, JavaScript, fonts

```
Request comes in
  → Check cache first
  → If found: return cached version immediately (fast!)
  → If not found: fetch from network, save to cache, return
```

Best for assets that don't change often. Makes the app load very fast.

### Strategy 2: Network First (for page navigation)
Used for: HTML pages (navigating between routes)

```
Request comes in
  → Try network first
  → If network succeeds: save to cache, return response
  → If network fails (offline): return cached version
  → If nothing cached: return cached index.html (SPA fallback)
```

Ensures users always get the latest page, but can still navigate offline.

### Strategy 3: Stale-While-Revalidate (for everything else)
```
Request comes in
  → Return cached version immediately (if available)
  → Simultaneously fetch fresh version from network
  → Update cache with fresh version for next time
```

Best balance of speed and freshness.

### Supabase Requests — Always Network
```javascript
if (url.hostname.includes('supabase.co')) {
  return; // Skip service worker — go directly to network
}
```
Product data, orders, profiles must always be fresh from the database.

---

## PWA Installation

**File:** `src/components/PWAInstallPrompt.tsx`

### How Installation Works

1. Browser detects the site meets PWA criteria (HTTPS + manifest + service worker)
2. Browser fires the `beforeinstallprompt` event
3. `PWAInstallPrompt` component captures this event and prevents the default browser prompt
4. Shows a custom "Add to Home Screen" banner at the bottom of the page with:
   - Be-Zone icon
   - App name and description
   - "Install" button
   - "Dismiss" button
5. On "Install" click: `promptEvent.prompt()` triggers the browser's native install dialog
6. User accepts → App installed to home screen

### iOS Handling
iOS Safari does not support `beforeinstallprompt`. On iOS, users must manually:
- Tap the Share button
- Select "Add to Home Screen"

### After Installation
- App opens without browser URL bar or navigation chrome
- Has its own icon in the app drawer
- Looks exactly like a native app
- Tapping app icon opens to the `start_url: "/"` (home page)

---

## Push Notifications

> See [Firebase documentation](./12-firebase.md) for the complete push notification system.

### Quick Summary

1. User grants notification permission
2. Browser registers with Firebase (FCM) using the service worker
3. FCM returns a unique push token
4. Token stored in Supabase `profiles.fcm_token`
5. When admin updates order status → server sends push via FCM → service worker receives it → notification shown on device

### Service Worker Push Handler
```javascript
self.addEventListener('push', (event) => {
  const payload = event.data.json();
  const title = payload.notification.title;
  const body  = payload.notification.body;
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'be-zone-order',  // Replaces previous notification if still visible
      renotify: true          // Makes sound even when replacing
    })
  );
});
```

### Notification Click Handler
```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Open /profile page (where order history is)
  clients.openWindow('/profile');
});
```

---

## PWA Checklist for Be-Zone

| Criterion | Status | File |
|-----------|--------|------|
| HTTPS | ✅ (Vercel provides) | — |
| Web App Manifest | ✅ | `public/manifest.json` |
| Service Worker | ✅ | `public/sw.js` |
| Offline support | ✅ (shell cached) | `sw.js` |
| Installable | ✅ | `PWAInstallPrompt.tsx` |
| Push notifications | ✅ | `useFCMToken.ts` + `sw.js` |
| App icons (192 + 512) | ✅ | `public/icons/` |
| Theme color | ✅ | `manifest.json` + `index.html` |
| Portrait orientation | ✅ | `manifest.json` |
| iOS meta tags | ✅ | `index.html` |
| Responsive design | ✅ | Tailwind responsive classes |
