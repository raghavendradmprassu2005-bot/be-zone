# 03 — Every File Explained

---

## Entry Points

### `index.html`
The single HTML file the entire app lives in. Contains:
- Viewport meta tag (mobile-responsive, PWA-safe with `viewport-fit=cover`)
- PWA manifest link, theme color, Apple touch icons
- Google Fonts preload (Cormorant Garamond + Playfair Display + DM Sans)
- SEO meta tags (title, description, Open Graph, Twitter Card)
- `<div id="root">` — React mounts here
- `<script type="module" src="/src/main.tsx">` — loads the app

**Used by:** Everything — this is the outer shell.

---

### `src/main.tsx`
The very first JavaScript that runs. It calls `ReactDOM.createRoot` to mount the `<App />` component inside `<div id="root">`. This is the bridge between `index.html` and React.

---

### `src/App.tsx`
The root React component. Sets up ALL the global providers in the correct nesting order:

```
ThemeProvider (dark/light mode)
  QueryClientProvider (React Query data cache)
    TooltipProvider (shadcn tooltips)
      AuthProvider (user session)
        CartProvider (shopping cart)
          WishlistProvider (saved items)
            BrowserRouter (URL routing)
              Navbar, CartDrawer, ExitIntentPopup,
              WhatsAppButton, AIChatAssistant, PWAInstallPrompt
              Routes → Pages
              Footer
```

Also contains `FCMTokenRegistrar` — a side-effect-only component that calls `useFCMToken()` to register the device for push notifications after login.

**Used by:** Everything — this is the app root.

---

### `src/index.css`
Global stylesheet loaded before any component. Contains:
- `@import` for Google Fonts (Cormorant Garamond, Playfair Display, DM Sans)
- Tailwind directives (`@tailwind base/components/utilities`)
- CSS custom properties (HSL color variables: `--background`, `--secondary`, `--gold`, etc.)
- Base styles: `body`, `h1-h6`, `img` max-width
- Custom utility classes: `.font-display`, `.font-body`, `.text-glow`, `.gradient-cosmic`, `.gradient-nebula`, `.box-glow`, `.shadow-premium`, `.starfield`
- CSS animations: `shimmer`, `glow-fade`, `float`, `twinkle`, `pulse-glow`

**Used by:** Every component (global).

---

### `tailwind.config.ts`
Tells Tailwind CSS what custom values to use. Key customisations:
- **`font-display`** → Playfair Display (used for product names, headings)
- **`font-body`** → DM Sans (used for body text)
- **`colors.secondary`** → Gold (`hsl(38 60% 52%)`) — the brand colour
- **`colors.gold`**, **`colors.cosmic-pink`**, **`colors.nebula`** — accent colours
- **`animations`**: `float`, `twinkle`, `pulse-glow`, `accordion-down/up`

**Used by:** Every Tailwind class in every component.

---

### `vite.config.ts`
Configuration for the Vite build tool:
- Dev server runs on port `8080`, host `::` (all interfaces)
- `@` alias → `./src` (so `import X from '@/components/X'` works)
- Uses `@vitejs/plugin-react-swc` for fast React compilation

---

### `vercel.json`
Tells Vercel how to deploy:
- `installCommand`: `npm install --legacy-peer-deps` (avoids Bun connection errors)
- `buildCommand`: `npm run build`
- `rewrites`: Any URL not starting with `/api/` redirects to `/index.html` (required for SPA routing)

---

## Pages

### `src/pages/Index.tsx` — Home Page (`/`)
The landing page. Contains:
- Hero section with animated text and CTA buttons
- Active campaign banner (from `useActiveCampaign`)
- Trust signals row (shipping, payments, returns)
- Service cards grid (Beauty, Hair, Makeup, etc.)
- Category navigation pills (links to `/products?category=X`)
- Featured products carousel
- Trending products section
- `RecentlyViewed` component at the bottom

**Hooks used:** `useProducts`, `useActiveCampaign`
**Components:** `ProductCard`, `RecentlyViewed`, `motion`

---

### `src/pages/Products.tsx` — Product Catalog (`/products`)
The main shop page. Contains:
- Desktop sidebar with category filter + price range slider
- Mobile filter panel (collapsible)
- SearchBar with live Supabase suggestions
- Sort dropdown (popularity, price, rating)
- Product grid (2 columns mobile, 3 desktop, 4 wide)
- "No products found" empty state

Filtering is done **client-side** against the React Query cache. Search covers: name, description, category, tags.

**Hooks:** `useProducts`, `useSearchParams`
**Components:** `ProductCard`, `SearchBar`

---

### `src/pages/ProductDetail.tsx` — Single Product (`/product/:id`)
The product page. Contains:
- Product image (aspect-square container)
- Category label, product name (Playfair Display)
- Star rating display
- Price + original price + discount badge
- Hot deal alert (if `hot-deal` tag present)
- Description, benefits list
- Quantity picker + Add to Cart + Wishlist + Share buttons
- Buy Now button (adds to cart + goes to checkout)
- WhatsApp order button
- Trust signals (Free Shipping, Secure Payment, 7-day Returns)
- Tags
- FAQ accordion (4 hardcoded questions)
- Related products grid (same category)
- Sticky mobile Buy Now bar (appears when main CTA scrolls out of view)

**Hooks:** `useProduct`, `useProducts`, `useCart`, `useWishlist`
**Components:** `ProductCard`, `ShareButton`

---

### `src/pages/Checkout.tsx` — Checkout (`/checkout`)
The order placement page. Three conceptual steps (displayed as one form):
1. **Shipping form** — Name, phone, email, address, city, pincode
2. **Order summary** — Items, quantities, prices, total
3. **Payment** — Cash on Delivery only (hardcoded)

On "Place Order":
1. Validates form
2. Inserts row to `orders` table in Supabase
3. Inserts rows to `order_items` table for each cart item
4. Updates `profiles` table with shipping info for next time
5. Calls `sendOrderNotification()` → hits `/api/notify-telegram`
6. Shows confetti animation + success screen

Accepts `buyNowItems` from router state (for direct "Buy Now" purchases that bypass cart).

**Hooks:** `useCart`, `useAuth`, `useProducts`, `useToast`

---

### `src/pages/Auth.tsx` — Login & Register (`/auth`)
A single page with tabs for Sign In and Sign Up. 
- Sign In calls `useAuth().signIn(email, password)`
- Sign Up calls `useAuth().signUp(email, password, fullName)`
- On success, navigates to home page
- Shows loading state + error toasts

**Context:** `AuthContext`

---

### `src/pages/Profile.tsx` — User Account (`/profile`)
Two tabs:
1. **Profile tab** — Edit name, phone, email, address, city, pincode → saves to `profiles` table
2. **Orders tab** — Shows order history from `orders` table with status badges

Redirects to `/auth` if not logged in.

**Supabase queries:** `profiles` (select + update), `orders` (select)

---

### `src/pages/Admin.tsx` — Admin Panel (`/admin`)
The complete admin dashboard. Requires `isAdmin === true` (redirects otherwise). Contains:
- Stats cards (total revenue, orders, products, customers)
- Revenue bar chart (Recharts)
- Tabbed interface: Products | Orders | Customers | Analytics | Campaigns

**Products tab:** Create/edit/delete products using `ProductEditor`, `ProductTable`, `ProductFilters`
**Orders tab:** List all orders, update status, send push notifications
**Customers tab:** List all user profiles
**Campaigns tab:** Create marketing campaigns with coupon codes

**Supabase queries:** `products`, `orders`, `profiles`, `campaigns` — all CRUD operations

---

### `src/pages/ZodiacGuide.tsx` — Zodiac Collections (`/zodiac`)
Shows product recommendations filtered by zodiac sign. User selects their sign, page shows matching products (filtered by `zodiac_sign` field on products).

---

### `src/pages/Wishlist.tsx` — Saved Items (`/wishlist`)
Shows all products saved via the heart icon. Reads from `WishlistContext` (in-memory, resets on page refresh). Shows ProductCard for each saved item.

---

### `src/pages/NotFound.tsx` — 404 Page (`*`)
Simple "page not found" screen with a link back to home. Logs the attempted URL to console.

---

## Components

### `src/components/Navbar.tsx`
The fixed top navigation bar. Contains:
- Logo (Be-Zone, "Glow on Demand")
- Desktop nav links (Home, Shop, Categories dropdown, Collections)
- Admin link (only if `isAdmin`)
- SearchBar (expands on click, 280px wide, with live suggestions)
- Cart icon with item count badge
- Wishlist icon
- User/profile icon
- Mobile hamburger menu
- Categories mega menu (`CategoryMegaMenu`)
- **Mobile bottom navigation bar** — Home, Shop, Cart, Wishlist, Login icons fixed at bottom

**Context:** `CartContext`, `AuthContext`

---

### `src/components/CartDrawer.tsx`
A slide-out panel (from the right side) showing cart contents. Contains:
- Item list with product image, name, price, quantity controls
- Remove item button
- Total price calculation
- "Go to Checkout" button
- Empty cart state

**Context:** `CartContext`

---

### `src/components/ProductCard.tsx`
A card showing a single product in grids/carousels. Contains:
- Product image
- Category label
- Product name (Playfair Display font)
- Star rating
- Price + original price + discount badge
- "Add to Cart" button
- "Buy Now" button (goes to checkout)
- "Buy on WhatsApp" button
- Heart/Wishlist toggle

**Context:** `CartContext`, `WishlistContext`
**Used by:** Index, Products, ProductDetail (related), Wishlist, Admin

---

### `src/components/SearchBar.tsx`
Reusable search component with live Supabase suggestions. Works in two modes:
- **Uncontrolled** (Navbar): manages its own query state
- **Controlled** (Products page): parent provides `value` + `onChange`

Features: debounced Supabase query, animated dropdown, product thumbnail + name + price, "No products found" state, X clear button, Escape key close, `onMouseDown + preventDefault` to prevent blur-before-click.

---

### `src/components/CategoryMegaMenu.tsx`
Large hover-triggered dropdown on desktop showing all product categories organized into sections (Women, Men, Kids, Home & Education). Links go to `/products?category=X`.

---

### `src/components/Footer.tsx`
Site-wide footer with: quick links, category links, policy links (Privacy, Returns, Shipping), contact info, social media links, copyright.

---

### `src/components/RecentlyViewed.tsx`
Shows products the user has recently browsed. Data stored in `localStorage` under key `recentlyViewed`. The `addToRecentlyViewed(product)` function is exported and called by `ProductDetail.tsx`. Shows up to 6 recent products in a grid.

---

### `src/components/ShareButton.tsx`
A popover button with three share options:
1. **WhatsApp** — Opens `wa.me` share link
2. **Instagram** — Copies URL to clipboard (Instagram doesn't support direct share)
3. **Copy Link** — Copies product URL to clipboard

---

### `src/components/PWAInstallPrompt.tsx`
Detects the browser's `beforeinstallprompt` event and shows a custom "Add to Home Screen" banner at the bottom of the page. Includes brand icon, app name, and Install/Dismiss buttons. Only shown when the browser supports PWA installation.

---

### `src/components/AIChatAssistant.tsx`
A floating chat button (bottom-right) that opens a chat panel. Provides rule-based answers to common questions about the store (returns, delivery, COD, etc.). Does not connect to any AI API — responses are hardcoded Q&A pairs with keyword matching.

---

### `src/components/ExitIntentPopup.tsx`
Triggered when the user's mouse leaves the viewport upward (as if about to close the tab). Shows a promotional popup with a discount offer. Uses `mouseleave` event on the `document`.

---

### `src/components/WhatsAppButton.tsx`
A floating WhatsApp icon fixed at the bottom-right of every page. Opens a WhatsApp chat with the store's business number for customer support.

---

## Context (Global State)

### `src/context/AuthContext.tsx`
Manages the logged-in user session. Exports:
- `user` — Supabase User object or null
- `session` — Supabase Session or null
- `loading` — boolean (true while auth state is loading)
- `isAdmin` — boolean (checks via `has_role` RPC function)
- `signIn(email, password)` — calls `supabase.auth.signInWithPassword`
- `signUp(email, password, fullName)` — calls `supabase.auth.signUp`
- `signOut()` — calls `supabase.auth.signOut`

Uses `supabase.auth.onAuthStateChange` listener to auto-update when session changes.

---

### `src/context/CartContext.tsx`
Manages the shopping cart entirely in memory (lost on page refresh). Exports:
- `items` — array of `{ product, quantity }`
- `addItem(product)` — adds 1 of a product, or increments if already in cart
- `removeItem(productId)` — removes a product
- `updateQuantity(productId, quantity)` — sets specific quantity
- `clearCart()` — empties the cart (called after successful checkout)
- `totalItems` — sum of all quantities
- `totalPrice` — sum of (price × quantity)
- `isCartOpen` / `setIsCartOpen` — controls the drawer visibility

---

### `src/context/WishlistContext.tsx`
Manages the wishlist entirely in memory. Exports:
- `items` — array of `Product` objects
- `addItem(product)` — adds to wishlist
- `removeItem(productId)` — removes from wishlist
- `isInWishlist(productId)` — returns boolean

---

## Hooks

### `src/hooks/useProducts.ts`
- `useProducts()` — fetches all `in_stock: true` products from Supabase
- `useProduct(id)` — fetches a single product by UUID

Both use `@tanstack/react-query` so data is cached and shared across all components. The cache key for all products is `["products"]`; for a single product it's `["product", id]`.

---

### `src/hooks/useSearch.ts`
Debounced live search hook. Given a query string (minimum 2 chars):
1. Waits 300ms after typing stops
2. Runs Supabase `ilike` query on `name`, `description`, `category`
3. Runs secondary `contains` query on `tags` array
4. Merges + deduplicates results (max 8)
5. Returns `{ results, isLoading }`

---

### `src/hooks/useOrders.ts`
Fetches orders. Used in the Admin panel to get all orders with their items.

---

### `src/hooks/useFCMToken.ts`
After login (non-admin users only):
1. Requests notification permission from the browser
2. Gets Firebase FCM token (linked to service worker `sw.js`)
3. Compares with stored token in `profiles` table
4. Updates Supabase `profiles.fcm_token` only if changed

---

### `src/hooks/useActiveCampaign.ts`
Fetches the single active campaign (`is_active = true`) from the `campaigns` table. Used by the home page to show a promotional banner.

---

### `src/hooks/useCampaigns.ts`
Fetches all campaigns ordered by `created_at`. Used by the Admin panel.

---

## Library Files (`src/lib/`)

### `src/lib/types.ts`
All shared TypeScript types:
- `Product` interface — all product fields
- `Category` type — the 9 valid category slugs
- `CartItem` interface — product + quantity
- `Review` interface
- `CATEGORIES` array — category id, name, icon, description
- `ZODIAC_SIGNS` constant

---

### `src/lib/firebase.ts`
Initializes Firebase using environment variables. Uses singleton pattern (`getApps().length` check) to avoid re-initialization during hot reload. Exports:
- `app` — Firebase app instance
- `getFirebaseMessaging()` — async function that returns the FCM Messaging instance with feature detection (checks for Notification API, Service Worker, Push API support)

---

### `src/lib/orderSound.ts`
Contains:
- `buildWhatsAppOrderUrl(productName, price)` — builds a `wa.me` URL for direct WhatsApp ordering
- Firebase messaging helper used by `useFCMToken`

---

### `src/lib/telegramNotify.ts`
Client-side function `sendOrderNotification(orderDetails)` that:
1. Builds a POST request body with order data
2. Calls `/api/notify-telegram` (the Vercel serverless function)
3. Returns silently on failure (non-critical)

---

### `src/lib/utils.ts`
Contains the `cn()` utility function that merges Tailwind CSS class names intelligently using `clsx` + `tailwind-merge`. Used in every shadcn/ui component.

---

## Supabase Integration

### `src/integrations/supabase/client.ts`
Creates and exports the single Supabase client used throughout the entire app:
```js
supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
```
Auth is configured to use `localStorage` for session persistence.

### `src/integrations/supabase/types.ts`
Auto-generated TypeScript definitions for every Supabase table (Row, Insert, Update shapes) and the `app_role` enum. Provides full type safety when making Supabase queries.

---

## API (Serverless Functions)

### `api/notify-telegram.js`
POST endpoint called when an order is placed. Receives order data, formats it as a Markdown message, and sends it to the admin's Telegram chat via the Bot API. Uses `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` environment variables.

### `api/send-push-notification.js`
POST endpoint called when an admin updates an order status. Flow:
1. Fetches customer's FCM token from `profiles` table (using service role key)
2. Mints a Google OAuth2 access token from Firebase service account credentials
3. Sends push via FCM HTTP v1 API
4. Logs result to `notification_logs` table
5. Clears stale tokens (UNREGISTERED/INVALID_ARGUMENT errors)

---

## PWA & Service Worker

### `public/sw.js`
The Service Worker file registered by the browser. Handles:
- **Install**: caches core shell assets (`/`, `/index.html`, `/manifest.json`, icons)
- **Activate**: cleans up old caches
- **Fetch**: three strategies:
  - *Cache First* for images, CSS, JS, fonts
  - *Network First* for navigation (falls back to `index.html` for SPA)
  - *Stale-While-Revalidate* for everything else
  - Supabase requests always go to network (never cached)
- **Push events**: displays push notifications from FCM
- **Notification click**: opens `/profile` page

### `public/manifest.json`
PWA metadata: app name "Be-Zone", gold theme color `#C4921A`, cream background `#FAF7F4`, portrait orientation, standalone display mode.
