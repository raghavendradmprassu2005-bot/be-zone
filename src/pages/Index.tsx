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
import gsap from 'gsap';
import TopProductCard from '@/components/TopProductCard';
import VisitStudio from "@/components/VisitStudio";
import Footer from '@/components/Footer';
import { useLayoutEffect } from "react";

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
    number: "01",
    label: "Atelier Craft",
    name: "Tailoring",
    desc: "Expert custom tailoring with precision fitting and premium craftsmanship for all occasions.",
    icon: Scissors,
    theme: "light" as const,
    bg: "#E8D8BE",
    surface: "#F5ECDE",
    text: "#2B241D",
    muted: "#6E6254",
    accent: "#9A784A",
    border: "rgba(154,120,74,0.28)",
    glow: "rgba(201,169,116,0.45)",
  },

  {
    number: "02",
    label: "Beauty Studio",
    name: "Eyebrow Shaping & Hair Style",
    desc: "Professional eyebrow threading, shaping and trendy hairstyling by skilled beauticians.",
    icon: Sparkles,
    theme: "light" as const,
    bg: "#E8D1CD",
    surface: "#F5E7E4",
    text: "#302422",
    muted: "#705E5A",
    accent: "#A77C72",
    border: "rgba(167,124,114,0.27)",
    glow: "rgba(199,153,143,0.45)",
  },

  {
    number: "03",
    label: "Bridal Editorial",
    name: "Saree Kuch (Draping & Styling)",
    desc: "Elegant saree draping and styling for weddings, festivals and special celebrations.",
    icon: Heart,
    theme: "light" as const,
    bg: "#DCD3DF",
    surface: "#EEE8F0",
    text: "#29252D",
    muted: "#68606E",
    accent: "#88718F",
    border: "rgba(136,113,143,0.27)",
    glow: "rgba(170,148,178,0.45)",
  },

  {
    number: "04",
    label: "Jewellery Boutique",
    name: "Necklaces for Rent",
    desc: "Elegant necklaces available for rent to complete your look for weddings, celebrations and special occasions.",
    icon: Gem,
    theme: "light" as const,
    bg: "#D8DDD2",
    surface: "#EAEDE5",
    text: "#262923",
    muted: "#60665B",
    accent: "#858F70",
    border: "rgba(133,143,112,0.28)",
    glow: "rgba(168,179,143,0.45)",
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
  const serviceTiltRefs = useRef<Array<HTMLDivElement | null>>([]);
  const servicesTitleRef = useRef<HTMLHeadingElement>(null);
  const magneticGridRef = useRef<HTMLDivElement>(null);

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

  // ------------------------------------------------------------
  // SERVICE CARD HOVER TILT
  // GSAP owns ONLY the outer card wrapper transform. Framer Motion
  // continues to own the inner card animation (scale / opacity / y / blur).
  // This prevents the two animation systems from overwriting each other.
  // ------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const isSmallScreen = () => window.matchMedia("(max-width: 767px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The tilt is intentionally desktop-only. On touch devices there is no
    // cursor position to calculate, so we leave the cards completely alone.
    if (isTouchDevice || reduceMotion) return;

    const cards = serviceTiltRefs.current.filter(
      (card): card is HTMLDivElement => card !== null
    );

    if (!cards.length) return;

    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      // Make the perspective explicit on the element GSAP is transforming.
      // This is more reliable than relying only on transformPerspective in
      // browsers with nested transformed elements.
      card.style.transformStyle = "preserve-3d";
      card.style.willChange = "transform";

      gsap.set(card, {
        rotationX: 0,
        rotationY: 0,
        transformPerspective: 800,
        transformOrigin: "center center",
        force3D: true,
      });

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        if (isSmallScreen()) return;

        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // 0 at the centre, -0.5 at the left/top, +0.5 at right/bottom.
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        // Keep the movement subtle and premium. The maximum is ±12.5°.
        const rotationY = x * 25;
        const rotationX = -y * 25;

        gsap.to(card, {
          rotationX,
          rotationY,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
          transformPerspective: 800,
          force3D: true,
        });
      };

      const handlePointerLeave = () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
          transformPerspective: 800,
          force3D: true,
        });
      };

      card.addEventListener("pointermove", handlePointerMove, { passive: true });
      card.addEventListener("pointerleave", handlePointerLeave, { passive: true });

      cleanups.push(() => {
        card.removeEventListener("pointermove", handlePointerMove);
        card.removeEventListener("pointerleave", handlePointerLeave);
        gsap.killTweensOf(card);
        gsap.set(card, {
          rotationX: 0,
          rotationY: 0,
          clearProps: "transform",
        });
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // ------------------------------------------------------------
// SERVICE NUMBERS — GSAP PREMIUM COUNT-UP
// Starts once when Our Services enters the viewport.
// No ScrollTrigger dependency.
// Works on desktop + mobile.
// ------------------------------------------------------------
useEffect(() => {
  const title = servicesTitleRef.current;

  if (!title) return;

  const ctx = gsap.context(() => {
    const numbers = Array.from(
      document.querySelectorAll<HTMLElement>(".service-number")
    );

    if (!numbers.length) return;

    // Reduced motion: show final values immediately.
    if (prefersReducedMotion) {
      numbers.forEach((number) => {
        const target = Number(number.dataset.target);

        if (Number.isFinite(target)) {
          number.textContent = String(target).padStart(2, "0");
        }
      });

      return;
    }

    // Start from 00.
    numbers.forEach((number) => {
      number.textContent = "00";
    });

    let hasPlayed = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasPlayed) return;

        hasPlayed = true;

        numbers.forEach((number, index) => {
          const target = Number(number.dataset.target);

          if (!Number.isFinite(target)) return;

          const counter = {
            value: 0,
          };

          gsap.to(counter, {
            value: target,

            duration: 1.1,

            delay: index * 0.08,

            ease: "power3.out",

            onUpdate: () => {
              number.textContent = String(
                Math.round(counter.value)
              ).padStart(2, "0");
            },

            onComplete: () => {
              number.textContent = String(target).padStart(
                2,
                "0"
              );
            },
          });
        });

        observer.disconnect();
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(title);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(numbers);
    };
  });

  return () => ctx.revert();
}, [prefersReducedMotion]);

  // ------------------------------------------------------------
  // SERVICE NUMBERS — GSAP random-entry animation
  // ------------------------------------------------------------
  useEffect(() => {
    const numbers = Array.from(
      document.querySelectorAll<HTMLSpanElement>(".service-number")
    );

    if (!numbers.length || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      numbers.forEach((number, index) => {
        const randomX = gsap.utils.random(-90, 90);
        const randomY = gsap.utils.random(-70, 70);
        const randomRotation = gsap.utils.random(-35, 35);
        const randomScale = gsap.utils.random(0.35, 1.7);

        gsap.set(number, {
          x: randomX,
          y: randomY,
          rotation: randomRotation,
          scale: randomScale,
        });

        gsap.to(number, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: gsap.utils.random(0.8, 1.25),
          delay: gsap.utils.random(0, 0.28) + index * 0.05,
          ease: "back.out(1.5)",
          overwrite: "auto",
        });
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

// ------------------------------------------------------------
// MAGNETIC DOT GRID — ULTRA-SMOOTH CURSOR REPULSION
//
// IMPORTANT:
// • No tween is created on every mouse movement.
// • No getBoundingClientRect() for every dot every frame.
// • gsap.quickSetter() handles transforms directly.
// • Cursor response is immediate.
// • Return uses lightweight spring physics.
// • Desktop only.
// • Completely disabled on touch/mobile.
// • Fully cleaned up on unmount.
//
// This keeps the existing 32 × 16 = 512 dot layout unchanged.
// ------------------------------------------------------------
useEffect(() => {
  const container = magneticGridRef.current;

  if (!container || prefersReducedMotion) return;

  // ----------------------------------------------------------
  // Desktop / mouse only
  // ----------------------------------------------------------
  const mediaQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  if (!mediaQuery.matches) {
    return;
  }

  // ----------------------------------------------------------
  // Collect dots once.
  //
  // IMPORTANT:
  // Do NOT use:
  // dot.element
  //
  // A querySelectorAll<HTMLElement>() result is already an
  // HTMLElement.
  // ----------------------------------------------------------
  const dots = Array.from(
    container.querySelectorAll<HTMLElement>(".magnetic-dot")
  );

  if (!dots.length) return;

  // ----------------------------------------------------------
  // Configuration
  // ----------------------------------------------------------

  // Interaction radius.
  const radius = 90;

  // Maximum displacement from the cursor.
  const maxStrength = 34;

  // Spring configuration used ONLY when the cursor leaves.
  //
  // Higher stiffness = faster return.
  // Higher damping = less oscillation.
  const springStrength = 0.24;
  const damping = 0.76;

  // Small threshold used to settle the spring cleanly.
  const settleThreshold = 0.02;

  // ----------------------------------------------------------
  // Quick setters
  //
  // These are dramatically cheaper than creating gsap.to()
  // repeatedly during pointer movement.
  // ----------------------------------------------------------
  const setX = dots.map((dot) =>
    gsap.quickSetter(dot, "x", "px")
  );

  const setY = dots.map((dot) =>
    gsap.quickSetter(dot, "y", "px")
  );

  // ----------------------------------------------------------
  // Store each dot's ORIGINAL grid position.
  //
  // We calculate this once.
  //
  // No getBoundingClientRect() for every dot on every frame.
  // ----------------------------------------------------------
  const positions = dots.map((dot) => ({
    x: 0,
    y: 0,
  }));

  // Current transform position.
  const current = dots.map(() => ({
    x: 0,
    y: 0,
  }));

  // Spring velocity.
  const velocity = dots.map(() => ({
    x: 0,
    y: 0,
  }));

  // ----------------------------------------------------------
  // Cursor state.
  // ----------------------------------------------------------
  const cursor = {
    x: -9999,
    y: -9999,
    active: false,
  };

  let containerRect = container.getBoundingClientRect();

  // ----------------------------------------------------------
  // Calculate the dot centers.
  //
  // offsetLeft / offsetTop are layout values and do NOT change
  // when we transform the dots.
  // ----------------------------------------------------------
  const calculatePositions = () => {
    containerRect = container.getBoundingClientRect();

    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;

    dots.forEach((dot, index) => {
      const rect = dot.getBoundingClientRect();

      positions[index].x =
        rect.left +
        rect.width / 2 -
        containerLeft;

      positions[index].y =
        rect.top +
        rect.height / 2 -
        containerTop;
    });
  };

  calculatePositions();

  // ----------------------------------------------------------
  // Resize handling.
  // ----------------------------------------------------------
  let resizeTimer: number | null = null;

  const handleResize = () => {
    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer);
    }

    resizeTimer = window.setTimeout(() => {
      calculatePositions();
    }, 80);
  };

  window.addEventListener("resize", handleResize, {
    passive: true,
  });

  // ----------------------------------------------------------
  // Keep the container position accurate during page scroll.
  //
  // We only update the container rect.
  // We do NOT measure every dot.
  // ----------------------------------------------------------
  let rectFrame = 0;

  const updateContainerRect = () => {
    rectFrame = 0;

    containerRect =
      container.getBoundingClientRect();
  };

  const handleWindowScroll = () => {
    if (!rectFrame) {
      rectFrame = requestAnimationFrame(
        updateContainerRect
      );
    }
  };

  window.addEventListener(
    "scroll",
    handleWindowScroll,
    {
      passive: true,
    }
  );

  // ----------------------------------------------------------
  // Animation loop
  // ----------------------------------------------------------
  let animationFrame = 0;
  let running = false;

  const render = () => {
    animationFrame = requestAnimationFrame(render);

    const cursorX =
      cursor.x - containerRect.left;

    const cursorY =
      cursor.y - containerRect.top;

    let hasMovement = false;

    dots.forEach((_, index) => {
      const baseX = positions[index].x;
      const baseY = positions[index].y;

      let targetX = 0;
      let targetY = 0;

      // ------------------------------------------------------
      // CURSOR ACTIVE
      //
      // Direct target calculation.
      //
      // There is intentionally NO gsap.to() here.
      // This means:
      //
      // cursor moves
      //     ↓
      // dot target changes immediately
      //     ↓
      // no tween queue
      // no tween overwrite
      // no animation delay
      // ------------------------------------------------------
      if (cursor.active) {
        const dx =
          baseX - cursorX;

        const dy =
          baseY - cursorY;

        const distanceSquared =
          dx * dx + dy * dy;

        if (
          distanceSquared <
          radius * radius
        ) {
          const distance =
            Math.sqrt(
              distanceSquared
            );

          // Prevent division by zero.
          const safeDistance =
            Math.max(distance, 0.001);

          // Direction away from cursor.
          const directionX =
            dx / safeDistance;

          const directionY =
            dy / safeDistance;

          // Strong in the center.
          // Soft near the edge.
          const normalized =
            1 -
            Math.min(
              distance / radius,
              1
            );

          const force =
            normalized *
            normalized *
            (3 - 2 * normalized);

          targetX =
            directionX *
            maxStrength *
            force;

          targetY =
            directionY *
            maxStrength *
            force;
        }
      }

      // ------------------------------------------------------
      // ACTIVE CURSOR:
      //
      // Move almost directly toward target.
      //
      // This is what makes the magnetic field feel immediate
      // rather than delayed.
      // ------------------------------------------------------
      if (cursor.active) {
        const follow =
          0.88;

        current[index].x +=
          (targetX -
            current[index].x) *
          follow;

        current[index].y +=
          (targetY -
            current[index].y) *
          follow;

        // Kill tiny floating point noise.
        if (
          Math.abs(
            targetX -
              current[index].x
          ) < 0.005
        ) {
          current[index].x =
            targetX;
        }

        if (
          Math.abs(
            targetY -
              current[index].y
          ) < 0.005
        ) {
          current[index].y =
            targetY;
        }

        // Reset spring velocity while controlled
        // by the cursor.
        velocity[index].x = 0;
        velocity[index].y = 0;
      }

      // ------------------------------------------------------
      // CURSOR INACTIVE:
      //
      // Real spring return.
      //
      // Unlike gsap.elastic.out(), this doesn't create 512
      // separate tweens and doesn't abruptly stop the animation.
      // ------------------------------------------------------
      else {
        const forceX =
          -current[index].x *
          springStrength;

        const forceY =
          -current[index].y *
          springStrength;

        velocity[index].x =
          velocity[index].x *
            damping +
          forceX;

        velocity[index].y =
          velocity[index].y *
            damping +
          forceY;

        current[index].x +=
          velocity[index].x;

        current[index].y +=
          velocity[index].y;

        // Small movement threshold.
        if (
          Math.abs(current[index].x) <
            settleThreshold &&
          Math.abs(current[index].y) <
            settleThreshold &&
          Math.abs(velocity[index].x) <
            settleThreshold &&
          Math.abs(velocity[index].y) <
            settleThreshold
        ) {
          current[index].x = 0;
          current[index].y = 0;

          velocity[index].x = 0;
          velocity[index].y = 0;
        }
      }

      // ------------------------------------------------------
      // Write transform directly.
      // ------------------------------------------------------
      setX[index](current[index].x);
      setY[index](current[index].y);

      if (
        Math.abs(current[index].x) >
          settleThreshold ||
        Math.abs(current[index].y) >
          settleThreshold
      ) {
        hasMovement = true;
      }
    });

    // --------------------------------------------------------
    // Once the spring is completely settled and the cursor is
    // outside, stop the RAF.
    //
    // This saves CPU when nothing is happening.
    // --------------------------------------------------------
    if (
      !cursor.active &&
      !hasMovement
    ) {
      cancelAnimationFrame(
        animationFrame
      );

      animationFrame = 0;
      running = false;
    }
  };

  // ----------------------------------------------------------
  // Start the animation loop only when necessary.
  // ----------------------------------------------------------
  const startAnimation = () => {
    if (running) return;

    running = true;

    if (!animationFrame) {
      animationFrame =
        requestAnimationFrame(render);
    }
  };

  // ----------------------------------------------------------
  // Pointer move
  // ----------------------------------------------------------
  const handlePointerMove = (
    event: PointerEvent
  ) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    cursor.x = event.clientX;
    cursor.y = event.clientY;

    const rect =
      container.getBoundingClientRect();

    containerRect = rect;

    cursor.active =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    // Immediate animation start.
    startAnimation();
  };

  // ----------------------------------------------------------
  // Pointer enter
  // ----------------------------------------------------------
  const handlePointerEnter = (
    event: PointerEvent
  ) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    cursor.x = event.clientX;
    cursor.y = event.clientY;

    containerRect =
      container.getBoundingClientRect();

    cursor.active = true;

    startAnimation();
  };

  // ----------------------------------------------------------
  // Pointer leave
  // ----------------------------------------------------------
  const handlePointerLeave = () => {
    cursor.active = false;

    cursor.x = -9999;
    cursor.y = -9999;

    // Keep the animation running so the spring can finish
    // naturally. DO NOT kill it here.
    startAnimation();
  };

  // ----------------------------------------------------------
  // Pointer events
  // ----------------------------------------------------------
  container.addEventListener(
    "pointermove",
    handlePointerMove,
    { passive: true }
  );

  container.addEventListener(
    "pointerenter",
    handlePointerEnter,
    { passive: true }
  );

  container.addEventListener(
    "pointerleave",
    handlePointerLeave,
    { passive: true }
  );

  // ----------------------------------------------------------
  // Cleanup
  // ----------------------------------------------------------
  return () => {
    if (resizeTimer !== null) {
      window.clearTimeout(
        resizeTimer
      );
    }

    if (animationFrame) {
      cancelAnimationFrame(
        animationFrame
      );
    }

    if (rectFrame) {
      cancelAnimationFrame(
        rectFrame
      );
    }

    window.removeEventListener(
      "resize",
      handleResize
    );

    window.removeEventListener(
      "scroll",
      handleWindowScroll
    );

    container.removeEventListener(
      "pointermove",
      handlePointerMove
    );

    container.removeEventListener(
      "pointerenter",
      handlePointerEnter
    );

    container.removeEventListener(
      "pointerleave",
      handlePointerLeave
    );

    // Reset every dot.
    dots.forEach((_, index) => {
      current[index].x = 0;
      current[index].y = 0;
      velocity[index].x = 0;
      velocity[index].y = 0;

      setX[index](0);
      setY[index](0);
    });

    animationFrame = 0;
    rectFrame = 0;
    running = false;
  };
}, [prefersReducedMotion]);

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

  const heroRef = useRef<HTMLElement | null>(null);
const heroVideoRef = useRef<HTMLVideoElement | null>(null);
const heroContentRef = useRef<HTMLDivElement | null>(null);

useLayoutEffect(() => {
  const hero = heroRef.current;
  const video = heroVideoRef.current;
  const content = heroContentRef.current;

  if (!hero || !video || !content) return;

  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Desktop parallax only.
  // Mobile remains exactly as designed.
  if (
    !desktopQuery.matches ||
    reducedMotionQuery.matches
  ) {
    return;
  }

  const ctx = gsap.context(() => {
    // -------------------------------------------------------
    // INITIAL STATE
    // -------------------------------------------------------

    gsap.set(video, {
      scale: 1.2,
      y: 0,
      transformOrigin: "center center",
      force3D: true,
      willChange: "transform",
    });

    gsap.set(content, {
      y: 0,
      force3D: true,
      willChange: "transform",
    });

    // -------------------------------------------------------
    // SMOOTH PARALLAX CONTROLLERS
    // -------------------------------------------------------

    const moveVideo = gsap.quickTo(video, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    const moveContent = gsap.quickTo(content, "y", {
      duration: 0.3,
      ease: "power3.out",
    });

    let raf = 0;

    // -------------------------------------------------------
    // UPDATE PARALLAX
    // -------------------------------------------------------

    const updateParallax = () => {
      raf = 0;

      if (!hero || !video || !content) return;

      const rect = hero.getBoundingClientRect();
      const height = Math.max(
        hero.offsetHeight,
        1
      );

      /*
       * Only animate while the hero is near the viewport.
       * This prevents unnecessary calculations lower on
       * the page.
       */

      const viewportHeight =
        window.innerHeight;

      if (
        rect.bottom < -100 ||
        rect.top > viewportHeight + 100
      ) {
        return;
      }

      /*
       * Convert hero position into normalized progress.
       *
       * At the beginning:
       * progress = 0
       *
       * As the hero scrolls:
       * progress approaches 1
       */

      const progress = gsap.utils.clamp(
        0,
        1,
        -rect.top / height
      );

      // -----------------------------------------------------
      // BACKGROUND VIDEO
      // -----------------------------------------------------

      moveVideo(progress * 190);

      // -----------------------------------------------------
      // FOREGROUND CONTENT
      // -----------------------------------------------------

      moveContent(progress * -60);
    };

    // -------------------------------------------------------
    // RAF SCROLL HANDLER
    // -------------------------------------------------------

    const requestParallaxUpdate = () => {
      if (raf) return;

      raf = window.requestAnimationFrame(
        updateParallax
      );
    };

    // -------------------------------------------------------
    // SCROLL
    // -------------------------------------------------------

    window.addEventListener(
      "scroll",
      requestParallaxUpdate,
      { passive: true }
    );

    // -------------------------------------------------------
    // RESIZE
    // -------------------------------------------------------

    window.addEventListener(
      "resize",
      requestParallaxUpdate,
      { passive: true }
    );

    // -------------------------------------------------------
    // VIDEO LOAD
    //
    // Important for production/live deployment.
    // Once the video metadata is ready, recalculate the
    // hero position.
    // -------------------------------------------------------

    const handleVideoReady = () => {
      requestParallaxUpdate();
    };

    video.addEventListener(
      "loadedmetadata",
      handleVideoReady
    );

    video.addEventListener(
      "canplay",
      handleVideoReady
    );

    // -------------------------------------------------------
    // INITIAL POSITION
    // -------------------------------------------------------

    requestParallaxUpdate();

    // -------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------

    return () => {
      window.removeEventListener(
        "scroll",
        requestParallaxUpdate
      );

      window.removeEventListener(
        "resize",
        requestParallaxUpdate
      );

      video.removeEventListener(
        "loadedmetadata",
        handleVideoReady
      );

      video.removeEventListener(
        "canplay",
        handleVideoReady
      );

      if (raf) {
        window.cancelAnimationFrame(raf);
      }

      gsap.killTweensOf(video);
      gsap.killTweensOf(content);

      gsap.set(video, {
        clearProps: "transform,willChange",
      });

      gsap.set(content, {
        clearProps: "transform,willChange",
      });
    };
  }, hero);

  return () => {
    ctx.revert();
  };
}, []);

  return (
    <div className="min-h-screen pb-0" style={{ fontFamily: "'Artifika', serif" }}>

      {/* Brand announcement strip (between header and hero) */}
<section
  className={`brand-strip ${brandStripClass}`}
  role="region"
  aria-label="Bhoomika Beauty Parlour announcement"
>
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
<section
  ref={heroRef}
  className="
    relative flex
    min-h-[88svh]
    items-center
    overflow-hidden
    pt-20
    pb-8
    md:min-h-[80vh]
    md:pt-16
    md:pb-0
    lg:h-[88vh]
    lg:min-h-0
  "
>
  <div className="absolute inset-0 overflow-hidden">
    {/* Desktop Hero Video */}
    <video
      ref={heroVideoRef}
      className="hidden h-full w-full object-cover md:block"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={heroImage}
      aria-hidden="true"
    >
      <source
        src="/videos/be-zone-hero-desktop.mp4"
        type="video/mp4"
      />
    </video>

    {/* Mobile Hero Video */}
    <video
      className="
        block
        h-full
        w-full
        object-cover
        md:hidden
      "
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={heroImage}
      aria-hidden="true"
    >
      <source
        src="/videos/be-zone-hero-mobile.mp4"
        type="video/mp4"
      />
    </video>

    {/* Cinematic overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
  </div>

  {/* Hero Content */}
  <div
    ref={heroContentRef}
    className="
      container
      relative
      z-10
      mx-auto
      w-full
      px-5
      md:px-4
    "
  >
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        max-w-[92%]
        md:max-w-xl
      "
    >
      {/* Campaign label */}
      <span
        className="
          mb-5
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-secondary/30
          bg-secondary/10
          px-4
          py-1.5
          text-xs
          font-semibold
          uppercase
          tracking-[0.2em]
          text-secondary
          backdrop-blur-sm
          md:mb-5
        "
      >
        <span aria-hidden="true">✦</span>
        New Collection 2026
      </span>

      {/* Main headline */}
      <h1
        className="
          mb-4
          font-display
          text-[2.85rem]
          font-semibold
          leading-[0.98]
          tracking-[-0.02em]
          text-primary-foreground
          sm:text-6xl
          lg:text-7xl
          md:mb-3
        "
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        Discover Your
        <span className="block text-glow">Perfect Style</span>
      </h1>

      {/* Kannada brand statement */}
      <p
        className="
          animate-glow-fade
          mb-4
          font-display
          text-lg
          italic
          leading-relaxed
          text-primary-foreground/75
          sm:text-xl
          md:mb-3
        "
        style={{ animationDelay: "0.3s" }}
      >
        ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಶೈಲಿಯನ್ನು ಅನ್ವೇಷಿಸಿ
      </p>

      {/* Category line */}
      <p
        className="
          mb-4
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.2em]
          text-secondary/90
          sm:text-xs
          md:mb-3
          md:tracking-[0.25em]
        "
      >
        Beauty&nbsp;&nbsp;·&nbsp;&nbsp;Jewellery&nbsp;&nbsp;·&nbsp;&nbsp;Fashion&nbsp;&nbsp;·&nbsp;&nbsp;Self Care
      </p>

      {/* Supporting copy */}
      <p
        className="
          font-body
          mb-7
          max-w-[340px]
          text-[15px]
          leading-[1.6]
          text-primary-foreground/65
          sm:text-base
          md:mb-8
          md:max-w-md
        "
      >
        Curated collection of premium beauty, skincare, makeup & fashion —
        all at unbeatable prices.
      </p>

      {/* CTAs */}
      <div
        className="
          flex
          w-full
          flex-col
          gap-3
          sm:flex-row
          md:flex-wrap
        "
      >
        <Button
          asChild
          size="lg"
          className="
            gradient-nebula
            h-12
            w-full
            px-8
            text-foreground
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-xl
            sm:w-auto
          "
        >
          <Link to="/products">
            Shop Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="
            h-12
            w-full
            border-primary-foreground/30
            bg-transparent
            text-primary-foreground
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-primary-foreground/10
            sm:w-auto
          "
        >
          <Link to="/zodiac">Explore Collections</Link>
        </Button>
      </div>
    </motion.div>
  </div>

  {/* Minimal scroll cue — desktop only */}
  <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-primary-foreground/50 lg:flex">
    <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">
      Scroll to discover
    </span>

    <span className="h-8 w-px bg-primary-foreground/30" />
  </div>
</section>

      {/* Our Services */}
<section className="relative overflow-hidden pt-5 pb-9 sm:pt-6 sm:pb-10 lg:pt-7 lg:pb-12">
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
      transform-style: preserve-3d;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    .services-title-letter {
      display: inline-block;
      transform-style: preserve-3d;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      will-change: transform, opacity, filter;
    }

    .service-number {
      display: inline-block;
      min-width: 2ch;
      font-variant-numeric: tabular-nums;
      transform: translateZ(0);
      will-change: contents;
    }

    @media (prefers-reduced-motion: reduce) {
      .service-card,
      .service-background,
      .service-glow,
      .services-title-letter {
        transition: none !important;
        animation: none !important;
      }
    }
  `}</style>

  {/* ---------------------------------------------------------
    LUXURY VIGNETTE BACKGROUND
    Stronger Be-Zone luxury colour presence
    --------------------------------------------------------- */}
<motion.div
  className="pointer-events-none absolute inset-0 -z-10 service-background"
  animate={{
    background: `
      radial-gradient(
        85% 75% at 50% 0%,
        ${activeService.glow}55 0%,
        ${activeService.bg}F5 38%,
        ${activeService.bg}E8 68%,
        ${activeService.bg}D5 100%
      )
    `,
  }}
  transition={{
    duration: prefersReducedMotion ? 0.15 : 0.9,
    ease: [0.22, 1, 0.36, 1],
  }}
>
  {/* Stronger central luxury illumination */}
  <motion.div
    className="absolute inset-0"
    animate={{
      opacity: prefersReducedMotion ? 0.4 : 0.65,
    }}
    transition={{
      duration: prefersReducedMotion ? 0.1 : 0.8,
    }}
    style={{
      background: `
        radial-gradient(
          ellipse 75% 65% at 50% 20%,
          rgba(255,255,255,0.42) 0%,
          rgba(255,255,255,0.18) 35%,
          transparent 72%
        )
      `,
    }}
  />

  {/* Active-service colour wash */}
  <motion.div
    className="absolute inset-0"
    animate={{
      opacity: prefersReducedMotion ? 0.3 : 0.48,
    }}
    transition={{
      duration: prefersReducedMotion ? 0.1 : 0.9,
      ease: "easeInOut",
    }}
    style={{
      background: `
        radial-gradient(
          ellipse 90% 80% at 50% 45%,
          ${activeService.glow}45 0%,
          ${activeService.bg}25 42%,
          transparent 78%
        )
      `,
    }}
  />

  {/* Luxury warm Be-Zone glow */}
  <div
    className="absolute inset-0"
    style={{
      background: `
        radial-gradient(
          ellipse 70% 55% at 50% 35%,
          rgba(196,155,92,0.13),
          transparent 70%
        )
      `,
    }}
  />

  {/* Bottom vignette — keeps the section visually grounded */}
  <div
    className="absolute inset-x-0 bottom-0 h-[42%]"
    style={{
      background: `
        linear-gradient(
          to bottom,
          transparent 0%,
          ${activeService.bg}35 45%,
          ${activeService.bg}70 100%
        )
      `,
    }}
  />

  {/* Soft edge vignette */}
  <div
    className="absolute inset-0"
    style={{
      background: `
        radial-gradient(
          ellipse 100% 100% at 50% 50%,
          transparent 42%,
          ${activeService.bg}30 100%
        )
      `,
    }}
  />
</motion.div>

  <div className="container relative mx-auto px-4">

    {/* -------------------------------------------------------
        HEADING
       ------------------------------------------------------- */}
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      className="mb-6 text-center lg:mb-8"
    >
      <motion.span
        className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-xs"
        animate={{
          color: activeService.accent,
        }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.7,
          ease: "easeInOut",
        }}
      >
        The Be-Zone Experience
      </motion.span>

      {/* 3D GSAP title */}
      <motion.h2
        ref={servicesTitleRef}
        className="mb-2 font-display text-3xl font-semibold leading-none sm:text-4xl lg:text-5xl"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
        animate={{
          color: activeService.text,
        }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.7,
          ease: "easeInOut",
        }}
      >
        {"Our Services".split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="services-title-letter"
            style={{
              whiteSpace:
                char === " "
                  ? "pre"
                  : "normal",
            }}
          >
            {char === " "
              ? "\u00A0"
              : char}
          </span>
        ))}
      </motion.h2>

      <motion.p
        className="font-body text-sm leading-relaxed tracking-wide sm:text-base"
        animate={{
          color: activeService.muted,
        }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.7,
          ease: "easeInOut",
        }}
      >
        Premium beauty services crafted with care
      </motion.p>
    </motion.div>

    {/* =======================================================
        MOBILE
       ======================================================= */}
    <div className="md:hidden">
      <div
        ref={servicesScrollRef}
        onScroll={(e) =>
          handleServicesScroll(
            e.currentTarget
          )
        }
        className="services-scroll -mx-4 flex gap-3 overflow-x-auto px-[7.5vw] pb-2"
        style={{
          scrollSnapType: "x mandatory",
          scrollSnapStop: "always",
          scrollPaddingInline: "7.5vw",
          scrollBehavior:
            prefersReducedMotion
              ? "auto"
              : "smooth",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          touchAction: "auto",
        }}
      >
        {services.map((service, i) => {
          const p =
            serviceProgress[i] ??
            (i === activeServiceIndex
              ? 1
              : 0);

          const scale =
            prefersReducedMotion
              ? 1
              : 0.985 + p * 0.015;

          const opacity =
            prefersReducedMotion
              ? 1
              : 0.92 + p * 0.08;

          const blurPx =
            prefersReducedMotion
              ? 0
              : Math.min(
                  (1 - p) * 0.5,
                  0.5
                );

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
                animate={{
                  scale,
                  opacity,
                }}
                transition={{
                  duration:
                    prefersReducedMotion
                      ? 0.1
                      : 0.25,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                style={{
                  filter: `blur(${blurPx}px)`,
                  background:
                    service.surface,
                  borderColor:
                    service.border,
                  boxShadow:
                    p > 0.75
                      ? `0 22px 45px -20px ${service.glow}`
                      : "0 8px 22px -14px rgba(0,0,0,0.14)",
                }}
                className="relative flex min-h-[350px] flex-col rounded-2xl border p-6"
              >
                {/* Number + icon */}
                <div className="mb-5 flex items-start justify-between">
                  <span
                    className="service-number font-display text-4xl font-light leading-none"
                    data-target={parseInt(
                      service.number,
                      10
                    )}
                    style={{
                      color:
                        service.accent,
                      opacity: 0.68,
                    }}
                  >
                    00
                  </span>

                  <motion.div
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            scale: 1.1,
                            rotate: 5,
                            y: -2,
                          }
                    }
                    transition={{
                      duration: 0.3,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      background: `${service.accent}1F`,
                      color: service.accent,
                      boxShadow: `0 0 0 0 ${service.accent}00`,
                    }}
                  >
                    <service.icon className="h-5 w-5" />
                  </motion.div>
                </div>

                <span
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    color:
                      service.accent,
                  }}
                >
                  {service.label}
                </span>

                <h3
                  className="mb-3 font-display text-2xl font-semibold leading-tight"
                  style={{
                    color:
                      service.text,
                    fontFamily:
                      "'Cormorant Garamond', serif",
                  }}
                >
                  {service.name}
                </h3>

                <p
                  className="font-body mb-5 text-sm leading-relaxed"
                  style={{
                    color:
                      service.muted,
                  }}
                >
                  {service.desc}
                </p>

                <div
                  className="mt-auto h-px w-10"
                  style={{
                    background:
                      service.accent,
                  }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Premium mobile dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {services.map((service, i) => (
          <button
            key={service.name}
            type="button"
            aria-label={`Go to ${service.name}`}
            onClick={() =>
              scrollToService(
                i,
                servicesScrollRef.current
              )
            }
            className="group relative flex h-5 w-5 items-center justify-center"
          >
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width:
                  i === activeServiceIndex
                    ? 18
                    : 5,
                height: 5,
                background:
                  i === activeServiceIndex
                    ? service.accent
                    : `${service.accent}55`,
                boxShadow:
                  i === activeServiceIndex
                    ? `0 0 12px ${service.accent}55`
                    : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>

    {/* =======================================================
        DESKTOP
       ======================================================= */}
    <div className="hidden md:block">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-4">
        {services.map((service, i) => {
          const isHovered =
            activeServiceIndex === i;

          return (
            <div
              ref={(el) => {
                serviceTiltRefs.current[i] =
                  el;
              }}
              key={service.name}
              className="service-card min-w-0 will-change-transform"
              onMouseEnter={() => {
                if (!prefersReducedMotion) {
                  setActiveServiceIndex(i);
                }
              }}
            >
              <motion.div
                animate={{
                  // ALL CARDS ALWAYS FULLY VISIBLE
                  opacity: 1,

                  // Existing card hover animation preserved
                  scale: isHovered
                    ? 1
                    : 0.975,

                  y: isHovered
                    ? 0
                    : 5,

                  filter: "blur(0px)",
                }}
                transition={{
                  duration:
                    prefersReducedMotion
                      ? 0.1
                      : 0.5,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                style={{
                  background:
                    service.surface,
                  borderColor:
                    service.border,

                  boxShadow: isHovered
                    ? `0 25px 55px -22px ${service.glow}`
                    : "0 8px 20px -12px rgba(0,0,0,0.15)",

                  minHeight: 400,
                }}
                className="relative flex h-full flex-col rounded-2xl border p-6 lg:p-7"
              >
                {/* Number + icon */}
                <div className="mb-6 flex items-start justify-between">
                  <span
                    className="service-number font-display text-4xl font-light leading-none lg:text-5xl"
                    data-target={parseInt(
                      service.number,
                      10
                    )}
                    style={{
                      color:
                        service.accent,
                      opacity: 0.68,
                    }}
                  >
                    00
                  </span>

                  {/* Icon hover effect */}
                  <motion.div
                    animate={{
                      scale: isHovered
                        ? 1.1
                        : 1,
                      rotate: isHovered
                        ? 0
                        : -3,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            scale: 1.15,
                            rotate: 6,
                            y: -2,
                          }
                    }
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0.1
                          : 0.45,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full lg:h-12 lg:w-12"
                    style={{
                      background:
                        `${service.accent}1F`,
                      color:
                        service.accent,
                      boxShadow:
                        isHovered
                          ? `0 8px 24px -10px ${service.accent}`
                          : "none",
                    }}
                  >
                    <service.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </motion.div>
                </div>

                <span
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] lg:text-[11px]"
                  style={{
                    color:
                      service.accent,
                  }}
                >
                  {service.label}
                </span>

                <h3
                  className="mb-3 font-display text-2xl font-semibold leading-tight lg:text-[28px]"
                  style={{
                    color:
                      service.text,
                    fontFamily:
                      "'Cormorant Garamond', serif",
                  }}
                >
                  {service.name}
                </h3>

                <p
                  className="font-body mb-6 flex-1 text-sm leading-relaxed"
                  style={{
                    color:
                      service.muted,
                  }}
                >
                  {service.desc}
                </p>

                <motion.div
                  animate={{
                    width: isHovered
                      ? 56
                      : 40,
                  }}
                  transition={{
                    duration:
                      prefersReducedMotion
                        ? 0.1
                        : 0.45,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                  className="mb-5 h-px"
                  style={{
                    background:
                      service.accent,
                  }}
                />

                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color:
                      service.accent,
                  }}
                >
                  Explore Service
                  <ArrowRight className="h-3 w-3" />
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Premium desktop dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {services.map((service, i) => (
          <button
            key={service.name}
            type="button"
            aria-label={`Show ${service.name}`}
            onClick={() =>
              setActiveServiceIndex(i)
            }
            className="group flex h-5 w-5 items-center justify-center"
          >
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width:
                  i === activeServiceIndex
                    ? 20
                    : 5,
                height: 5,
                background:
                  i === activeServiceIndex
                    ? service.accent
                    : `${service.accent}55`,
                boxShadow:
                  i === activeServiceIndex
                    ? `0 0 14px ${service.accent}55`
                    : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Premium Categories */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2
              className="mb-2 font-display text-3xl font-semibold text-foreground sm:text-4xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}
            >
              Shop by Category
            </h2>
            <p className="font-body text-base leading-relaxed tracking-wide">Curated collections for every style</p>
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
              <Button asChild variant="ghost" size="sm" className="font-body text-sm font-medium text-secondary">
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
                <p className="font-body mt-1 text-lg text-muted-foreground">
  Curated picks loved by our customers
</p>
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
              <p className="font-body mt-1 text-xs text-muted-foreground">Hand-picked by our AI based on what shoppers love</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="font-body text-sm font-medium text-secondary">
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
              <p className="font-body mx-auto mb-8 max-w-md text-sm text-primary-foreground/60">
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
<section className="border-t border-border/50 pt-16 pb-2 lg:pt-20 lg:pb-3">
  <div className="container mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10 text-center"
    >
      <h2
        className="mb-2 font-display text-3xl font-semibold text-foreground sm:text-4xl"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        What Our Customers Say
      </h2>

      <p className="font-body text-sm text-muted-foreground">
        Real reviews from happy shoppers
      </p>
    </motion.div>

    {(() => {
      const reviews = [
        {
          name: "Priya S.",
          text: "Amazing quality products! The beauty combo was a steal. Will definitely order again.",
          rating: 5,
        },
        {
          name: "Rahul M.",
          text: "Fast delivery and great packaging. The accessories collection is stunning and premium.",
          rating: 5,
        },
        {
          name: "Anita K.",
          text: "Love the variety! From skincare to fashion, everything exceeded my expectations.",
          rating: 4,
        },
        {
          name: "Sneha R.",
          text: "The products look even better in person. Beautiful quality and everything arrived perfectly packed.",
          rating: 5,
        },
        {
          name: "Arjun P.",
          text: "Really smooth shopping experience. The prices are fair and delivery was quicker than expected.",
          rating: 5,
        },
        {
          name: "Kavya N.",
          text: "I ordered beauty essentials and was genuinely impressed with the quality. Will shop here again.",
          rating: 5,
        },
        {
          name: "Meera V.",
          text: "The collection feels carefully selected and premium. I found exactly what I was looking for.",
          rating: 5,
        },
        {
          name: "Rohan S.",
          text: "Excellent service from start to finish. Great packaging, fast delivery and lovely products.",
          rating: 5,
        },
        {
          name: "Divya A.",
          text: "Absolutely loved my order. The quality, presentation and attention to detail were wonderful.",
          rating: 5,
        },
        {
          name: "Nikhil K.",
          text: "A reliable place to shop for beauty and fashion essentials. Everything matched the description.",
          rating: 5,
        },
        {
          name: "Aishwarya M.",
          text: "Such a beautiful selection and a very easy shopping experience. The products feel genuinely premium.",
          rating: 5,
        },
      ];

      return (
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          }}
        >
          <style>{`
            @keyframes bezone-testimonials-loop {
              from {
                transform: translate3d(0, 0, 0);
              }

              to {
                transform: translate3d(-50%, 0, 0);
              }
            }

            .bezone-testimonials-track {
              width: max-content;
              animation-name: bezone-testimonials-loop;
              animation-duration: 55s;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              animation-play-state: running;
              will-change: transform;
              transform: translate3d(0, 0, 0);
              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;
              perspective: 1000px;
            }

            /*
             * IMPORTANT:
             * There is intentionally NO :hover pause here.
             *
             * The carousel must continue moving even when
             * the pointer is over a testimonial card.
             */

            .bezone-testimonials-track,
            .bezone-testimonials-track * {
              animation-play-state: running !important;
            }

            @media (prefers-reduced-motion: reduce) {
              .bezone-testimonials-track {
                animation: none;
                transform: none;
              }
            }
          `}</style>

          <div className="bezone-testimonials-track flex py-2">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="flex shrink-0 gap-5"
              >
                {reviews.map((review, i) => (
                  <article
                    key={`${group}-${review.name}-${i}`}
                    className="
                      w-[280px]
                      shrink-0
                      rounded-2xl
                      border
                      border-border/50
                      bg-card
                      p-6
                      shadow-sm
                      sm:w-[320px]
                    "
                  >
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${
                            j < review.rating
                              ? "fill-secondary text-secondary"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mb-4 min-h-[84px] text-sm leading-relaxed text-muted-foreground italic">
                      "{review.text}"
                    </p>

                    <p className="text-sm font-semibold text-foreground">
                      {review.name}
                    </p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    })()}
  </div>
</section>

    {/* Magnetic Repel Grid */}
<section className="relative overflow-hidden pt-0 pb-8 sm:pb-10 lg:pb-12">
  <div className="relative left-1/2 w-screen -translate-x-1/2">
    <div
      ref={magneticGridRef}
      className="
        magnetic-grid
        relative
        mx-auto
        h-[210px]
        w-full
        overflow-hidden
        border-y
        border-border/30
        bg-muted/10
        sm:h-[225px]
        lg:h-[245px]
      "
      aria-label="Interactive magnetic dot grid"
    >
      {/* Subtle background glow */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55),transparent_72%)]
        "
      />

      {/* Magnetic dot field */}
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(32, minmax(0, 1fr))",
          gridTemplateRows: "repeat(16, minmax(0, 1fr))",
          padding: "24px 22px",
        }}
      >
        {Array.from({ length: 512 }).map((_, i) => (
          <span
            key={i}
            className="
              magnetic-dot
              m-auto
              block
              h-[2px]
              w-[2px]
              rounded-full
              will-change-transform
            "
            style={{
              backgroundColor: "hsl(var(--foreground))",
              opacity: 0.38,
            }}
          />
        ))}
      </div>
    </div>
  </div>
</section>

      <VisitStudio />
  </div>
  );
};
export default Index;