import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Upload,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  price: number;
  compare_at_price: number | null;
  in_stock: boolean;
  stock_quantity: number | null;
  featured: boolean;
  badge: string | null;
  brand: string | null;
  description: string | null;
  sku: string | null;
  created_at: string;
  primary_image?: string;
}

const CATEGORIES = ["All", "Living Room", "Dining Room", "Bedroom", "Office", "Accessories"];
const PAGE_SIZE = 20;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*, product_images(url, is_primary)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (categoryFilter !== "All") {
        query = query.eq("category", categoryFilter);
      }
      if (stockFilter === "in_stock") query = query.eq("in_stock", true);
      if (stockFilter === "out_of_stock") query = query.eq("in_stock", false);

      const { data, count, error } = await query;
      if (error) throw error;

      const productsWithImages = (data || []).map((p) => {
        const primary = (p.product_images || []).find((i: any) => i.is_primary) || p.product_images?.[0];
        return { ...p, primary_image: primary?.url };
      });

      setProducts(productsWithImages);
      setTotalCount(count || 0);
      setSelectedIds(new Set()); // reset selection on new fetch
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku?.toLowerCase().includes(search.toLowerCase()) ||
          (p.brand || "").toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
      fetchProducts();
    }
  };

  const handleToggleStock = async (id: string, inStock: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ in_stock: !inStock })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update stock status");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, in_stock: !inStock } : p))
      );
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ featured: !featured })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update featured status");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p))
      );
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);

    const { id, primary_image, ...updateData } = editingProduct;
    const { error } = await supabase
      .from("products")
      .update({
        name: updateData.name,
        price: updateData.price,
        compare_at_price: updateData.compare_at_price,
        category: updateData.category,
        subcategory: updateData.subcategory,
        description: updateData.description,
        in_stock: updateData.in_stock,
        stock_quantity: updateData.stock_quantity,
        featured: updateData.featured,
        badge: updateData.badge,
        brand: updateData.brand,
        sku: updateData.sku,
      })
      .eq("id", id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save product");
    } else {
      toast.success("Product updated");
      setShowEditDialog(false);
      fetchProducts();
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllOnPage = () => {
    setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = async (fields: Partial<Product>) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("products").update(fields).in("id", ids);
    if (error) {
      toast.error("Bulk update failed");
    } else {
      toast.success("Bulk update applied");
      fetchProducts();
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) toast.error("Bulk delete failed");
    else {
      toast.success("Products deleted");
      fetchProducts();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-500 mt-1">
              {totalCount} products in your inventory
            </p>
          </div>
        </div>

        {/* Filters + bulk actions */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stockFilter}
                onValueChange={(v: "all" | "in_stock" | "out_of_stock") => { setStockFilter(v); setPage(0); }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedIds.size > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-amber-400 text-amber-600">
                  {selectedIds.size} selected
                </Badge>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ in_stock: true })}>
                  Mark In Stock
                </Button>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ in_stock: false })}>
                  Mark Out
                </Button>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ featured: true })}>
                  Feature
                </Button>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ featured: false })}>
                  Unfeature
                </Button>
                <Button variant="destructive" size="sm" onClick={bulkDelete}>
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-slate-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3">
                        <input
                          type="checkbox"
                          onChange={(e) => e.target.checked ? selectAllOnPage() : clearSelection()}
                          className="h-4 w-4 accent-amber-500"
                          aria-label="Select all"
                        />
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Featured</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="h-4 w-4 accent-amber-500"
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.primary_image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            />
                            <div>
                              <p className="font-medium text-slate-900 text-sm line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {product.sku || product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          {Number(product.price) > 0 ? (
                            <span className="font-semibold text-slate-900">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">Contact</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => handleToggleStock(product.id, product.in_stock)}>
                            <Badge
                              className={
                                product.in_stock
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }
                            >
                              {product.in_stock ? "In Stock" : "Out"}
                            </Badge>
                          </button>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              className="w-20 h-9"
                              defaultValue={product.stock_quantity || 0}
                              onBlur={async (e) => {
                                const qty = parseInt(e.target.value) || 0;
                                await supabase.from("products").update({ stock_quantity: qty }).eq("id", product.id);
                                setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock_quantity: qty } : p));
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Switch
                            checked={product.featured || false}
                            onCheckedChange={() => handleToggleFeatured(product.id, product.featured || false)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowEditDialog(true);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id, product.name)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} of{" "}
                  {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      value={editingProduct.sku || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, sku: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compare at Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.compare_at_price || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          compare_at_price: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={editingProduct.stock_quantity || 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock_quantity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingProduct.category}
                      onValueChange={(v) =>
                        setEditingProduct({ ...editingProduct, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      value={editingProduct.brand || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, brand: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={editingProduct.description || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Badge</Label>
                    <Input
                      value={editingProduct.badge || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          badge: e.target.value || null,
                        })
                      }
                      placeholder="e.g. New Arrival, On Sale"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Input
                      value={editingProduct.subcategory || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          subcategory: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingProduct.in_stock}
                      onCheckedChange={(v) =>
                        setEditingProduct({ ...editingProduct, in_stock: v })
                      }
                    />
                    <Label>In Stock</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingProduct.featured || false}
                      onCheckedChange={(v) =>
                        setEditingProduct({ ...editingProduct, featured: v })
                      }
                    />
                    <Label>Featured</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProduct}
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
