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
  Clock,
  Eye,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

interface DashboardStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  categoryBreakdown: { name: string; count: number }[];
  recentOrders: any[];
  revenueTrend: { name: string; total: number }[];
  topCustomers: { name: string; total_spent: number; total_orders: number }[];
  lowStock: { name: string; stock_quantity: number }[];
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#ec4899"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    categoryBreakdown: [],
    recentOrders: [],
    revenueTrend: [],
    topCustomers: [],
    lowStock: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: inStockProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("in_stock", true);

      const { count: outOfStockProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("in_stock", false);

      const { data: products } = await supabase
        .from("products")
        .select("category");

      const catMap: Record<string, number> = {};
      products?.forEach((p) => {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(catMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { data: orderTotals } = await supabase
        .from("orders")
        .select("total");

      const totalRevenue = orderTotals?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

      const { count: totalCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: revenueBuckets } = await supabase
        .from("orders")
        .select("total, created_at")
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString());

      const trendMap: Record<string, number> = {};
      revenueBuckets?.forEach((o) => {
        const day = new Date(o.created_at).toISOString().slice(0, 10);
        trendMap[day] = (trendMap[day] || 0) + (Number(o.total) || 0);
      });
      const revenueTrend = Object.entries(trendMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, total]) => ({ name, total }));

      const { data: topCustomers } = await supabase
        .from("customers")
        .select("first_name, last_name, total_spent, total_orders")
        .order("total_spent", { ascending: false })
        .limit(5);

      const { data: lowStock } = await supabase
        .from("products")
        .select("name, stock_quantity")
        .lte("stock_quantity", 5)
        .order("stock_quantity", { ascending: true })
        .limit(8);

      setStats({
        totalProducts: totalProducts || 0,
        inStockProducts: inStockProducts || 0,
        outOfStockProducts: outOfStockProducts || 0,
        totalOrders: totalOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalRevenue,
        categoryBreakdown,
        recentOrders: recentOrders || [],
        revenueTrend,
        topCustomers: (topCustomers || []).map((c) => ({
          name: `${c.first_name} ${c.last_name}`,
          total_spent: c.total_spent || 0,
          total_orders: c.total_orders || 0,
        })),
        lowStock: lowStock || [],
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      link: "/admin/products",
      change: `${stats.inStockProducts} in stock`,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      link: "/admin/orders",
      change: "All time",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      link: "/admin/customers",
      change: "Registered",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      link: "/admin/analytics",
      change: "Lifetime",
    },
  ];

  const quickActions = [
    { label: "Add Product", href: "/admin/products", icon: Package },
    { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Run Price Scan", href: "/admin/competitive-pricing", icon: Zap },
    { label: "Analytics", href: "/admin/analytics", icon: Activity },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here's your store overview.</p>
          </div>
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-all shadow-sm">
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 hover:border-amber-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {loading ? "..." : stat.value}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Revenue Trend (full width) */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Revenue Trend (30 Days)
            </CardTitle>
            <Link to="/admin/analytics" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              Full Analytics <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.revenueTrend}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Revenue data will appear here as orders come in</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  {loading ? "Loading..." : "No products yet. Import your catalog!"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Pie */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.categoryBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  {loading ? "Loading..." : "No data available"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Inventory & Orders Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Alert */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-800">In Stock</span>
                </div>
                <span className="text-lg font-bold text-emerald-700">{stats.inStockProducts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-800">Out of Stock</span>
                </div>
                <span className="text-lg font-bold text-red-700">{stats.outOfStockProducts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-blue-800">Total SKUs</span>
                </div>
                <span className="text-lg font-bold text-blue-700">{stats.totalProducts}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900">Recent Orders</CardTitle>
              <Link to="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{order.order_number}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${Number(order.total).toFixed(2)}</p>
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.status === "delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No orders yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Top Customers, Low Stock, Competitive Pricing */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Customers */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Top Customers
              </CardTitle>
              <Link to="/admin/customers" className="text-sm text-blue-600 hover:underline">View</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topCustomers.length === 0 && <p className="text-slate-500 text-sm">No customers yet.</p>}
              {stats.topCustomers.map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-amber-200 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.total_orders} orders</p>
                  </div>
                  <p className="font-semibold text-emerald-600">${(c.total_spent || 0).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-500" />
                Low Stock Alerts
              </CardTitle>
              <Link to="/admin/products" className="text-sm text-blue-600 hover:underline">Manage</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.lowStock.length === 0 && <p className="text-slate-500 text-sm">All items are healthy.</p>}
              {stats.lowStock.map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-rose-200 transition-colors">
                  <p className="font-medium text-slate-900 text-sm truncate max-w-[180px]">{p.name}</p>
                  <Badge variant="outline" className="border-amber-400 text-amber-600 text-xs">
                    Qty: {p.stock_quantity ?? 0}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Competitive Pricing Widget */}
          <CompetitivePricingWidget />
        </div>
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
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-600" />
          Competitive Pricing
        </CardTitle>
        <Link to="/admin/competitive-pricing" className="text-sm text-blue-600 hover:underline">View All</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentScans.length === 0 && (
          <p className="text-slate-500 text-sm">
            No scans yet.{" "}
            <Link to="/admin/competitive-pricing" className="text-amber-600 hover:underline">
              Run your first scan
            </Link>
          </p>
        )}
        {recentScans.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-amber-200 transition-colors">
            <div>
              <p className="font-semibold text-slate-900">{scan.competitor_name}</p>
              <p className="text-xs text-slate-500">{new Date(scan.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">{scan.total_products_found} products</Badge>
              <Badge variant="outline" className="border-emerald-300 text-emerald-600 text-xs">{scan.matches_found} matches</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
