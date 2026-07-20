# 01 — Project Overview

## What Is Be-Zone?

Be-Zone is a **full-stack e-commerce Progressive Web App (PWA)** built for selling premium beauty, skincare, makeup, jewellery, grooming, and fashion products in India. It targets customers who want a luxury shopping experience on both mobile and desktop.

Think of it like a mini Amazon, but specialised for Indian beauty products, with a gold-and-white luxury theme.

---

## Type of Project

| Attribute | Value |
|-----------|-------|
| Category | E-commerce / Online Store |
| Type | Progressive Web App (PWA) — installable on phones like a native app |
| Target Market | India (₹ pricing, Cash on Delivery, WhatsApp ordering) |
| Users | Customers (public) + Admins (private panel) |

---

## Technology Stack

### Frontend
| Technology | What it does |
|-----------|--------------|
| **React 18** | Builds the user interface with reusable components |
| **TypeScript** | Adds type safety so mistakes are caught before running |
| **Vite** | Builds and bundles the project very fast |
| **Tailwind CSS** | Utility-first CSS — style elements directly in JSX with class names |
| **shadcn/ui** | Pre-built UI components (buttons, dialogs, inputs) built on Radix UI |
| **Framer Motion** | Smooth animations and page transitions |
| **Recharts** | Charts for the admin dashboard |
| **React Router v6** | Client-side navigation between pages without full page reloads |
| **TanStack Query (React Query)** | Fetches, caches and syncs data from Supabase |
| **next-themes** | Light/dark mode switching |

### Backend & Database
| Technology | What it does |
|-----------|--------------|
| **Supabase** | Hosted PostgreSQL database + authentication + file storage |
| **Supabase Auth** | Handles user login, signup, sessions, and role-based access |
| **Supabase Storage** | Stores product images in the `product-images` bucket |
| **Row Level Security (RLS)** | Database policies that control who can read/write what |

### Notifications
| Technology | What it does |
|-----------|--------------|
| **Firebase Cloud Messaging (FCM)** | Sends push notifications to customers' phones/browsers |
| **Telegram Bot** | Sends new order alerts to the admin's Telegram chat |

### Deployment & Serverless
| Technology | What it does |
|-----------|--------------|
| **Vercel** | Hosts the frontend and runs serverless API functions |
| **Vercel Serverless Functions** | Server-side code in `/api/` — handles Telegram and FCM securely |

### Key Libraries
| Library | Purpose |
|---------|---------|
| `canvas-confetti` | Celebration animation on successful order |
| `sonner` | Toast notification popups |
| `lucide-react` | Icon library |
| `embla-carousel-react` | Product carousels |
| `date-fns` | Date formatting |
| `zod` | Form validation schemas |

---

## Architecture

Be-Zone uses a **Single Page Application (SPA)** architecture:

```
Browser (React SPA)
│
├── Reads/Writes data → Supabase (PostgreSQL via REST API)
├── Auth sessions → Supabase Auth
├── Product images → Supabase Storage
│
├── On order placed → Vercel Serverless Function (api/notify-telegram.js)
│                      └─→ Telegram Bot API → Admin's Telegram chat
│
└── On order status change → Vercel Serverless Function (api/send-push-notification.js)
                              └─→ Firebase FCM → Customer's browser/phone
```

There is **no traditional backend server**. All business logic runs either:
1. **In the browser** (React components, hooks, context)
2. **In Supabase** (database queries, RLS policies, database functions)
3. **In Vercel Serverless Functions** (for things that must stay secret: API keys, Firebase private keys, Telegram tokens)

---

## Main Features

### For Customers
- 🛍️ **Browse Products** — Filter by category, price, rating; search by name/brand/description
- 📦 **Product Detail Page** — Images, pricing, discount badges, FAQ, related products
- 🛒 **Shopping Cart** — Slide-out drawer, quantity adjustment, real-time total
- ❤️ **Wishlist** — Save products for later
- 📱 **WhatsApp Ordering** — Direct purchase via WhatsApp message
- 💳 **Checkout** — Cash on Delivery, shipping address form
- 👤 **Profile** — Edit delivery address, view order history
- 🔔 **Push Notifications** — Order status updates on phone/browser
- ♾️ **Recently Viewed** — LocalStorage-powered history
- ⬇️ **PWA Install** — Install to home screen like a native app
- ♈ **Zodiac Guide** — Product recommendations by zodiac sign
- 🤖 **AI Chat Assistant** — On-page help bot
- 🎯 **Exit Intent Popup** — Triggered when mouse leaves the page

### For Admins
- 📊 **Dashboard** — Revenue stats, order counts, product counts
- 📦 **Product Management** — Add, edit, delete products with image upload
- 📋 **Order Management** — View all orders, update status, trigger push notifications
- 👥 **Customer List** — View registered users
- 🎪 **Campaigns** — Create marketing campaigns with coupon codes

---

## Overall Workflow

```
1. Customer visits be-zone.vercel.app
2. React app loads from Vercel CDN
3. Service Worker installs for offline support
4. React Query fetches products from Supabase
5. Customer browses → adds to cart (in memory)
6. Customer registers/logs in → Supabase Auth session
7. FCM token registered → stored in Supabase profiles table
8. Customer checks out → order saved to Supabase
9. Telegram notification → admin receives order on Telegram
10. Admin updates order status in /admin
11. Push notification triggered → customer's phone notifies
12. Customer views order history in /profile
```
