import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryInfo {
  name: string;
  count: number;
  inStock: number;
  outOfStock: number;
  featured: number;
  subcategories: { name: string; count: number }[];
  avgPrice: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: products } = await supabase
        .from("products")
        .select("category, subcategory, in_stock, featured, price");

      if (!products) return;

      const catMap: Record<string, CategoryInfo> = {};
      products.forEach((p) => {
        if (!catMap[p.category]) {
          catMap[p.category] = {
            name: p.category,
            count: 0,
            inStock: 0,
            outOfStock: 0,
            featured: 0,
            subcategories: [],
            avgPrice: 0,
          };
        }
        const cat = catMap[p.category];
        cat.count++;
        if (p.in_stock) cat.inStock++;
        else cat.outOfStock++;
        if (p.featured) cat.featured++;
        cat.avgPrice += Number(p.price) || 0;

        if (p.subcategory) {
          const existing = cat.subcategories.find((s) => s.name === p.subcategory);
          if (existing) existing.count++;
          else cat.subcategories.push({ name: p.subcategory, count: 1 });
        }
      });

      const result = Object.values(catMap)
        .map((c) => ({ ...c, avgPrice: c.count > 0 ? c.avgPrice / c.count : 0 }))
        .sort((a, b) => b.count - a.count);

      setCategories(result);
    } catch (err) {
      console.error(err);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">
            {categories.length} categories in your catalog
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card key={cat.name} className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cat.name}</CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {cat.count} products
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-700">{cat.inStock}</p>
                    <p className="text-[10px] text-green-600 uppercase font-medium">In Stock</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-700">{cat.outOfStock}</p>
                    <p className="text-[10px] text-red-600 uppercase font-medium">Out</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <p className="text-lg font-bold text-amber-700">{cat.featured}</p>
                    <p className="text-[10px] text-amber-600 uppercase font-medium">Featured</p>
                  </div>
                </div>

                {/* Avg Price */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Avg. Price</span>
                  <span className="font-semibold">
                    {cat.avgPrice > 0
                      ? `$${cat.avgPrice.toFixed(2)}`
                      : "Contact for Pricing"}
                  </span>
                </div>

                {/* Subcategories */}
                {cat.subcategories.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Subcategories</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.subcategories
                        .sort((a, b) => b.count - a.count)
                        .map((sub) => (
                          <Badge key={sub.name} variant="secondary" className="text-xs">
                            {sub.name} ({sub.count})
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <Link to={`/admin/products?category=${encodeURIComponent(cat.name)}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Eye className="h-4 w-4 mr-2" />
                    View Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No categories found</p>
              <p className="text-sm mt-1">Import products to see categories here</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
