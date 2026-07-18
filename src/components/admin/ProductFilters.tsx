import type { Dispatch, SetStateAction } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: Dispatch<SetStateAction<string>>;
  filterBrand: string;
  setFilterBrand: Dispatch<SetStateAction<string>>;
  filterStock: string;
  setFilterStock: Dispatch<SetStateAction<string>>;
  filterFeatured: string;
  setFilterFeatured: Dispatch<SetStateAction<string>>;
  sortOption: string;
  setSortOption: Dispatch<SetStateAction<string>>;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
  categories: string[];
  brands: string[];
}

export function ProductFilters({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterBrand,
  setFilterBrand,
  filterStock,
  setFilterStock,
  filterFeatured,
  setFilterFeatured,
  sortOption,
  setSortOption,
  priceRange,
  setPriceRange,
  categories,
  brands,
}: ProductFiltersProps) {
  return (
    <Card className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-slate-950">Product Management</CardTitle>
          <CardDescription className="text-slate-500">Search, filter, sort, and manage your catalogue with confidence.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Search className="mr-2 h-4 w-4" /> Quick actions
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, category, brand, tags"
              className="pl-11"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label className="text-slate-600">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-600">Brand</Label>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-600">Stock</Label>
              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                  <SelectValue placeholder="All stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1.6fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-slate-600">Featured</Label>
              <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="not-featured">Not featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-600">Sort by</Label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                  <SelectValue placeholder="Newest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-low-high">Price: Low → High</SelectItem>
                  <SelectItem value="price-high-low">Price: High → Low</SelectItem>
                  <SelectItem value="highest-rated">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-slate-600">Min price</Label>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(event) => setPriceRange([Number(event.target.value) || 0, priceRange[1]])}
                className="rounded-xl border-slate-200 bg-slate-50 text-slate-700"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-slate-600">Max price</Label>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value) || 10000])}
                className="rounded-xl border-slate-200 bg-slate-50 text-slate-700"
                placeholder="10000"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
