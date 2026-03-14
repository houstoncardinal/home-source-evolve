
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  minimum_order numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer DEFAULT 0,
  starts_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT NULL,
  is_active boolean DEFAULT true,
  applies_to text DEFAULT 'all',
  category_filter text DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are viewable by everyone" ON public.coupons FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update coupons" ON public.coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete coupons" ON public.coupons FOR DELETE TO authenticated USING (true);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reorder_point integer DEFAULT 10;
