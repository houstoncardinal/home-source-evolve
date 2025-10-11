import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";

const products = [
  {
    id: 1,
    name: "3-Piece Aluminum Patio Set",
    description: "All-weather patio furniture with 6.7\" thick Olefin fabric cushions and coffee table. Perfect for outdoor entertaining with weather-resistant materials and comfortable seating.",
    price: 825.49,
    image: "https://images.unsplash.com/photo-1601140528547-2e03e96e5b01?w=800&q=80",
    category: "Patio",
    badge: "Best Seller",
    features: [
      "Weather-resistant aluminum frame",
      "6.7\" thick Olefin fabric cushions",
      "Includes coffee table",
      "Easy to clean and maintain",
      "UV-resistant materials"
    ]
  },
  {
    id: 2,
    name: "EVA 180 TV Stand",
    description: "Modern entertainment center in black matt and gloss finish, 70.87 inches",
    price: 549.99,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    category: "Living Room",
    badge: "Trending",
    features: [
      "70.87 inches wide",
      "Black matt and gloss finish",
      "Cable management system",
      "Adjustable shelves",
      "Supports TVs up to 85\""
    ]
  },
  {
    id: 3,
    name: "8-Seater Dining Table",
    description: "Formal traditional design with self-storing leaf, cherry finish wooden furniture",
    price: 981.37,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    category: "Dining",
    badge: "Premium",
    features: [
      "Seats up to 8 people",
      "Self-storing leaf extension",
      "Cherry wood finish",
      "Traditional formal design",
      "Solid wood construction"
    ]
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main className="pt-[88px]" role="main">
        <article className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              to="/products"
              className="inline-flex items-center text-muted-foreground hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to Products
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative animate-fade-in">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.badge && (
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-semibold text-base px-4 py-2">
                  {product.badge}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">
                  ${product.price}
                </span>
                <span className="text-lg text-muted-foreground ml-2">USD</span>
              </div>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                <ul className="space-y-3" role="list">
                  {product.features?.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-accent mr-3 mt-1" aria-hidden="true">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label htmlFor="quantity" className="block text-sm font-medium mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border rounded-md py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Quantity"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6"
                  aria-label={`Add ${quantity} ${product.name} to cart`}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
                  Add to Cart
                </Button>
                <Link to="/cart" className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 font-semibold text-lg py-6"
                  >
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
