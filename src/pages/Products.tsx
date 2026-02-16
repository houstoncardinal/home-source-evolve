import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  primary_image?: string;
  image_alt?: string;
};
type ProductQuery = Product & { product_images?: { url: string; alt_text: string | null; is_primary: boolean }[] };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [sort, setSort] = useState<"featured" | "new" | "price_asc" | "price_desc">("featured");
  const [brands, setBrands] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);

  // simple client cache per page to avoid refetch when paginating back/forward
  const pageCache = useRef<Record<number, Product[]>>({});
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();

  const categories = ["All", "Living Room", "Dining Room", "Bedroom", "Office", "Accessories"];

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory && categories.includes(urlCategory)) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, sort, search, priceMin, priceMax, selectedBrands, selectedBadges, includeOutOfStock]);

  useEffect(() => {
    // load filter facets once
    const loadFacets = async () => {
      const { data: brandData } = await supabase.from("products").select("brand");
      const uniqueBrands = Array.from(new Set((brandData || []).map((b) => b.brand).filter(Boolean))) as string[];
      setBrands(uniqueBrands.sort());

      const { data: badgeData } = await supabase.from("products").select("badge");
      const uniqueBadges = Array.from(new Set((badgeData || []).map((b) => b.badge).filter(Boolean))) as string[];
      setBadges(uniqueBadges.sort());
    };
    loadFacets();
  }, []);

  const PAGE_SIZE = 24;

  const fetchPage = async () => {
    try {
      setLoading(true);
      // If cached, use immediately (still refresh in background)
      if (pageCache.current[page]) {
        setProducts(pageCache.current[page]);
      }

      // Build base filters
      const applyFilters = (builder: any) => {
        if (!includeOutOfStock) builder = builder.eq("in_stock", true);
        if (selectedCategory !== "All") builder = builder.eq("category", selectedCategory);
        if (search.trim()) builder = builder.ilike("name", `%${search.trim()}%`);
        if (priceMin) builder = builder.gte("price", Number(priceMin));
        if (priceMax) builder = builder.lte("price", Number(priceMax));
        if (selectedBrands.length) builder = builder.in("brand", selectedBrands);
        if (selectedBadges.length) builder = builder.in("badge", selectedBadges);
        return builder;
      };

      // Count query (minimal payload)
      const { count, error: countError } = await applyFilters(
        supabase.from("products").select("id", { count: "exact", head: true })
      );
      if (countError) throw countError;
      setTotalCount(count ?? 0);

      // Data query with left join for primary image (limit 1 per product)
      let dataQuery = applyFilters(
        supabase
          .from("products")
          .select(
            "id, name, slug, price, compare_at_price, category, badge, in_stock, created_at, featured, brand, product_images(url, alt_text, is_primary)"
          )
      )
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      // pull just one image (primary first)
      dataQuery = dataQuery
        .order("is_primary", { foreignTable: "product_images", ascending: false })
        .limit(1, { foreignTable: "product_images" });

      switch (sort) {
        case "price_asc":
          dataQuery = dataQuery.order("price", { ascending: true }).order("created_at", { ascending: false });
          break;
        case "price_desc":
          dataQuery = dataQuery.order("price", { ascending: false }).order("created_at", { ascending: false });
          break;
        case "new":
          dataQuery = dataQuery.order("created_at", { ascending: false });
          break;
        default:
          dataQuery = dataQuery.order("featured", { ascending: false }).order("created_at", { ascending: false });
      }

      const { data: productsData, error: productsError } = await dataQuery as unknown as { data: ProductQuery[]; error: any };
      if (productsError) throw productsError;

      const merged = (productsData ?? []).map((p: ProductQuery) => {
        const primary = (p.product_images || []).find((img) => img.is_primary) || p.product_images?.[0];
        return {
          ...p,
          primary_image: primary?.url,
          image_alt: primary?.alt_text,
        };
      });

      setProducts(merged);
      pageCache.current[page] = merged;

      // background prefetch next page
      const nextPage = page + 1;
      const totalPagesLocal = Math.max(1, Math.ceil((count ?? merged.length) / PAGE_SIZE));
      if (nextPage < totalPagesLocal && !pageCache.current[nextPage]) {
        prefetchPage(nextPage, dataQuery, PAGE_SIZE);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const prefetchPage = useCallback(
    async (pageToPrefetch: number, baseQuery: any, pageSize: number) => {
      try {
        const offset = pageToPrefetch * pageSize;
        const { data } = await baseQuery.range(offset, offset + pageSize - 1);
        const merged = (data ?? []).map((p: ProductQuery) => {
          const primary = (p.product_images || []).find((img) => img.is_primary) || p.product_images?.[0];
          return {
            ...p,
            primary_image: primary?.url,
            image_alt: primary?.alt_text,
          };
        });
        pageCache.current[pageToPrefetch] = merged;
      } catch (_) {
        /* best-effort prefetch */
      }
    },
    []
  );

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);

  const filteredProducts = products;

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: product.primary_image || "/placeholder.svg",
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16 space-y-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Curated catalog</p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground">
                    {selectedCategory === "All" ? "All Products" : selectedCategory}
                  </h1>
                  <p className="text-lg text-muted-foreground font-light max-w-xl mt-3">
                    {selectedCategory === "All"
                      ? "Browse our complete collection of premium furniture"
                      : `Explore our ${selectedCategory.toLowerCase()} collection`}
                  </p>
                </div>
                <div className="px-4 py-3 rounded-xl border border-border/80 bg-card shadow-sm text-sm text-muted-foreground flex flex-col items-end">
                  <span className="font-semibold text-foreground">{totalCount}</span>
                  <span className="text-xs uppercase tracking-[0.18em]">pieces available</span>
                  <span className="text-[11px] text-muted-foreground">Page {page + 1} of {totalPages}</span>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="grid lg:grid-cols-[260px_1fr] gap-6 mb-10">
              {/* Facet rail */}
              <div className="bg-card/60 border border-border rounded-2xl p-4 shadow-sm space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => { setSelectedCategory(category); setPage(0); pageCache.current = {}; }}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all ${
                          selectedCategory === category
                            ? "bg-foreground text-background shadow"
                            : "text-muted-foreground hover:text-foreground bg-muted/60"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Search</p>
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); pageCache.current = {}; }}
                    placeholder="Search products"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Price</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="number"
                      min="0"
                      value={priceMin}
                      onChange={(e) => { setPriceMin(e.target.value); setPage(0); pageCache.current = {}; }}
                      placeholder="Min $"
                      className="w-24 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-foreground"
                    />
                    <span className="text-xs uppercase tracking-[0.18em]">to</span>
                    <input
                      type="number"
                      min="0"
                      value={priceMax}
                      onChange={(e) => { setPriceMax(e.target.value); setPage(0); pageCache.current = {}; }}
                      placeholder="Max $"
                      className="w-24 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                {brands.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => {
                        const active = selectedBrands.includes(brand);
                        return (
                          <button
                            key={brand}
                            onClick={() => {
                              setSelectedBrands((prev) =>
                                active ? prev.filter((b) => b !== brand) : [...prev, brand]
                              );
                              setPage(0);
                              pageCache.current = {};
                            }}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                              active ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {brand}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {badges.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Highlights</p>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge) => {
                        const active = selectedBadges.includes(badge);
                        return (
                          <button
                            key={badge}
                            onClick={() => {
                              setSelectedBadges((prev) =>
                                active ? prev.filter((b) => b !== badge) : [...prev, badge]
                              );
                              setPage(0);
                              pageCache.current = {};
                            }}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                              active ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {badge}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <input
                    id="outofstock"
                    type="checkbox"
                    checked={includeOutOfStock}
                    onChange={(e) => { setIncludeOutOfStock(e.target.checked); setPage(0); pageCache.current = {}; }}
                    className="accent-accent h-4 w-4"
                  />
                  <label htmlFor="outofstock" className="text-muted-foreground">Include out of stock</label>
                </div>
              </div>

              {/* Controls + grid */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-xs uppercase tracking-[0.18em]">Sort</span>
                    <select
                      value={sort}
                      onChange={(e) => { setSort(e.target.value as any); setPage(0); pageCache.current = {}; }}
                      className="px-4 py-2 text-sm rounded-full border border-border bg-card shadow-sm focus:outline-none focus:border-foreground"
                    >
                      <option value="featured">Featured</option>
                      <option value="new">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="text-xs text-muted-foreground">Showing {products.length} of {totalCount} items</div>
                </div>

                {/* Products Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="aspect-[3/4] rounded-xl bg-muted/60 animate-pulse" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-32">
                    <p className="text-lg text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <Card className="group overflow-hidden border border-border/70 bg-card premium-card h-full shadow-[0_20px_70px_-50px_rgba(0,0,0,0.45)]">
                          <Link to={`/product/${product.slug}`}>
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                          <img
                            src={product.primary_image || "/placeholder.svg"}
                            alt={product.image_alt || product.name}
                            loading="lazy"
                            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 768px) 32vw, 50vw"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                              {product.badge && (
                                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5">
                                  {product.badge}
                                </Badge>
                              )}
                              {product.compare_at_price && (
                                <Badge variant="secondary" className="absolute top-3 right-3 bg-destructive text-white text-[11px]">
                                  Save ${((typeof product.compare_at_price === 'string' ? parseFloat(product.compare_at_price) : product.compare_at_price) - (typeof product.price === 'string' ? parseFloat(product.price) : product.price)).toFixed(0)}
                                </Badge>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                                <Button
                                  size="icon"
                                  className="bg-white/90 hover:bg-white text-foreground h-10 w-10 rounded-full shadow-lg"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart(product);
                                  }}
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Link>

                          <CardContent className="p-5">
                            <Link to={`/product/${product.slug}`}>
                              <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-[0.18em]">
                                {product.category}
                              </p>
                              <h3 className="text-base font-display font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-1 text-foreground">
                                {product.name}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-2">
                              {(typeof product.price === 'string' ? parseFloat(product.price) : product.price) > 0 ? (
                                <>
                                  <span className="text-lg font-semibold text-foreground">
                                    ${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                  {product.compare_at_price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ${(typeof product.compare_at_price === 'string' ? parseFloat(product.compare_at_price) : product.compare_at_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm font-semibold text-accent">
                                  Contact for Price
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Pagination controls */}
                <div className="flex items-center justify-center gap-3 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-full"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page <span className="font-semibold text-foreground">{page + 1}</span> of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="rounded-full"
                  >
                    Next
                  </Button>
                </div>
              </div> {/* end products column */}
            </div> {/* end grid */}
          </div> {/* end max width */}
        </div> {/* end container */}
      </main>

      <Footer />
    </div>
  );
}
