import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Box, Columns, Eye, FileText, Image, Layers, Plus, Pencil, Package, Search, Share2, ShoppingBag, Shield, Trash2, Users, Gift, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { ProductFilters } from '@/components/admin/ProductFilters';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { sendPushNotification } from '@/lib/pushNotify';

import type { Database } from '@/integrations/supabase/types';
import type { AdminProductForm } from '@/components/admin/types';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category: string;
  tags: string;
  zodiac_sign: string;
  in_stock: boolean;
}

const emptyForm: AdminProductForm = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  category: 'beauty-care',
  tags: '',
  zodiac_sign: '',
  in_stock: true,
  rating: '0',
  featured: false,
  top_product: false,
};

type ProductRow = Database['public']['Tables']['products']['Row'];
type OrderWithItems = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Database['public']['Tables']['order_items']['Row'][];
};

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders' | 'campaigns'>('dashboard');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ProductRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('delete');
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subtitle: '',
    banner: '',
    discount: '',
    startDate: '',
    endDate: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductForm>(emptyForm);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);

    const productPromise = supabase
      .from('products')
      .select('id,name,description,price,original_price,category,image,in_stock,rating,review_count,tags,zodiac_sign,created_at')
      .order('created_at', { ascending: false });

    const orderPromise = supabase
      .from('orders')
      .select(`id,user_id,status,total,created_at,shipping_name,shipping_phone,shipping_email,shipping_address,shipping_city,shipping_pincode,order_items(id,product_id,product_name,price,quantity)`)
      .order('created_at', { ascending: false });

    const customerPromise = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const [productResult, orderResult, customerResult] = await Promise.all([productPromise, orderPromise, customerPromise]);

    if (productResult.error) {
      console.error('Product dashboard fetch error', productResult.error);
      toast({ title: 'Unable to load products', variant: 'destructive' });
    }

    if (orderResult.error) {
      console.error('Order dashboard fetch error', orderResult.error);
      toast({ title: 'Unable to load orders', variant: 'destructive' });
    }

    if (customerResult.error) {
      console.error('Customer dashboard fetch error', customerResult.error);
      toast({ title: 'Unable to load customers', variant: 'destructive' });
    }

    setProducts(productResult.data ?? []);
    setOrders((orderResult.data ?? []) as OrderWithItems[]);
    setCustomerCount(customerResult.count ?? 0);
    setDashboardLoading(false);
  };

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }

    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin, loading]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, user_id, order_items(*)')
      .order('created_at', { ascending: false });

    if (data) setOrders(data as OrderWithItems[]);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles([]);
    setGalleryPreview(null);
    setPreviewProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      category: p.category,
      // strip managed flags from the free-text field so they don't duplicate
      tags: (p.tags || []).filter(t => t !== 'top-product').join(', '),
      zodiac_sign: p.zodiac_sign || '',
      in_stock: p.in_stock,
      rating: String(p.rating ?? 0),
      featured: (p.tags ?? []).includes('featured'),
      top_product: (p.tags ?? []).includes('top-product'),
    });
    setImageFiles([]);
    setGalleryPreview(p.image || null);
    setDialogOpen(true);
  };

  const saveProduct = async () => {
    let imageUrl = editingId
      ? products.find((p) => p.id === editingId)?.image || ''
      : '';

    const uploadFile = imageFiles[0];

    if (uploadFile) {
      const fileName = `${Date.now()}-${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, uploadFile);

      if (uploadError) {
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
        return;
      }

      imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }

    // Build tags: user-typed tags (minus managed flags) + managed flags from toggles
    const userTags = form.tags.split(',').map((t) => t.trim()).filter(t => t && t !== 'top-product');
    if (form.top_product) userTags.push('top-product');

    const payload = {
      name: form.name,
      description: form.description,
      price: parseInt(form.price, 10),
      original_price: form.original_price ? parseInt(form.original_price, 10) : null,
      category: form.category,
      image: imageUrl,
      tags: userTags,
      zodiac_sign: form.zodiac_sign || null,
      in_stock: form.in_stock,
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Product updated ✨' });
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Product added ✨' });
    }

    setDialogOpen(false);
    setImageFiles([]);
    setGalleryPreview(null);
    fetchDashboardData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Product deleted' });
    fetchDashboardData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    // 1. Update the order status in Supabase — this MUST succeed first
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      toast({ title: 'Failed to update order status', description: updateError.message, variant: 'destructive' });
      return;
    }

    // 2. Show immediate confirmation — order is already saved
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    toast({ title: `Order ${statusLabel}` });

    // 3. Refresh orders list
    fetchDashboardData();

    // 4. Fire-and-forget push notification to the customer
    //    If this fails, the order status update is unaffected
    const order = orders.find((o) => o.id === id);
    const userId = (order as any)?.user_id as string | undefined;

    if (userId) {
      sendPushNotification({
        orderId:      id,
        userId,
        newStatus:    status,
        customerName: order?.shipping_name ?? '',
      })
        .then((result) => {
          if (!result.ok) {
            // Silently log — don't alarm admin unless it's a config issue
            console.warn(`[Push] Notification not delivered: ${result.reason}`);
            if (result.reason === 'Push not configured') {
              toast({
                title:       'Push notification not configured',
                description: 'Set Firebase env vars in Vercel to enable customer notifications.',
                variant:     'destructive',
              });
            }
          } else {
            console.info(`[Push] ✅ Notification sent for order ${id.slice(0, 8)}`);
          }
        })
        .catch((err: Error) => {
          // Network or endpoint error — log only; order status is already saved
          console.warn('[Push] Notification failed (order updated successfully):', err.message);
        });
    }
  };

  const saveCampaign = async () => {
    const { error } = await supabase.from('campaigns').insert({
      title: campaignForm.title,
      description: campaignForm.subtitle,
      banner: campaignForm.banner,
      discount_text: campaignForm.discount,
      start_date: campaignForm.startDate,
      end_date: campaignForm.endDate,
      is_active: true,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Campaign Created 🎉' });
    setCampaignDialogOpen(false);
    setCampaignForm({ title: '', subtitle: '', banner: '', discount: '', startDate: '', endDate: '' });
  };

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + (order.total ?? 0), 0), [orders]);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled').length;
  const totalProducts = products.length;

  const recentOrders = useMemo(() => orders.slice(0, 10), [orders]);

  const revenueLast7Days = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateKey: date.toISOString().slice(0, 10),
        revenue: 0,
      };
    });

    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      const dateKey = createdAt.toISOString().slice(0, 10);
      const bucket = days.find((item) => item.dateKey === dateKey);
      if (bucket) bucket.revenue += order.total ?? 0;
    });

    return days.map(({ day, revenue }) => ({ day, revenue }));
  }, [orders]);

  const ordersPerDay = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateKey: date.toISOString().slice(0, 10),
        count: 0,
      };
    });

    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      const dateKey = createdAt.toISOString().slice(0, 10);
      const bucket = days.find((item) => item.dateKey === dateKey);
      if (bucket) bucket.count += 1;
    });

    return days.map(({ day, count }) => ({ day, count }));
  }, [orders]);

  const topSellingProducts = useMemo(() => {
    const sales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const key = item.product_name || 'Unknown';
        sales[key] = sales[key] || { name: key, quantity: 0, revenue: 0 };
        sales[key].quantity += item.quantity ?? 0;
        sales[key].revenue += (item.price ?? 0) * (item.quantity ?? 0);
      });
    });

    return Object.values(sales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => !product.in_stock),
    [products],
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category ?? '').filter(Boolean))),
    [products],
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.zodiac_sign ?? '').filter(Boolean))),
    [products],
  );

  const selectedProductIds = useMemo(
    () => Object.entries(selectedIds).filter(([, selected]) => selected).map(([id]) => id),
    [selectedIds],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !normalizedQuery ||
          [product.name, product.category, product.zodiac_sign]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery) ||
          (product.tags ?? []).join(' ').toLowerCase().includes(normalizedQuery);

        if (!matchesSearch) return false;
        if (filterCategory !== 'all' && product.category !== filterCategory) return false;
        if (filterBrand !== 'all' && (product.zodiac_sign || 'Unknown') !== filterBrand) return false;

        if (filterStock !== 'all') {
          const stockState = !product.in_stock ? 'out-of-stock' : product.price < 250 ? 'low-stock' : 'in-stock';
          if (stockState !== filterStock) return false;
        }

        if (filterFeatured !== 'all') {
          const isFeatured = (product.tags ?? []).includes('featured');
          const featuredState = isFeatured ? 'featured' : 'not-featured';
          if (featuredState !== filterFeatured) return false;
        }

        if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'price-low-high':
            return (a.price ?? 0) - (b.price ?? 0);
          case 'price-high-low':
            return (b.price ?? 0) - (a.price ?? 0);
          case 'highest-rated':
            return (b.rating ?? 0) - (a.rating ?? 0);
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      })
      .map((product) => ({
        id: product.id,
        image: product.image ?? '',
        name: product.name,
        category: product.category,
        brand: product.zodiac_sign || 'Brand',
        price: product.price ?? 0,
        original_price: product.original_price,
        discount: product.original_price
          ? Math.round(((product.original_price - (product.price ?? 0)) / product.original_price) * 100)
          : 0,
        in_stock: product.in_stock,
        status: !product.in_stock ? 'out-of-stock' : product.price < 250 ? 'low-stock' : 'active',
        rating: product.rating ?? 0,
        created_at: product.created_at,
        featured: (product.tags ?? []).includes('featured'),
        views: 0,
        wishlistCount: 0,
        orders: 0,
        revenue: 0,
        tags: (product.tags ?? []) as string[],
      }));
  }, [products, searchQuery, filterCategory, filterBrand, filterStock, filterFeatured, sortOption, priceRange]);

  const handleBulkAction = async () => {
    if (selectedProductIds.length === 0) {
      toast({ title: 'Select products first', variant: 'default' });
      return;
    }

    if (bulkAction === 'delete') {
      if (!confirm('Delete selected products?')) return;
      const { error } = await supabase.from('products').delete().in('id', selectedProductIds);
      if (error) {
        toast({ title: 'Bulk delete failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Selected products deleted' });
    } else if (bulkAction === 'mark-featured') {
      const { data: selectedProducts, error: fetchError } = await supabase
        .from('products')
        .select('id,tags')
        .in('id', selectedProductIds);

      if (fetchError) {
        toast({ title: 'Bulk update failed', description: fetchError.message, variant: 'destructive' });
        return;
      }

      const updates = (selectedProducts ?? []).map((product) => {
        const tags = Array.from(new Set([...(product.tags ?? []), 'featured']));
        return supabase.from('products').update({ tags }).eq('id', product.id);
      });

      const results = await Promise.all(updates);
      const firstError = results.map((result) => result.error).find(Boolean);
      if (firstError) {
        toast({ title: 'Bulk update failed', description: firstError?.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Selected products marked featured' });
    } else if (bulkAction === 'archive') {
      const { error } = await supabase.from('products').update({ in_stock: false }).in('id', selectedProductIds);
      if (error) {
        toast({ title: 'Bulk archive failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Selected products archived' });
    }

    setSelectedIds({});
    fetchDashboardData();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-20"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center pt-20"><p className="text-muted-foreground">Access denied</p></div>;

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <ShoppingBag className="h-5 w-5" />,
      trend: '+12% this month',
      trendColor: 'text-emerald-700 bg-emerald-100/80',
      trendIcon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: <Package className="h-5 w-5" />,
      trend: '+6% this week',
      trendColor: 'text-emerald-700 bg-emerald-100/80',
      trendIcon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    {
      label: 'Total Customers',
      value: customerCount,
      icon: <Users className="h-5 w-5" />,
      trend: '+8% this month',
      trendColor: 'text-emerald-700 bg-emerald-100/80',
      trendIcon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    {
      label: 'Total Products',
      value: totalProducts,
      icon: <Box className="h-5 w-5" />,
      trend: 'Stable',
      trendColor: 'text-slate-600 bg-slate-100/80',
      trendIcon: <ArrowDownRight className="h-3.5 w-3.5" />,
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: <Package className="h-5 w-5" />,
      trend: '-5% today',
      trendColor: 'text-rose-700 bg-rose-100/80',
      trendIcon: <ArrowDownRight className="h-3.5 w-3.5" />,
    },
    {
      label: 'Delivered Orders',
      value: deliveredOrders,
      icon: <ShoppingBag className="h-5 w-5" />,
      trend: '+10% today',
      trendColor: 'text-emerald-700 bg-emerald-100/80',
      trendIcon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    {
      label: 'Cancelled Orders',
      value: cancelledOrders,
      icon: <ArrowDownRight className="h-5 w-5" />,
      trend: '-2% today',
      trendColor: 'text-rose-700 bg-rose-100/80',
      trendIcon: <ArrowDownRight className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 shadow-sm">
                <Sparkles className="h-4 w-4" /> Welcome back, Admin
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-slate-700" />
                  <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950">Admin Dashboard</h1>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  Monitor sales, manage products, and keep an eye on the next campaign from your admin dashboard.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 px-5 py-4 text-sm text-slate-700 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Today</p>
                <p className="mt-1 text-base font-semibold">{todayDate}</p>
              </div>
              <Button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:-translate-y-0.5 active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
              <Button variant="outline" className="rounded-full border border-slate-200/90 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 active:scale-95" onClick={() => setTab('products')}>
                View Products
              </Button>
              <Button variant="outline" className="rounded-full border border-slate-200/90 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 active:scale-95" onClick={() => setTab('orders')}>
                Orders
              </Button>
              <Button variant="outline" className="rounded-full border border-slate-200/90 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 active:scale-95" onClick={() => setTab('campaigns')}>
                Coupons
              </Button>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {(['dashboard', 'products', 'orders', 'campaigns'] as const).map((section) => {
              const label = section === 'dashboard' ? 'Dashboard' : section.charAt(0).toUpperCase() + section.slice(1);
              return (
                <Button
                  key={section}
                  variant={tab === section ? 'default' : 'outline'}
                  onClick={() => setTab(section)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-out ${tab === section ? 'gradient-cosmic text-primary-foreground' : 'border-border/50 text-muted-foreground bg-white/90 hover:-translate-y-0.5 active:scale-95'}`}
                >
                  {label}
                </Button>
              );
            })}
          </div>

          {tab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <Card key={index} className="h-32 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
                        <Skeleton className="mb-4 h-6 w-40 rounded-full" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                      </Card>
                    ))
                  : statCards.slice(0, 4).map((card) => (
                      <motion.div
                        key={card.label}
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 210, damping: 18 }}
                        className="h-full"
                      >
                        <Card className="h-full rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.16)]">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
                              {card.icon}
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${card.trendColor}`}>
                              {card.trendIcon}
                              {card.trend}
                            </span>
                          </div>
                          <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{card.label}</p>
                            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                              {card.value}
                            </motion.p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {dashboardLoading
                      ? Array.from({ length: 2 }).map((_, index) => (
                          <Card key={index} className="h-80 rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
                            <Skeleton className="mb-4 h-6 w-48 rounded-full" />
                            <Skeleton className="h-64 w-full rounded-3xl" />
                          </Card>
                        ))
                      : (
                          <>
                            <Card className="h-80 rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.14)]">
                              <CardHeader className="gap-4">
                                <div>
                                  <CardTitle className="text-lg font-semibold text-slate-950">Revenue (Last 7 Days)</CardTitle>
                                  <CardDescription className="mt-1 text-sm text-slate-500">Live revenue flow</CardDescription>
                                </div>
                              </CardHeader>
                              <CardContent className="mt-4 px-0 pb-0">
                                {revenueLast7Days.every((item) => item.revenue === 0) ? (
                                  <p className="text-sm text-slate-500">No revenue recorded for the last seven days.</p>
                                ) : (
                                  <div className="h-[260px] rounded-[1.5rem] bg-slate-950/5 p-3">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={revenueLast7Days} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.08} />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                          cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4', fill: 'transparent' }}
                                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 15px 45px rgba(15, 23, 42, 0.08)', color: '#0f172a' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#b45309" fill="url(#revenueGradient)" strokeWidth={3} />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            <Card className="h-80 rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.14)]">
                              <CardHeader className="gap-4">
                                <div>
                                  <CardTitle className="text-lg font-semibold text-slate-950">Orders Per Day</CardTitle>
                                  <CardDescription className="mt-1 text-sm text-slate-500">Last 7 days</CardDescription>
                                </div>
                              </CardHeader>
                              <CardContent className="mt-4 px-0 pb-0">
                                {ordersPerDay.every((item) => item.count === 0) ? (
                                  <p className="text-sm text-slate-500">No order activity in the last seven days.</p>
                                ) : (
                                  <div className="h-[260px] rounded-[1.5rem] bg-slate-950/5 p-3">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={ordersPerDay} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                          cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4', fill: 'transparent' }}
                                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 15px 45px rgba(15, 23, 42, 0.08)', color: '#0f172a' }}
                                        />
                                        <Bar dataKey="count" fill="#52525b" radius={[12, 12, 0, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </>
                        )}
                  </div>

                  <Card className="h-96">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Based on quantity sold</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dashboardLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-10 rounded-xl" />
                          ))}
                        </div>
                      ) : topSellingProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sales data available yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={330}>
                          <BarChart data={topSellingProducts} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }} />
                            <Bar dataKey="quantity" fill="#f59e0b" radius={[8, 8, 0, 0]}>
                              {topSellingProducts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#fbbf24' : '#f59e0b'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="p-6 rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.12)]">
                    <CardHeader>
                      <CardTitle>Low Stock Warning</CardTitle>
                      <CardDescription>Products that need restocking</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      {dashboardLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-10 rounded-2xl" />
                          ))}
                        </div>
                      ) : lowStockProducts.length === 0 ? (
                        <p className="text-sm text-slate-500">No low-stock products found. Everything is stocked well.</p>
                      ) : (
                        <div className="space-y-3">
                          {lowStockProducts.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between rounded-3xl border border-slate-200/60 bg-slate-50/80 px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-950">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.category}</p>
                              </div>
                              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Out of stock</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="p-6 rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.12)]">
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Latest 10 orders</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4 space-y-4">
                      {dashboardLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="space-y-2 rounded-3xl bg-slate-100/80 p-4">
                              <Skeleton className="h-4 w-3/4 rounded-full" />
                              <Skeleton className="h-4 w-full rounded-full" />
                            </div>
                          ))}
                        </div>
                      ) : recentOrders.length === 0 ? (
                        <p className="text-sm text-slate-500">No recent orders yet. New activity will appear here soon.</p>
                      ) : (
                        <div className="space-y-4">
                          {recentOrders.map((order) => (
                            <div key={order.id} className="rounded-[1.75rem] border border-slate-200/60 bg-slate-50/80 p-5 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-slate-950">{order.shipping_name || 'Guest'}</p>
                                  <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <Badge variant="outline" className="rounded-full border-slate-200 bg-white/80 px-3 py-1 text-xs uppercase text-slate-600">{order.status}</Badge>
                                <span className="font-semibold text-slate-950">₹{order.total}</span>
                              </div>
                              <div className="mt-3 text-sm text-slate-600">
                                {order.order_items?.slice(0, 2).map((item) => item.product_name).join(', ') || 'No items'}{order.order_items && order.order_items.length > 2 ? ` +${order.order_items.length - 2} more` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="space-y-6">
              <ProductFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterBrand={filterBrand}
                setFilterBrand={setFilterBrand}
                filterStock={filterStock}
                setFilterStock={setFilterStock}
                filterFeatured={filterFeatured}
                setFilterFeatured={setFilterFeatured}
                sortOption={sortOption}
                setSortOption={setSortOption}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                categories={categories}
                brands={brands}
              />

              <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Product operations</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Catalogue overview</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={openNew}>
                      <Plus className="mr-2 h-4 w-4" /> Add product
                    </Button>
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="h-11 rounded-full border-slate-200 bg-slate-50 text-slate-700 min-w-[120px] sm:min-w-[180px]">
                        <SelectValue placeholder="Bulk action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delete">Delete selection</SelectItem>
                        <SelectItem value="mark-featured">Mark as featured</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="rounded-full px-4 py-2 text-sm" onClick={handleBulkAction}>
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm">
                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total products</CardTitle>
                    <CardContent className="mt-4">
                      <p className="text-3xl font-semibold text-slate-950">{products.length}</p>
                      <p className="text-sm text-slate-500 mt-2">Live catalogue count</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm">
                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Featured</CardTitle>
                    <CardContent className="mt-4">
                      <p className="text-3xl font-semibold text-slate-950">{products.filter((product) => (product.tags ?? []).includes('featured')).length}</p>
                      <p className="text-sm text-slate-500 mt-2">Premium items highlighted in storefront</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm">
                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Out of stock</CardTitle>
                    <CardContent className="mt-4">
                      <p className="text-3xl font-semibold text-slate-950">{lowStockProducts.length}</p>
                      <p className="text-sm text-slate-500 mt-2">Products needing restock</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-20 text-center">
                  <p className="text-lg font-semibold text-slate-950">No products match your filters yet</p>
                  <p className="mt-2 text-sm text-slate-600">Adjust the search, category, stock, or featured filters to see more items.</p>
                </div>
              ) : (
                <ProductTable
                  products={filteredProducts}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  onEdit={(row) => {
                    const product = products.find((p) => p.id === row.id);
                    if (product) openEdit(product);
                  }}
                  onPreview={(row) => {
                    const product = products.find((p) => p.id === row.id);
                    if (product) {
                      setPreviewProduct(product);
                      setPreviewOpen(true);
                    }
                  }}
                  onDelete={deleteProduct}
                />
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="py-20 text-center text-muted-foreground">No orders yet</p>
              ) : orders.map((o) => (
                <div key={o.id} className="rounded-lg border border-border/50 bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-display text-base font-semibold text-foreground">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={o.status} onValueChange={(val) => updateOrderStatus(o.id, val)}>
                        <SelectTrigger className="w-32 border-border/50 bg-muted/30 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className="text-xs">COD</Badge>
                      <span className="font-display text-lg font-bold text-foreground">₹{o.total}</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-md border border-border/30 bg-muted/10 p-3 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">📦 Delivery Details</p>
                      <p className="text-sm text-foreground font-medium">{o.shipping_name}</p>
                      <p className="text-sm text-muted-foreground">{o.shipping_phone}</p>
                      <p className="text-sm text-muted-foreground">{o.shipping_email}</p>
                      <p className="text-sm text-muted-foreground mt-1">{o.shipping_address}</p>
                      <p className="text-sm text-muted-foreground">{o.shipping_city} - {o.shipping_pincode}</p>
                    </div>
                    <div className="rounded-md border border-border/30 bg-muted/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">🛒 Items Ordered</p>
                      {o.order_items && o.order_items.length > 0 ? (
                        <div className="space-y-1">
                          {o.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                              <span className="text-foreground font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Loading items...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Campaign Management</h2>
                  <p className="text-muted-foreground">Create and manage festive offers and sales.</p>
                </div>
                <Button className="gradient-cosmic" onClick={() => setCampaignDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Campaign
                </Button>
              </div>
              <div className="rounded-xl border border-dashed p-20 text-center">
                <Gift className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No Campaigns Yet</h3>
                <p className="text-muted-foreground">Create your first Grand Sale campaign.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ProductEditor
          form={form}
          setForm={setForm}
          onSave={saveProduct}
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          galleryPreview={galleryPreview}
          setGalleryPreview={setGalleryPreview}
          isEditing={Boolean(editingId)}
        />
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-950">Product Preview</DialogTitle>
          </DialogHeader>
          {previewProduct ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-[1.5rem] overflow-hidden border border-slate-200 bg-slate-950/5">
                  {previewProduct.image ? (
                    <img src={previewProduct.image} alt={previewProduct.name} className="h-80 w-full object-cover" />
                  ) : (
                    <div className="flex h-80 items-center justify-center bg-slate-100 text-slate-500">No image available</div>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{previewProduct.category}</p>
                  <h3 className="text-3xl font-semibold text-slate-950">{previewProduct.name}</h3>
                  <p className="text-sm leading-7 text-slate-600">{previewProduct.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Current price</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">₹{previewProduct.price}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Brand</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{previewProduct.zodiac_sign || 'Brand'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Inventory</p>
                  <Badge variant={previewProduct.in_stock ? 'default' : 'destructive'}>
                    {previewProduct.in_stock ? 'In stock' : 'Out of stock'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Category</p>
                    <p className="mt-2 text-slate-950">{previewProduct.category}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(previewProduct.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Rating</p>
                    <p className="mt-2 text-slate-900 font-semibold">{previewProduct.rating?.toFixed(1) ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Select a product to preview its details.</p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Festival Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaign Title</Label>
              <Input value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} placeholder="Grand Diwali Sale" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea value={campaignForm.subtitle} onChange={(e) => setCampaignForm({ ...campaignForm, subtitle: e.target.value })} placeholder="Up to 70% OFF on Beauty Products" />
            </div>
            <div>
              <Label>Banner Image URL</Label>
              <Input value={campaignForm.banner} onChange={(e) => setCampaignForm({ ...campaignForm, banner: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Text</Label>
                <Input placeholder="70% OFF" value={campaignForm.discount} onChange={(e) => setCampaignForm({ ...campaignForm, discount: e.target.value })} />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={campaignForm.startDate} onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={campaignForm.endDate} onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })} />
            </div>
            <Button className="w-full gradient-cosmic" onClick={saveCampaign}>Save Campaign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
