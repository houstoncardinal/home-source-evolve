import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const allProducts = [
  {
    id: 1,
    name: "3-Piece Aluminum Patio Set",
    description: "All-weather patio furniture with 6.7\" thick Olefin fabric cushions and coffee table",
    price: 825.49,
    image: "https://images.unsplash.com/photo-1601140528547-2e03e96e5b01?w=800&q=80",
    category: "Patio",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "EVA 180 TV Stand",
    description: "Modern entertainment center in black matt and gloss finish, 70.87 inches",
    price: 549.99,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    category: "Living Room",
    badge: "Trending",
  },
  {
    id: 3,
    name: "8-Seater Dining Table",
    description: "Formal traditional design with self-storing leaf, cherry finish wooden furniture",
    price: 981.37,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    category: "Dining",
    badge: "Premium",
  },
  {
    id: 4,
    name: "Velvet Accent Chair",
    description: "Luxurious velvet upholstery with gold metal legs, perfect for any room",
    price: 449.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    category: "Living Room",
  },
  {
    id: 5,
    name: "Modern Platform Bed",
    description: "Queen size platform bed with upholstered headboard and storage drawers",
    price: 1199.99,
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
    category: "Bedroom",
    badge: "New",
  },
  {
    id: 6,
    name: "Executive Office Desk",
    description: "Solid wood desk with built-in cable management and spacious drawers",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
    category: "Office",
  },
];

export default function Products() {
  const [filter, setFilter] = useState("All");
  const { addItem } = useCart();

  const categories = ["All", "Living Room", "Dining", "Bedroom", "Office", "Patio"];
  
  const filteredProducts = filter === "All" 
    ? allProducts 
    : allProducts.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main className="pt-[88px]" role="main">
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                All Products
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover our complete collection of premium furniture
              </p>
            </div>

            {/* Filter Buttons */}
            <div 
              className="flex flex-wrap gap-3 mb-12"
              role="tablist"
              aria-label="Product categories"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  onClick={() => setFilter(category)}
                  className="font-semibold"
                  role="tab"
                  aria-selected={filter === category}
                  aria-controls="products-grid"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            <div 
              id="products-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              role="tabpanel"
            >
              {filteredProducts.map((product, index) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link 
                    to={`/product/${product.id}`}
                    aria-label={`View details for ${product.name}`}
                  >
                    <div className="relative h-72 overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      {product.badge && (
                        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-semibold">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-6">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>
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
                        onClick={() => addItem(product)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
