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
  type LucideIcon,
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
     🟢 TOP NAVBAR CUSTOMIZATION
     Change ONLY these values if you want to customize
     the outer navbar appearance.
  ========================================================= */

  // 🟢 CHANGE HERE: Gap from top of the screen
  const NAVBAR_TOP_GAP = '12px';

  // 🟢 CHANGE HERE: Gap from left and right edges
  const NAVBAR_SIDE_GAP = '5%';

  // 🟢 CHANGE HERE: Border radius
  // Smaller = less rounded
  // Larger = more rounded
  const NAVBAR_RADIUS = '15px';

  // 🟢 CHANGE HERE: Border color
  const NAVBAR_BORDER_COLOR = 'rgba(255, 255, 255, 0.18)';

  // 🟢 CHANGE HERE: Border thickness
  const NAVBAR_BORDER_WIDTH = '1px';

  // 🟢 CHANGE HERE: Navbar background
  // Kept exactly as your current navbar background.
  const NAVBAR_BACKGROUND = '#F8F5EE';

  // 🟢 CHANGE HERE: Very subtle shadow
  // Set to 'none' if you want no shadow.
  const NAVBAR_SHADOW =
    '0 4px 18px rgba(0, 0, 0, 0.06)';

  /* =========================================================
     🟢 B COLOR / CONTRAST
     
     mix-blend-mode: difference makes the B automatically
     react to whatever is visually behind it.

     White behind B → dark B
     Dark behind B → light B
     Complex background → contrast automatically changes
  ========================================================= */

  const logoBStyle = {
    color: '#FFFFFF',
    fontWeight: 600,
    mixBlendMode: 'difference' as const,
  };

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

     KEPT
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

  /* =========================================================
     🆕 MOBILE BOTTOM NAV — ACTIVE ITEM TRACKING

     Drives the traveling active dot + icon lift animation.
     Route-backed items (Home / Shop / Profile) sync from the
     URL automatically. Items with no route of their own
     (the center "B" placeholder, and Cart which opens a
     drawer rather than navigating) are set directly on tap.
     This block only affects the bottom mobile nav — nothing
     above it was touched.
  ========================================================= */

  const getActiveIdFromPath = (pathname: string) => {
    if (pathname === '/') return 'home';
    if (pathname === '/products') return 'shop';
    if (pathname === '/profile' || pathname === '/auth') return 'profile';
    return null;
  };

  const [activeMobileId, setActiveMobileId] = useState(
    () => getActiveIdFromPath(location.pathname) ?? 'home'
  );

  useEffect(() => {
    const routeActive = getActiveIdFromPath(location.pathname);
    if (routeActive) {
      setActiveMobileId(routeActive);
    }
  }, [location.pathname]);

  type MobileNavItem = {
    id: 'home' | 'shop' | 'b' | 'cart' | 'profile';
    kind: 'link' | 'button';
    to?: string;
    icon?: LucideIcon;
    label: string;
    special?: boolean;
    onClick?: () => void;
  };

  const mobileNavItems: MobileNavItem[] = [
    { id: 'home', kind: 'link', to: '/', icon: Home, label: 'Home' },
    { id: 'shop', kind: 'link', to: '/products', icon: Grid3X3, label: 'Shop' },
    { id: 'b', kind: 'button', special: true, label: 'B' },
    {
      id: 'cart',
      kind: 'button',
      icon: ShoppingCart,
      label: 'Cart',
      onClick: () => setIsCartOpen(true),
    },
    {
      id: 'profile',
      kind: 'link',
      to: user ? '/profile' : '/auth',
      icon: User,
      label: user ? 'Profile' : 'Login',
    },
  ];

  return (
    <>
      {/* =====================================================
          TOP NAVBAR

          🟢 OUTER POSITION / BORDER / RADIUS / BACKGROUND
          These values are controlled above.
          
          IMPORTANT:
          Bottom mobile navigation is NOT changed.
      ===================================================== */}

      <nav
        className="
          fixed
          z-50
          overflow-visible
        "
        style={{
          top: NAVBAR_TOP_GAP,
          left: NAVBAR_SIDE_GAP,
          right: NAVBAR_SIDE_GAP,

          // 🟢 CHANGE HERE: Navbar background
          background: NAVBAR_BACKGROUND,

          // 🟢 CHANGE HERE: Thin premium border
          border: `${NAVBAR_BORDER_WIDTH} solid ${NAVBAR_BORDER_COLOR}`,

          // 🟢 CHANGE HERE: Corner radius
          borderRadius: NAVBAR_RADIUS,

          // 🟢 CHANGE HERE: Soft shadow
          boxShadow: NAVBAR_SHADOW,

          // Keeps the navbar above page content
          zIndex: 50,
        }}
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
            py-2
            lg:py-2.5
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
              shrink-0
              select-none
              flex-col
              items-start
            "
          >

            {/* =================================================
                BE-ZONE

                🟢 B automatically contrasts with background.

                e-Zone remains your existing dark color.
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

              {/* 🟢 AUTOMATIC CONTRAST B */}

              <span style={logoBStyle}>
                B
              </span>

              {/* 🟢 CHANGE HERE: e-Zone color */}

              <span
                style={{
                  color: '#111111',
                }}
              >
                e-Zone
              </span>

            </span>

          </Link>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden items-center gap-8 md:ml-8 md:flex lg:ml-12">

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
              onClick={() =>
                setMegaMenuOpen(!megaMenuOpen)
              }
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

                UNCHANGED
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

                UNCHANGED
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
                    onSelect={() =>
                      setSearchOpen(false)
                    }
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
              onClick={() =>
                setSearchOpen(!searchOpen)
              }
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
              <AnimatePresence
                mode="wait"
                initial={false}
              >
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
                onClick={() =>
                  setIsCartOpen(true)
                }
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

              <Link
                to={user ? '/profile' : '/auth'}
              >
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
              onClick={() =>
                setMobileOpen(!mobileOpen)
              }
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

            UNCHANGED
        ===================================================== */}

        <CategoryMegaMenu
          open={megaMenuOpen}
          onClose={() =>
            setMegaMenuOpen(false)
          }
        />


        {/* =====================================================
            MOBILE MENU

            PART OF TOP NAVBAR - UNCHANGED
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
                    text-muted-foreground
                  "
                >
                  {user ? '/profile' : 'sign in'}
                </Link>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>


      {/* =======================================================
          MOBILE BOTTOM NAVIGATION

          🆕 UPDATED: Home — Shop — B — Cart — Profile
          Wishlist removed. Traveling active dot (layoutId)
          + spring-based icon lift on the selected item.
          Existing routes/handlers for Home, Shop, Cart and
          Profile are untouched — only the visuals + the
          B placeholder are new. Admin pill preserved as-is.
      ======================================================= */}

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-lg md:hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >

        <div className="flex items-stretch justify-around py-2">

          {mobileNavItems.map((item) => {
            const isActive = activeMobileId === item.id;
            const Icon = 'icon' in item ? item.icon : null;

            const iconBlock = (
              <motion.div
                className="relative flex flex-col items-center gap-0.5 px-3 py-1"
                animate={{
                  y: isActive ? -3 : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 22,
                  mass: 0.6,
                }}
                whileTap={{ scale: isActive ? 1.04 : 0.94 }}
              >
                {/* Traveling active dot — shared layoutId slides between items */}
                {isActive && (
                  <motion.span
                    layoutId="mobileActiveDot"
                    className="absolute -top-1.5 h-1.5 w-1.5 rounded-full bg-[#C4921A]"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32,
                      mass: 0.5,
                    }}
                  />
                )}

                {item.special ? (
                  // Center "B" — premium placeholder, reuses the
                  // existing gold accent. No functionality yet.
                  <span
  className={`
    relative
    flex
    h-8
    w-8
    items-center
    justify-center
    rounded-full
    transition-all
    duration-300
    ${
      isActive
        ? 'bg-[#C4921A]/10'
        : 'bg-[#C4921A]/5'
    }
  `}
>
  {/* Premium outer ring */}
  <span
    className={`
      absolute
      inset-0
      rounded-full
      border
      transition-all
      duration-300
      ${
        isActive
          ? 'border-[#C4921A]'
          : 'border-[#C4921A]/30'
      }
    `}
  />

  {/* Premium B mark */}
  <span
    className={`
      relative
      font-display
      text-[17px]
      font-bold
      leading-none
      tracking-[-0.08em]
      transition-all
      duration-300
      ${
        isActive
          ? 'text-[#C4921A]'
          : 'text-[#C4921A]/75'
      }
    `}
  >
    B
  </span>

  {/* Small highlight */}
  {isActive && (
    <span
      className="
        pointer-events-none
        absolute
        inset-[2px]
        rounded-full
        border
        border-[#E0B85A]/20
      "
    />
  )}
</span>
                ) : (
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    {Icon && (
                      <Icon
                        className={`h-5 w-5 transition-colors ${
                          isActive ? 'text-[#C4921A]' : 'text-muted-foreground'
                        }`}
                      />
                    )}

                    {item.id === 'cart' && totalItems > 0 && (
                      <span
                        className="
                          absolute
                          -top-1.5
                          -right-2
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-secondary
                          text-[9px]
                          font-bold
                          text-secondary-foreground
                        "
                      >
                        {totalItems}
                      </span>
                    )}
                  </span>
                )}

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-[#C4921A]' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            );

            if (item.kind === 'link') {
              return (
                <Link
                  key={item.id}
                  to={item.to ?? '/'}
                  onClick={() => setActiveMobileId(item.id)}
                  className="flex flex-1 items-center justify-center"
                >
                  {iconBlock}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMobileId(item.id);
                  item.onClick?.();
                }}
                className="flex flex-1 items-center justify-center"
              >
                {iconBlock}
              </button>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className="
                rounded-lg
                px-3
                py-2.5
                text-sm
                font-medium
                text-secondary
              "
            >
              Admin Panel
            </Link>
          )}

        </div>

      </div>

    </>
  );
};

export default Navbar;