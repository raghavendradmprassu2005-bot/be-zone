import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('exit-popup-dismissed');
    if (dismissed) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setShow(true);
        document.removeEventListener('mouseout', handler);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mouseout', handler);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', handler);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('exit-popup-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-premium-lg"
          >
            <button onClick={dismiss} className="absolute right-3 top-3 z-10 rounded-full bg-muted/50 p-1.5 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
            <div className="gradient-cosmic p-8 text-center">
              <Gift className="mx-auto mb-3 h-10 w-10 text-primary-foreground" />
              <h2 className="font-display text-2xl font-bold text-primary-foreground">Wait! Don't Leave Empty-Handed 🎁</h2>
            </div>
            <div className="p-6 text-center">
              <p className="mb-2 text-lg font-semibold text-foreground">Get 10% OFF your first order!</p>
              <p className="mb-6 text-sm text-muted-foreground">Use code <span className="font-bold text-primary">WELCOME10</span> at checkout</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="gradient-cosmic text-primary-foreground shadow-lg" onClick={dismiss}>
                  <Link to="/products">Claim My Discount</Link>
                </Button>
                <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
