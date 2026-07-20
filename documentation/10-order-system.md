# 10 — Order System

---

## Overview

The order system covers the full lifecycle from a customer adding items to cart through to delivery confirmation and push notification. Currently only **Cash on Delivery (COD)** is supported.

---

## Complete Order Lifecycle

```
1. CART BUILDING
   Customer browses → clicks "Add to Cart" on ProductCard
   CartContext.addItem(product) → items[] updated in memory

2. CART REVIEW
   CartDrawer opens (slide-out) → customer sees items, quantities, total
   Quantity adjustments → CartContext.updateQuantity()
   Remove item → CartContext.removeItem()

3. CHECKOUT (/checkout)
   Customer clicks "Go to Checkout" from CartDrawer
   OR clicks "Buy Now" on product (bypasses cart)

4. SHIPPING FORM
   Form pre-filled from Supabase profiles if user has saved address
   Fields: Name, Phone, Email, Address, City, Pincode
   Validation: all fields required

5. ORDER PLACED
   Customer clicks "Place Order"
   [A] INSERT into orders table
   [B] INSERT into order_items (one per product)
   [C] UPDATE profiles (save shipping info for next time)
   [D] POST /api/notify-telegram → Admin gets Telegram alert
   [E] Cart cleared → confetti + success screen

6. ORDER PENDING (Admin side)
   Admin sees new order in Telegram
   Admin opens /admin → Orders tab
   New order appears with status: "pending"

7. STATUS UPDATES (Admin)
   Admin changes status: pending → confirmed → shipped → delivered
   OR: pending/confirmed → cancelled

8. PUSH NOTIFICATION (Optional)
   After each status update, admin can click "Send Notification"
   POST /api/send-push-notification
   Customer's phone shows push notification with status update
   Customer taps → opens /profile → sees updated order

9. ORDER HISTORY (Customer)
   Customer visits /profile → Orders tab
   Shows all past orders with:
   - Short order ID (first 8 chars of UUID)
   - Date placed
   - Total amount
   - Item count
   - Status badge (color-coded)
```

---

## Status Values

| Status | Meaning | Color |
|--------|---------|-------|
| `pending` | Order received, not yet confirmed | Yellow |
| `confirmed` | Admin has confirmed the order | Blue |
| `shipped` | Package dispatched for delivery | Orange |
| `delivered` | Package delivered to customer | Green |
| `cancelled` | Order cancelled | Red |

---

## Order Data Saved in Supabase

### `orders` table row (one per order):
```json
{
  "id": "uuid-auto-generated",
  "user_id": "customer-auth-uuid",
  "status": "pending",
  "payment_method": "cod",
  "payment_status": "pending",
  "total": 1197,
  "shipping_name": "Raghu Kumar",
  "shipping_phone": "9876543210",
  "shipping_email": "raghu@example.com",
  "shipping_address": "123 MG Road",
  "shipping_city": "Bengaluru",
  "shipping_pincode": "560001",
  "created_at": "2026-07-18T10:30:00Z"
}
```

### `order_items` table rows (one per product):
```json
[
  {
    "id": "uuid",
    "order_id": "parent-order-uuid",
    "product_id": "product-uuid-or-null",
    "product_name": "Mulethi Face Cream",
    "price": 299,
    "quantity": 2
  },
  {
    "id": "uuid",
    "order_id": "parent-order-uuid",
    "product_id": "another-product-uuid",
    "product_name": "NYN Huda Lipstick",
    "price": 599,
    "quantity": 1
  }
]
```

> **Important:** `product_name` and `price` are copied (snapshotted) at order time. Even if the admin later changes the product's price or name, the historical order stays accurate.

---

## Buy Now vs Cart Checkout

### Regular Cart Flow
1. User adds multiple items to cart
2. Goes to `/checkout`
3. `checkoutItems` = all items from `CartContext.items`
4. After order: `clearCart()` clears everything

### Buy Now Flow
1. User clicks "Buy Now" on a specific product in `ProductDetail`
2. `handleBuyNow()` also calls `addItem(product)` but immediately navigates to `/checkout`
3. Checkout receives `buyNowItems` via React Router `location.state`
4. `checkoutItems` = the single product from `location.state.buyNowItems`
5. Cart is NOT cleared (the regular cart items remain)

---

## Telegram Notification Format

When an order is placed, the admin receives this message on Telegram:

```
🛍️ NEW ORDER — Be-Zone

🔖 Order ID:  `ABC12345`
📅 Date & Time:  18 Jul 2026, 4:00 PM IST

👤 Customer Details
  • Name:  Raghu Kumar
  • 📞 Phone:  9876543210
  • 📧 Email:  raghu@example.com

📦 Delivery Address
  123 MG Road, Bengaluru, 560001

🛒 Ordered Items
  • Mulethi Face Cream × 2  —  ₹598
  • NYN Huda Lipstick × 1  —  ₹599

💰 Order Total:  ₹1,197
💳 Payment:  Cash on Delivery

⚡ Manage Orders
```

---

## Push Notification Messages

When admin sends a status update notification, the customer sees:

| Status | Phone Notification |
|--------|-------------------|
| confirmed | "✅ Order Confirmed — Great news! Your Be-Zone order has been confirmed." |
| shipped | "🚚 Order Shipped — Your Be-Zone order is on its way! Expect it soon." |
| delivered | "🎉 Order Delivered — Your Be-Zone order has been delivered. Enjoy!" |
| cancelled | "❌ Order Cancelled — Your Be-Zone order has been cancelled. Contact us for help." |

---

## Files Involved in the Order System

| File | Role |
|------|------|
| `src/pages/Checkout.tsx` | Main checkout UI, order creation logic |
| `src/context/CartContext.tsx` | Cart state (items, totals, clear) |
| `src/lib/telegramNotify.ts` | Client function that calls Telegram API route |
| `api/notify-telegram.js` | Server: sends Telegram message |
| `src/pages/Admin.tsx` | Admin views + updates orders |
| `api/send-push-notification.js` | Server: sends FCM push notification |
| `src/pages/Profile.tsx` | Customer views order history |
| `public/sw.js` | Displays push notifications on device |

---

## Error Handling in Orders

| Step | What happens on error |
|------|----------------------|
| Supabase INSERT orders fails | Error shown to customer, confetti NOT fired, no Telegram sent |
| Supabase INSERT order_items fails | Error shown to customer |
| Telegram notification fails | Silently ignored (order still saved) — designed as non-critical |
| Push notification fails | Logged to `notification_logs`, admin sees error, order status already updated |

---

## Checkout Form Pre-fill

The checkout form tries to pre-fill from the user's saved profile:
```js
// In Checkout.tsx, on component mount:
supabase.from('profiles')
  .select('full_name, phone, email, address, city, pincode')
  .eq('id', user.id)
  .single()
// → Pre-fills the form fields if data exists
```

After a successful order, the same data is saved back to `profiles` so next checkout is pre-filled automatically.
