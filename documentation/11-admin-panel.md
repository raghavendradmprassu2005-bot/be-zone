# 11 — Admin Panel

---

## Overview

The Admin Panel is accessible at `/admin`. It is **protected** — any user without the `admin` role in the `user_roles` table is redirected to the home page immediately.

**File:** `src/pages/Admin.tsx`

---

## Access Control

```js
// In Admin.tsx
const { user, isAdmin } = useAuth();

useEffect(() => {
  if (!isAdmin) navigate('/');
}, [isAdmin]);
```

`isAdmin` comes from `AuthContext`, which queries the Supabase `has_role()` RPC function on every login.

To grant admin access, run in Supabase SQL Editor:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('user-uuid-here', 'admin');
```

---

## Dashboard (Stats Cards)

The dashboard header shows four summary cards:

| Card | Data Source | Calculation |
|------|-------------|-------------|
| 💰 Total Revenue | `orders` table | `SUM(total)` where status ≠ `cancelled` |
| 📦 Total Orders | `orders` table | `COUNT(*)` |
| 🛍️ Products | `products` table | `COUNT(*)` |
| 👥 Customers | `profiles` table | `COUNT(*)` |

Below the stats is a **Revenue Bar Chart** (using Recharts `BarChart`) showing revenue grouped by month.

---

## Tab 1: Products

**What it shows:** All products in the database (including out-of-stock).

**Sub-components used:**
- `ProductFilters` — search bar + category dropdown for filtering the admin product list
- `ProductTable` — table with columns: Image, Name, Category, Price, In Stock, Actions
- `ProductEditor` — modal dialog for adding or editing a product

**Actions available:**

| Action | How | Supabase Call |
|--------|-----|---------------|
| Add Product | "Add Product" button → ProductEditor dialog | `INSERT INTO products` |
| Edit Product | Pencil icon on row → ProductEditor pre-filled | `UPDATE products WHERE id = :id` |
| Delete Product | Trash icon or bulk delete | `DELETE FROM products WHERE id IN (...)` |
| Upload Image | Image picker in ProductEditor | `storage.upload()` then `getPublicUrl()` |
| Toggle In-Stock | Toggle switch on row | `UPDATE products SET in_stock = :value` |
| Bulk Select | Checkboxes in ProductTable | Enable bulk delete |

### ProductEditor Form Fields

| Field | Type | Notes |
|-------|------|-------|
| Name | Text input | Required |
| Description | Textarea | Required |
| Price | Number input | In ₹, required |
| Original Price | Number input | Optional — enables discount display |
| Category | Dropdown | From CATEGORIES list |
| Tags | Text input | Comma-separated, e.g. `hot-deal,trending` |
| Zodiac Sign | Dropdown | Optional — for Zodiac Guide |
| In Stock | Toggle | Default: true |
| Image | File upload | Uploads to Supabase Storage |

---

## Tab 2: Orders

**What it shows:** Every order from every customer, newest first.

**Columns displayed:** Order ID (short), Date, Customer Name, Phone, City, Total, Payment Method, Status, Actions.

**Actions available:**

| Action | How | Supabase Call |
|--------|-----|---------------|
| View items | Expand/click order | `SELECT * FROM order_items WHERE order_id = :id` |
| Change status | Status dropdown | `UPDATE orders SET status = :newStatus WHERE id = :id` |
| Send push notification | "Notify" button | POST `/api/send-push-notification` |

**Status dropdown options:**
- `pending` → `confirmed` → `shipped` → `delivered`
- Any status → `cancelled`

**Send Notification Flow:**
```
Admin selects new status → clicks "Send Notification"
                                    ↓
        POST /api/send-push-notification
        { orderId, userId, newStatus, customerName }
                                    ↓
        Server fetches FCM token from profiles
                                    ↓
        Firebase FCM → Customer's device → Push notification shown
```

---

## Tab 3: Customers

**What it shows:** A list of all registered users (from `profiles` table).

**Columns:** Full Name, Email, Phone, City, Pincode, Join Date.

**Actions:** View only — no edit/delete of customer profiles from admin panel.

**Supabase call:**
```js
supabase.from('profiles').select('*').order('created_at', { ascending: false })
```

---

## Tab 4: Analytics

**What it shows:** Visual charts for business metrics.

**Charts include:**
- Revenue over time (Recharts BarChart)
- Orders by status breakdown
- Top categories by order volume

All chart data is derived from the already-fetched `orders` and `products` data — no additional Supabase queries for analytics.

---

## Tab 5: Campaigns

**What it shows:** Marketing campaigns that appear as banners on the home page.

**Actions:**

| Action | Effect |
|--------|--------|
| Create campaign | Inserts new row in `campaigns` table |
| Set Active | Sets `is_active = true` (deactivates others) |
| Set Inactive | Sets `is_active = false` |

**Campaign form fields:**
- Title (required)
- Description
- Banner image URL
- Discount text (e.g., "20% OFF")
- Coupon code (e.g., `SAVE20`)
- Start date / End date
- Active toggle

**How it appears on home page:**
`useActiveCampaign` hook queries for `is_active = true` campaign → home page renders it as a promotional banner at the top.

---

## Admin-Only Components

### `src/components/admin/ProductEditor.tsx`
A `Dialog` (modal) component with the full product form. Handles both create and edit modes. Manages image preview, upload progress, and form validation. On mobile, the dialog is scrollable with `max-h-[90dvh]`.

### `src/components/admin/ProductTable.tsx`
A `Table` component that lists all products. Has:
- Sortable columns
- Row-level checkboxes for bulk selection
- Image thumbnail
- In-stock badge
- Edit and delete action buttons

### `src/components/admin/ProductFilters.tsx`
A filter bar above the product table with:
- Search input (filters by name client-side)
- Category dropdown
- "Clear" button

### `src/components/admin/types.ts`
TypeScript interfaces:
```typescript
interface AdminProductForm {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string;        // comma-separated string in the form
  zodiacSign?: string;
  inStock: boolean;
  image?: string;
}

interface AdminProductRow {
  // extends Product with admin-specific fields
}
```

---

## Admin Panel Security Layers

| Layer | Where | What it prevents |
|-------|-------|-----------------|
| Route guard | `Admin.tsx` useEffect | Non-admins redirected to `/` |
| RLS on products | Supabase | Non-admins can't INSERT/UPDATE/DELETE products even with direct API access |
| RLS on orders | Supabase | Non-admins can only see their own orders |
| Service role key | Vercel env (server-only) | Clients can never bypass RLS with the service key |
| `has_role()` RPC | Supabase function | Admin check can't be spoofed from client |
