# 04 — Complete Application Flow

---

## Customer Flow

```
Customer visits https://be-zone.vercel.app
        │
        ▼
Browser downloads React SPA from Vercel CDN
        │
        ▼
Service Worker installs (sw.js) — caches shell assets
        │
        ▼
App.tsx mounts all Providers:
  ThemeProvider → QueryClient → Auth → Cart → Wishlist → Router
        │
        ▼
AuthContext: supabase.auth.getSession() — restore session from localStorage
        │
        ▼
React Query fetches products from Supabase → cached in memory
        │
        ▼
┌──────────────────────────────────────────────┐
│                  HOME PAGE (/)               │
│  Hero → Campaign Banner → Categories         │
│  Featured Products → Trending Products       │
│  Recently Viewed (from localStorage)         │
└──────────────────────────────────────────────┘
        │
        ├─── Clicks category → /products?category=makeup
        ├─── Clicks product card → /product/:id
        └─── Clicks Search icon → SearchBar opens with live suggestions
        │
        ▼
┌──────────────────────────────────────────────┐
│             PRODUCTS PAGE (/products)        │
│  SearchBar → Filter Sidebar → Sort → Grid   │
│  Client-side filter on cached products       │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│          PRODUCT DETAIL (/product/:id)       │
│  Image → Name → Price → Qty → Add to Cart   │
│  Buy Now → WhatsApp Order → FAQ → Related   │
└──────────────────────────────────────────────┘
        │
        ├─── Add to Cart → CartDrawer opens (slide-out panel)
        ├─── Buy on WhatsApp → Opens wa.me link directly
        └─── Buy Now → Goes straight to /checkout
        │
        ▼
┌──────────────────────────────────────────────┐
│              CART DRAWER                     │
│  Items list → Quantity controls → Total      │
│  "Go to Checkout" → /checkout                │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│              CHECKOUT (/checkout)            │
│  Shipping form → Order summary → COD only   │
│  "Place Order" button                        │
└──────────────────────────────────────────────┘
        │
        ▼
  Supabase: INSERT into orders + order_items
  Supabase: UPDATE profiles (save delivery address)
        │
        ▼
  Vercel: POST /api/notify-telegram
        │
        ▼
  Telegram Bot → Admin receives order notification
        │
        ▼
  Confetti animation → Success screen
        │
        ▼
┌──────────────────────────────────────────────┐
│             PROFILE (/profile)               │
│  Tab 1: Edit delivery info                   │
│  Tab 2: Order history with status badges     │
└──────────────────────────────────────────────┘
```

---

## Admin Flow

```
Admin visits /admin
        │
        ▼
AuthContext: checkAdmin(userId) → supabase.rpc('has_role')
        │
   ┌────┴────┐
   │         │
Not admin   Is admin
   │         │
redirect    Access granted
to /        │
            ▼
┌──────────────────────────────────────────────┐
│            ADMIN DASHBOARD (/admin)          │
│                                              │
│  Stats: Revenue | Orders | Products | Users  │
│  Revenue chart (Recharts bar chart)          │
│                                              │
│  Tabs:                                       │
│  [Products] [Orders] [Customers]             │
│  [Analytics] [Campaigns]                    │
└──────────────────────────────────────────────┘
        │
        ├─── PRODUCTS TAB
        │       Filter/search products
        │       Click "Add Product" → ProductEditor dialog opens
        │       Upload image → Supabase Storage (product-images bucket)
        │       Save → INSERT/UPDATE products table
        │       Delete → DELETE from products table
        │
        ├─── ORDERS TAB
        │       List all orders from all customers
        │       Select order → see items
        │       Change status dropdown:
        │         pending → confirmed → shipped → delivered → cancelled
        │       "Send Notification" button →
        │         POST /api/send-push-notification →
        │         Firebase FCM → Customer's device shows push notification
        │
        ├─── CUSTOMERS TAB
        │       List all profiles (registered users)
        │
        ├─── ANALYTICS TAB
        │       Revenue charts, order statistics
        │
        └─── CAMPAIGNS TAB
                Create campaign with title, description, coupon code
                Set is_active = true to show on home page
```

---

## Authentication Flow

```
User visits /auth
        │
        ▼
Two tabs: [Sign In] [Sign Up]
        │
        ├─── SIGN UP:
        │       Enter name + email + password
        │       supabase.auth.signUp() called
        │       Supabase creates auth.users row
        │       DB trigger creates profiles row automatically
        │       Session starts → user logged in
        │       FCM token requested from browser
        │       Token stored in profiles.fcm_token
        │
        └─── SIGN IN:
                Enter email + password
                supabase.auth.signInWithPassword() called
                Supabase validates → returns JWT session
                Session stored in localStorage
                checkAdmin() called → isAdmin set
                FCM token registered (if not admin)
```

---

## Order Flow

```
Customer adds items to cart
        │
        ▼
Navigates to /checkout
        │
        ▼
Fills shipping form (or pre-filled from profile)
        │
        ▼
Clicks "Place Order"
        │
        ▼
[1] INSERT into orders table:
    { user_id, total, status: 'pending',
      payment_method: 'cod',
      shipping_name, phone, email, address, city, pincode }
        │
        ▼
[2] INSERT into order_items (one per product):
    { order_id, product_id, product_name, price, quantity }
        │
        ▼
[3] UPDATE profiles set {address, city, pincode, phone}
        │
        ▼
[4] POST /api/notify-telegram (fire & forget):
    Telegram Bot sends formatted message to admin chat
        │
        ▼
[5] clearCart() — empties cart in memory
        │
        ▼
[6] Confetti + success screen shown
        │
        ▼
Admin sees order in Telegram
        │
        ▼
Admin opens /admin → Updates order status
        │
        ▼
Admin clicks "Send Notification"
        │
        ▼
[7] POST /api/send-push-notification:
    Fetches customer FCM token from profiles
    Mints Google OAuth2 token from service account
    Sends push via Firebase FCM HTTP v1 API
    Logs attempt to notification_logs table
        │
        ▼
Customer's browser/phone shows push notification:
  "✅ Order Confirmed — Your Be-Zone order has been confirmed"
        │
        ▼
Customer taps notification → Opens /profile (order history)
```

---

## Payment Flow

```
NOTE: Be-Zone currently supports ONLY Cash on Delivery (COD).
No payment gateway (Razorpay, Stripe, etc.) is integrated.

Customer places order
        │
        ▼
payment_method = 'cod' (hardcoded in Checkout.tsx)
payment_status = 'pending'
        │
        ▼
Delivery person collects cash on arrival
        │
        ▼
Admin manually updates payment_status = 'paid'
(via Admin panel order management)
```

---

## Notification Flow

### Telegram (New Order Alert)
```
Order placed in Checkout.tsx
        │
        ▼
sendOrderNotification() called (src/lib/telegramNotify.ts)
        │
        ▼
POST /api/notify-telegram
  Body: { orderId, customerName, phone, email, address, items, total }
        │
        ▼
Vercel runs api/notify-telegram.js (server-side)
  Reads TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID from env
        │
        ▼
Fetches: https://api.telegram.org/bot{TOKEN}/sendMessage
  { chat_id, text: formatted order message, parse_mode: 'MarkdownV2' }
        │
        ▼
Admin's Telegram receives:
  🛍️ NEW ORDER — Be-Zone
  🔖 Order ID: ABC12345
  👤 Customer: Raghu | 📞 9876543210
  📦 Address: 123 MG Road, Bengaluru
  🛒 • Mulethi Cream × 2 — ₹598
  💰 Total: ₹598
  💳 Payment: Cash on Delivery
  ⚡ [Manage Orders](https://be-zone.vercel.app/admin)
```

### FCM Push Notification (Order Status Update)
```
Admin updates order status in /admin
        │
        ▼
Admin clicks "Send Notification"
        │
        ▼
Frontend POSTs to /api/send-push-notification:
  { orderId, userId, newStatus, customerName }
        │
        ▼
Vercel runs api/send-push-notification.js:
  [1] Fetch profiles.fcm_token for this userId
  [2] Mint Google OAuth2 token from service account JWT
  [3] POST to FCM HTTP v1 API with push payload
  [4] Log result to notification_logs table
        │
        ▼
Firebase routes push to customer's browser/device (via sw.js)
        │
        ▼
sw.js push event: self.registration.showNotification(...)
        │
        ▼
Customer sees notification:
  "✅ Order Confirmed"
  "Great news! Your Be-Zone order has been confirmed."
        │
        ▼
Customer taps → navigates to /profile
```

---

## Database Flow

```
Browser (React)
        │
        ▼ (Supabase JS client — uses anon key)
        ▼ (Row Level Security enforced by Postgres)
        │
┌───────────────────────────────────────┐
│           SUPABASE (PostgreSQL)       │
│                                       │
│  products ←── useProducts hook        │
│  profiles ←── Profile page            │
│  orders   ←── Checkout + Profile      │
│  order_items ←── Checkout + Admin     │
│  campaigns ←── Index + Admin          │
│  user_roles ←── AuthContext           │
│  notification_logs ←── server only    │
└───────────────────────────────────────┘
        │
        ▼ (service role key — server side only, bypasses RLS)
Vercel Serverless Functions
  api/send-push-notification.js
    └── reads profiles.fcm_token
    └── writes notification_logs
```
