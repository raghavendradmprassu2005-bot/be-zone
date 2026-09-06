import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatAssistant from "@/components/AIChatAssistant";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ZodiacGuide from "./pages/ZodiacGuide";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useFCMToken } from "@/hooks/useFCMToken";
import ScrollToTop from "@/components/ScrollToTop";
import VisualSearch from "./components/VisualSearch";
import Agent from "./pages/Agent";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// Registers the customer's FCM push token after they sign in.
// Renders nothing — purely a side-effect component.
const FCMTokenRegistrar = () => {
  useFCMToken();
  return null;
};

const AGENT_ENTRY_DURATION = 650;

const ApplicationShell = () => {
  const location = useLocation();
  const isAgentRoute = location.pathname === "/agent";
  const [showShell, setShowShell] = useState(!isAgentRoute);
  const [isEnteringAgent, setIsEnteringAgent] = useState(isAgentRoute);

  useEffect(() => {
    if (!isAgentRoute) {
      setShowShell(true);
      setIsEnteringAgent(false);
      return;
    }

    setShowShell(true);
    setIsEnteringAgent(true);
    const timer = window.setTimeout(() => {
      setShowShell(false);
      setIsEnteringAgent(false);
    }, AGENT_ENTRY_DURATION);

    return () => window.clearTimeout(timer);
  }, [isAgentRoute]);

  return (
    <>
      <ScrollToTop />
      {showShell && (
        <>
          <div
            className="pointer-events-none fixed left-0 right-0 z-40 h-7"
            style={{
              top: "0px",
              backdropFilter: "blur(1.5px)",
              WebkitBackdropFilter: "blur(1.5px)",
              maskImage:
                "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
            }}
          />
          <Navbar />
          <CartDrawer />
          <ExitIntentPopup />
          <WhatsAppButton />
          <AIChatAssistant />
          <PWAInstallPrompt />
        </>
      )}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/zodiac" element={<ZodiacGuide />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/visual-search" element={<VisualSearch />} />
      </Routes>

      {showShell && <Footer />}

      <AnimatePresence>
        {isEnteringAgent && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#080807]/[0.08]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-hidden="true"
          >
            <motion.div
              className="absolute flex h-14 w-14 items-center justify-center rounded-full border border-[#e3c07a]/80 bg-[#0d0d0c] font-display text-2xl text-[#f4f0e8] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_45px_rgba(196,146,26,0.2)]"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.7, 1, 18], opacity: [0, 1, 1] }}
              transition={{
                duration: AGENT_ENTRY_DURATION / 1000,
                times: [0, 0.28, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              B
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
             <Sonner />
             <BrowserRouter>
               <ApplicationShell />
             </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
