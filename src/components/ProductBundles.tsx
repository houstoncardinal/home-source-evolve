import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Check } from "lucide-react";

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
  },
];

export const ProductBundles = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20" aria-labelledby="bundles-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-accent text-accent-foreground font-semibold px-4 py-2">
            <Package className="h-4 w-4 mr-2" />
            Save Up to 24%
          </Badge>
          <h2 id="bundles-heading" className="text-4xl md:text-5xl font-bold mb-4">
            Curated Furniture Bundles
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete room packages designed by experts, delivered at exceptional value
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {bundles.map((bundle, index) => (
            <Card
              key={bundle.id}
              className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-64 overflow-hidden bg-muted">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold text-base px-4 py-2 shadow-lg">
                  Save {bundle.savings}%
                </Badge>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                  {bundle.name}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {bundle.description}
                </p>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-accent" />
                    Includes {bundle.items.length} items:
                  </p>
                  <ul className="space-y-2">
                    {bundle.items.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start">
                        <Check className="h-4 w-4 text-accent mr-2 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        ${bundle.price}
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        ${bundle.originalPrice}
                      </span>
                    </div>
                    <p className="text-sm text-accent font-semibold mt-1">
                      You save ${(bundle.originalPrice - bundle.price).toFixed(2)}
                    </p>
                  </div>
                  <Link to="/products">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-bold shadow-[0_4px_20px_rgba(var(--accent),0.3)] hover:shadow-[0_6px_28px_rgba(var(--accent),0.4)] transition-all duration-300"
                    >
                      View Bundle Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <p className="text-muted-foreground mb-4">
            Need a custom bundle? Our design team can help!
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold"
          >
            Request Custom Bundle
          </Button>
        </div>
      </div>
    </section>
  );
};
