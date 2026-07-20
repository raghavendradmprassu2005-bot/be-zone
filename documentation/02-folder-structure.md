# 02 — Complete Folder Structure

## Root Level

```
be-zone/
├── api/                        ← Vercel serverless functions (server-side only)
├── documentation/              ← This documentation folder
├── public/                     ← Static files served as-is (not processed by Vite)
├── src/                        ← All React application source code
├── supabase/                   ← Supabase config and database migrations
├── .env                        ← Environment variables (Supabase URL & key)
├── .gitignore                  ← Files git will not track
├── components.json             ← shadcn/ui configuration
├── eslint.config.js            ← Code quality rules
├── index.html                  ← The single HTML file the SPA lives in
├── package.json                ← Project dependencies and scripts
├── package-lock.json           ← Exact dependency versions (npm)
├── bun.lockb                   ← Exact dependency versions (bun)
├── postcss.config.js           ← PostCSS config (used by Tailwind)
├── tailwind.config.ts          ← Tailwind custom colors, fonts, animations
├── tsconfig.json               ← TypeScript compiler settings
├── tsconfig.app.json           ← TypeScript settings for app code
├── tsconfig.node.json          ← TypeScript settings for Vite config
├── vercel.json                 ← Vercel deploy settings (install cmd, rewrites)
├── vite.config.ts              ← Vite bundler configuration
├── vitest.config.ts            ← Unit test configuration
├── playwright.config.ts        ← End-to-end test configuration
└── README.md                   ← Basic project readme
```

---

## `/api` — Vercel Serverless Functions

```
api/
├── notify-telegram.js          ← Sends new order notification to admin's Telegram
└── send-push-notification.js   ← Sends FCM push notification to customer's device
```

> **Why serverless?** These files contain secret API keys (Telegram token, Firebase private key) that must NEVER be sent to the browser. Vercel runs them server-side.

---

## `/public` — Static Assets

```
public/
├── favicon.ico                 ← Browser tab icon
├── icons/
│   ├── icon-192x192.png        ← PWA app icon (small)
│   └── icon-512x512.png        ← PWA app icon (large)
├── manifest.json               ← PWA manifest (app name, colors, icons)
├── placeholder.svg             ← Fallback image for broken product images
├── robots.txt                  ← Instructions for search engine crawlers
└── sw.js                       ← Service Worker (offline caching + push notifications)
```

---

## `/src` — Application Source Code

```
src/
├── App.tsx                     ← Root component: providers, router, routes
├── App.css                     ← Minimal global overrides (mostly unused)
├── main.tsx                    ← Entry point: renders App into #root
├── index.css                   ← Global styles, Tailwind directives, custom CSS
│
├── assets/                     ← Local image assets imported in components
│   ├── hero-beauty.jpg
│   ├── hero-cosmic.jpg
│   ├── category-women.jpg
│   ├── category-men.jpg
│   ├── category-kids.jpg
│   ├── fogg-perfume.jpeg
│   ├── glow-lovely-cream.jpeg
│   ├── mulethi-*.jpeg          ← Product images
│   ├── nyn-huda-lipstick.jpeg
│   └── *-category.png          ← Category icons
│
├── components/                 ← Reusable UI components
│   ├── ui/                     ← shadcn/ui primitives (50+ files)
│   ├── admin/                  ← Admin-only components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   ├── SearchBar.tsx
│   ├── CategoryMegaMenu.tsx
│   ├── RecentlyViewed.tsx
│   ├── ShareButton.tsx
│   ├── PWAInstallPrompt.tsx
│   ├── AIChatAssistant.tsx
│   ├── ExitIntentPopup.tsx
│   ├── NavLink.tsx
│   └── WhatsAppButton.tsx
│
├── context/                    ← Global state shared across all components
│   ├── AuthContext.tsx         ← User session, login/logout, isAdmin
│   ├── CartContext.tsx         ← Cart items, totals, open/close
│   └── WishlistContext.tsx     ← Saved/wishlist products
│
├── hooks/                      ← Custom React hooks (data fetching logic)
│   ├── useProducts.ts          ← Fetch all products or one product
│   ├── useSearch.ts            ← Live Supabase search with debounce
│   ├── useOrders.ts            ← Fetch orders (admin or user)
│   ├── useFCMToken.ts          ← Firebase FCM token management
│   ├── useActiveCampaign.ts    ← Fetch the current active campaign
│   ├── useCampaigns.ts         ← Fetch all campaigns (admin)
│   └── use-toast.ts            ← Toast notification helper
│
├── integrations/
│   └── supabase/
│       ├── client.ts           ← Creates and exports the Supabase client
│       └── types.ts            ← Auto-generated TypeScript types for all tables
│
├── lib/                        ← Utility functions and shared constants
│   ├── types.ts                ← Product, CartItem, Category, CATEGORIES list
│   ├── firebase.ts             ← Firebase app initialization + FCM messaging
│   ├── orderSound.ts           ← WhatsApp URL builder + Firebase helper
│   ├── telegramNotify.ts       ← Client-side function that calls /api/notify-telegram
│   └── utils.ts                ← Tailwind class merger (cn utility)
│
└── pages/                      ← One file per page/route
    ├── Index.tsx               ← / (Home page)
    ├── Products.tsx            ← /products (Product catalog)
    ├── ProductDetail.tsx       ← /product/:id (Single product)
    ├── Checkout.tsx            ← /checkout
    ├── Wishlist.tsx            ← /wishlist
    ├── Auth.tsx                ← /auth (Login & Register)
    ├── Profile.tsx             ← /profile (User account)
    ├── Admin.tsx               ← /admin (Admin panel)
    ├── ZodiacGuide.tsx         ← /zodiac (Zodiac product recommendations)
    └── NotFound.tsx            ← * (404 page)
```

---

## `/src/components/admin` — Admin Components

```
components/admin/
├── ProductEditor.tsx           ← Add/Edit product dialog with image upload
├── ProductFilters.tsx          ← Search and filter bar for admin product list
├── ProductTable.tsx            ← Table showing all products with checkboxes
└── types.ts                    ← AdminProductForm and AdminProductRow interfaces
```

---

## `/src/components/ui` — shadcn/ui Primitives

These are pre-built, accessible UI components. You do not normally edit these — they are used as building blocks.

```
components/ui/
├── accordion, alert, alert-dialog, aspect-ratio
├── avatar, badge, breadcrumb, button
├── calendar, card, carousel, chart
├── checkbox, collapsible, command, context-menu
├── dialog, drawer, dropdown-menu, form
├── hover-card, input, input-otp, label
├── menubar, navigation-menu, pagination, popover
├── progress, radio-group, resizable, scroll-area
├── select, separator, sheet, sidebar
├── skeleton, slider, sonner, switch
├── table, tabs, textarea, toast
├── toaster, toggle, toggle-group, tooltip
└── use-toast
```

---

## `/supabase` — Database Configuration

```
supabase/
├── config.toml                 ← Supabase project ID
└── migrations/
    ├── 20260330101055_*.sql    ← Initial schema (products, profiles, orders, roles, reviews)
    ├── 20260711150651_*.sql    ← Second migration (campaigns table)
    └── add_fcm_and_notification_logs.sql ← FCM token column + notification_logs table
```
