import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <main className="pt-[88px] flex items-center justify-center min-h-[calc(100vh-88px)]" role="main">
          <div className="text-center px-4 animate-fade-in">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Looks like you haven't added any items yet
            </p>
            <Link to="/products">
              <Button size="lg" className="font-semibold">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main className="pt-[88px]" role="main">
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex gap-6">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </Link>

                    <div className="flex-grow">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="text-xl font-semibold mb-2 hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-2xl font-bold text-primary mb-4">
                        ${item.price}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <span 
                            className="w-12 text-center font-semibold"
                            aria-label={`Quantity: ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                      <p className="text-2xl font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary">
                        ${(totalPrice * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button 
                    size="lg" 
                    className="w-full font-semibold text-lg"
                    aria-label="Proceed to checkout"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link to="/products">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full mt-4 font-semibold"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
