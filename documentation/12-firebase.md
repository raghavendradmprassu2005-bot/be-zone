# 12 — Firebase (Push Notifications)

---

## Overview

Be-Zone uses **Firebase Cloud Messaging (FCM)** to send push notifications to customers when their order status changes. Firebase is only used for push notifications — not for authentication, database, or hosting.

---

## Firebase Initialization

**File:** `src/lib/firebase.ts`

```javascript
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton pattern — prevents re-initialization during hot reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Returns the messaging instance with feature detection
export async function getFirebaseMessaging() {
  if (!('Notification' in window)) return null;
  if (!('serviceWorker' in navigator)) return null;
  if (!('PushManager' in window)) return null;
  return getMessaging(app);
}
```

**Why the singleton pattern?** During development, Vite hot-reloads the module many times. Without `getApps().length` check, Firebase would throw "app already initialized" errors.

---

## FCM Token Registration

**File:** `src/hooks/useFCMToken.ts`

This hook runs automatically for every logged-in, non-admin user via `FCMTokenRegistrar` in `App.tsx`.

### Flow:

```
1. Hook runs when user logs in (non-admin only)
        │
        ▼
2. Check: is Notification API available?
   Is Push API available?
   Is ServiceWorker available?
        │
        ▼
3. Request browser notification permission:
   Notification.requestPermission()
   → User sees "Allow notifications?" prompt
        │
   ┌────┴────┐
   │         │
Granted    Denied
   │         │
   ▼       Stop (no token)
4. Get existing ServiceWorker registration:
   navigator.serviceWorker.getRegistration('/sw.js')
   Wait for 'activated' state if installing
        │
        ▼
5. Get FCM token from Firebase:
   getToken(messaging, {
     vapidKey: VITE_FIREBASE_VAPID_KEY,
     serviceWorkerRegistration: swRegistration
   })
   → Firebase returns a long unique token string
        │
        ▼
6. Check existing token in Supabase:
   SELECT fcm_token FROM profiles WHERE id = userId
        │
   ┌────┴─────────────┐
   │                  │
Token same         Token different
   │                  │
 Skip              UPDATE profiles
                   SET fcm_token = newToken
                   WHERE id = userId
```

### Why check before updating?
To avoid unnecessary database writes. FCM tokens don't change frequently. Only updating when different reduces Supabase writes.

### Why non-admin only?
Admins don't need push notifications — they manage the store. Notifications are for customers receiving order status updates.

---

## FCM Token Storage

The token is stored in the `profiles` table under the `fcm_token` column:

```sql
-- Column added by migration:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fcm_token text DEFAULT NULL;

-- Index for fast server-side lookup:
CREATE INDEX idx_profiles_fcm_token ON profiles (fcm_token)
  WHERE fcm_token IS NOT NULL;
```

**Token lifecycle:**
- **Set:** When user logs in and grants notification permission
- **Updated:** When Firebase issues a new token (device/browser change)
- **Cleared:** Server-side when FCM returns `UNREGISTERED` or `INVALID_ARGUMENT` errors (meaning the token is no longer valid)

---

## Service Worker Role in Push Notifications

**File:** `public/sw.js`

The service worker is the "receiver" for push messages. It runs in the background, even when the website is not open.

```javascript
// In sw.js:
self.addEventListener('push', (event) => {
  const payload = event.data.json();

  // Extract notification content
  const title = payload.notification?.title || 'Be-Zone';
  const body  = payload.notification?.body  || 'Your order has been updated.';
  const icon  = payload.notification?.icon  || '/icons/icon-192x192.png';

  // Show the notification on the device
  event.waitUntil(
    self.registration.showNotification(title, { body, icon, badge, tag })
  );
});

// Handle notification tap:
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Navigate to /profile (order history)
  clients.openWindow('/profile');
});
```

> **No firebase-messaging-sw.js needed.** Firebase's default service worker file is not required because Be-Zone uses the standard Web Push protocol. The existing `sw.js` handles push events directly.

---

## Sending Push Notifications (Server Side)

**File:** `api/send-push-notification.js`

The server function (Vercel serverless) handles sending. It does NOT use the Firebase Admin SDK — instead it uses native `crypto` + `fetch` to avoid adding a large dependency.

### Authentication with Google:
```
Firebase requires OAuth2 authentication to use the FCM HTTP v1 API.

Server account credentials → Build a JWT → Exchange for access token → Use as Bearer header
```

**Step-by-step:**
1. Build a JWT (JSON Web Token) with:
   - `iss`: Firebase Client Email
   - `scope`: `https://www.googleapis.com/auth/firebase.messaging`
   - `aud`: `https://oauth2.googleapis.com/token`
   - Signed with Firebase Private Key (RSA-SHA256)

2. POST to Google OAuth2:
   ```
   POST https://oauth2.googleapis.com/token
   { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }
   → Returns { access_token: '...' }
   ```

3. POST to Firebase FCM HTTP v1:
   ```
   POST https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send
   Authorization: Bearer {access_token}
   { message: { token: customerFCMToken, notification: {...}, webpush: {...} } }
   ```

---

## Environment Variables for Firebase

### Frontend (VITE_ prefix — visible in browser)
| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_VAPID_KEY` | Web Push VAPID key (for getToken) |

### Backend (Vercel env — server-side ONLY, never in browser)
| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID (same as frontend but server-side) |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (RSA) — contains `\n` chars |

> ⚠️ **`FIREBASE_PRIVATE_KEY`** is extremely sensitive. It must ONLY be in Vercel's backend environment variables, never with the `VITE_` prefix.

---

## Notification Audit Log

Every push attempt (success or failure) is logged to `notification_logs`:

```json
{
  "order_id": "uuid",
  "user_id": "uuid",
  "status": "sent",         // or "failed" or "no_token"
  "error_message": null,    // populated on failure
  "created_at": "2026-07-18T10:00:00Z"
}
```

**Status values:**
| Status | Meaning |
|--------|---------|
| `sent` | Push successfully delivered to FCM |
| `failed` | FCM returned an error |
| `no_token` | Customer has no FCM token (never granted permission) |

---

## Complete Firebase Flow Summary

```
[Customer grants notification permission]
        ↓
[Browser generates FCM token via Firebase SDK]
        ↓
[useFCMToken stores token in Supabase profiles table]
        ↓
[Admin updates order status in /admin]
        ↓
[Admin clicks "Send Notification"]
        ↓
[api/send-push-notification.js runs server-side]
        ↓
[Reads FCM token from Supabase (service role key)]
        ↓
[Mints Google OAuth2 token from service account JWT]
        ↓
[POSTs to Firebase FCM HTTP v1 API]
        ↓
[Firebase routes to customer's browser/device]
        ↓
[sw.js push event fires → showNotification()]
        ↓
[Customer sees: "✅ Order Confirmed — Be-Zone"]
        ↓
[Customer taps → browser opens /profile]
        ↓
[Log written to notification_logs table]
```
