/**
 * api/send-push-notification.js
 * Vercel serverless function — runs server-side only.
 *
 * Uses the Firebase Cloud Messaging HTTP v1 REST API directly.
 * No firebase-admin SDK — only Node.js built-in `crypto` + `fetch`.
 *
 * Flow:
 * 1. Validate request body
 * 2. Fetch customer's FCM token from Supabase profiles (service role key)
 * 3. Mint a short-lived Google OAuth2 access token from the service account JWT
 * 4. POST to FCM HTTP v1 API
 * 5. Write result to notification_logs table
 * 6. Always return 200 — order status is already updated; this is non-critical
 */

import { createSign } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ── Google OAuth2: mint an access token from a service account ───────────────
async function getGoogleAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);

  const jwtHeader  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const jwtPayload = Buffer.from(JSON.stringify({
    iss:   clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url');

  const unsigned  = `${jwtHeader}.${jwtPayload}`;
  const signer    = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(privateKey, 'base64url');
  const jwt       = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  const data = await res.json();

  if (!data.access_token) {
    throw new Error(`OAuth2 token exchange failed: ${data.error_description ?? data.error ?? JSON.stringify(data)}`);
  }

  return data.access_token;
}

// ── FCM HTTP v1: send the push message ───────────────────────────────────────
async function sendFCMPush(accessToken, projectId, message) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code    = data.error?.status ?? res.status;
    const details = data.error?.message ?? JSON.stringify(data);
    throw Object.assign(new Error(details), { fcmStatus: code });
  }

  return data.name; // FCM message ID
}

// ── Supabase admin client (service role bypasses RLS) ────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

// ── Status copy ───────────────────────────────────────────────────────────────
const STATUS_COPY = {
  pending:   { title: '⏳ Order Received',   body: 'Your Be-Zone order has been received and is being processed.' },
  confirmed: { title: '✅ Order Confirmed',  body: 'Great news! Your Be-Zone order has been confirmed.' },
  shipped:   { title: '🚚 Order Shipped',    body: 'Your Be-Zone order is on its way! Expect it soon.' },
  delivered: { title: '🎉 Order Delivered',  body: 'Your Be-Zone order has been delivered. Enjoy!' },
  cancelled: { title: '❌ Order Cancelled',  body: 'Your Be-Zone order has been cancelled. Contact us for help.' },
};

// ── Log to notification_logs ──────────────────────────────────────────────────
async function logNotification(supabase, { orderId, userId, fcmStatus, errorMessage }) {
  try {
    await supabase.from('notification_logs').insert({
      order_id:      orderId  ?? null,
      user_id:       userId   ?? null,
      status:        fcmStatus,
      error_message: errorMessage ?? null,
    });
  } catch (e) {
    console.warn('[Push] Failed to write notification_log:', e?.message);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, reason: 'Method not allowed' });
  }

  // Guard: required env vars
  const missing = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY',
                   'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter(k => !process.env[k]);
  if (missing.length) {
    console.error('[Push] Missing env vars:', missing.join(', '));
    return res.status(200).json({ ok: false, reason: 'Push not configured', missing });
  }

  // Parse body
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ ok: false, reason: 'Invalid JSON' }); }

  const { orderId, userId, newStatus, customerName } = body ?? {};
  if (!orderId || !userId || !newStatus) {
    return res.status(400).json({ ok: false, reason: 'orderId, userId, newStatus required' });
  }

  const supabase = getSupabase();

  // 1. Fetch customer FCM token
  const { data: profile, error: profileErr } = await supabase
    .from('profiles').select('fcm_token').eq('id', userId).single();

  if (profileErr) {
    console.warn(`[Push] Profile lookup failed for user ${userId}:`, profileErr.message);
    await logNotification(supabase, { orderId, userId, fcmStatus: 'failed', errorMessage: profileErr.message });
    return res.status(200).json({ ok: false, reason: 'Profile lookup failed' });
  }

  const fcmToken = profile?.fcm_token;
  if (!fcmToken) {
    console.info(`[Push] No FCM token for user ${userId}`);
    await logNotification(supabase, { orderId, userId, fcmStatus: 'no_token' });
    return res.status(200).json({ ok: false, reason: 'No FCM token for this customer' });
  }

  // 2. Build FCM message
  const copy        = STATUS_COPY[newStatus] ?? { title: '📦 Order Update', body: `Your order status changed to: ${newStatus}.` };
  const notifBody   = customerName
    ? `${customerName}, ${copy.body.charAt(0).toLowerCase()}${copy.body.slice(1)}`
    : copy.body;

  const message = {
    token: fcmToken,
    notification: { title: copy.title, body: notifBody },
    webpush: {
      notification: {
        icon:             'https://be-zone.vercel.app/icons/icon-192x192.png',
        badge:            'https://be-zone.vercel.app/icons/icon-192x192.png',
        tag:              `order-${orderId}`,
        renotify:         true,
        requireInteraction: false,
        data: { url: 'https://be-zone.vercel.app/profile', orderId, status: newStatus },
      },
      fcm_options: { link: 'https://be-zone.vercel.app/profile' },
    },
  };

  // 3. Get OAuth2 token and send
  try {
    const privateKey  = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const accessToken = await getGoogleAccessToken(process.env.FIREBASE_CLIENT_EMAIL, privateKey);
    const messageId   = await sendFCMPush(accessToken, process.env.FIREBASE_PROJECT_ID, message);

    console.log(`[Push] ✅ Sent | order ${orderId.slice(0,8)} | status: ${newStatus} | id: ${messageId}`);
    await logNotification(supabase, { orderId, userId, fcmStatus: 'sent' });
    return res.status(200).json({ ok: true, messageId });

  } catch (err) {
    const errMsg   = err?.message ?? String(err);
    const fcmCode  = err?.fcmStatus ?? 'unknown';

    console.error(`[Push] ❌ Failed | order ${orderId.slice(0,8)} | ${fcmCode}: ${errMsg}`);

    // Clear stale / unregistered tokens automatically
    if (['UNREGISTERED', 'INVALID_ARGUMENT'].includes(fcmCode)) {
      await supabase.from('profiles').update({ fcm_token: null }).eq('id', userId);
      console.info(`[Push] Cleared stale FCM token for user ${userId}`);
    }

    await logNotification(supabase, { orderId, userId, fcmStatus: 'failed', errorMessage: errMsg });
    return res.status(200).json({ ok: false, reason: errMsg, code: fcmCode });
  }
}
