import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
}

interface Order {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  shipping_city: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ full_name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchProfile();
    fetchOrders();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    if (data) setProfile({
      full_name: data.full_name || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      city: data.city || '',
      pincode: data.pincode || '',
    });
  };

  const fetchOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  console.log("Current User ID:", user?.id);
  console.log("Orders Data:", data);
  console.log("Orders Error:", error);

  if (data) {
    setOrders(data);
  }
};

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user!.id);
    if (error) toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    else toast({ title: 'Profile updated ✨' });
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-gold/20 text-gold',
    confirmed: 'bg-accent/20 text-accent',
    shipped: 'bg-secondary/20 text-secondary',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-destructive/20 text-destructive',
  };

  const statusMessage: Record<
  string,
  { title: string; message: string; icon: string }
> = {
  pending: {
    icon: "🟡",
    title: "Order Pending",
    message: "We have received your order and will process it shortly.",
  },
  confirmed: {
    icon: "🔵",
    title: "Order Confirmed",
    message: "Your order has been confirmed and is being prepared.",
  },
  shipped: {
    icon: "🚚",
    title: "Order Shipped",
    message: "Your package is on the way.",
  },
  delivered: {
    icon: "✅",
    title: "Order Delivered",
    message: "Your order has been delivered successfully. Thank you for shopping with us!",
  },
  cancelled: {
    icon: "❌",
    title: "Order Cancelled",
    message: "This order has been cancelled.",
  },
};

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold text-foreground">My Account</h1>
            <Button variant="ghost" className="text-muted-foreground" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>

          <div className="mb-6 flex gap-2">
            <Button variant={tab === 'profile' ? 'default' : 'outline'} onClick={() => setTab('profile')} className={tab === 'profile' ? 'gradient-cosmic text-primary-foreground' : 'border-border/50 text-muted-foreground'}>
              <User className="mr-2 h-4 w-4" /> Profile
            </Button>
            <Button variant={tab === 'orders' ? 'default' : 'outline'} onClick={() => setTab('orders')} className={tab === 'orders' ? 'gradient-cosmic text-primary-foreground' : 'border-border/50 text-muted-foreground'}>
              <Package className="mr-2 h-4 w-4" /> Orders ({orders.length})
            </Button>
          </div>

          {tab === 'profile' && (
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-accent" /> Personal Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-muted-foreground">Full Name</Label><Input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className="bg-muted/30" /></div>
                <div><Label className="text-muted-foreground">Phone</Label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="bg-muted/30" /></div>
                <div className="sm:col-span-2"><Label className="text-muted-foreground">Email</Label><Input value={profile.email} disabled className="bg-muted/30 opacity-60" /></div>
                <div className="sm:col-span-2"><Label className="text-muted-foreground">Address</Label><Input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="bg-muted/30" /></div>
                <div><Label className="text-muted-foreground">City</Label><Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="bg-muted/30" /></div>
                <div><Label className="text-muted-foreground">Pincode</Label><Input value={profile.pincode} onChange={e => setProfile(p => ({ ...p, pincode: e.target.value }))} className="bg-muted/30" /></div>
              </div>
              <Button className="mt-6 gradient-cosmic text-primary-foreground" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes ✨'}
              </Button>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">No orders yet. Start shopping!</div>
              ) : orders.map(order => (
                <div key={order.id} className="rounded-lg border border-border/50 bg-card p-4">
  <div className="flex flex-wrap items-center justify-between gap-2">
    <div>
      <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>

    <div className="flex items-center gap-2">
      <Badge className={statusColor[order.status] || "bg-muted text-muted-foreground"}>
        {order.status}
      </Badge>

      <Badge variant="outline" className="text-xs text-muted-foreground">
        COD
      </Badge>
    </div>

    <span className="font-display text-lg font-bold text-foreground">
      ₹{order.total}
    </span>
  </div>

  <div className="mt-4 rounded-lg border border-border/30 bg-muted/20 p-4">
    <h3 className="font-semibold text-foreground">
      {statusMessage[order.status]?.icon}{" "}
      {statusMessage[order.status]?.title}
    </h3>

    <p className="mt-1 text-sm text-muted-foreground">
      {statusMessage[order.status]?.message}
    </p>
  </div>
</div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
