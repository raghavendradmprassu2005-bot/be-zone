# 13 — Telegram Notifications

---

## Overview

When a customer places an order, the admin receives an instant notification on Telegram. This is handled by a Vercel serverless function that calls the Telegram Bot API server-side, keeping the bot token completely secret.

---

## Which File Sends Telegram Messages

| File | Role |
|------|------|
| `src/lib/telegramNotify.ts` | **Client-side** — collects order data, calls the serverless function |
| `api/notify-telegram.js` | **Server-side** — receives the data, formats the message, calls Telegram API |

The client never touches the Telegram API directly. It only calls `/api/notify-telegram` which runs on Vercel's servers.

---

## How the Bot Works

### Step 1 — Order Placed
When `Checkout.tsx` successfully saves an order to Supabase, it calls:
```js
import { sendOrderNotification } from '@/lib/telegramNotify';

await sendOrderNotification({
  orderId,
  customerName: form.name,
  phone: form.phone,
  email: form.email,
  address: `${form.address}, ${form.city} - ${form.pincode}`,
  items: checkoutItems.map(i => ({
    name: i.product.name,
    quantity: i.quantity,
    price: i.product.price
  })),
  total,
  paymentMethod: 'Cash on Delivery',
  orderDate: new Date().toISOString()
});
```

### Step 2 — Serverless Function Called
`src/lib/telegramNotify.ts` makes a `fetch` call:
```js
fetch('/api/notify-telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})
```

### Step 3 — Server Formats Message
`api/notify-telegram.js` runs on Vercel's server. It:
1. Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from Vercel environment variables
2. Builds a rich Markdown message (MarkdownV2 format)
3. Sends it to the Telegram Bot API

### Step 4 — Admin Receives Message
The admin's Telegram account (configured as `TELEGRAM_CHAT_ID`) instantly receives the formatted notification.

---

## Message Format

The Telegram message is formatted in **MarkdownV2** style:

```
🛍️ *NEW ORDER — Be\-Zone*

🔖 *Order ID:*  `ABC12345`
📅 *Date & Time:*  18 Jul 2026, 4:00 PM IST

👤 *Customer Details*
  • *Name:*  Raghu Kumar
  • 📞 *Phone:*  9876543210
  • 📧 *Email:*  raghu@example.com

📦 *Delivery Address*
  123 MG Road, Bengaluru - 560001

🛒 *Ordered Items*
  • Mulethi Face Cream × 2  —  ₹598
  • NYN Huda Lipstick × 1  —  ₹599

💰 *Order Total:*  ₹1,197
💳 *Payment:*  Cash on Delivery

⚡ [Manage Orders](https://be-zone.vercel.app/admin)
```

The "Manage Orders" link takes the admin directly to `/admin`.

---

## Environment Variables

| Variable | Where Set | Purpose |
|----------|-----------|---------|
| `TELEGRAM_BOT_TOKEN` | Vercel Backend Env | The bot's secret token from @BotFather |
| `TELEGRAM_CHAT_ID` | Vercel Backend Env | The admin's Telegram chat ID or group ID |

> ⚠️ These are **server-side only** environment variables set in Vercel's dashboard. They have NO `VITE_` prefix and are never sent to the browser.

---

## How to Set Up a Telegram Bot

1. Open Telegram → search for `@BotFather`
2. Send `/newbot` → follow prompts → get your `BOT_TOKEN`
3. Find your Chat ID:
   - Start a chat with your bot
   - Visit: `https://api.telegram.org/bot{BOT_TOKEN}/getUpdates`
   - Look for `"chat": {"id": 123456789}` — that number is your `CHAT_ID`
4. Add both to Vercel: Settings → Environment Variables

---

## Error Handling

The Telegram notification is **non-critical**:
- If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` are missing → returns `{ ok: false, reason: 'not configured' }` with HTTP 200 (does not fail the checkout)
- If Telegram API returns an error → logs it server-side, returns HTTP 200 to the frontend
- If network fails → caught by try/catch, returns HTTP 200
- The order is **already saved** to Supabase before the Telegram call — if Telegram fails, the order still exists

In `src/lib/telegramNotify.ts`:
```js
try {
  await sendOrderNotification(data);
} catch {
  // Silent failure — order was already saved successfully
  console.warn('Telegram notification failed (non-critical)');
}
```

---

## Telegram API Used

```
POST https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage

Body:
{
  "chat_id": "YOUR_CHAT_ID",
  "text": "formatted message",
  "parse_mode": "MarkdownV2",
  "disable_web_page_preview": true
}
```

---

## Why Server-Side?

The Telegram bot token must **never** be exposed to the browser because:
1. Anyone who sees the token can send messages as your bot
2. They could see your chat ID and message you anything
3. Network traffic in browser devtools is visible to all users

By running it server-side in `api/notify-telegram.js`, the token exists only on Vercel's servers and is never included in the JavaScript bundle sent to browsers.
