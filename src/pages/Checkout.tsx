import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { sendOrderNotification } from '@/lib/telegramNotify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Truck, Lock, RotateCcw, Package, ArrowRight, Gift, Percent } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { CartItem } from '@/lib/types';
import confetti from 'canvas-confetti';

const steps = ['Cart', 'Shipping', 'Payment'];

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: allProducts = [] } = useProducts();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const currentStep = 1;

  const locationState = location.state as { buyNowItems?: CartItem[]; source?: 'buyNow' | 'cart' } | null;
  const buyNowItems = locationState?.source === 'buyNow' && Array.isArray(locationState.buyNowItems) ? locationState.buyNowItems : undefined;
  const checkoutItems = buyNowItems && buyNowItems.length > 0 ? buyNowItems : items;
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isBuyNowOrder = Boolean(buyNowItems && buyNowItems.length > 0);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setForm({
        name: data.full_name || '', phone: data.phone || '',
        email: data.email || user.email || '', address: data.address || '',
        city: data.city || '', pincode: data.pincode || '',
      });
    });
  }, [user]);

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.email || !form.address || !form.city || !form.pincode) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user!.id,
        total: checkoutTotal,
        payment_method: 'cod',
        status: 'pending',

        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_email: form.email,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_pincode: form.pincode,
      })
      .select()
      .single();

    if (error || !order) {
      toast({ title: 'Order failed', description: error?.message, variant: 'destructive' });
      setPlacing(false); return;
    }

    console.log("Cart Items:", items);
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        checkoutItems.map((item) => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }))
      );

console.log("Order Items Error:", itemsError);

if (itemsError) {
  toast({
    title: "Order Items Failed",
    description: itemsError.message,
    variant: "destructive",
  });
}

    await supabase.from('profiles').update({
      full_name: form.name, phone: form.phone, address: form.address, city: form.city, pincode: form.pincode,
    }).eq('id', user!.id);

    if (!isBuyNowOrder) {
      clearCart();
    }
    setOrderId(order.id);
    setOrderPlaced(true);
    setPlacing(false);

    // Fire confetti
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#2563eb', '#7c3aed', '#f59e0b', '#ec4899'] });
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5 } }), 500);

    // ── Telegram admin notification (fire-and-forget) ─────────────────────
    // Order is already saved above. If Telegram fails, the order is unaffected.
    sendOrderNotification({
      orderId: order.id,
      customerName: form.name,
      phone: form.phone,
      email: form.email,
      address: `${form.address}, ${form.city} - ${form.pincode}`,
      items: checkoutItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: checkoutTotal,
      paymentMethod: 'Cash on Delivery',
      orderDate: order.created_at,
    }).catch((err) => {
      // Intentionally silent — never block or affect the order success screen
      console.warn('[Telegram] Notification failed (order is safe):', err?.message ?? err);
    });
  };

  const recommended = allProducts
    .filter(p => !items.some(item => item.product.id === p.id))
    .slice(0, 4);

  if (orderPlaced) {
    return (
      <div className="min-h-screen px-4 pb-20 pt-24 md:pb-0">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-nebula/10"
            >
              <CheckCircle className="h-12 w-12 text-primary" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl"
            >
              🎉 Thank you for your order!
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mx-auto max-w-lg space-y-2"
            >
              <p className="text-base text-foreground font-medium">Your style journey starts here 💖</p>
              <p className="text-sm text-muted-foreground">We're preparing your items with care and love.</p>
              <p className="text-sm text-muted-foreground">Stay tuned for updates — we can't wait to see you again! ✨</p>
              <p className="text-sm text-muted-foreground">Come back soon for exclusive deals just for you!</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4"
            >
              <p className="text-xs text-muted-foreground">Order #{orderId.slice(0, 8)} • Cash on Delivery</p>
            </motion.div>

            {/* Discount Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mx-auto mt-8 max-w-md overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-nebula/5"
            >
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full gradient-cosmic">
                  <Percent className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Get 10% OFF your next purchase! 🎁</p>
                  <p className="text-xs text-muted-foreground">Use code <span className="font-bold text-primary">NEXT10</span> at checkout</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-8 flex justify-center gap-3"
            >
              <Button asChild variant="outline"><Link to="/profile">View Orders</Link></Button>
              <Button asChild className="gradient-cosmic text-primary-foreground shadow-lg shadow-primary/20">
                <Link to="/products">Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Recommended Products */}
          {recommended.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <h2 className="mb-6 text-center font-display text-xl font-bold text-foreground">You might also love ✨</h2>
              <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
                {recommended.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (checkoutItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        <Package className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="mb-4 text-muted-foreground">No items selected for checkout</p>
        <Button asChild variant="outline"><Link to="/products">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-20 md:pb-0">
      <div className="container mx-auto max-w-4xl px-4 py-6 lg:py-10">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
              {i < steps.length - 1 && <div className={`h-px w-8 sm:w-16 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="mb-5 text-lg font-semibold text-foreground">Shipping Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs font-medium text-muted-foreground">Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" required /></div>
                <div><Label className="text-xs font-medium text-muted-foreground">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5" required /></div>
                <div className="sm:col-span-2"><Label className="text-xs font-medium text-muted-foreground">Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1.5" required /></div>
                <div className="sm:col-span-2"><Label className="text-xs font-medium text-muted-foreground">Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1.5" required /></div>
                <div><Label className="text-xs font-medium text-muted-foreground">City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="mt-1.5" required /></div>
                <div><Label className="text-xs font-medium text-muted-foreground">Pincode</Label><Input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="mt-1.5" required /></div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-3">
                {checkoutItems.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium text-foreground">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="font-medium text-primary">Free</span></div>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between"><span className="font-semibold text-foreground">Total</span><span className="text-xl font-bold text-foreground">₹{checkoutTotal}</span></div>
                </div>
              </div>
              <Button className="mt-6 w-full gradient-cosmic py-6 text-primary-foreground text-base shadow-lg shadow-primary/20" onClick={placeOrder} disabled={placing}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </Button>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Free Shipping</span>
                <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
