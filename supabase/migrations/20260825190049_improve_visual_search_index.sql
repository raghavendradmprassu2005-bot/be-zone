-- Improve Visual Search index
-- Only affects the Visual Search embedding column.

DROP INDEX IF EXISTS public.products_image_embedding_idx;

CREATE INDEX IF NOT EXISTS products_image_embedding_hnsw_idx
ON public.products
USING hnsw (image_embedding vector_cosine_ops);