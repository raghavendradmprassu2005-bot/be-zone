import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import type { AgentProductQuery } from "@/agent/types";

export interface AgentProductService {
  search(query: AgentProductQuery): Promise<Product[]>;
  getById(productId: string): Promise<Product | null>;
}

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  image: string | null;
  rating: number | null;
  review_count: number | null;
  tags: string[] | null;
  zodiac_sign: string | null;
  in_stock: boolean | null;
};

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  originalPrice: row.original_price ?? undefined,
  category: row.category as Product["category"],
  image: row.image ?? "",
  rating: Number(row.rating ?? 0),
  reviewCount: row.review_count ?? 0,
  tags: row.tags ?? [],
  zodiacSign: row.zodiac_sign ?? undefined,
  inStock: row.in_stock ?? false,
});

export const supabaseAgentProductService: AgentProductService = {
  async search(query) {
    let request = supabase.from("products").select("*");

    if (query.inStockOnly !== false) {
      request = request.eq("in_stock", true);
    }

    if (query.category) {
      request = request.eq("category", query.category);
    }

    if (query.searchTerm?.trim()) {
      const searchTerm = query.searchTerm.trim();
      const searchTerms = (query.searchTerms?.length ? query.searchTerms : [searchTerm])
        .map((term) => term.trim().replace(/[(),]/g, ""))
        .filter(Boolean);
      const clauses = searchTerms.flatMap((term) => [
        `name.ilike.%${term}%`,
        `description.ilike.%${term}%`,
        `category.ilike.%${term}%`,
        `tags.cs.{${term}}`,
      ]);
      request = request.or(clauses.join(","));
    }

    if (query.minPrice !== undefined) {
      request = request.gte("price", query.minPrice);
    }

    if (query.maxPrice !== undefined) {
      request = request.lte("price", query.maxPrice);
    }

    if (query.tags?.length) {
      request = request.contains("tags", query.tags);
    }

    const { data, error } = await request
      .order("review_count", { ascending: false })
      .limit(query.limit ?? 20);

    if (error) {
      throw error;
    }

    return ((data ?? []) as ProductRow[]).map(toProduct);
  },

  async getById(productId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toProduct(data as ProductRow) : null;
  },
};
