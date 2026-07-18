import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star, ArrowLeft, Loader2, Shield, Truck, RotateCcw, ChevronDown, Plus, Minus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import ShareButton from '@/components/ShareButton';
import { addToRecentlyViewed } from '@/components/RecentlyViewed';
import { toast } from 'sonner';
import { buildWhatsAppOrderUrl } from "@/lib/orderSound";


const faqs = [
  { q: 'What is the return policy?', a: 'We offer a 7-day hassle-free return policy on all products. Items must be unused and in original packaging.' },
  { q: 'How long does delivery take?', a: 'Delivery typically takes 2-5 business days depending on your location. We ship across all of India.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes! We offer Cash on Delivery (COD) on all orders. Pay when your order arrives at your doorstep.' },
  { q: 'Are the products genuine?', a: 'Absolutely. All products are 100% authentic and sourced directly from verified suppliers.' },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  const { addItem } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [showStickyBuyBar, setShowStickyBuyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (product) addToRecentlyViewed(product);
  }, [product]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBuyBar(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center pt-20">
      <Loader2 className="h-8 w-8 animate-spin text-secondary" />
    </div>
  );

  if (!product) return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-20">
      <p className="mb-4 text-lg font-medium text-foreground">Product not found</p>
      <Button asChild variant="outline"><Link to="/products">Back to Shop</Link></Button>
    </div>
  );

  const wishlisted = isInWishlist(product.id);
  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const categoryEmoji: Record<string, string> = {
  "beauty-care": "🧴",
  "hair-care": "💇",
  "makeup": "💄",
  "jewellery": "💍",
  "grooming": "🧔",
  "kids-zone": "🧸",
  "education": "📚",
  "makeup-rental": "👑",
  "beauty-services": "✨",
};
  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
  };

  const handleBuyNow = () => {
    if (isProcessingBuy) return;
    setIsProcessingBuy(true);

    for (let i = 0; i < qty; i++) addItem(product);
    toast.success('Added to Cart!');

    const buyNowItems = [{ product, quantity: qty }];
    navigate('/checkout', {
      state: {
        buyNowItems,
        source: 'buyNow',
      },
    });

    setTimeout(() => setIsProcessingBuy(false), 500);
  };

  return (
    <div className="min-h-screen pb-16 pt-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        <Link to="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-2 lg:gap-12">
         {/* Image */}
<div className="aspect-square overflow-hidden rounded-2xl border border-border/40 bg-muted/10">
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          "https://via.placeholder.com/600x600?text=No+Image";
      }}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-9xl">
      {categoryEmoji[product.category] || "✨"}
    </div>
  )}
</div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {product.category.replace('-', ' ')}
            </p>
            <h1 className="mb-3 font-display text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl">{product.name}</h1>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-secondary text-secondary' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} · {product.reviewCount} reviews</span>
            </div>

            <div className="mb-6 flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl font-bold text-foreground sm:text-3xl">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-muted-foreground line-through sm:text-lg">₹{product.originalPrice}</span>
                  <Badge className="bg-secondary/10 text-secondary text-xs font-semibold">{discountPercent}% OFF</Badge>
                </>
              )}
            </div>

            {product.tags?.includes('hot-deal') && (
              <div className="mb-6 rounded-lg bg-destructive/5 border border-destructive/10 px-4 py-2.5">
                <p className="text-sm font-medium text-destructive">🔥 Hot Deal — Limited stock available!</p>
              </div>
            )}

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <ul className="mb-6 space-y-2">
              {['Premium quality materials', 'Authentic & verified product', 'Perfect for gifting'].map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary text-xs">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <div ref={ctaRef}>
              {/* Quantity + CTA */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-border/50">
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(Math.max(1, qty - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(qty + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="icon" className={`h-10 w-10 border-border/50 ${wishlisted ? 'text-cosmic-pink' : 'text-muted-foreground'}`} onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}>
                  <Heart className={`h-5 w-5 ${wishlisted ? 'fill-cosmic-pink' : ''}`} />
                </Button>
                <ShareButton title={product.name} url={window.location.href} />
                <Button className="min-w-[140px] flex-1 gradient-cosmic py-3 sm:py-6 text-primary-foreground shadow-lg text-base" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              </div>
              <Button
                className="mb-2 w-full gradient-nebula py-5 text-foreground text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                onClick={handleBuyNow}
                disabled={isProcessingBuy}
              >
                <Zap className="mr-2 h-5 w-5" /> Buy Now ⚡ — ₹{product.price * qty}
              </Button>
            </div>
            <button
              onClick={() => {
                window.open(buildWhatsAppOrderUrl(product.name, product.price * qty), '_blank');
              }}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1ebe57] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/>
              </svg>
              Buy on WhatsApp
            </button>

            {/* Trust Signals */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: 'Secure Payment' },
                { icon: RotateCcw, label: '7-day Returns' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-border/40 p-3 text-center">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags?.map(tag => <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">{tag}</Badge>)}
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-card">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-border/40 px-5 py-4">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">You Might Also Like</h2>
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Buy Now ⚡ */}
      <AnimatePresence>
        {showStickyBuyBar && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_-18px_30px_-20px_rgba(15,23,42,0.18)]">
              <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold text-foreground">₹{product.price * qty}</p>
                  {product.originalPrice && (
                    <p className="text-xs text-muted-foreground line-through">₹{product.originalPrice * qty}</p>
                  )}
                </div>
                <Button
                  className="min-w-[140px] rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D56D] to-[#D4AF37] px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-[#d4af37]/20"
                  onClick={handleBuyNow}
                  disabled={isProcessingBuy}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
