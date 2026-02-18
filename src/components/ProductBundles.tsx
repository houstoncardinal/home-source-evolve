import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type BundleProduct = {
  id: string;
  name: string;
  price: number;
  slug: string;
  category: string | null;
  description: string | null;
  badge: string | null;
  primary_image?: string;
};

type BundleConfig = {
  id: string;
  title: string;
  description: string;
  categories: string[];
  badge?: string;
};

type Bundle = BundleConfig & {
  items: BundleProduct[];
  primaryImage?: string;
};

const bundleConfigs: BundleConfig[] = [
  { id: "living-room-lounge", title: "Living Room", description: "Sectionals, recliners, and tables styled to coordinate", categories: ["Living Room"], badge: "Popular" },
  { id: "bedroom-retreat", title: "Bedroom", description: "Beds, vanities, and storage for serene nights", categories: ["Bedroom"] },
  { id: "dining-host", title: "Dining & Bar", description: "Dining sets, barstools, and occasional pieces", categories: ["Dining Room"] },
  { id: "office-focus", title: "Office", description: "Workspace-ready desks, storage, and seating", categories: ["Office"] },
];

export const ProductBundles = () => {
  const [products, setProducts] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const neededCategories = Array.from(new Set(bundleConfigs.flatMap((b) => b.categories)));

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, slug, category, description, badge")
        .in("category", neededCategories)
        .eq("in_stock", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      const productIds = (productsData ?? []).map((p) => p.id);
      let imageMap: Record<string, string> = {};

      if (productIds.length) {
        const { data: imageData } = await supabase
          .from("product_images")
          .select("product_id, url")
          .in("product_id", productIds)
          .eq("is_primary", true);

        imageMap = Object.fromEntries((imageData ?? []).map((img) => [img.product_id, img.url]));
      }

      const withImages: BundleProduct[] = (productsData ?? []).map((product) => ({
        ...product,
        primary_image: imageMap[product.id],
      }));

      setProducts(withImages);
    } catch (error) {
      console.error("Error loading bundles", error);
    } finally {
      setLoading(false);
    }
  };

  const bundles = useMemo<Bundle[]>(
    () =>
      bundleConfigs
        .map((config) => {
          const items = products.filter((p) => config.categories.includes(p.category ?? ""));
          const primaryImage = items.find((p) => p.primary_image)?.primary_image ?? "/placeholder.svg";
          return { ...config, items, primaryImage };
        })
        .filter((bundle) => bundle.items.length > 0),
    [products]
  );

  if (!loading && bundles.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="bundles-heading">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-14"
        >
          <span className="section-label mb-5">Shop by Room</span>
          <h2 id="bundles-heading" className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-5 mb-4">
            Curated Room Packages
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
            Coordinated packages styled by our design team so every piece feels intentional
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(loading ? bundleConfigs : bundles).slice(0, 4).map((bundle, idx) => {
            const items: BundleProduct[] = "items" in bundle ? (bundle.items as BundleProduct[]) : [];
            const pricedItems = items.filter((p) => {
              const n = typeof p.price === "string" ? parseFloat(p.price as string) : p.price;
              return n > 0;
            });
            const minPrice =
              pricedItems.length > 0
                ? Math.min(...pricedItems.map((p) => (typeof p.price === "string" ? parseFloat(p.price as string) : p.price)))
                : null;

            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <div className="group bg-background rounded-2xl border border-border/50 overflow-hidden hover:border-border hover:shadow-elevated transition-all duration-500 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={"primaryImage" in bundle ? (bundle.primaryImage as string) : "/placeholder.svg"}
                      alt={bundle.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                    {bundle.badge && (
                      <Badge className="absolute top-3 left-3 bg-accent text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1">
                        {bundle.badge}
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">Curated Set</p>
                      <h3 className="text-lg font-display font-bold">{bundle.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-sm text-muted-foreground font-light mb-3 flex-1">{bundle.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">{items.length > 0 ? `${items.length} pieces` : "—"}</span>
                      {minPrice !== null && (
                        <span className="text-sm font-semibold text-foreground">From ${minPrice.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
                      )}
                    </div>
                    <Link to={`/products?category=${bundle.categories[0]}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-full border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 text-sm font-medium"
                      >
                        Shop This Room
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
