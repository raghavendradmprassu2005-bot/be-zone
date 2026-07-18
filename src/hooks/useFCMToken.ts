/**
 * useFCMToken.ts
 *
 * Requests notification permission, obtains the FCM push token, and
 * persists it to the `profiles.fcm_token` column in Supabase so the
 * admin notification serverless function can look it up by user_id.
 *
 * Runs only for signed-in, non-admin users (customers).
 * Safe to call multiple times — idempotent.
 */
import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

async function registerAndStoreToken(userId: string): Promise<void> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return; // browser not supported or config missing

  // Request permission (no-op if already granted/denied)
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.info('[FCM] Notification permission not granted — push disabled');
    return;
  }

  // Get the existing sw.js registration and pass it to FCM
  // This avoids needing a separate firebase-messaging-sw.js
  let swRegistration: ServiceWorkerRegistration | undefined;
  try {
    swRegistration = await navigator.serviceWorker.getRegistration('/sw.js');
    // Wait for SW to be active before asking for a token
    if (swRegistration && swRegistration.installing) {
      await new Promise<void>((resolve) => {
        swRegistration!.installing!.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') resolve();
        });
      });
    }
  } catch {
    // SW not yet registered — getToken will try without it
  }

  const tokenOptions: Parameters<typeof getToken>[1] = { vapidKey: VAPID_KEY };
  if (swRegistration) tokenOptions.serviceWorkerRegistration = swRegistration;

  let token: string;
  try {
    token = await getToken(messaging, tokenOptions);
  } catch (err) {
    console.warn('[FCM] getToken failed:', err);
    return;
  }

  if (!token) return;

  // Upsert into profiles — only if the token has actually changed
  const { data: profile } = await supabase
    .from('profiles')
    .select('fcm_token')
    .eq('id', userId)
    .single();

  if (profile?.fcm_token === token) return; // already up-to-date

  const { error } = await supabase
    .from('profiles')
    .update({ fcm_token: token })
    .eq('id', userId);

  if (error) {
    console.warn('[FCM] Failed to store token in profiles:', error.message);
  } else {
    console.info('[FCM] Push token stored successfully');
  }
}

export function useFCMToken(): void {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Only register tokens for signed-in customers (not admins)
    if (!user || isAdmin) return;
    if (!VAPID_KEY) return; // env var not configured

    registerAndStoreToken(user.id).catch(console.warn);
  }, [user?.id, isAdmin]);
}
