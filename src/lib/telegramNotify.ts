/**
 * telegramNotify.ts
 *
 * Calls the secure server-side endpoint (/api/notify-telegram) to send
 * an admin Telegram message after a successful order.
 *
 * The Telegram Bot Token and Chat ID live in Vercel env vars — this file
 * never touches them directly.
 */

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  /** Full formatted address string, e.g. "123 Main St, Mumbai - 400001" */
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  /** ISO date string from Supabase created_at */
  orderDate?: string;
}

/**
 * Sends an order notification to the admin via Telegram.
 *
 * This is intentionally fire-and-forget: if it throws, catch it at
 * the call site and log — the order is already saved in Supabase.
 */
export async function sendOrderNotification(
  payload: OrderNotificationPayload
): Promise<void> {
  const response = await fetch('/api/notify-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `[Telegram] Endpoint returned ${response.status}: ${text}`
    );
  }

  const data = await response.json().catch(() => ({ ok: false }));

  if (!data.ok) {
    // Log the Telegram-side error but do NOT rethrow — the order is safe.
    console.warn('[Telegram] Notification not delivered:', data.reason ?? data.telegramError);
  }
}
