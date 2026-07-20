# 06 — Database Analysis (Supabase / PostgreSQL)

---

## Overview

Be-Zone uses **Supabase** (hosted PostgreSQL) as its database. The database has **7 tables** and **1 enum type**. All tables have **Row Level Security (RLS)** enabled, meaning the database itself enforces who can read or write each row.

---

## Tables at a Glance

| Table | Purpose |
|-------|---------|
| `products` | All store products |
| `profiles` | Customer account information |
| `orders` | Customer orders |
| `order_items` | Individual line items within orders |
| `reviews` | Product reviews |
| `user_roles` | Assigns admin/moderator/user roles |
| `campaigns` | Marketing campaigns / promotions |
| `notification_logs` | Logs of push notification attempts |

---

## Table 1: `products`

**Purpose:** Stores every product sold in the Be-Zone store.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Unique identifier, auto-generated |
| `name` | text | ✓ | Product name (e.g., "Mulethi Face Cream") |
| `description` | text | ✓ | Full product description |
| `price` | integer | ✓ | Selling price in Indian Rupees (₹) |
| `original_price` | integer | ✗ | Original/MRP price — used to calculate discount % |
| `category` | text | ✓ | Category slug (e.g., `"beauty-care"`, `"makeup"`) |
| `image` | text | ✓ | URL to product image (Supabase Storage or external) |
| `rating` | numeric(2,1) | ✓ | Average rating (0.0–5.0) |
| `review_count` | integer | ✓ | Number of reviews |
| `tags` | text[] | ✓ | Array of tags (e.g., `["hot-deal", "trending"]`) |
| `zodiac_sign` | text | ✗ | Zodiac sign if product is zodiac-specific |
| `in_stock` | boolean | ✓ | Whether product is available (default: true) |
| `created_at` | timestamptz | ✓ (auto) | When product was added |

### Row Level Security Policies
| Policy | Who | What |
|--------|-----|------|
| Products are publicly readable | Everyone | SELECT |
| Admins can insert products | Admins only | INSERT |
| Admins can update products | Admins only | UPDATE |
| Admins can delete products | Admins only | DELETE |

### Used By
- `useProducts` hook (fetch all in-stock products)
- `useProduct(id)` hook (fetch one product)
- `useSearch` hook (search products)
- `Admin.tsx` (CRUD operations)
- `ProductCard`, `ProductDetail`, `Products`, `Index` pages

### Relationships
- Referenced by `order_items.product_id`
- Referenced by `reviews.product_id`

---

## Table 2: `profiles`

**Purpose:** Stores user profile and delivery information. Linked 1:1 with Supabase Auth users.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ | Same UUID as `auth.users.id` — the user's auth ID |
| `full_name` | text | ✗ | Customer's full name |
| `phone` | text | ✗ | Phone number |
| `email` | text | ✗ | Email address |
| `address` | text | ✗ | Street address |
| `city` | text | ✗ | City |
| `pincode` | text | ✗ | 6-digit PIN code |
| `fcm_token` | text | ✗ | Firebase Cloud Messaging token for push notifications |
| `created_at` | timestamptz | ✓ (auto) | Account creation time |

> **`fcm_token`** is added by the `add_fcm_and_notification_logs.sql` migration. It stores the customer's browser/device push token so admins can send them notifications when order status changes.

### How Profile is Created
A PostgreSQL trigger `on_auth_user_created` automatically creates a profile row whenever a new user signs up:
```sql
INSERT INTO profiles (id, email, full_name)
VALUES (new_user.id, new_user.email, new_user.full_name_from_metadata);
```

### Row Level Security Policies
| Policy | Who | What |
|--------|-----|------|
| Users can read own profile | Authenticated (own row) | SELECT |
| Users can update own profile | Authenticated (own row) | UPDATE |
| Users can insert own profile | Authenticated (own row) | INSERT |

(Server-side functions use the service role key which bypasses RLS.)

### Used By
- `Profile.tsx` — view + edit
- `Checkout.tsx` — pre-fill form + save after order
- `useFCMToken.ts` — store FCM token
- `send-push-notification.js` — read FCM token (server-side)
- `Admin.tsx` — list customers

---

## Table 3: `orders`

**Purpose:** Stores one row per customer order.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Order ID (first 8 chars shown as short ID) |
| `user_id` | uuid | ✗ | References `auth.users.id` — null for guest orders |
| `status` | text | ✓ | Order status: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `payment_method` | text | ✓ | Payment method — currently always `"cod"` |
| `payment_status` | text | ✓ | Payment status — `"pending"` at creation |
| `total` | integer | ✓ | Total order value in ₹ |
| `shipping_name` | text | ✓ | Customer name for delivery |
| `shipping_phone` | text | ✓ | Phone for delivery |
| `shipping_email` | text | ✓ | Email for confirmation |
| `shipping_address` | text | ✓ | Street address |
| `shipping_city` | text | ✓ | City |
| `shipping_pincode` | text | ✓ | PIN code |
| `customer_name` | text | ✗ | Alias for shipping_name (legacy) |
| `phone_number` | text | ✗ | Alias for shipping_phone (legacy) |
| `address` | text | ✗ | Alias for shipping_address (legacy) |
| `created_at` | timestamptz | ✓ (auto) | When order was placed |

### Status Flow
```
pending → confirmed → shipped → delivered
                              ↘ cancelled
```

### Row Level Security Policies
| Policy | Who | What |
|--------|-----|------|
| Users can read own orders | Authenticated (own rows) | SELECT |
| Users can insert own orders | Authenticated | INSERT |
| Admins can read all orders | Admin role | SELECT |
| Admins can update orders | Admin role | UPDATE |

### Used By
- `Checkout.tsx` — INSERT new order
- `Profile.tsx` — SELECT user's orders
- `Admin.tsx` — SELECT all orders + UPDATE status

### Relationships
- `user_id` → `auth.users.id`
- Referenced by `order_items.order_id`
- Referenced by `notification_logs.order_id`

---

## Table 4: `order_items`

**Purpose:** One row per product per order. An order with 3 different products has 3 order_items rows.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Row ID |
| `order_id` | uuid | ✓ | References `orders.id` |
| `product_id` | uuid | ✗ | References `products.id` (null if product deleted) |
| `product_name` | text | ✓ | Product name copied at order time (snapshot) |
| `price` | integer | ✓ | Price at time of purchase (snapshot) |
| `quantity` | integer | ✓ | Quantity ordered (default: 1) |

> **Snapshot Design:** `product_name` and `price` are copied at order time so order history remains accurate even if the admin later changes the product.

### Row Level Security Policies
| Policy | Who | What |
|--------|-----|------|
| Users can read own order items | Authenticated (via join to orders) | SELECT |
| Users can insert order items | Authenticated (via join to orders) | INSERT |
| Admins can read all order items | Admin role | SELECT |

### Used By
- `Checkout.tsx` — INSERT items
- `Admin.tsx` — SELECT to show order details

---

## Table 5: `reviews`

**Purpose:** Stores product reviews written by customers.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Review ID |
| `product_id` | uuid | ✓ | References `products.id` |
| `user_id` | uuid | ✗ | References `auth.users.id` |
| `author` | text | ✓ | Reviewer name |
| `rating` | integer | ✓ | 1–5 stars (enforced by CHECK constraint) |
| `comment` | text | ✓ | Review text |
| `created_at` | timestamptz | ✓ (auto) | When review was written |

### Row Level Security Policies
| Policy | Who | What |
|--------|-----|------|
| Reviews are publicly readable | Everyone | SELECT |
| Authenticated users can insert | Authenticated | INSERT |

### Note
Reviews exist in the database schema but the UI for displaying/submitting reviews is not fully implemented in the current frontend.

---

## Table 6: `user_roles`

**Purpose:** Controls which users are admins/moderators. Separate from `auth.users` for flexibility.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Row ID |
| `user_id` | uuid | ✓ | References `auth.users.id` |
| `role` | app_role | ✓ | One of: `admin`, `moderator`, `user` |

> There is a UNIQUE constraint on `(user_id, role)` — same user cannot have the same role twice.

### The `has_role()` Function
```sql
SELECT has_role('user-uuid', 'admin') -- returns true/false
```
Used by:
- `AuthContext.tsx` to check if logged-in user is admin
- All RLS policies that check admin access

### Used By
- `AuthContext.tsx` — `checkAdmin(userId)` calls `supabase.rpc('has_role', ...)`
- All admin-only RLS policies

---

## Table 7: `campaigns`

**Purpose:** Marketing campaigns shown as banners on the home page.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Campaign ID |
| `title` | text | ✓ | Campaign headline |
| `description` | text | ✗ | Campaign description |
| `banner` | text | ✗ | Banner image URL |
| `discount_text` | text | ✗ | Discount label (e.g., "20% OFF") |
| `coupon_code` | text | ✗ | Promo code customers can enter |
| `start_date` | text | ✗ | Campaign start date |
| `end_date` | text | ✗ | Campaign end date |
| `is_active` | boolean | ✓ | Whether campaign is currently live |
| `created_at` | timestamptz | ✓ (auto) | When created |
| `updated_at` | timestamptz | ✓ | When last updated |

### Used By
- `useActiveCampaign` hook — home page banner
- `useCampaigns` hook — admin campaign management
- `Admin.tsx` — create/manage campaigns

---

## Table 8: `notification_logs`

**Purpose:** Audit log of every push notification attempt by the server.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | uuid | ✓ (auto) | Log entry ID |
| `order_id` | uuid | ✗ | Which order triggered this notification |
| `user_id` | uuid | ✗ | Which customer it was sent to |
| `status` | text | ✓ | `sent`, `failed`, `no_token` |
| `error_message` | text | ✗ | Error details if `status = 'failed'` |
| `created_at` | timestamptz | ✓ (auto) | When the attempt happened |

### Row Level Security Policies
| Policy | Who | What |
|--------|-----|------|
| Users can view own logs | Authenticated (own rows) | SELECT |
| Admins can view all logs | Admin or moderator role | SELECT |

Server-side (`send-push-notification.js`) uses the service role key which bypasses RLS for INSERT.

### Used By
- `api/send-push-notification.js` — INSERT log entry after each attempt

---

## Database Relationships Diagram

```
auth.users (Supabase managed)
    │
    ├── profiles (1:1) — id references auth.users.id
    │       └── fcm_token (push token)
    │
    ├── user_roles (many) — admin/moderator assignment
    │
    └── orders (many) — user's purchase history
            │
            ├── order_items (many) ──→ products (reference, nullable)
            │
            └── notification_logs (many) — push notification audit

products ──→ reviews (many)
```

---

## Row Level Security Summary

RLS means **the database checks every query** against policies. Even if someone has your Supabase URL and anon key, they cannot:
- Read another user's orders or profile
- Insert/update/delete products without admin role
- Read notification logs that aren't theirs

The only exception: the **service role key** used server-side bypasses RLS — this is why it must stay secret in Vercel environment variables, never in the frontend.
