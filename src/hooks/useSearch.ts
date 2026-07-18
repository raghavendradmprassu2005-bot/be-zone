import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

const mapRow = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  originalPrice: p.original_price ?? undefined,
  category: p.category,
  image: p.image,
  rating: Number(p.rating ?? 0),
  reviewCount: p.review_count ?? 0,
  tags: p.tags ?? [],
  zodiacSign: p.zodiac_sign ?? undefined,
  inStock: p.in_stock,
});

/**
 * Live search against Supabase.
 * Searches: name, description, category (server-side ilike) + tags (array contains).
 * Results are debounced so Supabase is only queried after the user pauses typing.
 */
export const useSearch = (query: string, debounceMs = 300) => {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        // Primary: ilike search across text columns
        const { data: textData, error } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
          .order('review_count', { ascending: false })
          .limit(8);

        if (error) throw error;

        const mapped = (textData || []).map(mapRow);
        const seen = new Set(mapped.map((p) => p.id));

        // Secondary: tag array contains (exact element match, lowercased)
        const { data: tagData } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .contains('tags', [q.toLowerCase()])
          .limit(4);

        if (tagData) {
          for (const row of tagData) {
            if (!seen.has(row.id)) {
              mapped.push(mapRow(row));
              seen.add(row.id);
            }
          }
        }

        setResults(mapped.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { results, isLoading };
};
