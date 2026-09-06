CREATE OR REPLACE FUNCTION public.set_product_image_embedding(
  p_product_id uuid,
  p_embedding vector(512)
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET image_embedding = p_embedding
  WHERE id = p_product_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL
ON FUNCTION public.set_product_image_embedding(uuid, vector)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.set_product_image_embedding(uuid, vector)
TO service_role;