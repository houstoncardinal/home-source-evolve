import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number; value: number }[]>([]);
  const [stockData, setStockData] = useState<{ name: string; value: number }[]>([]);
  const [priceRanges, setPriceRanges] = useState<{ range: string; count: number }[]>([]);
  const [brandData, setBrandData] = useState<{ name: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: products } = await supabase.from("products").select("*");
      if (!products) return;

      // Category breakdown
      const catMap: Record<string, { count: number; value: number }> = {};
      products.forEach((p) => {
        if (!catMap[p.category]) catMap[p.category] = { count: 0, value: 0 };
        catMap[p.category].count++;
        catMap[p.category].value += Number(p.price) || 0;
      });
      setCategoryData(
        Object.entries(catMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count)
      );

      // Stock status
      const inStock = products.filter((p) => p.in_stock).length;
      const outOfStock = products.filter((p) => !p.in_stock).length;
      setStockData([
        { name: "In Stock", value: inStock },
        { name: "Out of Stock", value: outOfStock },
      ]);

      // Price ranges
      const ranges = [
        { range: "Contact", min: -1, max: 0.01 },
        { range: "$1-$500", min: 0.01, max: 500 },
        { range: "$500-$1K", min: 500, max: 1000 },
        { range: "$1K-$2K", min: 1000, max: 2000 },
        { range: "$2K-$5K", min: 2000, max: 5000 },
        { range: "$5K+", min: 5000, max: Infinity },
      ];
      setPriceRanges(
        ranges.map((r) => ({
          range: r.range,
          count: products.filter((p) => Number(p.price) >= r.min && Number(p.price) < r.max).length,
        }))
      );

      // Brand breakdown
      const brandMap: Record<string, number> = {};
      products.forEach((p) => {
        const brand = p.brand || "Unbranded";
        brandMap[brand] = (brandMap[brand] || 0) + 1;
      });
      setBrandData(
        Object.entries(brandMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );

      // Top featured products
      setTopProducts(products.filter((p) => p.featured).slice(0, 8));
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  const totalProducts = categoryData.reduce((s, c) => s + c.count, 0);
  const totalValue = categoryData.reduce((s, c) => s + c.value, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">Inventory and catalog insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">In Stock</p>
                  <p className="text-2xl font-bold">{stockData[0]?.value || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Catalog Value</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Categories</p>
                  <p className="text-2xl font-bold">{categoryData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Stock Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Price Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceRanges}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Top Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {brandData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Featured Products */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Featured Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.category}</p>
                    <p className="text-sm font-semibold text-amber-600 mt-1">
                      {Number(p.price) > 0 ? `$${Number(p.price).toFixed(2)}` : "Contact"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No featured products</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
