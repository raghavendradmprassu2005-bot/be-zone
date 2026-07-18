import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 font-display text-4xl font-bold text-foreground">Wishlist</h1>
        <p className="mb-8 text-muted-foreground">Items you've saved for later</p>
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/20" />
            <p className="mb-4 text-muted-foreground">Your wishlist is empty</p>
            <Button asChild variant="outline"><Link to="/products">Browse products</Link></Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
