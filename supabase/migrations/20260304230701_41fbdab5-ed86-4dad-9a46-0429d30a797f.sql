
-- Allow authenticated users to INSERT, UPDATE, DELETE on all admin-managed tables

-- Products
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

-- Orders
CREATE POLICY "Authenticated users can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete orders" ON public.orders FOR DELETE TO authenticated USING (true);

-- Customers
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete customers" ON public.customers FOR DELETE TO authenticated USING (true);

-- Store Settings
CREATE POLICY "Authenticated users can insert store_settings" ON public.store_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update store_settings" ON public.store_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete store_settings" ON public.store_settings FOR DELETE TO authenticated USING (true);

-- Product Images
CREATE POLICY "Authenticated users can insert product_images" ON public.product_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update product_images" ON public.product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete product_images" ON public.product_images FOR DELETE TO authenticated USING (true);

-- Product Colors
CREATE POLICY "Authenticated users can insert product_colors" ON public.product_colors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update product_colors" ON public.product_colors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete product_colors" ON public.product_colors FOR DELETE TO authenticated USING (true);

-- Product Textures
CREATE POLICY "Authenticated users can insert product_textures" ON public.product_textures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update product_textures" ON public.product_textures FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete product_textures" ON public.product_textures FOR DELETE TO authenticated USING (true);

-- Product Features
CREATE POLICY "Authenticated users can insert product_features" ON public.product_features FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update product_features" ON public.product_features FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete product_features" ON public.product_features FOR DELETE TO authenticated USING (true);

-- Product Variations
CREATE POLICY "Authenticated users can insert product_variations" ON public.product_variations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update product_variations" ON public.product_variations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete product_variations" ON public.product_variations FOR DELETE TO authenticated USING (true);

-- Competitor Scans
CREATE POLICY "Authenticated users can insert competitor_scans" ON public.competitor_scans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update competitor_scans" ON public.competitor_scans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete competitor_scans" ON public.competitor_scans FOR DELETE TO authenticated USING (true);

-- Competitor Products
CREATE POLICY "Authenticated users can insert competitor_products" ON public.competitor_products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update competitor_products" ON public.competitor_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete competitor_products" ON public.competitor_products FOR DELETE TO authenticated USING (true);
