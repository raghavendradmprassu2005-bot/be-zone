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
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5">
        {/* Category */}
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {categoryEmoji[product.category]} {categoryLabel[product.category] || product.category}
        </p>

        {/* Product name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-1.5 font-display text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary line-clamp-2">
            {product.name}
          </h3>
        </Link>

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

        {/* Action buttons — pinned to bottom */}
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-[11px] px-2 border-border/50 hover:bg-muted/50"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-0.5 h-3 w-3" /> Cart
            </Button>
            <button
              onClick={handleBuyNow}
              disabled={isProcessingBuy}
              className={`relative flex-1 h-7 overflow-hidden rounded-md px-2 text-[11px] font-semibold text-foreground transition-all duration-300 gradient-nebula hover:shadow-md hover:shadow-secondary/30 hover:scale-[1.02] active:scale-95 ${ripple ? 'animate-pulse' : ''} ${isProcessingBuy ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-0.5">
                <Zap className="h-3 w-3" /> Buy
              </span>
              {ripple && <span className="absolute inset-0 animate-ping rounded-md bg-secondary/20" />}
            </button>
          </div>
          <button
            onClick={handleWhatsApp}
            aria-label={`Buy ${product.name} on WhatsApp`}
            className="flex h-7 w-full items-center justify-center gap-1 rounded-full bg-[#25D366] px-2 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1ebe57] hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.711.306 1.265.489 1.696.626.713.226 1.361.194 1.874.118.572-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TopProductCard;
