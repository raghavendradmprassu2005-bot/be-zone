// Soft premium success chime using WebAudio (no asset needed)
let ctx: AudioContext | null = null;

export const playSuccessChime = () => {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioCtx = ctx;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    // Two soft bell-like tones (E5 -> A5)
    const notes = [
      { freq: 659.25, start: 0, dur: 0.45 },
      { freq: 880.0, start: 0.12, dur: 0.55 },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  } catch (e) {
    // silently ignore audio errors
  }
};

export const buildWhatsAppOrderUrl = (productName: string, price: number) => {
  const msg = `Hi, I want to order:\nProduct: ${productName}\nPrice: ₹${price}\n\nMy Name:\nMy Address:`;
  return `https://wa.me/917619305964?text=${encodeURIComponent(msg)}`;
};

export const ORDER_SUCCESS_MESSAGE =
  'Your order has been placed successfully! Thank you for choosing Bhoomika Beauty Parlour 💄';
