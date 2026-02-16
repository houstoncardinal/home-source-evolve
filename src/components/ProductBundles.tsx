import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  {
    id: "living-room-lounge",
    title: "Living Room",
    description: "Sectionals, recliners, and tables styled to coordinate",
    categories: ["Living Room"],
    badge: "Popular",
  },
  {
    id: "bedroom-retreat",
    title: "Bedroom",
    description: "Beds, vanities, and storage for serene nights",
    categories: ["Bedroom"],
  },
  {
    id: "dining-host",
    title: "Dining & Bar",
    description: "Dining sets, barstools, and occasional pieces",
    categories: ["Dining Room"],
  },
  {
    id: "office-focus",
    title: "Office",
    description: "Workspace-ready desks, storage, and seating",
    categories: ["Office"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export const ProductBundles = () => {
  const [products, setProducts] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);

      const neededCategories = Array.from(
        new Set(bundleConfigs.flatMap((bundle) => bundle.categories))
      );

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
        const { data: imageData, error: imageError } = await supabase
          .from("product_images")
          .select("product_id, url")
          .in("product_id", productIds)
          .eq("is_primary", true);

        if (imageError) throw imageError;
        imageMap = Object.fromEntries(
          (imageData ?? []).map((img) => [img.product_id, img.url])
        );
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
          const items = products.filter((p) =>
            config.categories.includes(p.category ?? "")
          );
          const primaryImage =
            items.find((p) => p.primary_image)?.primary_image ||
            items[0]?.primary_image ||
            "/placeholder.svg";

          return {
            ...config,
            items,
            primaryImage,
          };
        })
        .filter((bundle) => bundle.items.length > 0),
    [products]
  );

  if (!loading && bundles.length === 0) {
    return null;
  }

  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-muted/20 via-background to-background"
      aria-labelledby="bundles-heading"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-160px] top-20 w-[420px] h-[420px] bg-accent/10 blur-3xl" />
        <div className="absolute right-[-120px] bottom-0 w-[360px] h-[360px] bg-primary/12 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="section-label mb-6">Room Packages</span>
          <h2
            id="bundles-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6"
          >
            Curated Bundles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Coordinated packages styled by our design team so every piece feels intentional
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 max-w-7xl mx-auto"
        >
          {(loading ? bundleConfigs : bundles).slice(0, 4).map((bundle, idx) => {
            const items = "items" in bundle ? bundle.items : [];
            const pricedItems = items.filter(
              (p) => (typeof p.price === "string" ? parseFloat(p.price) : p.price) > 0
            );
            const minPrice =
              pricedItems.length > 0
                ? Math.min(
                    ...pricedItems.map((p) =>
                      typeof p.price === "string" ? parseFloat(p.price) : p.price
                    )
                  )
                : null;

            return (
              <motion.div key={bundle.id} variants={itemVariants}>
                <Card className="group overflow-hidden border border-border/70 bg-card premium-card h-full shadow-[0_24px_80px_-50px_rgba(0,0,0,0.45)]">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={"primaryImage" in bundle ? bundle.primaryImage : "/placeholder.svg"}
                      alt={bundle.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

                    {bundle.badge && (
                      <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-semibold text-xs uppercase tracking-wider px-3 py-1 shadow">
                        {bundle.badge}
                      </Badge>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">Curated set</p>
                      <h3 className="text-xl font-display font-semibold leading-tight">
                        {bundle.title}
                      </h3>
                      <p className="text-white/70 text-sm font-light mb-2">
                        {bundle.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-white/80">
                        <span>{(items as BundleProduct[]).length || "—"} pieces</span>
                        {minPrice !== null && (
                          <span>From ${minPrice.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <Link to={`/products?category=${bundle.categories[0]}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm font-semibold tracking-[0.08em] rounded-full border-border hover:border-foreground hover:bg-foreground hover:text-background group/btn"
                      >
                        Shop This Look
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
