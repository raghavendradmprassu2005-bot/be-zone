import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Loader2, Truck, ShieldCheck, RotateCcw, Clock, ChevronRight, ChevronLeft, Scissors, Sparkles, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import RecentlyViewed from '@/components/RecentlyViewed';
import heroImage from '@/assets/hero-beauty.jpg';
import categoryWomen from '@/assets/category-women.jpg';
import categoryMen from '@/assets/category-men.jpg';
import categoryKids from '@/assets/category-kids.jpg';
import { useState, useEffect, useCallback } from 'react';

const trustSignals = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% safe payments' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Clock, title: 'Fast Delivery', desc: '2-5 business days' },
];

const categories = [
  { name: 'Women', desc: 'Clothing, Accessories & Cosmetics', image: categoryWomen, href: '/products?category=crystals' },
  { name: 'Men', desc: 'Clothing & Accessories', image: categoryMen, href: '/products?category=tarot' },
  { name: 'Kids', desc: 'Clothing & Essentials', image: categoryKids, href: '/products?category=incense' },
];

const services = [
  { icon: Scissors, name: 'Tailoring', desc: 'Expert custom tailoring with precision fitting and premium craftsmanship for all occasions.' },
  { icon: Sparkles, name: 'Eyebrow Shaping & Hair Style', desc: 'Professional eyebrow threading, shaping and trendy hairstyling by skilled beauticians.' },
  { icon: Heart, name: 'Saree Kuch (Draping & Styling)', desc: 'Elegant saree draping and styling for weddings, festivals and special celebrations.' },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const featured = products.filter(p => p.tags.includes('featured')).slice(0, 4);
  const hotDeals = products.filter(p => p.tags.includes('hot-deal'));
  const [slideIndex, setSlideIndex] = useState(0);
  const trending = products.slice(0, 8);
  const bestsellers = products.filter(p => p.tags.includes('bestseller'));

  const nextSlide = useCallback(() => {
    if (trending.length > 0) setSlideIndex(i => (i + 1) % Math.ceil(trending.length / 2));
  }, [trending.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Be-Zone luxury beauty collection" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-xl">
            <span className="mb-4 inline-block rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary backdrop-blur-sm">
              New Collection 2026
            </span>
            <h1 className="mb-3 font-display text-5xl font-semibold leading-[1.05] text-primary-foreground sm:text-6xl lg:text-7xl">
              Discover Your
              <span className="block text-glow">Perfect Style</span>
            </h1>
            <p className="animate-glow-fade mb-2 font-display text-xl italic text-primary-foreground/70" style={{ animationDelay: '0.3s' }}>
              ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಶೈಲಿಯನ್ನು ಅನ್ವೇಷಿಸಿ
            </p>
            <p className="mb-8 max-w-md text-base leading-relaxed text-primary-foreground/70">
              Curated collection of premium beauty, skincare, makeup & fashion — all at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-nebula px-8 text-foreground shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
                <Link to="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/10">
                <Link to="/zodiac">Explore Collections</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-y border-border/50 bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4 md:py-8">
          {trustSignals.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-secondary">✦ What We Offer</span>
            <h2 className="mb-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Our Services</h2>
            <p className="text-sm text-muted-foreground tracking-wide">Premium beauty services crafted with care</p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-border/40 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-premium cursor-pointer"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors duration-300 group-hover:bg-secondary group-hover:text-foreground">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold text-foreground">{service.name}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{service.desc}</p>
                <div className="mt-3 h-0.5 w-0 rounded-full bg-secondary transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Categories */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="mb-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Shop by Category</h2>
            <p className="text-sm text-muted-foreground tracking-wide">Curated collections for every style</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={cat.href} className="group relative block overflow-hidden rounded-2xl card-hover">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl font-semibold text-primary-foreground">{cat.name}</h3>
                    <p className="mt-1 text-sm text-primary-foreground/70">{cat.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-secondary transition-all group-hover:gap-2">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-secondary/40" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex items-end justify-between">
              <div>
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-secondary">✦ Handpicked</span>
                <h2 className="font-display text-3xl font-semibold text-foreground">Explore Collections</h2>
                <p className="mt-1 text-sm font-medium tracking-[0.15em] text-secondary/80">Bhoomika Beauty Parlour</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-secondary">
                <Link to="/products">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {featured.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products Slider */}
      {trending.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex items-end justify-between">
              <div>
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-secondary">✦ Trending Now</span>
                <h2 className="font-display text-3xl font-semibold text-foreground">Top Products</h2>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="outline" size="icon" className="h-9 w-9 border-border/50" onClick={() => setSlideIndex(i => Math.max(0, i - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-border/50" onClick={nextSlide}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
            ) : (
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-5"
                  animate={{ x: `-${slideIndex * 50}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                >
                  {trending.map(product => (
                    <div key={product.id} className="w-[calc(50%-1.25rem)] shrink-0 sm:w-[calc(25%-1.875rem)]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hot Deals */}
      {hotDeals.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex items-end justify-between">
              <div>
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-destructive">🔥 Limited Time</span>
                <h2 className="font-display text-3xl font-semibold text-foreground">Hot Deals</h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-secondary">
                <Link to="/products">See All <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {hotDeals.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* AI Recommended for You */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex items-end justify-between">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-secondary">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommended
              </span>
              <h2 className="font-display text-3xl font-semibold text-foreground">Recommended for You</h2>
              <p className="mt-1 text-xs text-muted-foreground">Hand-picked by our AI based on what shoppers love</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-secondary">
              <Link to="/products">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </motion.div>
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
          ) : (
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {bestsellers.slice(0, 8).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* Visit Our Beauty Studio */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-secondary/5 p-8 lg:p-14"
          >
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-secondary">✦ Visit Us</span>
              <h2 className="mb-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">Visit Our Beauty Studio</h2>
              <h3 className="mb-6 font-display text-xl text-secondary font-medium">Bhoomika Beauty Parlour</h3>
              <div className="mb-6 flex items-start justify-center gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Near Govt Hospital</p>
                  <p className="text-sm text-muted-foreground">Basavapatna, Davanagere, Karnataka</p>
                </div>
              </div>
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
                Experience premium beauty services in our elegant studio. Our skilled beauticians provide personalized care for every client.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://wa.me/917619305964?text=Hi,%20I%20want%20to%20know%20more%20about%20your%20beauty%20services/products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg gradient-nebula px-6 py-3 text-sm font-semibold text-foreground shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://maps.app.goo.gl/XTh2zrsuTndPabPt9?g_st=ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-secondary/50 bg-secondary/10 px-6 py-3 text-sm font-semibold text-secondary transition-all hover:bg-secondary hover:text-secondary-foreground hover:shadow-lg hover:scale-[1.02]"
                >
                  <MapPin className="h-4 w-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-2xl bg-foreground p-10 text-center lg:p-16">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="mb-3 font-display text-3xl font-semibold text-primary-foreground sm:text-4xl">
                Don't Miss Exclusive Deals
              </h2>
              <p className="mx-auto mb-8 max-w-md text-sm text-primary-foreground/60">
                Get early access to sales, new arrivals, and special offers delivered straight to you.
              </p>
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <input type="email" placeholder="Enter your email" className="flex-1 rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                <Button size="lg" className="gradient-nebula text-foreground shadow-lg hover:shadow-xl transition-all">
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <RecentlyViewed />

      {/* Testimonials */}
      <section className="border-t border-border/50 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
            <h2 className="mb-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">What Our Customers Say</h2>
            <p className="text-sm text-muted-foreground">Real reviews from happy shoppers</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Priya S.', text: 'Amazing quality products! The beauty combo was a steal. Will definitely order again.', rating: 5 },
              { name: 'Rahul M.', text: 'Fast delivery and great packaging. The accessories collection is stunning and premium.', rating: 5 },
              { name: 'Anita K.', text: 'Love the variety! From skincare to fashion, everything exceeded my expectations.', rating: 4 },
            ].map((review, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < review.rating ? 'fill-secondary text-secondary' : 'text-border'}`} />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground italic">"{review.text}"</p>
                <p className="text-sm font-semibold text-foreground">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
