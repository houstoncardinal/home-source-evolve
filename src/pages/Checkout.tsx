import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

function generateOrderNumber() {
  const prefix = "CHS";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Find or create customer
      const { data: existingCustomers } = await supabase
        .from("customers")
        .select("id")
        .eq("email", formData.email)
        .limit(1);

      let customerId: string;

      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update customer info
        await supabase.from("customers").update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip,
        }).eq("id", customerId);
      } else {
        const { data: newCustomer, error: custError } = await supabase
          .from("customers")
          .insert({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip,
          })
          .select("id")
          .single();

        if (custError) throw custError;
        customerId = newCustomer.id;
      }

      // 2. Create order
      const orderItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const { error: orderError } = await supabase.from("orders").insert({
        order_number: generateOrderNumber(),
        customer_id: customerId,
        items: orderItems,
        subtotal: totalPrice,
        tax,
        shipping: 0,
        total,
        status: "pending",
        shipping_address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
      });

      if (orderError) throw orderError;

      // 3. Update customer totals
      await supabase.rpc("has_role", { _user_id: "00000000-0000-0000-0000-000000000000", _role: "user" }).then(() => {
        // Just a dummy call; real update below
      });
      
      // Update customer order count and spend
      const { data: custData } = await supabase
        .from("customers")
        .select("total_orders, total_spent")
        .eq("id", customerId)
        .single();

      if (custData) {
        await supabase.from("customers").update({
          total_orders: (custData.total_orders || 0) + 1,
          total_spent: (custData.total_spent || 0) + total,
        }).eq("id", customerId);
      }

      // 4. Deduct inventory
      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .single();

        if (product && product.stock_quantity !== null) {
          const newQty = Math.max(0, (product.stock_quantity || 0) - item.quantity);
          await supabase.from("products").update({
            stock_quantity: newQty,
            in_stock: newQty > 0,
          }).eq("id", item.id);
        }
      }

      toast({
        title: "Order placed successfully! 🎉",
        description: "You'll receive a confirmation email shortly.",
      });

      clearCart();
      setLoading(false);
      navigate("/");
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Order failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen">
      <SEOHead title="Checkout" description="Complete your purchase at Curated Home Source." />
      <Header />
      <main className="pt-[88px]" role="main">
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
                  </div>
                </div>
              </Card>

              {/* Shipping */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required value={formData.address} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required value={formData.city} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" required value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" name="zip" required value={formData.zip} onChange={handleChange} />
                  </div>
                </div>
              </Card>

              {/* Payment placeholder */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Payment</h2>
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Secure Payment Coming Soon</p>
                    <p className="text-xs text-amber-700">Stripe integration will be activated before launch. Orders are recorded for fulfillment.</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-grow">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-accent">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </Card>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
