-- Visual Search
-- Stores a vector representation of each product image.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_embedding vector(512);

CREATE INDEX IF NOT EXISTS products_image_embedding_idx
ON public.products
USING ivfflat (image_embedding vector_cosine_ops)
WITH (lists = 100);