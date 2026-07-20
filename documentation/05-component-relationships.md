# 05 — Component Relationships & Dependency Map

---

## App Component Tree

```
App.tsx
├── ThemeProvider (next-themes)
├── QueryClientProvider (TanStack Query)
├── TooltipProvider (shadcn)
├── AuthProvider (AuthContext)
│   ├── CartProvider (CartContext)
│   │   ├── WishlistProvider (WishlistContext)
│   │   │   ├── <Toaster /> (toast notifications)
│   │   │   ├── <Sonner /> (sonner notifications)
│   │   │   ├── BrowserRouter
│   │   │   │   ├── <Navbar />
│   │   │   │   │   ├── SearchBar
│   │   │   │   │   │   └── useSearch (hook)
│   │   │   │   │   └── CategoryMegaMenu
│   │   │   │   ├── <CartDrawer />
│   │   │   │   ├── <ExitIntentPopup />
│   │   │   │   ├── <WhatsAppButton />
│   │   │   │   ├── <AIChatAssistant />
│   │   │   │   ├── <PWAInstallPrompt />
│   │   │   │   ├── <FCMTokenRegistrar />
│   │   │   │   │   └── useFCMToken (hook)
│   │   │   │   ├── Routes
│   │   │   │   │   ├── / → <Index />
│   │   │   │   │   │   ├── ProductCard (×many)
│   │   │   │   │   │   └── RecentlyViewed
│   │   │   │   │   ├── /products → <Products />
│   │   │   │   │   │   ├── SearchBar
│   │   │   │   │   │   └── ProductCard (×many)
│   │   │   │   │   ├── /product/:id → <ProductDetail />
│   │   │   │   │   │   ├── ProductCard (related, ×many)
│   │   │   │   │   │   └── ShareButton
│   │   │   │   │   ├── /checkout → <Checkout />
│   │   │   │   │   ├── /wishlist → <Wishlist />
│   │   │   │   │   │   └── ProductCard (×many)
│   │   │   │   │   ├── /auth → <Auth />
│   │   │   │   │   ├── /profile → <Profile />
│   │   │   │   │   ├── /admin → <Admin />
│   │   │   │   │   │   ├── ProductFilters
│   │   │   │   │   │   ├── ProductTable
│   │   │   │   │   │   └── ProductEditor
│   │   │   │   │   ├── /zodiac → <ZodiacGuide />
│   │   │   │   │   └── * → <NotFound />
│   │   │   │   └── <Footer />
```

---

## Which Context Each Component Uses

| Component / Page | AuthContext | CartContext | WishlistContext |
|-----------------|-------------|-------------|-----------------|
| Navbar | ✓ (`user`, `isAdmin`) | ✓ (`totalItems`) | — |
| CartDrawer | — | ✓ (all cart ops) | — |
| ProductCard | — | ✓ (`addItem`) | ✓ (`addItem`, `isInWishlist`) |
| Index | — | — | — |
| Products | — | — | — |
| ProductDetail | — | ✓ (`addItem`) | ✓ (all wishlist ops) |
| Checkout | ✓ (`user`) | ✓ (`items`, `clearCart`) | — |
| Wishlist | — | — | ✓ (`items`) |
| Auth | ✓ (`signIn`, `signUp`) | — | — |
| Profile | ✓ (`user`) | — | — |
| Admin | ✓ (`user`, `isAdmin`) | — | — |

---

## Which Hook Each Page/Component Uses

| File | Hooks Used |
|------|-----------|
| `Index.tsx` | `useProducts`, `useActiveCampaign` |
| `Products.tsx` | `useProducts`, `useSearchParams` |
| `ProductDetail.tsx` | `useProduct`, `useProducts` |
| `Admin.tsx` | `useCampaigns`, `useToast` |
| `Profile.tsx` | (manual Supabase calls, no custom hook) |
| `Checkout.tsx` | `useToast` |
| `Navbar.tsx` | (SearchBar uses `useSearch` internally) |
| `SearchBar.tsx` | `useSearch` |
| `App.tsx` | `useFCMToken` (via FCMTokenRegistrar) |

---

## Component → Component Dependencies

```
ProductCard
  depends on: CartContext, WishlistContext
  used by: Index, Products, ProductDetail, Wishlist

SearchBar
  depends on: useSearch hook, react-router navigate
  used by: Navbar, Products

Navbar
  depends on: CartContext, AuthContext, SearchBar, CategoryMegaMenu
  used by: App.tsx (global)

CartDrawer
  depends on: CartContext
  used by: App.tsx (global)

ShareButton
  depends on: nothing (just clipboard API + WhatsApp URL)
  used by: ProductDetail

RecentlyViewed
  depends on: localStorage (addToRecentlyViewed function)
  used by: Index, ProductDetail

CategoryMegaMenu
  depends on: nothing (static category links)
  used by: Navbar

ProductEditor (admin)
  depends on: Supabase client (direct calls), shadcn Dialog
  used by: Admin.tsx

ProductTable (admin)
  depends on: shadcn Table
  used by: Admin.tsx

ProductFilters (admin)
  depends on: nothing (just props)
  used by: Admin.tsx
```

---

## Data Flow: Product Display

```
Supabase (products table)
        │
        ▼ (HTTP request via Supabase JS client)
useProducts() hook (TanStack Query)
        │
        ▼ (cached in QueryClient)
        │
        ├──→ Index.tsx → maps → ProductCard[]
        ├──→ Products.tsx → filters → ProductCard[]
        ├──→ ProductDetail.tsx → displays single product
        │                     → filters related → ProductCard[]
        └──→ Wishlist.tsx → maps → ProductCard[]
```

---

## Data Flow: Cart to Order

```
User clicks "Add to Cart" on ProductCard
        │
        ▼
CartContext.addItem(product) called
        │
        ▼
CartContext.items[] updated (in memory)
        │
        ▼
CartDrawer re-renders showing updated items
Navbar re-renders showing updated item count
        │
        ▼
User clicks "Go to Checkout"
        │
        ▼
Checkout.tsx reads CartContext.items
        │
        ▼
User fills shipping form → clicks "Place Order"
        │
        ▼
Supabase INSERT orders + order_items
        │
        ▼
CartContext.clearCart() called → items = []
        │
        ▼
telegramNotify.sendOrderNotification() → /api/notify-telegram
```

---

## Data Flow: Search

```
User types in SearchBar (Navbar or Products page)
        │
        ▼ (after 300ms debounce)
useSearch(query) hook
        │
        ▼ (Supabase .ilike() query)
Supabase: SELECT * FROM products
  WHERE name ILIKE '%query%'
     OR description ILIKE '%query%'
     OR category ILIKE '%query%'
  ORDER BY review_count DESC
  LIMIT 8
        │
        ▼ (second query for tags)
Supabase: SELECT * FROM products WHERE tags @> '{query}'
        │
        ▼
Results merged + deduplicated (max 8)
        │
        ▼
SearchBar renders suggestion dropdown with thumbnails + prices
        │
        ▼
User clicks suggestion → navigate('/product/:id')
```

---

## Data Flow: Push Notifications

```
User logs in (non-admin)
        │
        ▼
useFCMToken() hook runs (via FCMTokenRegistrar in App.tsx)
        │
        ▼
Notification.requestPermission() → user grants permission
        │
        ▼
getToken(messaging, { vapidKey, serviceWorkerRegistration })
        │
        ▼
Firebase returns unique FCM token for this device
        │
        ▼
Supabase: UPDATE profiles SET fcm_token = '...' WHERE id = userId
        │
        ▼ (later, when admin updates order status)
Admin POSTs to /api/send-push-notification
        │
        ▼
Server reads profiles.fcm_token for this userId
        │
        ▼
Firebase FCM sends push to that token
        │
        ▼
Browser receives push → sw.js handles 'push' event
        │
        ▼
self.registration.showNotification(title, options)
        │
        ▼
User sees notification → taps → navigates to /profile
```

---

## shadcn/ui Components Used in Each Page

| Page | shadcn Components Used |
|------|----------------------|
| Index | Button, Badge |
| Products | Button, Select, Slider, Input |
| ProductDetail | Button, Badge, Dialog (via shadcn) |
| Checkout | Button, Input, Label |
| Auth | Button, Input, Label |
| Profile | Button, Input, Label, Badge, Tabs |
| Admin | Button, Dialog, Input, Label, Badge, Table, Select, Card, Checkbox, Skeleton, Tabs |
| Wishlist | Button |
| All | Tooltip, Toast, Sonner |
