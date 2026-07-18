import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Msg = { role: 'bot' | 'user'; text: string; quickReplies?: string[] };

const WHATSAPP_URL =
  'https://wa.me/917619305964?text=Hi,%20I%20want%20to%20book%20an%20appointment%20at%20Bhoomika%20Beauty%20Parlour.';
const MAP_URL = 'https://maps.app.goo.gl/KkDJDDGE1PMis9vm7';

const INITIAL: Msg = {
  role: 'bot',
  text: "Hi 💖 I'm Bhoomika's beauty assistant. How can I help you today?",
  quickReplies: ['View Services', 'Show Prices', 'Working Hours', 'Show Location', 'Book on WhatsApp'],
};

const smartReply = (input: string): Msg => {
  const q = input.toLowerCase().trim();

  if (/(service|offer|what do you|treatment)/.test(q))
    return {
      role: 'bot',
      text: '✨ Our services:\n• Tailoring\n• Eyebrow Shaping & Hair Style\n• Saree Kuch (Draping & Styling)\n• Bridal Makeup\n• Skincare & Haircare',
      quickReplies: ['Show Prices', 'Book on WhatsApp'],
    };

  if (/(price|cost|rate|charge|how much)/.test(q))
    return {
      role: 'bot',
      text: '💰 Indicative prices:\n• Eyebrow Shaping — ₹50\n• Hair Styling — ₹300+\n• Saree Draping — ₹500\n• Tailoring — ₹400+\n• Bridal Combo — ₹4,999',
      quickReplies: ['Book on WhatsApp', 'Show Location'],
    };

  if (/(location|where|address|map|reach|direction)/.test(q))
    return {
      role: 'bot',
      text: '📍 Bhoomika Beauty Parlour\nNear Govt Hospital, Basavapatna, Davanagere, Karnataka.\nTap below to open in Maps.',
      quickReplies: ['Open Maps', 'Book on WhatsApp'],
    };

  if (/(time|hour|open|close|when)/.test(q))
    return {
      role: 'bot',
      text: '🕘 Working hours:\nMon–Sat: 9:00 AM – 8:00 PM\nSunday: 10:00 AM – 6:00 PM',
      quickReplies: ['Book on WhatsApp', 'View Services'],
    };

  if (/bridal|wedding|marriage/.test(q))
    return {
      role: 'bot',
      text: '👰 Our Bridal Combo includes makeup, hairstyling, saree draping & skincare prep — perfect for your big day!',
      quickReplies: ['Book on WhatsApp', 'Show Prices'],
    };

  if (/hair/.test(q))
    return {
      role: 'bot',
      text: '💇‍♀️ We offer trendy haircuts, styling, hair spa & smoothening treatments by expert stylists.',
      quickReplies: ['Show Prices', 'Book on WhatsApp'],
    };

  if (/skin|face|glow|facial/.test(q))
    return {
      role: 'bot',
      text: '🌸 Try our skincare range — Mulethi Powder, Glow & Lovely cream, and our signature glow facials.',
      quickReplies: ['View Services', 'Book on WhatsApp'],
    };

  if (/discount|deal|sale/.test(q))
    return {
      role: 'bot',
      text: '🎉 Current offers:\n• Mulethi Powder — 75% OFF\n• Glow & Lovely — 14% OFF\n• Free shipping on orders above ₹499',
      quickReplies: ['Book on WhatsApp'],
    };

  if (/book|appointment|whatsapp/.test(q))
    return {
      role: 'bot',
      text: '📲 Tap below to chat with us on WhatsApp and book your slot instantly.',
      quickReplies: ['Book on WhatsApp'],
    };

  if (/(hi|hello|hey|namaste)/.test(q))
    return {
      role: 'bot',
      text: 'Hello 💖 How can I help you today?',
      quickReplies: ['View Services', 'Show Prices', 'Show Location'],
    };

  return {
    role: 'bot',
    text: "I'd love to help! You can ask about our services, prices, location or working hours.",
    quickReplies: ['View Services', 'Show Prices', 'Book on WhatsApp', 'Show Location'],
  };
};

const AIChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;

    if (value === 'Book on WhatsApp') {
      window.open(WHATSAPP_URL, '_blank');
      setMessages(m => [...m, { role: 'user', text: value }, {
        role: 'bot', text: 'Opening WhatsApp… 💬', quickReplies: ['View Services', 'Show Prices'],
      }]);
      setInput('');
      return;
    }
    if (value === 'Open Maps' || value === 'Show Location') {
      if (value === 'Open Maps') window.open(MAP_URL, '_blank');
    }

    setMessages(m => [...m, { role: 'user', text: value }]);
    setInput('');
    setTimeout(() => setMessages(m => [...m, smartReply(value)]), 350);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat assistant"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-nebula text-foreground shadow-premium-lg md:bottom-6 md:right-24"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 left-4 right-4 z-50 flex h-[480px] max-w-sm flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-premium-lg md:bottom-24 md:left-auto md:right-24"
          >
            {/* Header */}
            <div className="flex items-center gap-3 gradient-nebula px-4 py-3 text-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Beauty Assistant</p>
                <p className="text-[10px] opacity-80">AI-powered • Online now</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 hover:bg-foreground/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === 'user'
                        ? 'rounded-br-sm bg-secondary text-secondary-foreground'
                        : 'rounded-bl-sm bg-card text-foreground border border-border/40'
                    }`}
                  >
                    {m.text}
                    {m.quickReplies && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.quickReplies.map(qr => (
                          <button
                            key={qr}
                            onClick={() => handleSend(qr)}
                            className="rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-1 text-[11px] font-medium text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2 border-t border-border/40 bg-card p-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services, prices…"
                className="h-10 flex-1 text-sm"
              />
              <Button type="submit" size="icon" className="h-10 w-10 gradient-nebula text-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
