import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col border-border/50 bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-lg text-foreground">Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={() => setIsCartOpen(false)} asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 rounded-xl border border-border/50 bg-card p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/20 text-2xl">
                     {item.product.category === 'beauty-care' && '🧴'}
  {item.product.category === 'hair-care' && '💇'}
  {item.product.category === 'makeup' && '💄'}
  {item.product.category === 'jewellery' && '💍'}
  {item.product.category === 'grooming' && '🧔'}
  {item.product.category === 'kids-zone' && '🧸'}
  {item.product.category === 'education' && '📚'}
  {item.product.category === 'makeup-rental' && '👑'}
  {item.product.category === 'beauty-services' && '✨'}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h4 className="text-sm font-medium text-foreground leading-tight">{item.product.name}</h4>
                    <p className="text-sm font-semibold text-foreground">₹{item.product.price}</p>
                    <div className="mt-auto flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold text-foreground w-5 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-sm font-bold text-foreground">₹{item.product.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-4">
              <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span><span className="text-primary font-medium">Free</span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">₹{totalPrice}</span>
              </div>
              <Button className="w-full gradient-cosmic text-primary-foreground py-5 text-base shadow-lg shadow-primary/20" onClick={() => setIsCartOpen(false)} asChild>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button variant="ghost" className="mt-2 w-full text-sm text-muted-foreground" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
