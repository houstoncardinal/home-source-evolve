// @ts-nocheck
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, ShoppingCart, Users, DollarSign, TrendingUp,
  AlertTriangle, Activity, Star, ArrowUpRight, Zap,
  Clock, Target, Layers, RefreshCw, Sparkles, Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
  categoryBreakdown: { name: string; count: number }[];
  recentOrders: any[];
  revenueTrend: { name: string; total: number }[];
  topCustomers: { name: string; total_spent: number; total_orders: number }[];
  lowStock: { name: string; stock_quantity: number; category: string }[];
  recentProducts: any[];
}

const CHART_COLORS = ["hsl(30,62%,42%)", "hsl(210,70%,55%)", "hsl(150,60%,45%)", "hsl(270,60%,60%)", "hsl(0,65%,55%)", "hsl(330,60%,55%)"];

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, inStockProducts: 0, outOfStockProducts: 0,
    totalOrders: 0, totalCustomers: 0, totalRevenue: 0, avgOrderValue: 0,
    categoryBreakdown: [], recentOrders: [], revenueTrend: [],
    topCustomers: [], lowStock: [], recentProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalProducts },
        { count: inStockProducts },
        { count: outOfStockProducts },
        { count: totalOrders },
        { count: totalCustomers },
        { data: orderTotals },
        { data: products },
        { data: recentOrders },
        { data: revenueBuckets },
        { data: topCustomers },
        { data: lowStock },
        { data: recentProducts },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("in_stock", true),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("in_stock", false),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("products").select("category"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("total, created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from("customers").select("first_name, last_name, total_spent, total_orders").order("total_spent", { ascending: false }).limit(5),
        supabase.from("products").select("name, stock_quantity, category").lte("stock_quantity", 5).order("stock_quantity", { ascending: true }).limit(6),
        supabase.from("products").select("name, price, category, created_at, in_stock").order("created_at", { ascending: false }).limit(5),
      ]);

      const totalRevenue = orderTotals?.reduce((s, o) => s + (Number(o.total) || 0), 0) || 0;
      const avgOrderValue = (totalOrders || 0) > 0 ? totalRevenue / (totalOrders || 1) : 0;

      const catMap: Record<string, number> = {};
      products?.forEach((p) => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
      const categoryBreakdown = Object.entries(catMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

      const trendMap: Record<string, number> = {};
      revenueBuckets?.forEach((o) => {
        const day = new Date(o.created_at).toISOString().slice(5, 10);
        trendMap[day] = (trendMap[day] || 0) + (Number(o.total) || 0);
      });
      const revenueTrendData = Object.entries(trendMap).sort(([a], [b]) => a.localeCompare(b)).map(([name, total]) => ({ name, total }));

      setStats({
        totalProducts: totalProducts || 0,
        inStockProducts: inStockProducts || 0,
        outOfStockProducts: outOfStockProducts || 0,
        totalOrders: totalOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalRevenue,
        avgOrderValue,
        categoryBreakdown,
        recentOrders: recentOrders || [],
        revenueTrend: revenueTrendData,
        topCustomers: (topCustomers || []).map((c) => ({
          name: `${c.first_name} ${c.last_name}`,
          total_spent: c.total_spent || 0,
          total_orders: c.total_orders || 0,
        })),
        lowStock: (lowStock || []).map((p) => ({ ...p, category: p.category || "" })),
        recentProducts: recentProducts || [],
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchStats(); };

  const kpis = [
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`, icon: DollarSign, accent: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700", link: "/admin/analytics" },
    { title: "Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, accent: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-700", link: "/admin/orders" },
    { title: "Customers", value: stats.totalCustomers.toLocaleString(), icon: Users, accent: "from-violet-500 to-violet-600", bg: "bg-violet-50", text: "text-violet-700", link: "/admin/customers" },
    { title: "Products", value: stats.totalProducts.toLocaleString(), icon: Package, accent: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-700", link: "/admin/products" },
  ];

  const miniKpis = [
    { label: "Avg Order Value", value: `$${stats.avgOrderValue.toFixed(0)}`, icon: Target },
    { label: "In Stock", value: stats.inStockProducts.toString(), icon: Layers },
    { label: "Out of Stock", value: stats.outOfStockProducts.toString(), icon: AlertTriangle },
    { label: "Categories", value: stats.categoryBreakdown.length.toString(), icon: Sparkles },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time overview of your commerce operations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl bg-white border border-border/60 text-muted-foreground hover:text-foreground hover:shadow-md transition-all ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="hidden md:flex gap-2">
              {[
                { label: "Add Product", href: "/admin/products", icon: Package },
                { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
                { label: "Price Scanner", href: "/admin/competitive-pricing", icon: Zap },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground bg-white border border-border/60 rounded-xl hover:border-accent/40 hover:text-accent hover:shadow-md transition-all">
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi) => (
            <Link key={kpi.title} to={kpi.link}>
              <Card className="group relative overflow-hidden p-6 border-border/40 bg-white hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">{kpi.title}</p>
                    <p className="text-3xl font-bold text-foreground tracking-tight">{loading ? "—" : kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.text}`} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-border/30 to-transparent group-hover:via-accent/40 transition-all duration-500" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {miniKpis.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-border/40">
              <div className="p-2 rounded-xl bg-muted/50">
                <stat.icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-base font-bold text-foreground">{loading ? "—" : stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card className="p-6 border-border/40 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-accent hover:text-accent/80 font-semibold flex items-center gap-1 transition-colors">
              View Details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.revenueTrend}>
                <defs>
                  <linearGradient id="revGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(30,62%,42%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(30,62%,42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(36,16%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220,8%,46%)" }} axisLine={{ stroke: "hsl(36,16%,90%)" }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "hsl(220,8%,46%)" }} axisLine={{ stroke: "hsl(36,16%,90%)" }} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid hsl(36,16%,90%)", borderRadius: "12px", color: "hsl(220,18%,12%)", boxShadow: "0 8px 30px -8px rgba(0,0,0,0.1)" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(30,62%,42%)" strokeWidth={2.5} fill="url(#revGradLight)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Revenue data will appear as orders come in</p>
              </div>
            </div>
          )}
        </Card>

        {/* Two Column: Category + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Category Breakdown */}
          <Card className="lg:col-span-2 p-6 border-border/40 bg-white">
            <h3 className="text-base font-bold text-foreground mb-5">Category Mix</h3>
            {stats.categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {stats.categoryBreakdown.map((cat, i) => {
                  const pct = stats.totalProducts > 0 ? (cat.count / stats.totalProducts) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">{cat.count} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No products yet</p>
            )}
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-3 p-6 border-border/40 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-accent hover:text-accent/80 font-semibold transition-colors">
                View All
              </Link>
            </div>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recentOrders.map((order) => {
                  const style = statusStyle[order.status] || statusStyle.pending;
                  return (
                    <div key={order.id} className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-muted/20 border border-border/30 hover:border-border/60 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/5">
                          <ShoppingCart className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{order.order_number}</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[11px] font-medium border ${style}`}>
                          {order.status}
                        </Badge>
                        <span className="text-sm font-bold text-foreground">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Customers */}
          <Card className="p-6 border-border/40 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />Top Customers
              </h3>
              <Link to="/admin/customers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View</Link>
            </div>
            {stats.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No customers yet</p>
            ) : (
              <div className="space-y-2.5">
                {stats.topCustomers.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.total_orders} orders</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">${(c.total_spent || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Low Stock */}
          <Card className="p-6 border-border/40 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />Low Stock Alerts
              </h3>
              <Link to="/admin/products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manage</Link>
            </div>
            {stats.lowStock.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <Layers className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm text-muted-foreground">All inventory levels healthy</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.lowStock.map((p) => (
                  <div key={p.name} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-muted/20 border border-border/30">
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.category}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs font-bold border ${
                      (p.stock_quantity ?? 0) === 0
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}>
                      {p.stock_quantity ?? 0} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recently Added */}
          <Card className="p-6 border-border/40 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />Recently Added
              </h3>
              <Link to="/admin/products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View All</Link>
            </div>
            {stats.recentProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No products yet</p>
            ) : (
              <div className="space-y-2.5">
                {stats.recentProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-muted/20 border border-border/30">
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${Number(p.price).toFixed(0)}</p>
                      <span className={`text-[10px] font-semibold ${p.in_stock ? "text-emerald-600" : "text-red-500"}`}>
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Competitive Pricing Widget */}
        <CompetitivePricingWidget />
      </div>
    </AdminLayout>
  );
}

function CompetitivePricingWidget() {
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("competitor_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentScans(data || []));
  }, []);

  return (
    <Card className="p-6 border-border/40 bg-white">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" />
          Competitive Pricing Intelligence
        </h3>
        <Link to="/admin/competitive-pricing" className="text-xs text-accent hover:text-accent/80 font-semibold flex items-center gap-1 transition-colors">
          View Scanner <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {recentScans.length === 0 ? (
        <div className="py-12 text-center">
          <Zap className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No price scans yet</p>
          <Link to="/admin/competitive-pricing" className="text-xs text-accent hover:text-accent/80 mt-2 inline-block font-semibold">
            Run your first scan →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentScans.map((scan) => (
            <div key={scan.id} className="px-5 py-4 rounded-xl bg-muted/20 border border-border/30 hover:border-border/60 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{scan.competitor_name}</p>
                <Badge variant="outline" className={`text-[10px] font-semibold border ${
                  scan.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  {scan.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{scan.total_products_found || 0} found</span>
                <span>·</span>
                <span>{scan.matches_found || 0} matched</span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-2">{new Date(scan.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
