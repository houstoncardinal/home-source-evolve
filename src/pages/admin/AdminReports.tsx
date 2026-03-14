import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, TrendingUp, DollarSign, ShoppingCart, Users, BarChart3, Calendar } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#d97706", "#0891b2", "#7c3aed", "#059669", "#dc2626", "#2563eb", "#ea580c", "#4f46e5"];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0,
    revenueByDay: [] as { date: string; revenue: number; orders: number }[],
    topProducts: [] as { name: string; revenue: number; quantity: number }[],
    categoryBreakdown: [] as { name: string; value: number }[],
    statusBreakdown: [] as { name: string; value: number }[],
    topCustomers: [] as { name: string; email: string; spent: number; orders: number }[],
  });

  useEffect(() => { fetchReports(); }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let ordersQuery = supabase.from("orders").select("*");
      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const since = new Date(Date.now() - days * 86400000).toISOString();
        ordersQuery = ordersQuery.gte("created_at", since);
      }
      const { data: orders } = await ordersQuery;
      const { data: customers } = await supabase.from("customers").select("*");
      const { data: products } = await supabase.from("products").select("name, category, price");

      const orderList = orders || [];
      const totalRevenue = orderList.reduce((s, o) => s + (Number(o.total) || 0), 0);
      const totalOrders = orderList.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Revenue by day
      const dayMap: Record<string, { revenue: number; orders: number }> = {};
      orderList.forEach(o => {
        const day = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dayMap[day]) dayMap[day] = { revenue: 0, orders: 0 };
        dayMap[day].revenue += Number(o.total) || 0;
        dayMap[day].orders += 1;
      });
      const revenueByDay = Object.entries(dayMap).map(([date, d]) => ({ date, ...d }));

      // Top products from order items
      const productMap: Record<string, { revenue: number; quantity: number }> = {};
      orderList.forEach(o => {
        const items = (o.items as any[]) || [];
        items.forEach((item: any) => {
          const name = item.name || "Unknown";
          if (!productMap[name]) productMap[name] = { revenue: 0, quantity: 0 };
          productMap[name].revenue += (Number(item.price) || 0) * (item.quantity || 1);
          productMap[name].quantity += item.quantity || 1;
        });
      });
      const topProducts = Object.entries(productMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Category breakdown
      const catMap: Record<string, number> = {};
      (products || []).forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
      const categoryBreakdown = Object.entries(catMap).map(([name, value]) => ({ name, value }));

      // Status breakdown
      const statusMap: Record<string, number> = {};
      orderList.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
      const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      // Top customers
      const topCustomers = (customers || [])
        .filter(c => (Number(c.total_spent) || 0) > 0)
        .sort((a, b) => (Number(b.total_spent) || 0) - (Number(a.total_spent) || 0))
        .slice(0, 10)
        .map(c => ({
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          spent: Number(c.total_spent) || 0,
          orders: c.total_orders || 0,
        }));

      setStats({
        totalRevenue, totalOrders, totalCustomers: (customers || []).length, avgOrderValue,
        revenueByDay, topProducts, categoryBreakdown, statusBreakdown, topCustomers,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    }
    setLoading(false);
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const exportReport = () => {
    const sections = [
      "SALES SUMMARY REPORT",
      `Date Range: ${dateRange}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Total Revenue: ${fmt(stats.totalRevenue)}`,
      `Total Orders: ${stats.totalOrders}`,
      `Total Customers: ${stats.totalCustomers}`,
      `Average Order Value: ${fmt(stats.avgOrderValue)}`,
      "",
      "TOP PRODUCTS",
      "Name,Revenue,Quantity",
      ...stats.topProducts.map(p => `"${p.name}",${p.revenue.toFixed(2)},${p.quantity}`),
      "",
      "TOP CUSTOMERS",
      "Name,Email,Total Spent,Orders",
      ...stats.topCustomers.map(c => `"${c.name}","${c.email}",${c.spent.toFixed(2)},${c.orders}`),
      "",
      "DAILY REVENUE",
      "Date,Revenue,Orders",
      ...stats.revenueByDay.map(d => `"${d.date}",${d.revenue.toFixed(2)},${d.orders}`),
    ];
    const blob = new Blob([sections.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Comprehensive store performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {(["7d", "30d", "90d", "all"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateRange === r ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {r === "all" ? "All Time" : r.replace("d", " Days")}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportReport} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", value: fmt(stats.totalRevenue), icon: DollarSign, color: "amber" },
            { label: "Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "blue" },
            { label: "Customers", value: stats.totalCustomers.toString(), icon: Users, color: "purple" },
            { label: "Avg. Order", value: fmt(stats.avgOrderValue), icon: TrendingUp, color: "emerald" },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-white border-border/60 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{loading ? "—" : kpi.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl bg-${kpi.color}-50 flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-white border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueByDay}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#d97706" fill="url(#revenueGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-white border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {stats.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card className="bg-white border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-white border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No order data yet</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.quantity} sold</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold shrink-0">${p.revenue.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Customers Table */}
        <Card className="bg-white border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No customer data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${c.spent.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
