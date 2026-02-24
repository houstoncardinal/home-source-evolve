
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
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
CREATE POLICY "Customers are viewable by everyone" ON public.customers FOR SELECT USING (true);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
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
CREATE POLICY "Orders are viewable by everyone" ON public.orders FOR SELECT USING (true);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create store_settings table
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON public.store_settings FOR SELECT USING (true);

-- Create competitor_scans table for the scraper/pricer feature
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
CREATE POLICY "Competitor scans are viewable by everyone" ON public.competitor_scans FOR SELECT USING (true);

-- Create competitor_products table
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
CREATE POLICY "Competitor products are viewable by everyone" ON public.competitor_products FOR SELECT USING (true);
