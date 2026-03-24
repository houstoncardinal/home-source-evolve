CREATE OR REPLACE FUNCTION public.count_products_without_images()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT count(*)
  FROM public.products p
  LEFT JOIN public.product_images pi ON pi.product_id = p.id
  WHERE pi.id IS NULL
$$;