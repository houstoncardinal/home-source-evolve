import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
  "Living Room": "Sectionals, recliners, and accent tables to anchor your space",
  "Dining Room": "Dining sets and bar seating for memorable gatherings",
  Bedroom: "Beds, vanities, and storage for restorative sleep",
  Office: "Desks, storage, and seating built for productivity",
  Accessories: "Mirrors, tables, and décor that finish the room",
};

const categoryOrder = ["Living Room", "Dining Room", "Bedroom", "Office", "Accessories"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

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

        // Pick the lead product per category in desired order
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
          const { data: images, error: imageError } = await supabase
            .from("product_images")
            .select("product_id, url")
            .in("product_id", ids)
            .eq("is_primary", true);
          if (imageError) throw imageError;

          const imageMap = new Map(images?.map((img) => [img.product_id, img.url]));
          leadProducts.forEach((p) => {
            p.image = imageMap.get(p.productId);
          });
        }

        // Sort by desired order then featured flag
        const ordered = leadProducts
          .sort((a, b) => {
            const orderDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
            if (orderDiff !== 0) return orderDiff;
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
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
        const description =
          data?.description || categoryDescriptions[category] || "Explore the latest arrivals";
        const image = data?.image || "/placeholder.svg";
        const featured = index === 0;
        const id = data?.id || category.toLowerCase().replace(/\s+/g, "-");
        const targetSlug = data?.productSlug;

        return { id, category, title, description, image, featured, targetSlug };
      }),
    [loading, previews]
  );

  if (!loading && cards.length === 0) return null;

  return (
    <section id="collections" className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-background/70 to-muted/10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-120px] top-10 w-[420px] h-[420px] bg-accent/12 blur-3xl rounded-full" />
        <div className="absolute right-[-160px] bottom-0 w-[360px] h-[360px] bg-primary/10 blur-3xl rounded-full" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="section-label mb-6">Shop by Room</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
            Explore our full catalog organized by the rooms you love most
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {cards.map((collection, index) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              className={index === 0 ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
            >
              <Link to={collection.targetSlug ? `/product/${collection.targetSlug}` : `/products?category=${collection.category}`}>
                <Card
                  className={`group relative overflow-hidden bg-card border-0 cursor-pointer premium-card ${
                    index === 0 ? "h-[500px] lg:h-full" : "h-72 lg:h-80"
                  }`}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={collection.image}
                      alt={`${collection.title} furniture collection`}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-primary-foreground">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Explore
                      </span>
                      <h3 className={`font-display font-bold mb-3 ${index === 0 ? "text-4xl lg:text-5xl" : "text-2xl lg:text-3xl"}`}>
                        {collection.title}
                      </h3>
                      <p className="text-sm text-primary-foreground/70 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-xs">
                        {collection.description}
                      </p>
                      <div className="inline-flex items-center gap-2 text-accent font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                        <span>View Collection</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  {collection.featured && (
                    <div className="absolute top-6 right-6 px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-full shadow-glow">
                      Featured
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
