import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  slug: string;
  badge: string | null;
  category: string;
  primary_image?: string;
}

const formatPrice = (price: number | string) => {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const BestSellers = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, description, price, compare_at_price, slug, badge, category")
      .eq("in_stock", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);

    if (!productsData || productsData.length === 0) return;

    const withImages = await Promise.all(
      productsData.map(async (product) => {
        const { data: imageData } = await supabase
          .from("product_images")
          .select("url")
          .eq("product_id", product.id)
          .eq("is_primary", true)
          .single();
        return { ...product, primary_image: imageData?.url };
      })
    );

    setProducts(withImages);
    const cats = Array.from(new Set(withImages.map((p) => p.category)));
    setCategories(["All", ...cats]);
  };

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-secondary/40" aria-labelledby="bestsellers-heading">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-10"
        >
          <div>
            <span className="section-label mb-4">Editor's Picks</span>
            <h2 id="bestsellers-heading" className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-2 font-light">Our most sought-after pieces, chosen for quality and design.</p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="border-border hover:border-foreground hover:bg-foreground hover:text-background rounded-full px-6 shrink-0 transition-all duration-300">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Category Tabs */}
        {categories.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-white text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {filtered.slice(0, 8).map((product, index) => {
            const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
            const comparePrice = product.compare_at_price
              ? typeof product.compare_at_price === "string"
                ? parseFloat(product.compare_at_price)
                : product.compare_at_price
              : null;
            const savings = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="group bg-white rounded-2xl overflow-hidden border border-border/50 hover:border-border hover:shadow-elevated transition-all duration-500">
                  {/* Image */}
                  <Link to={`/product/${product.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.primary_image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-600 ease-out"
                        loading="lazy"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {product.badge && (
                          <Badge className="bg-accent text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide shadow">
                            {product.badge}
                          </Badge>
                        )}
                        {savings && (
                          <Badge className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 shadow">
                            -{savings}%
                          </Badge>
                        )}
                      </div>
                      {/* Quick Add */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Button
                          size="icon"
                          className="h-9 w-9 rounded-full bg-white shadow-md hover:bg-accent hover:text-white text-foreground transition-colors duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem({
                              id: product.id,
                              name: product.name,
                              price,
                              image: product.primary_image || "/placeholder.svg",
                            });
                          }}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1 font-medium">{product.category}</p>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 leading-snug group-hover:text-accent transition-colors duration-200">
                        {product.name}
                      </h3>
                    </Link>
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">(4.9)</span>
                    </div>
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      {price > 0 ? (
                        <>
                          <span className="text-base font-bold text-foreground">${formatPrice(price)}</span>
                          {comparePrice && comparePrice > price && (
                            <span className="text-xs text-muted-foreground line-through">${formatPrice(comparePrice)}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-accent">Contact for Price</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10 sm:hidden"
        >
          <Link to="/products">
            <Button size="lg" variant="outline" className="rounded-full px-8 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
