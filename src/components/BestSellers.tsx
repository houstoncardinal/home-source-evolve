import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Star } from "lucide-react";

const products = [
  {
    id: "1",
    name: "3-Piece Aluminum Patio Set",
    description: "All-weather patio furniture with 6.7\" thick Olefin fabric cushions and coffee table",
    price: 825.49,
    image: "https://images.unsplash.com/photo-1601140528547-2e03e96e5b01?w=800&q=80",
    badge: "Best Seller",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "2",
    name: "EVA 180 TV Stand",
    description: "Modern entertainment center in black matt and gloss finish, 70.87 inches",
    price: 549.99,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    badge: "Trending",
    rating: 4.8,
    reviews: 89,
  },
  {
    id: "3",
    name: "8-Seater Dining Table",
    description: "Formal traditional design with self-storing leaf, cherry finish wooden furniture",
    price: 981.37,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    badge: "Premium",
    rating: 5.0,
    reviews: 156,
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

export const BestSellers = () => {
  const { addItem } = useCart();
  
  return (
    <section className="py-28 bg-background" aria-labelledby="bestsellers-heading">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-6">
            Customer Favorites
          </span>
          <h2 id="bestsellers-heading" className="text-4xl md:text-6xl font-display font-bold mb-6">
            Best Sellers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Our most loved pieces, chosen by discerning customers like you
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Card className="group overflow-hidden border-0 bg-card premium-card">
                <Link to={`/product/${product.id}`} aria-label={`View details for ${product.name}`}>
                  {/* Image Container */}
                  <div className="relative h-80 overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                    />
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-semibold shadow-glow px-4 py-1">
                      {product.badge}
                    </Badge>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                      <Button 
                        size="icon" 
                        className="bg-background/90 hover:bg-background text-foreground h-12 w-12 rounded-full shadow-luxury transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product);
                        }}
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        className="bg-background/90 hover:bg-background text-foreground h-12 w-12 rounded-full shadow-luxury transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-accent fill-accent' : 'text-muted'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-accent transition-colors duration-300">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-5 line-clamp-2 font-light">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground font-display">
                        ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addItem(product)}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-md hover:shadow-glow transition-all duration-300 btn-shimmer px-6"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
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
              className="border-2 border-foreground hover:bg-foreground hover:text-background px-12 py-7 text-lg font-semibold transition-all duration-500 group"
            >
              View All Products
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
