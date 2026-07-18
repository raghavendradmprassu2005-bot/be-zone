import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { CATEGORIES, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as Category | null;
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('popularity');
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: products = [], isLoading } = useProducts();

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 10000), [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter(p => p.category === selectedCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return result;
  }, [products, selectedCategory, sortBy, search, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearch('');
    setPriceRange([0, maxPrice]);
    setSortBy('popularity');
  };

  const hasActiveFilters = selectedCategory !== 'all' || search || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="min-h-screen pb-16 pt-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-3xl font-bold text-foreground lg:text-4xl">All Products</h1>
          <p className="mb-6 text-sm text-muted-foreground">{filtered.length} products found</p>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Categories</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => setSelectedCategory('all')} className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedCategory === 'all' ? 'bg-primary/5 font-medium text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    All Products
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedCategory === cat.id ? 'bg-primary/5 font-medium text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}>
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Price Range</h3>
                <Slider value={priceRange} onValueChange={setPriceRange} max={maxPrice} step={50} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-sm text-muted-foreground">
                  <X className="mr-1 h-3.5 w-3.5" /> Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Mobile Controls */}
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1 min-w-0">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by name, brand, category…"
                  inputClassName="h-10 bg-muted/30 text-sm"
                  className="w-full"
                />
              </div>
              <div className="flex w-full sm:w-auto items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 sm:w-40 h-10 border-border/50 bg-background text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low → High</SelectItem>
                    <SelectItem value="price-high">Price: High → Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/50 lg:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 overflow-hidden rounded-xl border border-border/50 bg-card p-4 lg:hidden">
                  <div className="flex flex-wrap gap-2">
                    <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'gradient-cosmic text-primary-foreground' : ''}>All</Button>
                    {CATEGORIES.map(cat => (
                      <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className={selectedCategory === cat.id ? 'gradient-cosmic text-primary-foreground' : ''}>
                        {cat.icon} {cat.name}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Price: ₹{priceRange[0]} – ₹{priceRange[1]}</p>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={maxPrice} step={50} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category pills (desktop) */}
            <div className="mb-6 hidden flex-wrap gap-2 lg:flex">
              <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'gradient-cosmic text-primary-foreground' : 'border-border/50 text-muted-foreground'}>All</Button>
              {CATEGORIES.map(cat => (
                <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className={selectedCategory === cat.id ? 'gradient-cosmic text-primary-foreground' : 'border-border/50 text-muted-foreground'}>
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="mb-2 text-lg font-medium text-foreground">No products found</p>
                <p className="mb-4 text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;