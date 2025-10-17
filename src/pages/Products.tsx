import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  primary_image?: string;
  image_alt?: string;
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const categories = ["All", "Living Room", "Dining Room", "Bedroom", "Office", "Patio"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Fetch primary images for each product
      const productsWithImages = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: imageData } = await supabase
            .from("product_images")
            .select("url, alt_text")
            .eq("product_id", product.id)
            .eq("is_primary", true)
            .single();

          return {
            ...product,
            primary_image: imageData?.url,
            image_alt: imageData?.alt_text,
          };
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: product.primary_image || "/placeholder.svg",
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Luxury Furniture Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our curated selection of premium furniture pieces designed to elevate your living spaces
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12 animate-fade-in">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-300 hover:scale-105"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-2 hover:border-accent/50 animate-fade-in bg-card"
                >
                  <Link to={`/product/${product.slug}`}>
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={product.primary_image || "/placeholder.svg"}
                        alt={product.image_alt || product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      {product.badge && (
                        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground shadow-lg">
                          {product.badge}
                        </Badge>
                      )}
                      {product.compare_at_price && (
                        <Badge variant="secondary" className="absolute top-4 left-4 bg-destructive text-white shadow-lg">
                          Save ${((typeof product.compare_at_price === 'string' ? parseFloat(product.compare_at_price) : product.compare_at_price) - (typeof product.price === 'string' ? parseFloat(product.price) : product.price)).toFixed(0)}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-6">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    </Link>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-accent">
                          ${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toFixed(2)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${(typeof product.compare_at_price === 'string' ? parseFloat(product.compare_at_price) : product.compare_at_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Add to Cart
                      </Button>
                      <Link to={`/product/${product.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full border-2 hover:border-accent">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No products found in this category</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
