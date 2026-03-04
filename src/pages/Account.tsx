import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, User, MapPin, LogOut, ShoppingBag, Clock, Truck, CheckCircle2, XCircle } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: any[];
  tracking_number: string | null;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-800", label: "Pending" },
  processing: { icon: Package, color: "bg-blue-100 text-blue-800", label: "Processing" },
  shipped: { icon: Truck, color: "bg-indigo-100 text-indigo-800", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "bg-green-100 text-green-800", label: "Delivered" },
  cancelled: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Cancelled" },
};

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "", address: "", city: "", state: "", zip: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Load user metadata into profile form
    const meta = user.user_metadata || {};
    setProfile({
      firstName: meta.first_name || "",
      lastName: meta.last_name || "",
      phone: meta.phone || "",
      address: meta.address || "",
      city: meta.city || "",
      state: meta.state || "",
      zip: meta.zip || "",
    });

    // Load orders by customer email
    const fetchOrders = async () => {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email!)
        .limit(1);

      if (customer && customer.length > 0) {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", customer[0].id)
          .order("created_at", { ascending: false });

        setOrders((data as Order[]) || []);
      }
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
      },
    });
    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <SEOHead title="My Account" description="Manage your account and view order history." />
      <Header />
      <main className="pt-[88px]" role="main">
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold">My Account</h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="h-4 w-4" />Orders</TabsTrigger>
              <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              {loadingOrders ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : orders.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h2 className="text-2xl font-display font-bold mb-2">No Orders Yet</h2>
                  <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                  <Link to="/products"><Button>Browse Products</Button></Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const sc = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = sc.icon;
                    const items = Array.isArray(order.items) ? order.items : [];
                    return (
                      <Card key={order.id} className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-bold text-lg">Order #{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${sc.color} gap-1`}>
                              <StatusIcon className="h-3 w-3" />{sc.label}
                            </Badge>
                            <span className="font-bold text-lg">${Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>

                        {order.tracking_number && (
                          <p className="text-sm text-muted-foreground mb-3">
                            <Truck className="h-3.5 w-3.5 inline mr-1" />
                            Tracking: <span className="font-medium text-foreground">{order.tracking_number}</span>
                          </p>
                        )}

                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {items.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 min-w-[180px] bg-muted/30 rounded-lg p-2">
                              {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} · ${Number(item.price).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                          {items.length > 4 && (
                            <div className="flex items-center px-4 text-sm text-muted-foreground">+{items.length - 4} more</div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-6 max-w-2xl">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />Profile & Shipping Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pFirstName">First Name</Label>
                    <Input id="pFirstName" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pLastName">Last Name</Label>
                    <Input id="pLastName" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="pPhone">Phone</Label>
                    <Input id="pPhone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="pAddress">Address</Label>
                    <Input id="pAddress" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pCity">City</Label>
                    <Input id="pCity" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pState">State</Label>
                    <Input id="pState" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pZip">ZIP Code</Label>
                    <Input id="pZip" value={profile.zip} onChange={(e) => setProfile({ ...profile, zip: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="mt-6" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Profile"}
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}
