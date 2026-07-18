import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/types";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true);

      console.table(data);
      console.log(JSON.stringify(data, null, 2));

      if (error) {
        throw error;
      }

      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.original_price ?? undefined,
        category: p.category as any,
        image: p.image,
        rating: Number(p.rating ?? 0),
        reviewCount: p.review_count ?? 0,
        tags: p.tags ?? [],
        zodiacSign: p.zodiac_sign ?? undefined,
        inStock: p.in_stock,
      }));
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.original_price ?? undefined,
        category: data.category as any,
        image: data.image,
        rating: Number(data.rating ?? 0),
        reviewCount: data.review_count ?? 0,
        tags: data.tags ?? [],
        zodiacSign: data.zodiac_sign ?? undefined,
        inStock: data.in_stock,
      };
    },
  });
};