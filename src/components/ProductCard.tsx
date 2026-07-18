import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingCart, Heart, Star, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import ShareButton from '@/components/ShareButton';
import { toast } from 'sonner';
import { buildWhatsAppOrderUrl } from "@/lib/orderSound";
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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const wishlisted = isInWishlist(product.id);
  const [ripple, setRipple] = useState(false);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);

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

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
      state: {
        buyNowItems: [{ product, quantity: 1 }],
        source: 'buyNow',
      },
    });

    setTimeout(() => setIsProcessingBuy(false), 500);
  }, [product, navigate, addItem, isProcessingBuy]);

  const handleWhatsAppOrder = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(buildWhatsAppOrderUrl(product.name, product.price), '_blank');
  }, [product]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    addItem(product);
  }, [addItem, product]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-shadow hover:shadow-premium card-hover"
    >
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {product.tags.includes('hot-deal') && (
          <Badge className="bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5">
            🔥 Hot Deal
          </Badge>
        )}
        {discountPercent > 0 && (
          <Badge className="bg-foreground text-primary-foreground text-xs font-semibold px-2 py-0.5">
            {discountPercent}% OFF
          </Badge>
        )}
        {product.tags.includes('limited') && (
          <Badge className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-0.5 animate-pulse">
            ⏰ Limited
          </Badge>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); wishlisted ? removeFromWishlist(product.id) : addToWishlist(product); }}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110"
      >
        <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-cosmic-pink text-cosmic-pink' : 'text-muted-foreground'}`} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block">
        {product.image ? (
  <div className="aspect-square overflow-hidden bg-muted/20">
    <img
      src={product.image.startsWith("http")
        ? product.image
        : productImages[product.image]}
      alt={product.name}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      loading="lazy"
      onError={(e) => {
        console.log("Image failed:", product.image);
        e.currentTarget.src = glowLovelyCream;
      }}
    />
  </div>
) : (
          <div className="flex aspect-square items-center justify-center bg-muted/20 text-6xl">
            {categoryEmoji[product.category] || '✨'}
          </div>
        )}
        {/* Quick actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
  size="sm"
  variant="secondary"
  className="h-9 bg-background/95 text-foreground shadow-lg backdrop-blur-sm hover:bg-background"
  onClick={() => navigate(`/product/${product.id}`)}
>
  <Eye className="mr-1.5 h-3.5 w-3.5" />
  Quick View
</Button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
  {{
    "beauty-care": "Beauty Care",
    "hair-care": "Hair Care",
    "makeup": "Makeup",
    "jewellery": "Jewellery",
    "grooming": "Grooming",
    "kids-zone": "Kids Zone",
    "education": "Education",
    "makeup-rental": "Makeup Rental",
    "beauty-services": "Beauty Services",
  }[product.category] || product.category}
</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 font-display text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-secondary line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? 'fill-secondary text-secondary' : 'text-border'}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:flex-1 h-9 text-xs border-border/40 hover:bg-muted/50"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
            </Button>
            <button
              onClick={handleBuyNow}
              disabled={isProcessingBuy}
              className={`relative w-full sm:flex-1 h-9 overflow-hidden rounded-md px-3 text-xs font-semibold text-foreground transition-all duration-300 gradient-nebula hover:shadow-lg hover:shadow-secondary/30 hover:scale-[1.02] active:scale-95 ${ripple ? 'animate-pulse' : ''} ${isProcessingBuy ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Buy Now
              </span>
              {ripple && (
                <span className="absolute inset-0 animate-ping rounded-md bg-secondary/20" />
              )}
            </button>
          </div>
          <button
            onClick={handleWhatsAppOrder}
            aria-label={`Buy ${product.name} on WhatsApp`}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1ebe57] hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.711.306 1.265.489 1.696.626.713.226 1.361.194 1.874.118.572-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/>
            </svg>
            Buy on WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;