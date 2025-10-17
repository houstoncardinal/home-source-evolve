-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
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

-- Create product images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product colors table
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

-- Create product textures/materials table
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

-- Create product variations table (size, style, etc.)
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

-- Create product features table
CREATE TABLE public.product_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_textures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (products are public)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product colors are viewable by everyone" ON public.product_colors FOR SELECT USING (true);
CREATE POLICY "Product textures are viewable by everyone" ON public.product_textures FOR SELECT USING (true);
CREATE POLICY "Product variations are viewable by everyone" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Product features are viewable by everyone" ON public.product_features FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_colors_product_id ON public.product_colors(product_id);
CREATE INDEX idx_product_textures_product_id ON public.product_textures(product_id);
CREATE INDEX idx_product_variations_product_id ON public.product_variations(product_id);
CREATE INDEX idx_product_features_product_id ON public.product_features(product_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample luxury furniture products
INSERT INTO public.products (name, slug, description, long_description, price, compare_at_price, category, subcategory, brand, sku, in_stock, stock_quantity, featured, badge, dimensions, care_instructions)
VALUES 
('Luxe Velvet Sofa', 'luxe-velvet-sofa', 'Premium velvet sofa with solid oak frame', 'Handcrafted with premium velvet upholstery and a solid oak frame. Features high-density foam cushions for superior comfort and durability. The elegant design complements both modern and traditional interiors.', 2499.00, 2999.00, 'Living Room', 'Sofas', 'Artisan Furniture Co.', 'LVS-001', true, 12, true, 'Best Seller', '{"width": "84in", "depth": "36in", "height": "33in"}', 'Professional cleaning recommended. Avoid direct sunlight to prevent fading.'),
('Modern Marble Dining Table', 'modern-marble-dining-table', 'Stunning white marble table with gold accents', 'Crafted from genuine Carrara marble with brushed gold stainless steel legs. The natural veining makes each piece unique. Seats 6-8 people comfortably. Perfect centerpiece for elegant dining spaces.', 3299.00, 3799.00, 'Dining Room', 'Tables', 'Luxe Living', 'MMDT-002', true, 8, true, 'New Arrival', '{"width": "72in", "depth": "40in", "height": "30in"}', 'Wipe clean with damp cloth. Use coasters to prevent staining.'),
('Executive Leather Office Chair', 'executive-leather-office-chair', 'Ergonomic leather chair with lumbar support', 'Premium top-grain leather with advanced ergonomic features. Adjustable lumbar support, armrests, and seat height. 360-degree swivel and smooth-rolling casters. Built for all-day comfort and style.', 899.00, 1099.00, 'Office', 'Chairs', 'ErgoElite', 'ELOC-003', true, 25, true, NULL, '{"width": "28in", "depth": "28in", "height": "45-50in"}', 'Clean with leather conditioner. Avoid harsh chemicals.'),
('King Platform Bed with Storage', 'king-platform-bed-storage', 'Modern platform bed with built-in storage drawers', 'Contemporary design with clean lines and ample storage. Features four large drawers and a sturdy slat system that eliminates the need for a box spring. Premium wood construction with durable finish.', 1799.00, 2199.00, 'Bedroom', 'Beds', 'Sleep Haven', 'KPB-004', true, 15, false, NULL, '{"width": "80in", "depth": "86in", "height": "48in"}', 'Dust regularly. Use wood polish for maintenance.'),
('Outdoor Teak Lounge Set', 'outdoor-teak-lounge-set', '4-piece weather-resistant teak furniture set', 'Premium grade-A teak wood naturally resists weather and insects. Includes loveseat, two chairs, and coffee table. Removable cushions with fade-resistant fabric. Perfect for patio or deck entertaining.', 4299.00, 4999.00, 'Patio', 'Sets', 'Garden Luxe', 'OTLS-005', true, 6, true, 'Premium', '{"loveseat": "52x32x35in", "chairs": "28x32x35in", "table": "40x24x18in"}', 'Apply teak oil annually. Store cushions when not in use.'),
('Mid-Century Walnut Credenza', 'mid-century-walnut-credenza', 'Solid walnut media console with brass hardware', 'Inspired by classic mid-century design with modern functionality. Solid American walnut with hand-finished brass pulls. Cable management system and adjustable shelving. Perfect for media storage or display.', 1599.00, 1899.00, 'Living Room', 'Storage', 'Heritage Home', 'MCWC-006', true, 10, false, NULL, '{"width": "68in", "depth": "18in", "height": "30in"}', 'Dust with soft cloth. Use wood oil to maintain luster.');

-- Insert product images
INSERT INTO public.product_images (product_id, url, alt_text, is_primary, display_order)
SELECT p.id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'Luxe velvet sofa front view', true, 1
FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', 'Modern marble dining table', true, 1
FROM public.products p WHERE p.slug = 'modern-marble-dining-table'
UNION ALL
SELECT p.id, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800', 'Executive leather office chair', true, 1
FROM public.products p WHERE p.slug = 'executive-leather-office-chair'
UNION ALL
SELECT p.id, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 'King platform bed with storage', true, 1
FROM public.products p WHERE p.slug = 'king-platform-bed-storage'
UNION ALL
SELECT p.id, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', 'Outdoor teak lounge set', true, 1
FROM public.products p WHERE p.slug = 'outdoor-teak-lounge-set'
UNION ALL
SELECT p.id, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800', 'Mid-century walnut credenza', true, 1
FROM public.products p WHERE p.slug = 'mid-century-walnut-credenza';

-- Insert color options for products
INSERT INTO public.product_colors (product_id, name, hex_code, in_stock, price_adjustment, display_order)
SELECT p.id, 'Navy Blue', '#1e3a8a', true, 0, 1 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Emerald Green', '#047857', true, 0, 2 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Blush Pink', '#f9a8d4', true, 50, 3 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Charcoal Grey', '#4b5563', true, 0, 4 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Black', '#000000', true, 0, 1 FROM public.products p WHERE p.slug = 'executive-leather-office-chair'
UNION ALL
SELECT p.id, 'Cognac Brown', '#8b4513', true, 50, 2 FROM public.products p WHERE p.slug = 'executive-leather-office-chair'
UNION ALL
SELECT p.id, 'White', '#ffffff', true, 0, 3 FROM public.products p WHERE p.slug = 'executive-leather-office-chair';

-- Insert texture/material options
INSERT INTO public.product_textures (product_id, name, description, in_stock, price_adjustment, display_order)
SELECT p.id, 'Velvet', 'Premium soft velvet upholstery', true, 0, 1 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Linen', 'Natural breathable linen fabric', true, -100, 2 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Bouclé', 'Textured bouclé fabric', true, 150, 3 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Top-Grain Leather', 'Premium leather finish', true, 0, 1 FROM public.products p WHERE p.slug = 'executive-leather-office-chair'
UNION ALL
SELECT p.id, 'Mesh Back', 'Breathable mesh with leather seat', true, -100, 2 FROM public.products p WHERE p.slug = 'executive-leather-office-chair';

-- Insert product variations (sizes, styles)
INSERT INTO public.product_variations (product_id, variation_type, value, price_adjustment, in_stock, display_order)
SELECT p.id, 'Size', '84" (Standard)', 0, true, 1 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Size', '96" (Large)', 300, true, 2 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Size', '72" (Compact)', -200, true, 3 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Size', '72" (6-person)', 0, true, 1 FROM public.products p WHERE p.slug = 'modern-marble-dining-table'
UNION ALL
SELECT p.id, 'Size', '84" (8-person)', 400, true, 2 FROM public.products p WHERE p.slug = 'modern-marble-dining-table';

-- Insert product features
INSERT INTO public.product_features (product_id, feature, display_order)
SELECT p.id, 'Solid oak hardwood frame', 1 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'High-density foam cushions', 2 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Removable cushion covers', 3 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Hand-finished details', 4 FROM public.products p WHERE p.slug = 'luxe-velvet-sofa'
UNION ALL
SELECT p.id, 'Genuine Carrara marble top', 1 FROM public.products p WHERE p.slug = 'modern-marble-dining-table'
UNION ALL
SELECT p.id, 'Brushed gold stainless steel legs', 2 FROM public.products p WHERE p.slug = 'modern-marble-dining-table'
UNION ALL
SELECT p.id, 'Seats 6-8 people', 3 FROM public.products p WHERE p.slug = 'modern-marble-dining-table'
UNION ALL
SELECT p.id, 'Adjustable lumbar support', 1 FROM public.products p WHERE p.slug = 'executive-leather-office-chair'
UNION ALL
SELECT p.id, '360-degree swivel', 2 FROM public.products p WHERE p.slug = 'executive-leather-office-chair'
UNION ALL
SELECT p.id, 'Height adjustable', 3 FROM public.products p WHERE p.slug = 'executive-leather-office-chair';