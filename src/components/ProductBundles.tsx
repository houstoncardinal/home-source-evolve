import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Check, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const bundles = [
  {
    id: 1,
    name: "Complete Living Room Package",
    description: "Everything you need for a modern, stylish living space",
    price: 2799.99,
    originalPrice: 3499.99,
    savings: 20,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    items: [
      "Modern Sectional Sofa",
      "Glass Coffee Table",
      "2x End Tables",
      "Floor Lamp",
      "Area Rug (8x10)",
      "Throw Pillows Set",
    ],
    featured: true,
  },
  {
    id: 2,
    name: "Master Bedroom Suite",
    description: "Transform your bedroom into a luxury retreat",
    price: 2199.99,
    originalPrice: 2899.99,
    savings: 24,
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
    items: [
      "King Platform Bed",
      "Premium Mattress",
      "2x Matching Nightstands",
      "6-Drawer Dresser",
      "Bedroom Bench",
      "Premium Bedding Set",
    ],
    featured: false,
  },
  {
    id: 3,
    name: "Dining Room Essentials",
    description: "Host unforgettable dinners with this complete set",
    price: 1899.99,
    originalPrice: 2399.99,
    savings: 21,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    items: [
      "Extendable Dining Table",
      "6x Upholstered Chairs",
      "Buffet Cabinet",
      "Statement Chandelier",
      "Table Linens Set",
      "Centerpiece Décor",
    ],
    featured: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
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
  return (
    <section className="py-28 bg-gradient-to-b from-background via-muted/20 to-background" aria-labelledby="bundles-heading">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-20"
        >
          <Badge className="mb-6 bg-accent/20 text-accent font-semibold px-4 py-2 border-0">
            <Sparkles className="h-4 w-4 mr-2" />
            Save Up to 24%
          </Badge>
          <h2 id="bundles-heading" className="text-4xl md:text-6xl font-display font-bold mb-6">
            Curated Bundles
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Complete room packages designed by experts, delivered at exceptional value
          </p>
        </motion.div>

        {/* Bundles Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {bundles.map((bundle) => (
            <motion.div key={bundle.id} variants={itemVariants}>
              <Card className={`group overflow-hidden border-0 bg-card premium-card h-full ${bundle.featured ? 'ring-2 ring-accent' : ''}`}>
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-muted">
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                  />
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold px-4 py-1.5 shadow-glow">
                    Save {bundle.savings}%
                  </Badge>
                  {bundle.featured && (
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-semibold px-4 py-1.5">
                      Most Popular
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <CardContent className="p-8">
                  <h3 className="text-xl font-display font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                    {bundle.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 font-light">
                    {bundle.description}
                  </p>

                  {/* Items List */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-accent" />
                      Includes {bundle.items.length} premium items:
                    </p>
                    <ul className="space-y-2">
                      {bundle.items.slice(0, 4).map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start text-muted-foreground font-light">
                          <Check className="h-4 w-4 text-accent mr-2 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {bundle.items.length > 4 && (
                        <li className="text-sm text-accent font-medium">
                          + {bundle.items.length - 4} more items
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Price and CTA */}
                  <div className="pt-6 border-t border-border">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-display font-bold text-foreground">
                          ${bundle.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          ${bundle.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-sm text-accent font-semibold mt-1">
                        You save ${(bundle.originalPrice - bundle.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Link to="/products">
                      <Button
                        size="lg"
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow hover:shadow-[0_0_60px_-8px_hsl(38_85%_55%_/_0.6)] transition-all duration-500 btn-shimmer group/btn"
                      >
                        View Bundle
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Custom Bundle CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4 font-light">
            Need a custom bundle? Our design team can help!
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-foreground hover:bg-foreground hover:text-background font-semibold px-10 py-6 transition-all duration-500"
          >
            Request Custom Bundle
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
