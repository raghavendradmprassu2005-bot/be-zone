import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Loader2, Truck, ShieldCheck, RotateCcw, Clock, ChevronRight, ChevronLeft, Scissors, Sparkles, Heart, Gem, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import RecentlyViewed from '@/components/RecentlyViewed';
import heroImage from '@/assets/hero-beauty.jpg';
import categoryWomen from '@/assets/category-women.jpg';
import categoryMen from '@/assets/category-men.jpg';
import categoryKids from '@/assets/category-kids.jpg';
import { useRef, useEffect, useState } from 'react';
import TopProductCard from '@/components/TopProductCard';
import VisitStudio from "@/components/VisitStudio";
import Footer from '@/components/Footer';
import ScrollDrawText from '@/components/ScrollDrawText';

const trustSignals = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% safe payments' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Clock, title: 'Fast Delivery', desc: '2-5 business days' },
];

const categories = [
  { name: 'Women', desc: 'Clothing, Accessories & Cosmetics', image: categoryWomen, href: '/products?group=women' },
  { name: 'Men', desc: 'Clothing & Accessories', image: categoryMen, href: '/products?group=men' },
  { name: 'Kids', desc: 'Clothing & Essentials', image: categoryKids, href: '/products?group=kids' },
];

const services = [
  {
    number: '01',
    label: 'Atelier Craft',
    name: 'Tailoring',
    desc: 'Expert custom tailoring with precision fitting and premium craftsmanship for all occasions.',
    icon: Scissors,
    theme: 'light' as const,
    bg: '#F8F2E7',
    surface: '#FBF6EC',
    text: '#2B2420',
    muted: '#6B5F52',
    accent: '#B08D57',
    border: 'rgba(176,141,87,0.28)',
    glow: 'rgba(214,180,120,0.55)',
  },
  {
    number: '02',
    label: 'Beauty Studio',
    name: 'Eyebrow Shaping & Hair Style',
    desc: 'Professional eyebrow threading, shaping and trendy hairstyling by skilled beauticians.',
    icon: Sparkles,
    theme: 'light' as const,
    bg: '#F6E9E7',
    surface: '#FAF0EE',
    text: '#2E2220',
    muted: '#7A5D5A',
    accent: '#B9828A',
    border: 'rgba(185,130,138,0.28)',
    glow: 'rgba(196,133,140,0.5)',
  },
  {
    number: '03',
    label: 'Bridal Editorial',
    name: 'Saree Kuch (Draping & Styling)',
    desc: 'Elegant saree draping and styling for weddings, festivals and special celebrations.',
    icon: Heart,
    theme: 'dark' as const,
    bg: '#2A1017',
    surface: '#331319',
    text: '#F3E7E1',
    muted: '#C9A9A6',
    accent: '#CBA66B',
    border: 'rgba(203,166,107,0.3)',
    glow: 'rgba(122,20,42,0.55)',
  },
  {
    number: '04',
    label: 'Jewellery Boutique',
    name: 'Necklaces for Rent',
    desc: 'Elegant necklaces available for rent to complete your look for weddings, celebrations and special occasions.',
    icon: Gem,
    theme: 'dark' as const,
    bg: '#0E241C',
    surface: '#123027',
    text: '#EAF2EC',
    muted: '#9FC2B2',
    accent: '#CDB985',
    border: 'rgba(205,185,133,0.3)',
    glow: 'rgba(20,95,72,0.55)',
  },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const featured = products.filter(p => p.tags.includes('featured')).slice(0, 4);
  const hotDeals = products.filter(p => p.tags.includes('hot-deal'));
  const topProducts = products.filter(p => p.tags.includes('top-product'));
  const bestsellers = products.filter(p => p.tags.includes('bestseller'));

  const earthSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><radialGradient id="g" cx="40%" cy="35%" r="80%"><stop offset="0%" stop-color="#fff6e0" stop-opacity="0.55"/><stop offset="34%" stop-color="#d8b86d" stop-opacity="0.24"/><stop offset="100%" stop-color="#0e0904" stop-opacity="0.95"/></radialGradient><radialGradient id="h" cx="64%" cy="60%" r="70%"><stop offset="0%" stop-color="#ffedd0" stop-opacity="0.18"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient></defs><circle cx="600" cy="600" r="560" fill="#160f09"/><circle cx="600" cy="600" r="560" fill="url(#g)"/><circle cx="600" cy="600" r="520" fill="url(#h)"/><g fill="#cfb470" opacity="0.16"><path d="M360 420c40-60 115-90 180-100 50-8 92 14 132 44 36 28 64 64 100 96 38 34 88 48 136 58 36 8 78 18 110 38 18 10 30 24 34 44 6 28-8 58-26 80-28 34-76 42-118 40-50-2-98-18-140-42-34-20-62-48-98-66-52-26-110-30-160-54-30-14-56-36-70-68-12-28-16-64 0-92z"/><path d="M240 760c60-36 142-28 206 6 40 22 78 56 110 88 24 22 52 42 82 54 44 18 92 20 138 14 56-8 114-28 154-70 30-34 40-82 32-126-10-60-58-112-114-128-46-14-96-4-140 18-34 16-62 40-96 54-42 18-90 24-130 44-28 14-54 34-76 58-16 18-30 42-28 68 2 22 16 44 36 54z"/><circle cx="760" cy="760" r="28"/><circle cx="820" cy="660" r="18"/><circle cx="660" cy="720" r="24"/></g></svg>`;
  const earthBackground = "url('/images/earth-gold.png')";

  const carouselRef = useRef<HTMLDivElement>(null);
  const [brandStripClass, setBrandStripClass] = useState('');
  const scrollCarousel = (dir: 'prev' | 'next') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'next' ? 184 : -184, behavior: 'smooth' });
  };

  const servicesScrollRef = useRef<HTMLDivElement>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [serviceProgress, setServiceProgress] = useState<number[]>([1, 0, 0, 0]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const servicesRAF = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const listener = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener?.('change', listener);
    return () => mq.removeEventListener?.('change', listener);
  }, []);

  useEffect(() => {
  return () => {
    if (servicesRAF.current) {
      cancelAnimationFrame(servicesRAF.current);
    }
  };
}, []);

  const computeServiceProgress = (el: HTMLDivElement) => {
    const children = Array.from(el.children) as HTMLElement[];
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const maxDist = el.clientWidth / 2 + 40;
    let closestIndex = 0;
    let closestDist = Infinity;
    const progress = children.map((child, idx) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = idx;
      }
      const ratio = 1 - Math.min(dist / maxDist, 1);
      return Math.max(0, ratio);
    });
    return { progress, closestIndex };
  };

  const handleServicesScroll = (el: HTMLDivElement | null) => {
  if (!el) return;

  if (servicesRAF.current) {
    cancelAnimationFrame(servicesRAF.current);
  }

  servicesRAF.current = requestAnimationFrame(() => {
    const { progress, closestIndex } =
      computeServiceProgress(el);

    setServiceProgress(progress);

    // Mobile: active service follows the card currently
    // positioned in the center.
    //
    // Desktop: active service is controlled by mouse hover,
    // so scrolling alone does not remove the hover reveal.
    if (window.innerWidth < 768) {
      setActiveServiceIndex(closestIndex);
    }
  });
};
  const scrollToService = (index: number, el: HTMLDivElement | null) => {
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    const targetLeft = child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const activeService = services[activeServiceIndex];

  useEffect(() => {
    // Entrance animation for brand strip; respect prefers-reduced-motion
    const reduces = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduces) {
      setBrandStripClass('settled');
      return;
    }
    // play entrance, then settle into slow shimmer
    setBrandStripClass('animate');
    const t = setTimeout(() => setBrandStripClass('settled'), 2400);
    return () => clearTimeout(t);
    
  }, []);

  return (
    <div className="min-h-screen pb-0" style={{ fontFamily: "'Artifika', serif" }}>

      {/* Brand announcement strip (between header and hero) */}
      <section className={`brand-strip ${brandStripClass}`} role="region" aria-label="Bhoomika Beauty Parlour announcement">
        <div className="brand-strip-inner container mx-auto px-4">
          <span className="ornament hidden sm:inline">✦</span>
          <div className="title-wrap">
            <span className="title font-display">BHOOMIKA BEAUTY PARLOUR</span>

          </div>
          <span className="ornament hidden sm:inline">✦</span>
          <span className="sparkle left" aria-hidden="true"></span>
          <span className="sparkle right" aria-hidden="true"></span>
        </div>
      </section>

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
            <h1 className="mb-3 font-display text-5xl font-semibold leading-[1.05] text-primary-foreground sm:text-6xl lg:text-7xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
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
      <section className="relative overflow-hidden py-12 lg:py-20">
        <style>{`
          .services-scroll::-webkit-scrollbar {
            display: none;
          }

          .services-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .service-card {
            scroll-snap-stop: always;
          }

          @media (prefers-reduced-motion: reduce) {
            .service-card,
            .service-background,
            .service-glow {
              transition: none !important;
              animation: none !important;
            }
          }
        `}</style>

        {/* Soft, fading background — stays inside Our Services */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10 service-background"
          animate={{
            background: `linear-gradient(180deg, ${activeService.bg} 0%, ${activeService.bg}CC 38%, ${activeService.bg}66 72%, transparent 100%)`,
          }}
          transition={{
            duration: prefersReducedMotion ? 0.15 : 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              aria-hidden="true"
              className="absolute inset-0 service-glow"
              initial={false}
              animate={{
                opacity: activeServiceIndex === i ? 0.65 : 0,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 1.1,
                ease: "easeInOut",
              }}
              style={{
                background: `radial-gradient(70% 55% at 50% 25%, ${service.glow}, transparent 72%)`,
                filter: "blur(55px)",
              }}
            />
          ))}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 45%, rgba(255,255,255,0.18) 100%)",
            }}
          />
        </motion.div>

        <div className="container relative mx-auto px-4">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center lg:mb-12"
          >
            <motion.span
              className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.25em]"
              animate={{ color: activeService.accent }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.8,
                ease: "easeInOut",
              }}
            >
              The Be-Zone Experience
            </motion.span>

            <motion.h2
              className="mb-3 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
              }}
              animate={{ color: activeService.text }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.8,
                ease: "easeInOut",
              }}
            >
              Our Services
            </motion.h2>

            <motion.p
              className="text-sm tracking-wide"
              animate={{ color: activeService.muted }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.8,
                ease: "easeInOut",
              }}
            >
              Premium beauty services crafted with care
            </motion.p>
          </motion.div>

          {/* MOBILE — one card at a time */}
          <div className="md:hidden">
            <div
              ref={servicesScrollRef}
              onScroll={(e) => handleServicesScroll(e.currentTarget)}
              className="services-scroll -mx-4 flex gap-3 overflow-x-auto px-[7.5vw] pb-2"
              style={{
                scrollSnapType: "x mandatory",
                scrollSnapStop: "always",
                scrollPaddingInline: "7.5vw",
                scrollBehavior: prefersReducedMotion ? "auto" : "smooth",
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorX: "contain",
                touchAction: "auto",
              }}
            >
              {services.map((service, i) => {
                const p = serviceProgress[i] ?? (i === activeServiceIndex ? 1 : 0);
                const scale = prefersReducedMotion ? 1 : 0.985 + p * 0.015;
                const opacity = prefersReducedMotion ? 1 : 0.86 + p * 0.14;
                const blurPx = prefersReducedMotion ? 0 : Math.min((1 - p) * 0.8, 0.8);

                return (
                  <div
                    key={service.name}
                    className="service-card shrink-0"
                    style={{
                      scrollSnapAlign: "center",
                      scrollSnapStop: "always",
                      width: "85vw",
                      maxWidth: 360,
                    }}
                  >
                    <motion.div
                      animate={{ scale, opacity }}
                      transition={{
                        duration: prefersReducedMotion ? 0.1 : 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        filter: `blur(${blurPx}px)`,
                        background: service.surface,
                        borderColor: service.border,
                        boxShadow:
                          p > 0.75
                            ? `0 20px 45px -18px ${service.glow}`
                            : "0 8px 20px -12px rgba(0,0,0,0.14)",
                      }}
                      className="relative min-h-[350px] rounded-2xl border p-6"
                    >
                      <div className="mb-5 flex items-start justify-between">
                        <span
                          className="font-display text-4xl font-light leading-none"
                          style={{ color: service.accent, opacity: 0.55 }}
                        >
                          {service.number}
                        </span>

                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-full"
                          style={{
                            background: `${service.accent}1F`,
                            color: service.accent,
                          }}
                        >
                          <service.icon className="h-5 w-5" />
                        </div>
                      </div>

                      <span
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: service.accent }}
                      >
                        {service.label}
                      </span>

                      <h3
                        className="mb-3 font-display text-2xl font-semibold leading-tight"
                        style={{
                          color: service.text,
                          fontFamily: "'Cormorant Garamond', serif",
                        }}
                      >
                        {service.name}
                      </h3>

                      <p
                        className="mb-5 text-sm leading-relaxed"
                        style={{ color: service.muted }}
                      >
                        {service.desc}
                      </p>

                      <div
                        className="mb-5 h-px w-10"
                        style={{ background: service.accent }}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Mobile service numbers — white background */}
            <div className="mx-auto mt-5 flex w-fit items-center gap-1 rounded-full border border-white/70 bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur-sm">
              {services.map((service, i) => (
                <span key={service.name} className="flex items-center">
                  {i > 0 && (
                    <span className="px-0.5 text-[9px] text-[#B8A88D]">—</span>
                  )}
                  <button
                    type="button"
                    aria-label={`Go to ${service.name}`}
                    onClick={() => scrollToService(i, servicesScrollRef.current)}
                    className="min-w-[32px] rounded-full px-2 py-1 font-display text-[11px] font-semibold tracking-wider transition-all duration-300"
                    style={{
                      color: i === activeServiceIndex ? service.accent : "#7C7063",
                      background: i === activeServiceIndex ? "#F7F2E9" : "transparent",
                    }}
                  >
                    {service.number}
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* DESKTOP — exactly four cards in one row */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-4">
              {services.map((service, i) => {
                const isHovered = activeServiceIndex === i;

                return (
                  <div
                    key={service.name}
                    className="service-card min-w-0"
                    onMouseEnter={() => {
                      if (!prefersReducedMotion) {
                        setActiveServiceIndex(i);
                      }
                    }}
                  >
                    <motion.div
                      animate={{
                        opacity: isHovered ? 1 : 0.58,
                        scale: isHovered ? 1 : 0.975,
                        y: isHovered ? 0 : 5,
                        filter: prefersReducedMotion
                          ? "blur(0px)"
                          : isHovered
                            ? "blur(0px)"
                            : "blur(4px)",
                      }}
                      transition={{
                        duration: prefersReducedMotion ? 0.1 : 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        background: service.surface,
                        borderColor: service.border,
                        boxShadow: isHovered
                          ? `0 25px 55px -22px ${service.glow}`
                          : "0 8px 20px -12px rgba(0,0,0,0.15)",
                        minHeight: 400,
                      }}
                      className="relative flex h-full flex-col rounded-2xl border p-6 lg:p-7"
                    >
                      <div className="mb-6 flex items-start justify-between">
                        <span
                          className="font-display text-4xl font-light leading-none lg:text-5xl"
                          style={{
                            color: service.accent,
                            opacity: isHovered ? 0.7 : 0.4,
                          }}
                        >
                          {service.number}
                        </span>

                        <motion.div
                          animate={{
                            scale: isHovered ? 1.08 : 1,
                            rotate: isHovered ? 0 : -3,
                          }}
                          transition={{
                            duration: prefersReducedMotion ? 0.1 : 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full lg:h-12 lg:w-12"
                          style={{
                            background: `${service.accent}1F`,
                            color: service.accent,
                          }}
                        >
                          <service.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                        </motion.div>
                      </div>

                      <span
                        className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] lg:text-[11px]"
                        style={{ color: service.accent }}
                      >
                        {service.label}
                      </span>

                      <h3
                        className="mb-3 font-display text-2xl font-semibold leading-tight lg:text-[28px]"
                        style={{
                          color: service.text,
                          fontFamily: "'Cormorant Garamond', serif",
                        }}
                      >
                        {service.name}
                      </h3>

                      <p
                        className="mb-6 flex-1 text-sm leading-relaxed"
                        style={{ color: service.muted }}
                      >
                        {service.desc}
                      </p>

                      <motion.div
                        animate={{ width: isHovered ? 56 : 40 }}
                        transition={{
                          duration: prefersReducedMotion ? 0.1 : 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="mb-5 h-px"
                        style={{ background: service.accent }}
                      />

                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: service.accent }}
                      >
                        Explore Service
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Desktop numbers — white background */}
            <div className="mx-auto mt-6 flex w-fit items-center gap-1 rounded-full border border-white/70 bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur-sm">
              {services.map((service, i) => (
                <span key={service.name} className="flex items-center">
                  {i > 0 && (
                    <span className="px-0.5 text-[9px] text-[#B8A88D]">—</span>
                  )}
                  <button
                    type="button"
                    aria-label={`Show ${service.name}`}
                    onClick={() => setActiveServiceIndex(i)}
                    className="min-w-[32px] rounded-full px-2 py-1 font-display text-[11px] font-semibold tracking-wider transition-all duration-300"
                    style={{
                      color: i === activeServiceIndex ? service.accent : "#7C7063",
                      background: i === activeServiceIndex ? "#F7F2E9" : "transparent",
                    }}
                  >
                    {service.number}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Categories */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <ScrollDrawText
  text="Shop by Category"
  className="mb-2 text-foreground"
/>
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

      {/* Top Products Carousel */}
      {topProducts.length > 0 && (
        <section className="py-16 bg-muted/30 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex items-end justify-between"
            >
              <div>
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-secondary">⭐ Trending Now</span>
                <h2 className="font-display text-3xl font-semibold text-foreground">Top Products</h2>
                <p className="mt-1 text-sm text-muted-foreground">Curated picks loved by our customers</p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="outline" size="icon" className="h-9 w-9 border-border/50" onClick={() => scrollCarousel('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-border/50" onClick={() => scrollCarousel('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
            ) : (
              <div
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {topProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="shrink-0"
                    style={{ scrollSnapAlign: 'start', width: 'min(46vw, 172px)' }}
                  >
                    <TopProductCard product={product} />
                  </motion.div>
                ))}
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
              <h2 className="font-display text-3xl font-semibold text-foreground"style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>Recommended for You</h2>
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

      {/* Newsletter / CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-2xl bg-foreground p-10 text-center lg:p-16">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="mb-3 font-display text-3xl font-semibold text-primary-foreground sm:text-4xl"style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
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
            <h2 className="mb-2 font-display text-3xl font-semibold text-foreground sm:text-4xl"style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>What Our Customers Say</h2>
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
      <VisitStudio />
  </div>
  );
};
export default Index;