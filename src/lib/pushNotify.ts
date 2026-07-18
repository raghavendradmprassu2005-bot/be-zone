/**
 * pushNotify.ts
 *
 * Thin frontend helper that calls the secure server-side endpoint
 * /api/send-push-notification to trigger a Firebase push notification
 * to a customer after their order status is updated.
 *
 * The Firebase Admin credentials (project ID, client email, private key)
 * live in Vercel env vars — this file never touches them.
 */

export interface PushNotificationPayload {
  /** Supabase order UUID */
  orderId: string;
  /** Supabase user UUID (foreign key on orders.user_id) */
  userId: string;
  /** New status string, e.g. "shipped" */
  newStatus: string;
  /** Customer's name for the notification body */
  customerName: string;
}

export interface PushNotificationResult {
  ok: boolean;
  reason?: string;
  messageId?: string;
}

/**
 * Sends a push notification to the customer via the serverless function.
 *
 * IMPORTANT: Always call this AFTER the Supabase order update succeeds.
 * Wrap in .catch() so notification failure never blocks the admin workflow.
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<PushNotificationResult> {
  const response = await fetch('/api/send-push-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`[Push] Endpoint returned ${response.status}: ${text}`);
  }

  return response.json();
}
