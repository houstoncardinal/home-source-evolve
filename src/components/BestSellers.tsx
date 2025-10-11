import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    id: 1,
    name: "3-Piece Aluminum Patio Set",
    description: "All-weather patio furniture with 6.7\" thick Olefin fabric cushions and coffee table",
    price: 825.49,
    image: "https://images.unsplash.com/photo-1601140528547-2e03e96e5b01?w=800&q=80",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "EVA 180 TV Stand",
    description: "Modern entertainment center in black matt and gloss finish, 70.87 inches",
    price: 549.99,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    badge: "Trending",
  },
  {
    id: 3,
    name: "8-Seater Dining Table",
    description: "Formal traditional design with self-storing leaf, cherry finish wooden furniture",
    price: 981.37,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    badge: "Premium",
  },
];

export const BestSellers = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Best Sellers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our most loved pieces, chosen by customers like you
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-semibold">
                  {product.badge}
                </Badge>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">USD</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg font-semibold transition-all duration-300"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};
