# 16 — Editing Guide: Which Files to Change

This guide answers "what do I edit if I want to change X?" for every major feature.

---

## 🃏 Product Cards

**What:** The card shown in grids on the home page, product listing, wishlist, etc.

**File to edit:** `src/components/ProductCard.tsx`

**What you can change here:**
- Card layout and design
- Which buttons appear (Add to Cart, Buy Now, WhatsApp)
- How price and discount are shown
- Star rating display
- Card hover effects

**Also affects:** `tailwind.config.ts` (for color changes), `src/index.css` (for custom CSS)

---

## 🛒 Cart

**What:** The slide-out cart drawer, cart state, item management.

**Files to edit:**

| File | What to change |
|------|---------------|
| `src/context/CartContext.tsx` | Cart logic: add, remove, update quantity, total calculation |
| `src/components/CartDrawer.tsx` | Cart UI: layout, item display, totals display, checkout button |

**Note:** Cart data is in-memory only (no database). It resets on page refresh. To make the cart persistent, you would need to add localStorage or Supabase integration.

---

## 💳 Checkout

**What:** The checkout form, order placement logic, COD handling.

**File to edit:** `src/pages/Checkout.tsx`

**What you can change here:**
- Form fields (add/remove fields)
- Payment methods (currently COD only — add Razorpay, Stripe here)
- Order success screen design
- Confetti effect
- What data is saved to Supabase
- Pre-fill logic from profiles

**Also modify if adding payment gateway:**
- `src/integrations/supabase/types.ts` (if adding payment columns to orders)
- Database migration to add new columns

---

## 📦 Orders

**What:** How orders are created, stored, displayed in admin, and shown in profile.

**Files to edit:**

| File | What to change |
|------|---------------|
| `src/pages/Checkout.tsx` | Order creation logic |
| `src/pages/Admin.tsx` | Order list UI, status change logic |
| `src/pages/Profile.tsx` | Customer order history display |
| `api/notify-telegram.js` | Telegram message format for new orders |
| `api/send-push-notification.js` | Push notification content for status changes |

---

## 🔐 Login / Authentication

**What:** Sign in, sign up, session management, admin check.

**Files to edit:**

| File | What to change |
|------|---------------|
| `src/pages/Auth.tsx` | Login/signup form UI |
| `src/context/AuthContext.tsx` | Auth logic (signIn, signUp, signOut, isAdmin check) |

**To change who is an admin:** Run SQL in Supabase:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('user-uuid', 'admin');
```

---

## 🔍 Search

**What:** The live search bar in the navbar and on the products page.

**Files to edit:**

| File | What to change |
|------|---------------|
| `src/hooks/useSearch.ts` | Search logic: which columns are searched, debounce timing, result limit |
| `src/components/SearchBar.tsx` | Search UI: dropdown design, suggestion format, clear button |
| `src/components/Navbar.tsx` | How search opens/closes in the navbar |
| `src/pages/Products.tsx` | How search integrates with the product filter page |

---

## 🛍️ Product Detail Page

**What:** The individual product page with image, price, buttons, FAQ.

**File to edit:** `src/pages/ProductDetail.tsx`

**What you can change here:**
- Layout and design
- FAQ questions and answers (currently hardcoded in the `faqs` array at the top of the file)
- Trust signals (Shipping, Payment, Returns)
- Sticky buy bar
- Related products filter logic

---

## 🗂️ Navbar

**What:** The top navigation bar and mobile bottom bar.

**File to edit:** `src/components/Navbar.tsx`

**What you can change here:**
- Navigation links
- Logo text
- Search bar behavior
- Mobile bottom navigation icons and links
- Categories mega menu trigger

**For the categories dropdown:**
- `src/components/CategoryMegaMenu.tsx`

---

## 👑 Admin Panel

**What:** The entire /admin page.

**Files to edit:**

| File | What to change |
|------|---------------|
| `src/pages/Admin.tsx` | Main admin page: tabs, stats, order management, campaign creation |
| `src/components/admin/ProductEditor.tsx` | Add/Edit product dialog form |
| `src/components/admin/ProductTable.tsx` | Product list table columns and actions |
| `src/components/admin/ProductFilters.tsx` | Admin product search and filter bar |
| `src/components/admin/types.ts` | TypeScript types for admin form data |

---

## 🔔 Notifications

**What:** Telegram new order alerts + Firebase push notifications.

**Files to edit:**

| File | What to change |
|------|---------------|
| `api/notify-telegram.js` | Telegram message format, which data is included |
| `src/lib/telegramNotify.ts` | Which data is sent from the frontend to the Telegram API |
| `api/send-push-notification.js` | Push notification content per order status, FCM configuration |
| `src/hooks/useFCMToken.ts` | How and when FCM tokens are registered |
| `public/sw.js` | How push messages are displayed, notification click behavior |

---

## 🎨 Theme / Design

**What:** Colors, fonts, spacing, animations.

**Files to edit:**

| File | What to change |
|------|---------------|
| `tailwind.config.ts` | Color palette, font families, custom animations, breakpoints |
| `src/index.css` | CSS variables (HSL color values), base styles, custom utilities, font imports |
| `index.html` | Google Fonts links, theme color meta tag |

### To change the gold/brand color:
In `src/index.css`, find `--secondary: 38 60% 52%;` and change the HSL values. The same HSL is used throughout.

### To change product name font:
In `tailwind.config.ts`: `display: ["Your Font Name", "serif"]`
In `src/index.css`: Update the `@import` URL and `.font-display` utility

### To change body font:
In `tailwind.config.ts`: `body: ["Your Font Name", "sans-serif"]`
In `src/index.css`: Update the `@import` URL and `body` font-family

---

## 🏠 Home Page

**File to edit:** `src/pages/Index.tsx`

**What you can change:**
- Hero section text and buttons
- Category cards layout
- Which products appear in "Featured" and "Trending" sections
- Campaign banner design
- Trust signals row

---

## 📋 Product Categories

**File to edit:** `src/lib/types.ts`

The `CATEGORIES` array defines all 9 categories. To add a new category:
1. Add to the `Category` type union
2. Add to the `CATEGORIES` array
3. The category will automatically appear in filters, mega menu, etc.

---

## 📱 PWA / App Installation Prompt

**Files to edit:**

| File | What to change |
|------|---------------|
| `public/manifest.json` | App name, colors, icons, orientation |
| `public/sw.js` | Caching strategies, push notification display |
| `src/components/PWAInstallPrompt.tsx` | Install prompt UI and behavior |
| `public/icons/` | Replace icon files (keep same filenames and sizes) |

---

## 🤖 AI Chat Assistant

**File to edit:** `src/components/AIChatAssistant.tsx`

Currently uses **hardcoded Q&A pairs** with keyword matching — not a real AI API. To change:
- Edit the response rules in the component directly
- Or connect to OpenAI/Gemini API by adding fetch calls

---

## ♈ Zodiac Guide

**File to edit:** `src/pages/ZodiacGuide.tsx`

Products are linked to zodiac signs via the `zodiac_sign` column in the `products` table (set in Admin → Product Editor). The Zodiac Guide page filters products by the selected sign.

---

## 🦶 Footer

**File to edit:** `src/components/Footer.tsx`

Change links, contact information, social media URLs, copyright text.

---

## 💬 WhatsApp Integration

**Files to edit:**

| File | What to change |
|------|---------------|
| `src/lib/orderSound.ts` | `buildWhatsAppOrderUrl()` — the WhatsApp message format and phone number |
| `src/components/WhatsAppButton.tsx` | The floating button's phone number for customer support |

---

## 📊 Admin Charts / Analytics

The charts in the Admin panel are built with **Recharts**. To change:
- Edit `src/pages/Admin.tsx` — the chart data and `<BarChart>` / `<LineChart>` components
- Recharts documentation: recharts.org

---

## Routes / URL Structure

**File to edit:** `src/App.tsx`

The `<Routes>` block defines all URL paths. To add a new page:
1. Create the page component in `src/pages/NewPage.tsx`
2. Import it in `App.tsx`
3. Add `<Route path="/new-path" element={<NewPage />} />`
4. Update `vercel.json` rewrites if needed (usually not required)
