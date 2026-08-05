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
     CONTINUOUS FLOWER ROTATION

     IMPORTANT:
     Do NOT use [0, 1000] -> [0, 360].

     That causes the rotation to stop after a certain amount
     of scrolling.

     Instead, rotation is calculated from the COMPLETE
     scrollY value.

     Every 1000px of scrolling = 360 degrees.

     So:
       0px     = 0°
       500px   = 180°
       1000px  = 360°
       2000px  = 720°
       3000px  = 1080°
       Footer   = keeps rotating

     When user scrolls upward, it automatically rotates
     backward because scrollY decreases.
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
      ===================================================== */}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-lg shadow-sm border-b border-border/50'
            : 'bg-background/80 backdrop-blur-md'
        }`}
      >

        {/* ===================================================
            MAIN HEADER
        =================================================== */}

        <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:py-4">

          {/* =================================================
              LOGO

              MOBILE:

              Be-Zone       ✿   🔍   ☰
              Glow on Demand
          ================================================= */}

          <Link
            to="/"
            className="flex flex-col items-start shrink-0"
          >
            <span className="font-display text-2xl font-semibold tracking-wide text-foreground">
              Be-Zone
            </span>

            <span className="text-[10px] font-body uppercase tracking-[0.25em] text-muted-foreground">
              Glow on Demand
            </span>
          </Link>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden items-center gap-8 md:flex">

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
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-secondary"
                  />
                )}
              </Link>
            ))}


            {/* Categories */}

            <button
              onMouseEnter={() => setMegaMenuOpen(true)}
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="flex items-center gap-1 text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
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
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-secondary"
                />
              )}
            </Link>


            {/* Admin */}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

          </div>


          {/* =================================================
              RIGHT SIDE ACTIONS

              MOBILE:

              Be-Zone       ✿   🔍   ☰
              Glow on Demand

              FLOWER IS BEFORE SEARCH.
          ================================================= */}

          <div className="ml-auto flex items-center gap-1">

            {/* =================================================
                MOBILE FLOWER

                This is intentionally placed BEFORE Search.

                The flower stays in the header position and
                continuously rotates according to page scroll.
            ================================================= */}

            <motion.div
              style={{
                rotate: smoothFlowerRotation,
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-[#C4921A] md:hidden"
              aria-hidden="true"
            >
              <LuxuryFlower />
            </motion.div>


            {/* =================================================
                SEARCH BAR

                Desktop:
                Expands normally.

                Mobile:
                Search results are allowed to appear without
                pushing the flower/menu out of position.
            ================================================= */}

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{
                    width: 0,
                    opacity: 0,
                  }}
                  animate={{
                    width: 280,
                    opacity: 1,
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: 'easeOut',
                  }}
                  className="absolute right-14 top-full mt-2 z-[60] overflow-visible md:relative md:right-auto md:top-auto md:mt-0 md:z-auto"
                >
                  <SearchBar
                    placeholder="Search products…"
                    inputClassName="h-9 bg-muted/50 text-sm"
                    autoFocus
                    onSelect={() => setSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>


            {/* =================================================
                SEARCH BUTTON
            ================================================= */}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            >
              {searchOpen ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Search className="h-[18px] w-[18px]" />
              )}
            </Button>


            {/* =================================================
                DESKTOP ONLY

                Wishlist
                Cart
                Profile
            ================================================= */}

            <div className="hidden items-center gap-1 md:flex">

              {/* Wishlist */}

              <Link to="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Heart className="h-[18px] w-[18px]" />
                </Button>
              </Link>


              {/* Cart */}

              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />

                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>


              {/* Profile */}

              <Link to={user ? '/profile' : '/auth'}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
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
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:hidden"
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
              className="overflow-hidden border-t border-border/50 bg-background md:hidden"
            >
              <div className="container mx-auto flex flex-col gap-1 px-4 py-4">

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
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  Categories
                </Link>


                <Link
                  to="/zodiac"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  Collections
                </Link>


                <Link
                  to={user ? '/profile' : '/auth'}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  {user ? 'Profile' : 'Sign In'}
                </Link>


                {isAdmin && (
                  <Link
                    to="/admin"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary"
                  >
                    Admin Panel
                  </Link>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>


      {/* =======================================================
          MOBILE BOTTOM NAVIGATION
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