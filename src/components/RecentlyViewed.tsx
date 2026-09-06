import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

const STORAGE_KEY = 'recently-viewed';
const MAX_ITEMS = 8;

export const addToRecentlyViewed = (product: Product) => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    ) as Product[];

    const filtered = stored.filter((p) => p.id !== product.id);

    filtered.unshift(product);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_ITEMS))
    );
  } catch {}
};

const RecentlyViewed = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      ) as Product[];

      setProducts(stored);
    } catch {}
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
          Recently Viewed
        </h2>

        <div
          className="
            flex
            gap-5
            overflow-x-auto
            pb-4
            snap-x
            snap-mandatory
            scrollbar-hide
            overscroll-x-contain
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="
                flex-none
                w-[72%]
                sm:w-[42%]
                md:w-[30%]
                lg:w-[24%]
                snap-start
              "
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;