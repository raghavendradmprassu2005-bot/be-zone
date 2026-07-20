# 15 — Environment Variables

---

## Overview

Environment variables store secret configuration values that should not be hardcoded in the source code. Be-Zone has two types:

- **Frontend variables (`VITE_` prefix)** — included in the browser bundle. Visible to anyone who inspects the network traffic. Safe for public API keys (like Supabase anon key, Firebase web config).
- **Backend variables (no `VITE_` prefix)** — stored only on Vercel's servers. Never sent to the browser. Required for private secrets (bot tokens, private keys).

---

## Frontend Environment Variables (VITE_)

Set in `.env` file (for local development) and in Vercel dashboard (for production).

> ⚠️ All `VITE_` variables are visible in the browser. Only put values here that are safe to be public.

### Supabase (Required — App won't work without these)

| Variable | Example Value | Purpose |
|----------|--------------|---------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | The URL of your Supabase project. Found in Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_xxxxx` | The "anon/public" key for Supabase. Safe to be public — database security is enforced by RLS policies |

**Used in:** `src/integrations/supabase/client.ts`

---

### Firebase (Required for push notifications)

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key. Found in Firebase Console → Project Settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (usually `projectid.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket (usually `projectid.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID (numeric) |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_VAPID_KEY` | Web Push VAPID key. Found in Firebase Console → Cloud Messaging → Web Push certificates. Required for `getToken()` |

**Used in:** `src/lib/firebase.ts`, `src/hooks/useFCMToken.ts`

---

## Backend Environment Variables (Vercel Only)

Set ONLY in Vercel Dashboard → Project → Settings → Environment Variables. These must NEVER have the `VITE_` prefix.

> 🔐 These values are never sent to the browser. They exist only on Vercel's servers when serverless functions run.

### Telegram Bot

| Variable | How to Get | Purpose |
|----------|-----------|---------|
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram → `/newbot` | Authenticates your bot with Telegram's API |
| `TELEGRAM_CHAT_ID` | Message your bot → `getUpdates` endpoint | The chat/group ID where order alerts are sent |

**Used in:** `api/notify-telegram.js`

---

### Firebase Admin (Server-Side)

| Variable | How to Get | Purpose |
|----------|-----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings | Same project ID as frontend |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate new private key → JSON file → `client_email` field | Service account email for OAuth2 authentication |
| `FIREBASE_PRIVATE_KEY` | Same JSON file → `private_key` field | RSA private key for signing JWTs. Contains literal `\n` characters — paste exactly as-is |

**Used in:** `api/send-push-notification.js`

> ⚠️ `FIREBASE_PRIVATE_KEY` is very long (multiple lines). In Vercel, paste it exactly as-is from the JSON file. The serverless function replaces `\\n` with actual newlines: `process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')`.

---

### Supabase Service Role (Server-Side)

| Variable | How to Get | Purpose |
|----------|-----------|---------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | Same URL as frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` (secret) | Bypasses all Row Level Security — admin-level database access |

**Used in:** `api/send-push-notification.js`

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` can read and write anything in your database, bypassing all RLS policies. Keep it strictly server-side.

---

## Complete Variable Reference

| Variable | Type | Required | Where Used |
|----------|------|----------|-----------|
| `VITE_SUPABASE_URL` | Frontend | ✅ Yes | Supabase client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | ✅ Yes | Supabase client |
| `VITE_FIREBASE_API_KEY` | Frontend | For push | Firebase init |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | For push | Firebase init |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | For push | Firebase init |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | For push | Firebase init |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | For push | Firebase init |
| `VITE_FIREBASE_APP_ID` | Frontend | For push | Firebase init |
| `VITE_FIREBASE_VAPID_KEY` | Frontend | For push | FCM token |
| `TELEGRAM_BOT_TOKEN` | Backend | For Telegram | notify-telegram.js |
| `TELEGRAM_CHAT_ID` | Backend | For Telegram | notify-telegram.js |
| `FIREBASE_PROJECT_ID` | Backend | For push | send-push-notification.js |
| `FIREBASE_CLIENT_EMAIL` | Backend | For push | send-push-notification.js |
| `FIREBASE_PRIVATE_KEY` | Backend | For push | send-push-notification.js |
| `SUPABASE_URL` | Backend | For push | send-push-notification.js |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | For push | send-push-notification.js |

---

## Current `.env` File (Local Development)

The `.env` file at the project root is for local development only. Currently it contains:
```
VITE_SUPABASE_URL=https://sxxccueznkwsokgiragb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_gqEgw...
```

The Firebase variables and backend secrets are not in `.env` — they are in Vercel's environment variable settings for production.

---

## How to Add Missing Variables

### For Local Development
Add to `.env` at the project root:
```
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_PROJECT_ID=your-project-id
...
```

### For Production (Vercel)
1. Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add each variable with its name and value
3. Set Environment to "Production" (and "Preview" if needed)
4. Redeploy the project

> Vercel automatically injects these when the serverless functions run. No code change needed.
