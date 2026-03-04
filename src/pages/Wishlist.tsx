import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export default function Wishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="My Wishlist" description="Your saved furniture picks from Curated Home Source." />
      <Header />
      <main className="pt-[88px]" role="main">
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">My Wishlist</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">Save items you love to find them later</p>
              <Link to="/products">
                <Button size="lg" className="font-semibold">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <Link to={`/product/${item.slug}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-accent transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-accent font-bold mt-1">
                      {item.price > 0 ? `$${item.price.toFixed(2)}` : "Contact for Price"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1" onClick={() => handleAddToCart(item)}>
                        <ShoppingBag className="h-4 w-4 mr-1" /> Add to Cart
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
