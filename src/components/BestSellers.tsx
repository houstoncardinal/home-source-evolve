import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  slug: string;
  badge: string | null;
  primary_image?: string;
}

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

export const BestSellers = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, description, price, slug, badge")
      .eq("in_stock", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6);

    if (!productsData || productsData.length === 0) return;

    const withImages = await Promise.all(
      productsData.map(async (product) => {
        const { data: imageData } = await supabase
          .from("product_images")
          .select("url")
          .eq("product_id", product.id)
          .eq("is_primary", true)
          .single();

        return {
          ...product,
          primary_image: imageData?.url,
        };
      })
    );

    setProducts(withImages);
  };

  if (products.length === 0) return null;

  const heroProduct = products[0];
  const secondaryProducts = products.slice(1, 4);
  const remainingProducts = products.slice(4, 10);

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden" aria-labelledby="bestsellers-heading">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-200px] top-0 w-[520px] h-[520px] bg-accent/12 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-80px] w-[420px] h-[420px] bg-primary/10 blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto"
        >
          <span className="section-label mb-6">Editor's Picks</span>
          <h2 id="bestsellers-heading" className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
            Our most sought-after pieces, chosen for quality and design
          </p>
        </motion.div>

        {/* Hero highlight */}
        {heroProduct && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch mb-14"
          >
            <Card className="relative overflow-hidden border border-border/70 bg-card premium-card shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)]">
              <Link to={`/product/${heroProduct.slug}`} aria-label={`View details for ${heroProduct.name}`} className="flex flex-col h-full">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <img
                    src={heroProduct.primary_image || "/placeholder.svg"}
                    alt={heroProduct.name}
                    className="w-full h-full object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {heroProduct.badge && (
                    <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-semibold shadow-md px-3 py-1 text-xs uppercase tracking-wider">
                      {heroProduct.badge}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/70 mb-2">Signature pick</p>
                      <h3 className="text-2xl md:text-3xl font-display font-semibold text-white mb-2 line-clamp-2">
                        {heroProduct.name}
                      </h3>
                      <p className="text-white/70 text-sm font-light line-clamp-2">
                        {heroProduct.description}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      className="bg-white/90 hover:bg-white text-foreground h-12 w-12 rounded-full shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          id: heroProduct.id,
                          name: heroProduct.name,
                          price: typeof heroProduct.price === 'string' ? parseFloat(heroProduct.price) : heroProduct.price,
                          image: heroProduct.primary_image || "/placeholder.svg",
                        });
                      }}
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6 lg:p-7 flex items-center justify-between">
                  {(typeof heroProduct.price === 'string' ? parseFloat(heroProduct.price) : heroProduct.price) > 0 ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">Price</p>
                      <span className="text-2xl font-semibold text-foreground">
                        ${(typeof heroProduct.price === 'string' ? parseFloat(heroProduct.price) : heroProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">Pricing</p>
                      <span className="text-base font-semibold text-accent">Contact for Price</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm font-medium text-accent">
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              {secondaryProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border border-border/70 bg-card premium-card h-full">
                  <Link to={`/product/${product.slug}`} aria-label={`View details for ${product.name}`} className="flex flex-col h-full">
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <img
                        src={product.primary_image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-600 ease-out"
                      />
                      {product.badge && (
                        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold shadow px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                          {product.badge}
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                        <Button
                          size="icon"
                          className="bg-white/90 hover:bg-white text-foreground h-10 w-10 rounded-full shadow-lg"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                              image: product.primary_image || "/placeholder.svg",
                            });
                          }}
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="text-base font-display font-semibold mb-1 line-clamp-1 group-hover:text-accent transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-light">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {(typeof product.price === 'string' ? parseFloat(product.price) : product.price) > 0 ? (
                          <span className="text-lg font-semibold text-foreground">
                            ${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-accent">Contact for Price</span>
                        )}
                        <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Quick view</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {remainingProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Card className="group overflow-hidden border border-border/70 bg-card premium-card h-full">
                <Link to={`/product/${product.slug}`} aria-label={`View details for ${product.name}`} className="flex flex-col h-full">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={product.primary_image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {product.badge && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold shadow px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                        {product.badge}
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <Button
                        size="icon"
                        className="bg-white/90 hover:bg-white text-foreground h-11 w-11 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                            image: product.primary_image || "/placeholder.svg",
                          });
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="text-base font-display font-semibold mb-1 line-clamp-1 group-hover:text-accent transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-light leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {(typeof product.price === 'string' ? parseFloat(product.price) : product.price) > 0 ? (
                        <span className="text-lg font-semibold text-foreground">
                          ${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-accent">Contact for Price</span>
                      )}
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">View</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link to="/products">
            <Button
              size="lg"
              variant="outline"
              className="border border-border hover:border-foreground hover:bg-foreground hover:text-background px-10 py-6 text-sm font-semibold uppercase tracking-wider transition-all duration-500 rounded-full group"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
