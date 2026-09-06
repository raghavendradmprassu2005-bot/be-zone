-- Visual Search similarity function
-- Only used by the Visual Search feature.

CREATE OR REPLACE FUNCTION public.match_products_by_image(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.45,
  match_count integer DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price integer,
  original_price integer,
  category text,
  image text,
  rating numeric,
  review_count integer,
  tags text[],
  zodiac_sign text,
  in_stock boolean,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.category,
    p.image,
    p.rating,
    p.review_count,
    p.tags,
    p.zodiac_sign,
    p.in_stock,
    (1 - (p.image_embedding <=> query_embedding))::float AS similarity
  FROM public.products p
  WHERE
    p.in_stock = true
    AND p.image_embedding IS NOT NULL
    AND (1 - (p.image_embedding <=> query_embedding)) >= match_threshold
  ORDER BY p.image_embedding <=> query_embedding
  LIMIT LEAST(match_count, 50);
$$;

GRANT EXECUTE ON FUNCTION public.match_products_by_image(vector(512), float, integer)
TO anon, authenticated;