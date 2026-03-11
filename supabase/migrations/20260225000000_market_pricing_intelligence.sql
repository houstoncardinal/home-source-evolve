-- Market Pricing Intelligence System - Idempotent Migration
-- Non-destructive: safe to re-run

-- 0. Ensure uuid extension functions exist (gen_random_uuid requires pgcrypto or pgx)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure the shared trigger function exists (safe to run even if already present)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. Market scan sessions (tracks a batch scan run)
CREATE TABLE IF NOT EXISTS public.market_scan_sessions (
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

-- 2. Raw scraped market prices per product per source
CREATE TABLE IF NOT EXISTS public.product_market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.market_scan_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  matched_product_name TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  search_query_used TEXT DEFAULT NULL,
  confidence_score NUMERIC(3, 2) DEFAULT NULL,
  raw_data JSONB DEFAULT '{}'::jsonb,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_market_data_product_id ON public.product_market_data(product_id);
CREATE INDEX IF NOT EXISTS idx_product_market_data_session_id ON public.product_market_data(session_id);
CREATE INDEX IF NOT EXISTS idx_product_market_data_source_name ON public.product_market_data(source_name);

-- 3. Aggregated pricing ranges per product (one row per product, upserted after each scan)
CREATE TABLE IF NOT EXISTS public.product_pricing_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  market_min NUMERIC(12, 2) DEFAULT NULL,
  market_max NUMERIC(12, 2) DEFAULT NULL,
  market_avg NUMERIC(12, 2) DEFAULT NULL,
  market_median NUMERIC(12, 2) DEFAULT NULL,
  sources_count INTEGER NOT NULL DEFAULT 0,
  data_points_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  last_session_id UUID REFERENCES public.market_scan_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_product_pricing_ranges_product_id'
      AND n.nspname = 'public'
  ) THEN
    CREATE UNIQUE INDEX idx_product_pricing_ranges_product_id ON public.product_pricing_ranges(product_id);
  END IF;
END$$;

DROP TRIGGER IF EXISTS update_product_pricing_ranges_updated_at ON public.product_pricing_ranges;
CREATE TRIGGER update_product_pricing_ranges_updated_at
BEFORE UPDATE ON public.product_pricing_ranges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Configurable auto-pricing strategy rules
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  strategy TEXT NOT NULL CHECK (strategy IN ('premium', 'competitive', 'value')),
  description TEXT NOT NULL DEFAULT '',
  multiplier NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
  floor_pct NUMERIC(12, 4) NOT NULL DEFAULT 0.7000,
  ceiling_source TEXT NOT NULL DEFAULT 'compare_at_price' CHECK (ceiling_source IN ('compare_at_price', 'none')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON public.pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at
BEFORE UPDATE ON public.pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.pricing_rules (name, strategy, description, multiplier, floor_pct) VALUES
  ('Premium Positioning', 'premium',
   'Price 15% above market average to signal luxury positioning. Best for exclusive or differentiated products.',
   1.1500, 0.7000),
  ('Competitive Match', 'competitive',
   'Match market average exactly. Best for products with many direct competitors.',
   1.0000, 0.7000),
  ('Value Leader', 'value',
   'Price 8% below market average to drive volume and capture price-sensitive buyers.',
   0.9200, 0.7000)
ON CONFLICT (name) DO NOTHING;

-- 5. Append-only audit log of every price change (applied or dry-run preview)
CREATE TABLE IF NOT EXISTS public.pricing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL DEFAULT '',
  strategy TEXT NOT NULL,
  old_price NUMERIC(12, 2) NOT NULL,
  suggested_price NUMERIC(12, 2) NOT NULL,
  applied_price NUMERIC(12, 2) DEFAULT NULL,
  market_avg NUMERIC(12, 2) DEFAULT NULL,
  market_min NUMERIC(12, 2) DEFAULT NULL,
  market_max NUMERIC(12, 2) DEFAULT NULL,
  was_applied BOOLEAN NOT NULL DEFAULT false,
  dry_run BOOLEAN NOT NULL DEFAULT false,
  floor_enforced BOOLEAN NOT NULL DEFAULT false,
  ceiling_enforced BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_logs_product_id ON public.pricing_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_logs_strategy ON public.pricing_logs(strategy);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_pricing_logs_created_at'
      AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_pricing_logs_created_at ON public.pricing_logs(created_at DESC);
  END IF;
END$$;

-- 6. Row-level security
ALTER TABLE public.market_scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_scan_sessions_select" ON public.market_scan_sessions;
CREATE POLICY "market_scan_sessions_select" ON public.market_scan_sessions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "market_scan_sessions_insert" ON public.market_scan_sessions;
CREATE POLICY "market_scan_sessions_insert" ON public.market_scan_sessions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "market_scan_sessions_update" ON public.market_scan_sessions;
CREATE POLICY "market_scan_sessions_update" ON public.market_scan_sessions FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "product_market_data_select" ON public.product_market_data;
CREATE POLICY "product_market_data_select" ON public.product_market_data FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "product_market_data_insert" ON public.product_market_data;
CREATE POLICY "product_market_data_insert" ON public.product_market_data FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "product_pricing_ranges_select" ON public.product_pricing_ranges;
CREATE POLICY "product_pricing_ranges_select" ON public.product_pricing_ranges FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "product_pricing_ranges_insert" ON public.product_pricing_ranges;
CREATE POLICY "product_pricing_ranges_insert" ON public.product_pricing_ranges FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "product_pricing_ranges_update" ON public.product_pricing_ranges;
CREATE POLICY "product_pricing_ranges_update" ON public.product_pricing_ranges FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "pricing_rules_select" ON public.pricing_rules;
CREATE POLICY "pricing_rules_select" ON public.pricing_rules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pricing_rules_insert" ON public.pricing_rules;
CREATE POLICY "pricing_rules_insert" ON public.pricing_rules FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pricing_rules_update" ON public.pricing_rules;
CREATE POLICY "pricing_rules_update" ON public.pricing_rules FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "pricing_logs_select" ON public.pricing_logs;
CREATE POLICY "pricing_logs_select" ON public.pricing_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pricing_logs_insert" ON public.pricing_logs;
CREATE POLICY "pricing_logs_insert" ON public.pricing_logs FOR INSERT TO authenticated WITH CHECK (true);
