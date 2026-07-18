import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, User, Shield, Home, Grid3X3, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryMegaMenu from './CategoryMegaMenu';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setMegaMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-lg shadow-sm border-b border-border/50' : 'bg-background/80 backdrop-blur-md'}`}>
        <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:py-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <span className="font-display text-2xl font-semibold tracking-wide text-foreground">Be-Zone</span>
            <span className="text-[10px] font-body uppercase tracking-[0.25em] text-muted-foreground">Glow on Demand</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium tracking-wide transition-colors ${location.pathname === link.to ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-secondary" />
                )}
              </Link>
            ))}
            <button
              onMouseEnter={() => setMegaMenuOpen(true)}
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="flex items-center gap-1 text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Categories <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <Link
              to="/zodiac"
              className={`relative text-sm font-medium tracking-wide transition-colors ${location.pathname === '/zodiac' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Collections
              {location.pathname === '/zodiac' && (
                <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-secondary" />
              )}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-secondary/80">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-visible"
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
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <Heart className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
            <Link to={user ? '/profile' : '/auth'}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <User className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mega Menu */}
        <CategoryMegaMenu open={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} />

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/50 bg-background md:hidden"
            >
              <div className="container mx-auto flex flex-col gap-1 px-4 py-4">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-secondary/5 text-foreground' : 'text-muted-foreground'}`}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/products" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground">Categories</Link>
                <Link to="/zodiac" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground">Collections</Link>
                <Link to={user ? '/profile' : '/auth'} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground">
                  {user ? 'Profile' : 'Sign In'}
                </Link>
                {isAdmin && <Link to="/admin" className="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary">Admin Panel</Link>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${location.pathname === '/' ? 'text-secondary' : 'text-muted-foreground'}`}>
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/products" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${location.pathname === '/products' ? 'text-secondary' : 'text-muted-foreground'}`}>
            <Grid3X3 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </Link>
          <button onClick={() => setIsCartOpen(true)} className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground">{totalItems}</span>
            )}
            <span className="text-[10px] font-medium">Cart</span>
          </button>
          <Link to="/wishlist" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${location.pathname === '/wishlist' ? 'text-secondary' : 'text-muted-foreground'}`}>
            <Heart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>
          <Link to={user ? '/profile' : '/auth'} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${location.pathname === '/profile' || location.pathname === '/auth' ? 'text-secondary' : 'text-muted-foreground'}`}>
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">{user ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
