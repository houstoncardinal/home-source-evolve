-- ============================================================
-- Home Source Evolve — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SHARED UTILITY FUNCTION
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10, 2),
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  sku TEXT UNIQUE,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  badge TEXT,
  dimensions JSONB,
  weight DECIMAL(8, 2),
  care_instructions TEXT,
  shipping_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_textures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_type TEXT NOT NULL,
  value TEXT NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  sku_suffix TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_textures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products are editable by authenticated" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product images are editable by authenticated" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Product colors are viewable by everyone" ON public.product_colors FOR SELECT USING (true);
CREATE POLICY "Product colors are editable by authenticated" ON public.product_colors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Product textures are viewable by everyone" ON public.product_textures FOR SELECT USING (true);
CREATE POLICY "Product textures are editable by authenticated" ON public.product_textures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Product variations are viewable by everyone" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Product variations are editable by authenticated" ON public.product_variations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Product features are viewable by everyone" ON public.product_features FOR SELECT USING (true);
CREATE POLICY "Product features are editable by authenticated" ON public.product_features FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_colors_product_id ON public.product_colors(product_id);
CREATE INDEX idx_product_textures_product_id ON public.product_textures(product_id);
CREATE INDEX idx_product_variations_product_id ON public.product_variations(product_id);
CREATE INDEX idx_product_features_product_id ON public.product_features(product_id);

-- Triggers
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address_line1 TEXT DEFAULT '',
  address_line2 TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  country TEXT DEFAULT 'US',
  notes TEXT DEFAULT '',
  total_spent NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers viewable by authenticated" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers editable by authenticated" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  shipping_address JSONB DEFAULT '{}',
  billing_address JSONB DEFAULT '{}',
  items JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders viewable by authenticated" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Orders editable by authenticated" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- STORE SETTINGS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by everyone" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Settings editable by authenticated" ON public.store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', 'Home Source'),
  ('store_email', 'info@homesource.com'),
  ('currency', 'USD'),
  ('tax_rate', '0.08'),
  ('free_shipping_threshold', '2000'),
  ('shipping_flat_rate', '99');


-- ─────────────────────────────────────────────────────────────
-- COMPETITOR PRICING (legacy scanner)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.competitor_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_url TEXT NOT NULL,
  competitor_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  total_products_found INTEGER DEFAULT 0,
  matches_found INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.competitor_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitor scans viewable by authenticated" ON public.competitor_scans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Competitor scans editable by authenticated" ON public.competitor_scans FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.competitor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.competitor_scans(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  competitor_name TEXT NOT NULL DEFAULT '',
  competitor_product_name TEXT NOT NULL,
  competitor_price NUMERIC NOT NULL,
  competitor_url TEXT DEFAULT '',
  our_price NUMERIC,
  price_difference NUMERIC,
  price_difference_pct NUMERIC,
  recommendation TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.competitor_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitor products viewable by authenticated" ON public.competitor_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Competitor products editable by authenticated" ON public.competitor_products FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- MARKET PRICING INTELLIGENCE (AI auto-pricer)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.market_scan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_products INTEGER NOT NULL DEFAULT 0,
  scanned_products INTEGER NOT NULL DEFAULT 0,
  failed_products INTEGER NOT NULL DEFAULT 0,
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.market_scan_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  matched_product_name TEXT NOT NULL DEFAULT '',
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  search_query_used TEXT DEFAULT NULL,
  confidence_score DECIMAL(3, 2) DEFAULT NULL,
  raw_data JSONB DEFAULT '{}',
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_market_data_product_id ON public.product_market_data(product_id);
CREATE INDEX idx_product_market_data_session_id ON public.product_market_data(session_id);
CREATE INDEX idx_product_market_data_source_name ON public.product_market_data(source_name);

CREATE TABLE public.product_pricing_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  market_min DECIMAL(12, 2) DEFAULT NULL,
  market_max DECIMAL(12, 2) DEFAULT NULL,
  market_avg DECIMAL(12, 2) DEFAULT NULL,
  market_median DECIMAL(12, 2) DEFAULT NULL,
  sources_count INTEGER NOT NULL DEFAULT 0,
  data_points_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  last_session_id UUID REFERENCES public.market_scan_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_product_pricing_ranges_product_id ON public.product_pricing_ranges(product_id);

CREATE TRIGGER update_product_pricing_ranges_updated_at
BEFORE UPDATE ON public.product_pricing_ranges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  strategy TEXT NOT NULL CHECK (strategy IN ('premium', 'competitive', 'value')),
  description TEXT NOT NULL DEFAULT '',
  multiplier DECIMAL(5, 4) NOT NULL DEFAULT 1.0000,
  floor_pct DECIMAL(5, 4) NOT NULL DEFAULT 0.7000,
  ceiling_source TEXT NOT NULL DEFAULT 'compare_at_price' CHECK (ceiling_source IN ('compare_at_price', 'none')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_pricing_rules_updated_at
BEFORE UPDATE ON public.pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.pricing_rules (name, strategy, description, multiplier, floor_pct) VALUES
  ('Premium Positioning', 'premium', 'Price 15% above market average to signal luxury positioning.', 1.1500, 0.7000),
  ('Competitive Match', 'competitive', 'Match market average exactly.', 1.0000, 0.7000),
  ('Value Leader', 'value', 'Price 8% below market average to drive volume.', 0.9200, 0.7000);

CREATE TABLE public.pricing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL DEFAULT '',
  strategy TEXT NOT NULL,
  old_price DECIMAL(12, 2) NOT NULL,
  suggested_price DECIMAL(12, 2) NOT NULL,
  applied_price DECIMAL(12, 2) DEFAULT NULL,
  market_avg DECIMAL(12, 2) DEFAULT NULL,
  market_min DECIMAL(12, 2) DEFAULT NULL,
  market_max DECIMAL(12, 2) DEFAULT NULL,
  was_applied BOOLEAN NOT NULL DEFAULT false,
  dry_run BOOLEAN NOT NULL DEFAULT false,
  floor_enforced BOOLEAN NOT NULL DEFAULT false,
  ceiling_enforced BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_pricing_logs_product_id ON public.pricing_logs(product_id);
CREATE INDEX idx_pricing_logs_created_at ON public.pricing_logs(created_at DESC);
CREATE INDEX idx_pricing_logs_strategy ON public.pricing_logs(strategy);

-- RLS for market pricing tables
ALTER TABLE public.market_scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "market_scan_sessions_select" ON public.market_scan_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "market_scan_sessions_insert" ON public.market_scan_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "market_scan_sessions_update" ON public.market_scan_sessions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "product_market_data_select" ON public.product_market_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_market_data_insert" ON public.product_market_data FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "product_pricing_ranges_select" ON public.product_pricing_ranges FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_pricing_ranges_insert" ON public.product_pricing_ranges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "product_pricing_ranges_update" ON public.product_pricing_ranges FOR UPDATE TO authenticated USING (true);

CREATE POLICY "pricing_rules_select" ON public.pricing_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_rules_insert" ON public.pricing_rules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pricing_rules_update" ON public.pricing_rules FOR UPDATE TO authenticated USING (true);

CREATE POLICY "pricing_logs_select" ON public.pricing_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_logs_insert" ON public.pricing_logs FOR INSERT TO authenticated WITH CHECK (true);
