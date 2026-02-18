import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type CategoryPreview = {
  id: string;
  title: string;
  category: string;
  description: string;
  productId: string;
  productSlug: string;
  image?: string;
  featured?: boolean;
};

const categoryDescriptions: Record<string, string> = {
  "Living Room": "Sofas, sectionals & accent pieces",
  "Dining Room": "Dining sets & bar seating",
  Bedroom: "Beds, dressers & storage",
  Office: "Desks, chairs & storage",
  Accessories: "Mirrors, tables & décor",
};

const categoryIcons: Record<string, string> = {
  "Living Room": "🛋️",
  "Dining Room": "🍽️",
  Bedroom: "🛏️",
  Office: "💼",
  Accessories: "✨",
};

const categoryOrder = ["Living Room", "Dining Room", "Bedroom", "Office", "Accessories"];

export const Collections = () => {
  const [previews, setPreviews] = useState<CategoryPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true);
        const { data: products, error } = await supabase
          .from("products")
          .select("id, category, name, slug, description, featured")
          .eq("in_stock", true)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!products) return;

        const leadPerCategory: Record<string, CategoryPreview> = {};
        for (const product of products) {
          const cat = product.category;
          if (!cat || !categoryOrder.includes(cat)) continue;
          if (leadPerCategory[cat]) continue;
          leadPerCategory[cat] = {
            id: cat.toLowerCase().replace(/\s+/g, "-"),
            title: cat,
            category: cat,
            description: categoryDescriptions[cat] || product.description || "Explore the latest arrivals",
            productId: product.id,
            productSlug: product.slug,
            featured: product.featured ?? false,
          };
        }

        const leadProducts = Object.values(leadPerCategory);
        const ids = leadProducts.map((p) => p.productId);

        if (ids.length) {
          const { data: images } = await supabase
            .from("product_images")
            .select("product_id, url")
            .in("product_id", ids)
            .eq("is_primary", true);

          const imageMap = new Map(images?.map((img) => [img.product_id, img.url]));
          leadProducts.forEach((p) => {
            p.image = imageMap.get(p.productId);
          });
        }

        const ordered = leadProducts.sort((a, b) => {
          return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        });

        setPreviews(ordered);
      } catch (err) {
        console.error("Error loading collections", err);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  const cards = useMemo(
    () =>
      (loading ? categoryOrder : previews.map((p) => p.category)).map((category, index) => {
        const data = previews.find((p) => p.category === category);
        const title = data?.title || category;
        const description = data?.description || categoryDescriptions[category] || "Explore the latest arrivals";
        const image = data?.image;
        const id = data?.id || category.toLowerCase().replace(/\s+/g, "-");
        const targetSlug = data?.productSlug;
        const icon = categoryIcons[category] || "🏠";

        return { id, category, title, description, image, targetSlug, icon, index };
      }),
    [loading, previews]
  );

  if (!loading && cards.length === 0) return null;

  const [hero, ...rest] = cards;

  return (
    <section id="collections" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="section-label mb-5">Shop by Room</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-5 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto font-light leading-relaxed">
            Every room deserves furniture that fits perfectly. Find yours.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5">
          
          {/* Hero Card - Large */}
          {hero && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 lg:row-span-2"
            >
              <Link
                to={hero.targetSlug ? `/product/${hero.targetSlug}` : `/products?category=${hero.category}`}
                className="group block h-full"
              >
                <div className="relative overflow-hidden rounded-2xl h-72 sm:h-96 lg:h-full min-h-[400px] bg-muted premium-card">
                  {hero.image ? (
                    <img
                      src={hero.image}
                      alt={`${hero.title} collection`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-6xl">
                      {hero.icon}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60 mb-2 font-medium">Featured Collection</p>
                    <h3 className="text-3xl sm:text-4xl font-display font-bold mb-2">{hero.title}</h3>
                    <p className="text-sm text-white/70 mb-5 font-light">{hero.description}</p>
                    <div className="inline-flex items-center gap-2 bg-white text-foreground text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      Shop Now
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Secondary Cards */}
          {rest.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <Link
                to={card.targetSlug ? `/product/${card.targetSlug}` : `/products?category=${card.category}`}
                className="group block h-full"
              >
                <div className="relative overflow-hidden rounded-2xl h-44 sm:h-48 bg-muted premium-card h-full min-h-[160px]">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={`${card.title} collection`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-600 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-4xl">
                      {card.icon}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold mb-0.5">{card.title}</h3>
                      <p className="text-xs text-white/65 font-light">{card.description}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent transition-colors duration-300 shrink-0 ml-3">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors border-b border-accent/30 hover:border-accent pb-0.5"
          >
            View all {cards.length > 0 ? "500+" : ""} products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
