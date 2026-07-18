/**
 * firebase.ts
 * Initialises the Firebase app and exports a lazy getter for Messaging.
 * All config values come from Vite env vars (VITE_ prefix → public, baked at build time).
 * None of these values are secret — Firebase web config is always public.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Avoid re-initialising on hot-reload in development
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };

/**
 * Returns a Messaging instance, or null when:
 *  - Running on a browser that doesn't support the Push API
 *  - Running in a non-HTTPS context (e.g. http://localhost in some browsers)
 *  - Firebase config is incomplete (env vars not yet set)
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  // Guard: all required config keys must be present
  const required = ['apiKey', 'projectId', 'messagingSenderId', 'appId'] as const;
  for (const key of required) {
    if (!firebaseConfig[key]) {
      console.warn(`[FCM] Missing VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()} — push notifications disabled`);
      return null;
    }
  }

  // Guard: Notification API support
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    return getMessaging(app);
  } catch (err) {
    console.warn('[FCM] getMessaging failed:', err);
    return null;
  }
}
