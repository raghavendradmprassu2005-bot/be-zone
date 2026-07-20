# 07 — API Analysis

---

## Overview

Be-Zone makes API calls in two categories:
1. **Supabase queries** — from the React frontend using the Supabase JS client
2. **Vercel Serverless Functions** — server-side API routes in `/api/`

There is no traditional REST API or GraphQL backend. Supabase provides a REST API that the JS client wraps automatically.

---

## Supabase Queries

### Products

| Location | Query | Purpose |
|----------|-------|---------|
| `useProducts` | `SELECT * FROM products WHERE in_stock = true` | Load all available products |
| `useProduct(id)` | `SELECT * FROM products WHERE id = :id LIMIT 1` | Load single product detail |
| `useSearch` | `SELECT * FROM products WHERE name ILIKE '%q%' OR description ILIKE '%q%' OR category ILIKE '%q%' ORDER BY review_count DESC LIMIT 8` | Live search |
| `useSearch` | `SELECT * FROM products WHERE tags @> '{q}' LIMIT 4` | Tag-based search |
| `Admin.tsx` | `INSERT INTO products (name, description, price, ...)` | Admin creates product |
| `Admin.tsx` | `UPDATE products SET ... WHERE id = :id` | Admin edits product |
| `Admin.tsx` | `DELETE FROM products WHERE id = :id` | Admin deletes product |
| `Admin.tsx` | `SELECT COUNT(*) FROM products` | Dashboard stat |

---

### Profiles

| Location | Query | Purpose |
|----------|-------|---------|
| `Profile.tsx` | `SELECT * FROM profiles WHERE id = user.id LIMIT 1` | Load user profile |
| `Profile.tsx` | `UPDATE profiles SET full_name, phone, email, address, city, pincode WHERE id = user.id` | Save profile changes |
| `Checkout.tsx` | `UPDATE profiles SET address, city, pincode, phone WHERE id = user.id` | Save delivery info after order |
| `useFCMToken.ts` | `SELECT fcm_token FROM profiles WHERE id = user.id LIMIT 1` | Check existing FCM token |
| `useFCMToken.ts` | `UPDATE profiles SET fcm_token = :token WHERE id = user.id` | Store new FCM token |
| `Admin.tsx` | `SELECT * FROM profiles` | Admin customer list |
| `Admin.tsx` | `SELECT COUNT(*) FROM profiles` | Dashboard stat |
| `api/send-push-notification.js` | `SELECT fcm_token FROM profiles WHERE id = :userId` | Get token for push (server-side, service role) |
| `api/send-push-notification.js` | `UPDATE profiles SET fcm_token = NULL WHERE id = :userId` | Clear stale token |

---

### Orders

| Location | Query | Purpose |
|----------|-------|---------|
| `Checkout.tsx` | `INSERT INTO orders (user_id, total, status, payment_method, shipping_*)` | Create new order |
| `Profile.tsx` | `SELECT * FROM orders WHERE user_id = user.id ORDER BY created_at DESC` | Customer order history |
| `Admin.tsx` | `SELECT * FROM orders ORDER BY created_at DESC` | All orders (admin view) |
| `Admin.tsx` | `UPDATE orders SET status = :newStatus WHERE id = :orderId` | Admin updates order status |
| `Admin.tsx` | `SELECT COUNT(*) FROM orders` | Dashboard stat |
| `Admin.tsx` | `SELECT SUM(total) FROM orders WHERE status != 'cancelled'` | Revenue calculation |

---

### Order Items

| Location | Query | Purpose |
|----------|-------|---------|
| `Checkout.tsx` | `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)` | Save each cart item |
| `Admin.tsx` | `SELECT * FROM order_items WHERE order_id = :id` | View items in a specific order |

---

### Campaigns

| Location | Query | Purpose |
|----------|-------|---------|
| `useActiveCampaign` | `SELECT * FROM campaigns WHERE is_active = true LIMIT 1` | Home page banner |
| `useCampaigns` | `SELECT * FROM campaigns ORDER BY created_at DESC` | Admin campaign list |
| `Admin.tsx` | `INSERT INTO campaigns (title, description, coupon_code, is_active, ...)` | Create campaign |
| `Admin.tsx` | `UPDATE campaigns SET is_active = false WHERE is_active = true` | Deactivate all campaigns |

---

### User Roles (Auth)

| Location | Query | Purpose |
|----------|-------|---------|
| `AuthContext.tsx` | `SELECT has_role(:userId, 'admin')` (RPC call) | Check if user is admin |

---

### Supabase Storage

| Location | Operation | Purpose |
|----------|-----------|---------|
| `Admin.tsx` (ProductEditor) | `supabase.storage.from('product-images').upload(path, file)` | Upload product image |
| `Admin.tsx` (ProductEditor) | `supabase.storage.from('product-images').getPublicUrl(path)` | Get public URL for image |

---

### Notification Logs (Server-Side Only)

| Location | Query | Purpose |
|----------|-------|---------|
| `api/send-push-notification.js` | `INSERT INTO notification_logs (order_id, user_id, status, error_message)` | Log push attempt |

---

## Vercel Serverless API Routes

### `POST /api/notify-telegram`

**File:** `api/notify-telegram.js`  
**Called by:** `src/lib/telegramNotify.ts` (from Checkout.tsx after order)  
**Environment Variables Required:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

**Request Body:**
```json
{
  "orderId": "uuid-string",
  "customerName": "Raghu",
  "phone": "9876543210",
  "email": "customer@example.com",
  "address": "123 MG Road, Bengaluru, 560001",
  "items": [
    { "name": "Mulethi Cream", "quantity": 2, "price": 299 }
  ],
  "total": 598,
  "paymentMethod": "Cash on Delivery",
  "orderDate": "2026-07-18T10:00:00Z"
}
```

**What it does:**
1. Validates `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set
2. Formats a rich Markdown message
3. POSTs to `https://api.telegram.org/bot{TOKEN}/sendMessage`
4. Returns `{ ok: true }` or `{ ok: false, reason: '...' }`
5. Always returns HTTP 200 (failure is non-critical — order already saved)

---

### `POST /api/send-push-notification`

**File:** `api/send-push-notification.js`  
**Called by:** `Admin.tsx` (when admin clicks "Send Notification" on an order)  
**Environment Variables Required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**Request Body:**
```json
{
  "orderId": "uuid-string",
  "userId": "user-uuid",
  "newStatus": "shipped",
  "customerName": "Raghu"
}
```

**What it does:**
1. Validates all required environment variables
2. Fetches `profiles.fcm_token` for the user (using service role, bypasses RLS)
3. If no token → logs `no_token` and returns
4. Mints a Google OAuth2 access token using a service account JWT (RS256 signed)
5. POSTs to `https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send`
6. Logs result to `notification_logs` table
7. On `UNREGISTERED`/`INVALID_ARGUMENT` FCM errors → clears stale token from profiles
8. Always returns HTTP 200

**Push Message Format by Status:**

| Status | Title | Body |
|--------|-------|------|
| pending | ⏳ Order Received | Your Be-Zone order has been received and is being processed. |
| confirmed | ✅ Order Confirmed | Great news! Your Be-Zone order has been confirmed. |
| shipped | 🚚 Order Shipped | Your Be-Zone order is on its way! Expect it soon. |
| delivered | 🎉 Order Delivered | Your Be-Zone order has been delivered. Enjoy! |
| cancelled | ❌ Order Cancelled | Your Be-Zone order has been cancelled. Contact us for help. |

---

## External APIs Used

### Telegram Bot API
- **URL:** `https://api.telegram.org/bot{TOKEN}/sendMessage`
- **Method:** POST
- **Format:** JSON with `parse_mode: 'MarkdownV2'`
- **Used for:** New order alerts to admin

### Firebase Cloud Messaging HTTP v1
- **OAuth2 URL:** `https://oauth2.googleapis.com/token`
- **FCM URL:** `https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send`
- **Auth:** Google service account JWT → access token → Bearer header
- **Used for:** Order status push notifications to customers

### Google Fonts API
- **URL:** `https://fonts.googleapis.com/css2?family=Playfair+Display:...`
- **Used for:** Loading Playfair Display + DM Sans + Cormorant Garamond fonts
- **Requested by:** `index.html` link tag + `src/index.css` @import

### WhatsApp API (wa.me links)
- **URL format:** `https://wa.me/91{phone}?text={encodedMessage}`
- **Used for:** "Buy on WhatsApp" button, customer service floating button
- **File:** `src/lib/orderSound.ts` (buildWhatsAppOrderUrl function)

---

## React Query Cache Keys

TanStack Query caches API results by key. These are the cache keys used:

| Cache Key | What it caches | Invalidated when |
|-----------|---------------|-----------------|
| `["products"]` | All in-stock products | Admin edits/creates/deletes a product |
| `["product", id]` | Single product detail | Admin edits that product |
| `["campaigns"]` | All campaigns | Admin creates/updates a campaign |
| `["active-campaign"]` | Active campaign for banner | Admin activates a campaign |
