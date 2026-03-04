// @ts-nocheck
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Eye,
  Clock,
  Target,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
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

const CHART_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#ec4899"];

const statusConfig: Record<string, { color: string; bg: string }> = {
  pending: { color: "text-amber-400", bg: "bg-amber-400/10" },
  processing: { color: "text-blue-400", bg: "bg-blue-400/10" },
  shipped: { color: "text-cyan-400", bg: "bg-cyan-400/10" },
  delivered: { color: "text-emerald-400", bg: "bg-emerald-400/10" },
  cancelled: { color: "text-red-400", bg: "bg-red-400/10" },
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
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("orders").select("total, created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from("customers").select("first_name, last_name, total_spent, total_orders").order("total_spent", { ascending: false }).limit(5),
        supabase.from("products").select("name, stock_quantity, category").lte("stock_quantity", 5).order("stock_quantity", { ascending: true }).limit(8),
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`, icon: DollarSign, gradient: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20", link: "/admin/analytics" },
    { title: "Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20", link: "/admin/orders" },
    { title: "Customers", value: stats.totalCustomers.toLocaleString(), icon: Users, gradient: "from-violet-500 to-violet-600", shadow: "shadow-violet-500/20", link: "/admin/customers" },
    { title: "Products", value: stats.totalProducts.toLocaleString(), icon: Package, gradient: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/20", link: "/admin/products" },
  ];

  const miniStats = [
    { label: "Avg Order Value", value: `$${stats.avgOrderValue.toFixed(0)}`, icon: Target },
    { label: "In Stock", value: stats.inStockProducts.toString(), icon: Layers },
    { label: "Out of Stock", value: stats.outOfStockProducts.toString(), icon: AlertTriangle },
    { label: "Categories", value: stats.categoryBreakdown.length.toString(), icon: Tags },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time overview of your commerce operations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg bg-white/[0.04] border border-[#1e2235] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {[
                { label: "Add Product", href: "/admin/products", icon: Package },
                { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
                { label: "Price Scanner", href: "/admin/competitive-pricing", icon: Zap },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 bg-white/[0.04] border border-[#1e2235] rounded-lg hover:border-amber-500/30 hover:text-amber-400 transition-all">
                    <action.icon className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <div className="group relative overflow-hidden rounded-xl bg-[#0e1122] border border-[#1e2235] p-5 hover:border-[#2a2f48] transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{loading ? "—" : stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-amber-500/30 transition-all duration-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* Mini Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {miniStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0e1122] border border-[#1e2235]">
              <stat.icon className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-[11px] text-slate-600 font-medium">{stat.label}</p>
                <p className="text-sm font-semibold text-slate-300">{loading ? "—" : stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              Details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} axisLine={{ stroke: "#1e2235" }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#475569" }} axisLine={{ stroke: "#1e2235" }} />
                <Tooltip
                  contentStyle={{ background: "#0e1122", border: "1px solid #1e2235", borderRadius: "8px", color: "#e2e8f0" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-600">Revenue data will appear as orders come in</p>
              </div>
            </div>
          )}
        </div>

        {/* Two Column: Category + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Category Breakdown */}
          <div className="lg:col-span-2 rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Category Mix</h3>
            {stats.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat, i) => {
                  const pct = stats.totalProducts > 0 ? (cat.count / stats.totalProducts) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">{cat.name}</span>
                        <span className="text-xs text-slate-500">{cat.count} items ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1d30] overflow-hidden">
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
              <p className="text-sm text-slate-600">No products yet</p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-3 rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                View All
              </Link>
            </div>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-2">
                {stats.recentOrders.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <div key={order.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02] border border-[#1a1d30] hover:border-[#2a2f48] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${sc.bg}`}>
                          <ShoppingCart className={`h-3.5 w-3.5 ${sc.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{order.order_number}</p>
                          <p className="text-[11px] text-slate-600">{new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-semibold text-white">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-600">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Customers, Low Stock, Recent Products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Customers */}
          <div className="rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                Top Customers
              </h3>
              <Link to="/admin/customers" className="text-xs text-slate-500 hover:text-slate-300">View</Link>
            </div>
            {stats.topCustomers.length === 0 ? (
              <p className="text-sm text-slate-600">No customers yet</p>
            ) : (
              <div className="space-y-2">
                {stats.topCustomers.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-[#1a1d30]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">{c.name}</p>
                        <p className="text-[11px] text-slate-600">{c.total_orders} orders</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">${(c.total_spent || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Low Stock Alerts
              </h3>
              <Link to="/admin/products" className="text-xs text-slate-500 hover:text-slate-300">Manage</Link>
            </div>
            {stats.lowStock.length === 0 ? (
              <div className="py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <Layers className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-500">All inventory levels healthy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.lowStock.map((p) => (
                  <div key={p.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-[#1a1d30]">
                    <div>
                      <p className="text-sm font-medium text-slate-300 truncate max-w-[160px]">{p.name}</p>
                      <p className="text-[11px] text-slate-600">{p.category}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      (p.stock_quantity ?? 0) === 0 
                        ? "bg-red-500/10 text-red-400" 
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {p.stock_quantity ?? 0} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Added */}
          <div className="rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Recently Added
              </h3>
              <Link to="/admin/products" className="text-xs text-slate-500 hover:text-slate-300">View All</Link>
            </div>
            {stats.recentProducts.length === 0 ? (
              <p className="text-sm text-slate-600">No products yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-[#1a1d30]">
                    <div>
                      <p className="text-sm font-medium text-slate-300 truncate max-w-[160px]">{p.name}</p>
                      <p className="text-[11px] text-slate-600">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${Number(p.price).toFixed(0)}</p>
                      <span className={`text-[10px] font-medium ${p.in_stock ? "text-emerald-400" : "text-red-400"}`}>
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Competitive Pricing Widget */}
        <CompetitivePricingWidget />
      </div>
    </AdminLayout>
  );
}

function Tags(props: any) {
  return <Layers {...props} />;
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
    <div className="rounded-xl bg-[#0e1122] border border-[#1e2235] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-400" />
          Competitive Pricing Intelligence
        </h3>
        <Link to="/admin/competitive-pricing" className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
          View Scanner <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {recentScans.length === 0 ? (
        <div className="py-6 text-center">
          <Zap className="h-8 w-8 mx-auto mb-2 text-slate-700" />
          <p className="text-sm text-slate-600">No price scans yet</p>
          <Link to="/admin/competitive-pricing" className="text-xs text-amber-400 hover:text-amber-300 mt-1 inline-block">
            Run your first scan →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentScans.map((scan) => (
            <div key={scan.id} className="px-4 py-3 rounded-lg bg-white/[0.02] border border-[#1a1d30] hover:border-[#2a2f48] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-300">{scan.competitor_name}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  scan.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {scan.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>{scan.total_products_found || 0} found</span>
                <span>·</span>
                <span>{scan.matches_found || 0} matched</span>
              </div>
              <p className="text-[10px] text-slate-700 mt-1">{new Date(scan.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
