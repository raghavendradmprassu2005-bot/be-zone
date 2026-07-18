import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/hooks/useSearch';

interface SearchBarProps {
  /** Controlled value — when provided the parent owns the query string */
  value?: string;
  /** Called on every keystroke when used in controlled mode */
  onChange?: (value: string) => void;
  /** Called when a suggestion is selected (e.g. lets Navbar close itself) */
  onSelect?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

/**
 * Reusable search bar with live Supabase-powered suggestions.
 *
 * Uncontrolled (Navbar): omit `value` / `onChange` — manages its own query.
 * Controlled  (Products page): pass `value` + `onChange` to sync with page state.
 *
 * Suggestions use onMouseDown + preventDefault so the input never blurs before
 * the click registers — fixes the classic "dropdown closes before click" race.
 */
const SearchBar = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search products…',
  className,
  inputClassName,
  autoFocus,
}: SearchBarProps) => {
  const navigate = useNavigate();
  const [internalQuery, setInternalQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Controlled vs uncontrolled
  const isControlled = value !== undefined;
  const query = isControlled ? value : internalQuery;

  const setQuery = (q: string) => {
    if (isControlled) {
      onChange?.(q);
    } else {
      setInternalQuery(q);
    }
  };

  const { results, isLoading } = useSearch(query);

  // Open / close dropdown based on query length and results
  useEffect(() => {
    setDropdownOpen(query.trim().length >= 2);
  }, [query, results]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    setQuery('');
    setDropdownOpen(false);
    navigate(`/product/${id}`);
    onSelect?.();
  };

  const clear = () => {
    setQuery('');
    setDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setDropdownOpen(false);
      onSelect?.();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* Input row */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`pl-9 ${query ? 'pr-8' : ''} ${inputClassName ?? ''}`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-[70] mt-1.5 overflow-hidden rounded-xl border border-border/50 bg-background shadow-premium-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                Searching…
              </div>
            ) : results.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto py-1">
                {results.map((product) => (
                  <li key={product.id}>
                    {/* onMouseDown + preventDefault prevents input blur before click fires */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelect(product.id); }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                    >
                      {/* Thumbnail */}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-base">✨</div>
                        )}
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="truncate text-xs capitalize text-muted-foreground">
                          {product.category.replace(/-/g, ' ')}
                        </p>
                      </div>

                      {/* Price */}
                      <span className="shrink-0 text-sm font-semibold text-foreground">₹{product.price}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No products found for{' '}
                <span className="font-medium text-foreground">"{query}"</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
