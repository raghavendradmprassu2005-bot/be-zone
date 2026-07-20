# 09 — Product System

---

## Overview

Products are at the heart of Be-Zone. They are stored in the Supabase `products` table and managed entirely through the admin panel. Customers can browse, search, filter, and view product details without any account.

---

## How Products Are Created

**Who can create:** Only users with the `admin` role in `user_roles`.

**Where:** Admin Panel → Products tab → "Add Product" button → `ProductEditor` dialog opens.

**Process:**
1. Admin fills in the `ProductEditor` form:
   - Product Name
   - Description
   - Price (₹)
   - Original Price (₹) — for discount calculation
   - Category (dropdown from CATEGORIES list)
   - Tags (comma-separated, e.g., `hot-deal,trending`)
   - Zodiac Sign (optional)
   - In Stock toggle
   - Image upload

2. If an image is selected:
   ```
   supabase.storage.from('product-images').upload(
     `products/${Date.now()}_${filename}`,
     file
   )
   ```
   Then `getPublicUrl()` returns the public URL saved as `image`.

3. On save:
   ```js
   supabase.from('products').insert({
     name, description, price, original_price,
     category, tags, zodiac_sign, in_stock, image
   })
   ```

4. React Query cache is invalidated → all product lists refresh automatically.

**Files involved:**
- `src/pages/Admin.tsx` — hosts the dialog, handles save
- `src/components/admin/ProductEditor.tsx` — the form UI
- `src/components/admin/types.ts` — form field types

---

## How Products Are Edited

**Same dialog as creation** — `ProductEditor` — but pre-populated with existing data.

**Process:**
1. Admin clicks edit on a row in `ProductTable`
2. `ProductEditor` opens with current product data
3. Admin makes changes
4. On save:
   ```js
   supabase.from('products').update({ ...changes }).eq('id', productId)
   ```
5. React Query cache invalidated → UI refreshes

---

## How Products Are Deleted

1. Admin checks one or more products in `ProductTable`
2. Clicks "Delete Selected"
3. Confirmation dialog appears
4. On confirm:
   ```js
   supabase.from('products').delete().in('id', selectedIds)
   ```
5. Cache invalidated → products disappear from all pages

---

## How Products Are Displayed

### On the Home Page (`/`)
- **Featured carousel** — shows products tagged `featured`
- **Trending carousel** — shows products with highest `review_count`
- Both use `useProducts()` hook and filter/slice in the component

### On the Products Page (`/products`)
- Grid layout (2 columns mobile, 3 desktop, 4 wide desktop)
- Each product rendered as `ProductCard`

### On the Product Detail Page (`/product/:id`)
- Full-page layout with image, all details, CTA buttons
- Related products grid (same category, different id)

### `ProductCard` Component
Each card displays:
- Product image (with fallback emoji)
- Category label
- Product name (Playfair Display font)
- Star rating (filled/empty stars)
- Current price
- Original price + discount % badge (if `original_price` exists)
- "Add to Cart" button
- "Buy Now" button → navigates to checkout with this item
- "Buy on WhatsApp" → opens WhatsApp directly
- Heart icon → add/remove from wishlist

---

## How Products Are Filtered

Filtering happens **client-side** on the cached product list (no additional Supabase queries).

**In `Products.tsx`:**

```js
const filtered = useMemo(() => {
  let result = [...products]; // all in-stock products (from cache)

  // 1. Category filter
  if (selectedCategory !== 'all')
    result = result.filter(p => p.category === selectedCategory);

  // 2. Text search (name, description, category, tags)
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }

  // 3. Price range
  result = result.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  // 4. Sort
  switch (sortBy) {
    case 'price-low':  result.sort((a, b) => a.price - b.price); break;
    case 'price-high': result.sort((a, b) => b.price - a.price); break;
    case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
    default:           result.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return result;
}, [products, selectedCategory, search, priceRange, sortBy]);
```

---

## How Products Are Searched

Search uses **two mechanisms**:

### 1. Navbar SearchBar (Live Suggestions)
- Uses `useSearch(query)` hook
- Debounced 300ms
- Hits Supabase directly with `ilike` queries on name, description, category
- Secondary query for tag `contains`
- Returns up to 8 results as a dropdown
- Clicking a result navigates to `/product/:id`

### 2. Products Page SearchBar
- Same `SearchBar` component in controlled mode
- Query changes update `search` state
- Client-side filtering runs on the cached product list
- Live search dropdown also appears (same `useSearch` hook)
- Both the dropdown AND the grid filter update simultaneously

---

## How Products Are Stored

**Database:** Supabase PostgreSQL `products` table
**Images:** Supabase Storage bucket `product-images`

**Image URL pattern:**
```
https://[project].supabase.co/storage/v1/object/public/product-images/products/1234567890_filename.jpg
```

**Data flow on load:**
```
App starts → React Query calls useProducts()
→ Supabase returns all in_stock = true products
→ Data cached in QueryClient (key: ["products"])
→ All product lists read from cache (no repeated network calls)
→ Cache is shared: Index, Products, Wishlist all see same data
```

---

## The 9 Product Categories

| ID | Name | Icon | Description |
|----|------|------|-------------|
| `beauty-care` | Beauty Care | 🧴 | Skin care & beauty essentials |
| `hair-care` | Hair Care | 💇 | Hair oils, shampoos & treatments |
| `makeup` | Makeup | 💄 | Lipsticks, foundations & cosmetics |
| `jewellery` | Jewellery | 💍 | Fashion jewellery & accessories |
| `grooming` | Grooming | 🧔 | Men's grooming products |
| `kids-zone` | Kids Zone | 🧸 | Kids essentials & accessories |
| `education` | Education | 📚 | Educational books & learning products |
| `makeup-rental` | Makeup Rental | 👑 | Professional makeup rental services |
| `beauty-services` | Beauty Services | ✨ | Salon & beauty services |

---

## Product Tags System

Tags are stored as a `text[]` (array) column. Common tags used:

| Tag | Effect |
|-----|--------|
| `hot-deal` | Shows "🔥 Hot Deal" banner on product detail page |
| `trending` | May be filtered into trending carousel on home page |
| `featured` | May be shown in featured section on home page |
| `new-arrival` | Informational |
| Any zodiac name | Used by Zodiac Guide page to match products |

---

## Admin Product Management Components

| Component | File | Purpose |
|-----------|------|---------|
| ProductFilters | `src/components/admin/ProductFilters.tsx` | Search bar + category filter for admin product list |
| ProductTable | `src/components/admin/ProductTable.tsx` | Table of all products with checkboxes for bulk actions |
| ProductEditor | `src/components/admin/ProductEditor.tsx` | Add/Edit product form dialog with image upload |
| types.ts | `src/components/admin/types.ts` | TypeScript interfaces for admin form data |
