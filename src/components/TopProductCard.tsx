import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { buildWhatsAppOrderUrl } from '@/lib/orderSound';
import beautyMakeupCombo from '@/assets/beauty-makeup-combo.png';
import mulethiPowder from '@/assets/mulethi-powder.jpeg';
import foggPerfume from '@/assets/fogg-perfume.jpeg';
import nynHudaLipstick from '@/assets/nyn-huda-lipstick.jpeg';
import glowLovelyCream from '@/assets/glow-lovely-cream.jpeg';

const productImages: Record<string, string> = {
  'beauty-makeup-combo': beautyMakeupCombo,
  'mulethi-powder': mulethiPowder,
  'fogg-perfume': foggPerfume,
  'nyn-huda-lipstick': nynHudaLipstick,
  'glow-lovely-cream': glowLovelyCream,
};

const categoryLabel: Record<string, string> = {
  'beauty-care': 'Beauty Care',
  'hair-care': 'Hair Care',
  'makeup': 'Makeup',
  'jewellery': 'Jewellery',
  'grooming': 'Grooming',
  'kids-zone': 'Kids Zone',
  'education': 'Education',
  'makeup-rental': 'Makeup Rental',
  'beauty-services': 'Beauty Services',
};

const categoryEmoji: Record<string, string> = {
  'beauty-care': '🧴',
  'hair-care': '💇',
  'makeup': '💄',
  'jewellery': '💍',
  'grooming': '🧔',
  'kids-zone': '🧸',
  'education': '📚',
  'makeup-rental': '👑',
  'beauty-services': '✨',
};

interface TopProductCardProps {
  product: Product;
}

const TopProductCard = ({ product }: TopProductCardProps) => {
  const { addItem } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const wishlisted = isInWishlist(product.id);
  const [ripple, setRipple] = useState(false);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    addItem(product);
    toast.success('Added to cart!');
  }, [addItem, product]);

  const handleBuyNow = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessingBuy) return;
    setIsProcessingBuy(true);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    addItem(product);
    toast.success('Added to Cart!');
    navigate('/checkout', {
      state: { buyNowItems: [{ product, quantity: 1 }], source: 'buyNow' },
    });
    setTimeout(() => setIsProcessingBuy(false), 500);
  }, [product, navigate, addItem, isProcessingBuy]);

  const handleWhatsApp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(buildWhatsAppOrderUrl(product.name, product.price), '_blank');
  }, [product]);

  const imgSrc = product.image?.startsWith('http')
    ? product.image
    : (productImages[product.image] ?? glowLovelyCream);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden border border-border/40 bg-card shadow-[0_4px_16px_-6px_rgba(0,0,0,0.10)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]"
      style={{ borderRadius: 18 }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block flex-shrink-0">
        <div className="aspect-[3/4] overflow-hidden bg-muted/20">
          {product.image ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = glowLovelyCream; }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              {categoryEmoji[product.category] || '✨'}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discountPercent > 0 && (
            <Badge className="bg-foreground text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 shadow-sm leading-tight">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.tags.includes('hot-deal') && (
            <Badge className="bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 shadow-sm leading-tight">
              🔥 Hot
            </Badge>
          )}
        </div>

        {/* Wishlist button */}


      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5">
        {/* Category */}
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {categoryEmoji[product.category]} {categoryLabel[product.category] || product.category}
        </p>

        {/* Product name */}
        <h3 className="mb-1.5 product-name-jakarta text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary line-clamp-2">
          {product.name}
        </h3>

        {/* Star rating */}
        <div className="mb-2 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${i < Math.round(product.rating) ? 'fill-secondary text-secondary' : 'text-border'}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mb-2.5 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-foreground">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>

      </div>
      </Link>

      <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
      }}
      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
      <Heart className={`h-3.5 w-3.5 transition-colors ${wishlisted ? 'fill-cosmic-pink text-cosmic-pink' : 'text-muted-foreground'}`} />
      </button>
    </motion.div>
  );
};

export default TopProductCard;
