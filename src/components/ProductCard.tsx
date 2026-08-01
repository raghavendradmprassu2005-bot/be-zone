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
        <h3 className="mb-2 product-name-jakarta text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-secondary line-clamp-2">
          {product.name}
        </h3>
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

      </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;