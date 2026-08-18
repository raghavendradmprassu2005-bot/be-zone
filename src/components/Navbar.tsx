

import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  User,
  Shield,
  Home,
  Grid3X3,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import CategoryMegaMenu from './CategoryMegaMenu';
import SearchBar from './SearchBar';
import LuxuryFlower from './LuxuryFlower';

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  /* =========================================================
     SMOOTH TYPING + BACKSPACE TAGLINE ANIMATION

     Sequence:

     GLOW ON DEMAND
     ↓
     BACKSPACE
     ↓
     BEAUTY, YOUR WAY
     ↓
     BACKSPACE
     ↓
     ELEVATE YOUR STYLE
     ↓
     BACKSPACE
     ↓
     GLOW. STYLE. CONFIDENCE.
     ↓
     BACKSPACE
     ↓
     REPEAT

     Runs independently from scrolling/navigation.
  ========================================================= */

  const taglines = [
  'Glow on Demand',
  'Beauty, Your Way',
  'Elevate Your Style',
  'Discover Your Glow',
  'Style That Speaks',
  'Elegance, Every Day',
  'Your Beauty. Your Style.',
];

const [taglineIndex, setTaglineIndex] = useState(0);
const [typedTagline, setTypedTagline] = useState('');
const [isDeleting, setIsDeleting] = useState(false);

useEffect(() => {
  const currentTagline = taglines[taglineIndex];

  let delay = isDeleting ? 80 : 75;

  // Pause when the complete sentence is visible
  if (!isDeleting && typedTagline === currentTagline) {
    delay = 3800;
  }

  // Small pause after completely deleting
  if (isDeleting && typedTagline === '') {
    delay = 400;
  }

  const timer = window.setTimeout(() => {
    if (!isDeleting) {
      const nextText = currentTagline.slice(
        0,
        typedTagline.length + 1
      );

      setTypedTagline(nextText);

      if (nextText === currentTagline) {
        setIsDeleting(true);
      }
    } else {
      const nextText = currentTagline.slice(
        0,
        Math.max(0, typedTagline.length - 1)
      );

      setTypedTagline(nextText);

      if (nextText === '') {
        setIsDeleting(false);

        setTaglineIndex(
          (previousIndex) =>
            (previousIndex + 1) % taglines.length
        );
      }
    }
  }, delay);

  return () => {
    window.clearTimeout(timer);
  };
}, [typedTagline, isDeleting, taglineIndex]);


  /* =========================================================
     CONTINUOUS FLOWER ROTATION

     UNCHANGED
  ========================================================= */

  const { scrollY } = useScroll();

  const flowerRotation = useTransform(
    scrollY,
    (value) => value * 0.36
  );

  const smoothFlowerRotation = useSpring(
    flowerRotation,
    {
      stiffness: 80,
      damping: 18,
      mass: 0.5,
    }
  );


  /* =========================================================
     NAVBAR SCROLL EFFECT

     ONLY SCROLL STATE IS KEPT.
     BACKGROUND IS NOW ALWAYS SOLID WHITE.
  ========================================================= */

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handler, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, []);


  /* =========================================================
     CLOSE MOBILE MENU WHEN ROUTE CHANGES

     UNCHANGED
  ========================================================= */

  useEffect(() => {
    setMobileOpen(false);
    setMegaMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);


  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];


  return (
    <>
      {/* =====================================================
          TOP NAVBAR

          SOLID WHITE BACKGROUND
          NO GLASS
          NO BLUR
          NO TRANSPARENCY
          NO GRADIENT
      ===================================================== */}

      <nav
        className="
          fixed
          top-0
          left-0
          right-0
          z-50
          border-b
          border-[#E8E5DF]
          bg-white
          shadow-sm
        "
      >

        {/* ===================================================
            MAIN HEADER
        =================================================== */}

        <div
          className="
            container
            mx-auto
            flex
            items-center
            justify-between
            px-4
            py-3
            lg:py-4
          "
        >

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="
              relative
              flex
              flex-col
              items-start
              shrink-0
              select-none
            "
          >

            {/* =================================================
                BE-ZONE

                B = GOLD
                e-Zone = DEEP BLACK
            ================================================= */}

            <span
              className="
                font-display
                text-2xl
                font-semibold
                tracking-wide
                leading-none
                whitespace-nowrap
              "
              style={{
                color: '#111111',
              }}
            >
              <span
                style={{
                  color: '#C4921A',
                  fontWeight: 600,
                }}
              >
                B
              </span>

              <span
                style={{
                  color: '#111111',
                }}
              >
                e-Zone
              </span>
            </span>


            {/* =================================================
                ANIMATED TAGLINE
            ================================================= */}

            <span
  className="
    mt-1
    flex
    h-[15px]
    w-[180px]
    items-center
    overflow-hidden
    text-[10px]
    font-body
    font-medium
    uppercase
    tracking-[0.22em]
    whitespace-nowrap
  "
  style={{
    color: '#6B6B6B',
  }}
>
  <span className="truncate">
    {typedTagline}
  </span>

  {/* Elegant typing cursor */}

  <motion.span
    animate={{
      opacity: [1, 0, 1],
    }}
    transition={{
      duration: 0.7,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className="
      ml-[3px]
      inline-block
      h-[10px]
      w-[1px]
      shrink-0
      bg-[#C4921A]
    "
  />
</span>

          </Link>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden items-center gap-8 md:flex md:ml-8 lg:ml-12">

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}

                {location.pathname === link.to && (
                  <motion.div
                    layoutId="activeNav"
                    className="
                      absolute
                      -bottom-1
                      left-0
                      right-0
                      h-0.5
                      rounded-full
                      bg-secondary
                    "
                  />
                )}
              </Link>
            ))}


            {/* Categories */}

            <button
              onMouseEnter={() => setMegaMenuOpen(true)}
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="
                flex
                items-center
                gap-1
                text-sm
                font-medium
                tracking-wide
                text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              Categories

              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  megaMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>


            {/* Collections */}

            <Link
              to="/zodiac"
              className={`relative text-sm font-medium tracking-wide transition-colors ${
                location.pathname === '/zodiac'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Collections

              {location.pathname === '/zodiac' && (
                <motion.div
                  layoutId="activeNav"
                  className="
                    absolute
                    -bottom-1
                    left-0
                    right-0
                    h-0.5
                    rounded-full
                    bg-secondary
                  "
                />
              )}
            </Link>


            {/* Admin */}

            {isAdmin && (
              <Link
                to="/admin"
                className="
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-medium
                  text-secondary
                  transition-colors
                  hover:text-secondary/80
                "
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

          </div>


          {/* =================================================
              RIGHT SIDE ACTIONS
          ================================================= */}

          <div className="ml-auto flex items-center gap-1">

            {/* =================================================
                MOBILE FLOWER

                COMPLETELY UNCHANGED
            ================================================= */}

            <motion.div
              style={{
                rotate: smoothFlowerRotation,
              }}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                text-[#C4921A]
                md:hidden
              "
              aria-hidden="true"
            >
              <LuxuryFlower />
            </motion.div>


            {/* =================================================
    SEARCH BAR
    PREMIUM SMOOTH EXPANSION
================================================= */}

<AnimatePresence mode="wait">
  {searchOpen && (
    <motion.div
      initial={{
        width: 0,
        opacity: 0,
        x: 12,
        scale: 0.96,
      }}
      animate={{
        width: 280,
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        width: 0,
        opacity: 0,
        x: 12,
        scale: 0.96,
      }}
      transition={{
        width: {
          type: 'spring',
          stiffness: 420,
          damping: 32,
          mass: 0.7,
        },
        opacity: {
          duration: 0.18,
        },
        x: {
          type: 'spring',
          stiffness: 420,
          damping: 30,
        },
        scale: {
          type: 'spring',
          stiffness: 420,
          damping: 30,
        },
      }}
      className="
        absolute
        right-14
        top-full
        z-[60]
        mt-2
        overflow-visible
        md:relative
        md:right-auto
        md:top-auto
        md:mt-0
        md:z-auto
      "
    >
      <SearchBar
        placeholder="Search products…"
        inputClassName="
          h-9
          bg-white
          text-sm
          border
          border-[#E5E1D8]
          shadow-[0_6px_20px_rgba(0,0,0,0.08)]
          focus-visible:ring-1
          focus-visible:ring-[#C4921A]/30
        "
        autoFocus
        onSelect={() => setSearchOpen(false)}
      />
    </motion.div>
  )}
</AnimatePresence>


{/* =================================================
    SEARCH BUTTON
    CLEAN + SMOOTH ICON ANIMATION
================================================= */}

<Button
  variant="ghost"
  size="icon"
  onClick={() => setSearchOpen(!searchOpen)}
  className="
    relative
    h-9
    w-9
    shrink-0
    bg-transparent
    text-muted-foreground

    hover:bg-transparent
    hover:text-[#C4921A]

    focus:bg-transparent
    focus:text-muted-foreground

    focus-visible:bg-transparent
    focus-visible:text-muted-foreground
    focus-visible:ring-0
    focus-visible:ring-offset-0

    active:bg-transparent
    active:text-muted-foreground

    transition-colors
    duration-200
  "
>
  <AnimatePresence mode="wait" initial={false}>
    {searchOpen ? (
      <motion.span
        key="close"
        initial={{
          opacity: 0,
          rotate: -90,
          scale: 0.65,
        }}
        animate={{
          opacity: 1,
          rotate: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          rotate: 90,
          scale: 0.65,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 25,
        }}
        className="flex items-center justify-center"
      >
        <X className="h-[18px] w-[18px]" />
      </motion.span>
    ) : (
      <motion.span
        key="search"
        initial={{
          opacity: 0,
          rotate: 90,
          scale: 0.65,
        }}
        animate={{
          opacity: 1,
          rotate: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          rotate: -90,
          scale: 0.65,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 25,
        }}
        className="flex items-center justify-center"
      >
        <Search className="h-[18px] w-[18px]" />
      </motion.span>
    )}
  </AnimatePresence>
</Button>


            {/* =================================================
                DESKTOP ACTIONS
            ================================================= */}

            <div className="hidden items-center gap-1 md:flex">

              {/* Wishlist */}

              <Link to="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    h-9
                    w-9
                    text-muted-foreground
                    hover:text-foreground
                  "
                >
                  <Heart className="h-[18px] w-[18px]" />
                </Button>
              </Link>


              {/* Cart */}

              <Button
                variant="ghost"
                size="icon"
                className="
                  relative
                  h-9
                  w-9
                  text-muted-foreground
                  hover:text-foreground
                "
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />

                {totalItems > 0 && (
                  <span
                    className="
                      absolute
                      -right-0.5
                      -top-0.5
                      flex
                      h-[18px]
                      w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      bg-secondary
                      text-[10px]
                      font-bold
                      text-secondary-foreground
                    "
                  >
                    {totalItems}
                  </span>
                )}
              </Button>


              {/* Profile */}

              <Link to={user ? '/profile' : '/auth'}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    h-9
                    w-9
                    text-muted-foreground
                    hover:text-foreground
                  "
                >
                  <User className="h-[18px] w-[18px]" />
                </Button>
              </Link>

            </div>


            {/* =================================================
                MOBILE MENU
            ================================================= */}

            <Button
              variant="ghost"
              size="icon"
              className="
                h-9
                w-9
                shrink-0
                text-muted-foreground
                hover:text-foreground
                md:hidden
              "
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

          </div>

        </div>


        {/* =====================================================
            MEGA MENU
        ===================================================== */}

        <CategoryMegaMenu
          open={megaMenuOpen}
          onClose={() => setMegaMenuOpen(false)}
        />


        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: 'auto',
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              className="
                overflow-hidden
                border-t
                border-border/50
                bg-white
                md:hidden
              "
            >
              <div
                className="
                  container
                  mx-auto
                  flex
                  flex-col
                  gap-1
                  px-4
                  py-4
                "
              >

                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'bg-secondary/5 text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}


                <Link
                  to="/products"
                  className="
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-muted-foreground
                  "
                >
                  Categories
                </Link>


                <Link
                  to="/zodiac"
                  className="
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-muted-foreground
                  "
                >
                  Collections
                </Link>


                <Link
                  to={user ? '/profile' : '/auth'}
                  className="
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-muted-foregroud
                   "                   
                >
                  {user ? '/profile': 'sign in'}
                  </Link>

              </div>

         </motion.div>
      )}
     </AnimatePresence>

</nav>
      {/* =======================================================
          MOBILE BOTTOM NAVIGATION

          UNCHANGED
      ======================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-lg md:hidden">

        <div className="flex items-center justify-around py-2">

          {/* Home */}

          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === '/'
                ? 'text-secondary'
                : 'text-muted-foreground'
            }`}
          >
            <Home className="h-5 w-5" />

            <span className="text-[10px] font-medium">
              Home
            </span>
          </Link>


          {/* Shop */}

          <Link
            to="/products"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === '/products'
                ? 'text-secondary'
                : 'text-muted-foreground'
            }`}
          >
            <Grid3X3 className="h-5 w-5" />

            <span className="text-[10px] font-medium">
              Shop
            </span>
          </Link>


          {/* Cart */}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
          >
            <ShoppingCart className="h-5 w-5" />

            {totalItems > 0 && (
              <span className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground">
                {totalItems}
              </span>
            )}

            <span className="text-[10px] font-medium">
              Cart
            </span>
          </button>


          {/* Wishlist */}

          <Link
            to="/wishlist"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === '/wishlist'
                ? 'text-secondary'
                : 'text-muted-foreground'
            }`}
          >
            <Heart className="h-5 w-5" />

            <span className="text-[10px] font-medium">
              Wishlist
            </span>
          </Link>


          {/* Profile / Login */}

          <Link
            to={user ? '/profile' : '/auth'}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === '/profile' ||
              location.pathname === '/auth'
                ? 'text-secondary'
                : 'text-muted-foreground'
            }`}
          >
            <User className="h-5 w-5" />

            <span className="text-[10px] font-medium">
              {user ? 'Profile' : 'Login'}
            </span>
          </Link>

        </div>

      </div>

    </>
  );
};

export default Navbar;