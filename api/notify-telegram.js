// api/notify-telegram.js
// Vercel serverless function — runs server-side only.
// TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are never exposed to the browser.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    // Return 200 so the frontend treats this as non-critical
    return res.status(200).json({ ok: false, reason: 'Telegram not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const {
    orderId,
    customerName,
    phone,
    email,
    address,
    items,        // Array<{ name: string; quantity: number; price: number }>
    total,
    paymentMethod,
    orderDate,
  } = body;

  // ── Build the formatted Telegram message ────────────────────────────────
  const shortId = String(orderId || '').slice(0, 8).toUpperCase();

  const itemLines = Array.isArray(items)
    ? items
        .map(
          (item) =>
            `  • ${item.name} × ${item.quantity}  —  ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
        )
        .join('\n')
    : '  (no items)';

  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const message = [
    '🛍️ *NEW ORDER — Be\\-Zone*',
    '',
    `🔖 *Order ID:*  \`${shortId}\``,
    `📅 *Date & Time:*  ${formattedDate} IST`,
    '',
    '👤 *Customer Details*',
    `  • *Name:*  ${customerName || 'N/A'}`,
    `  • 📞 *Phone:*  ${phone || 'N/A'}`,
    email ? `  • 📧 *Email:*  ${email}` : null,
    '',
    '📦 *Delivery Address*',
    `  ${address || 'N/A'}`,
    '',
    '🛒 *Ordered Items*',
    itemLines,
    '',
    `💰 *Order Total:*  ₹${Number(total || 0).toLocaleString('en-IN')}`,
    `💳 *Payment:*  ${paymentMethod || 'Cash on Delivery'}`,
    '',
    '⚡ [Manage Orders](https://be-zone.vercel.app/admin)',
  ]
    .filter((line) => line !== null)
    .join('\n');

  // ── Send to Telegram Bot API ─────────────────────────────────────────────
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('[Telegram] API error:', JSON.stringify(result));
      return res.status(200).json({ ok: false, telegramError: result.description });
    }

    console.log(`[Telegram] Notification sent for order ${shortId}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[Telegram] Fetch failed:', err?.message || err);
    return res.status(200).json({ ok: false, reason: 'Network error' });
  }
}
