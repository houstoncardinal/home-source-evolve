// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  DollarSign,
  ImagePlus,
  RefreshCw,
  Percent,
  Tag,
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

const CATEGORIES = [
  "All",
  "Living Room",
  "Bedroom",
  "Dining Room",
  "Mattresses",
  "Kids & Teens",
  "Office",
  "Patio",
  "Accessories",
];
const PAGE_SIZE = 20;

const emptyProduct: Omit<Product, "id" | "created_at" | "primary_image"> = {
  name: "",
  slug: "",
  category: "Living Room",
  subcategory: null,
  price: 0,
  compare_at_price: null,
  in_stock: true,
  stock_quantity: 10,
  featured: false,
  badge: null,
  brand: "",
  description: "",
  sku: null,
};

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkPriceDialog, setShowBulkPriceDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [productImages, setProductImages] = useState<
    { id: string; url: string; is_primary: boolean; display_order: number }[]
  >([]);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [bulkPriceMode, setBulkPriceMode] = useState<"set" | "increase_pct" | "decrease_pct" | "increase_amt" | "decrease_amt">("set");
  const [bulkPriceValue, setBulkPriceValue] = useState("");
  const [backfillRunning, setBackfillRunning] = useState(false);

  const fetchProductImages = async (productId: string) => {
    const { data } = await supabase
      .from("product_images")
      .select("id, url, is_primary, display_order")
      .eq("product_id", productId)
      .order("display_order");
    setProductImages(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let countQuery = supabase
        .from("products")
        .select("id", { count: "exact", head: true });

      let query = supabase
        .from("products")
        .select("*, product_images(url, is_primary)" as any)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (categoryFilter !== "All") {
        query = query.eq("category", categoryFilter);
        countQuery = countQuery.eq("category", categoryFilter);
      }
      if (stockFilter === "in_stock") {
        query = query.eq("in_stock", true);
        countQuery = countQuery.eq("in_stock", true);
      }
      if (stockFilter === "out_of_stock") {
        query = query.eq("in_stock", false);
        countQuery = countQuery.eq("in_stock", false);
      }

      const [{ data, error }, { count }] = await Promise.all([query, countQuery]);
      if (error) throw error;

      const productsWithImages = (data || []).map((p: any) => {
        const primary = (p.product_images || []).find((i: any) => i.is_primary) || p.product_images?.[0];
        return { ...p, primary_image: primary?.url };
      });

      setProducts(productsWithImages);
      setTotalCount(count || 0);
      setSelectedIds(new Set());
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

  // ---- CRUD ----
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    // Delete related images first
    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("product_features").delete().eq("product_id", id);
    await supabase.from("product_colors").delete().eq("product_id", id);
    await supabase.from("product_textures").delete().eq("product_id", id);
    await supabase.from("product_variations").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Failed to delete product");
    else { toast.success("Product deleted"); fetchProducts(); }
  };

  const handleToggleStock = async (id: string, inStock: boolean) => {
    const { error } = await supabase.from("products").update({ in_stock: !inStock }).eq("id", id);
    if (error) toast.error("Failed to update");
    else setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, in_stock: !inStock } : p)));
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase.from("products").update({ featured: !featured }).eq("id", id);
    if (error) toast.error("Failed to update");
    else setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p)));
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);
    const { id, primary_image, created_at, ...updateData } = editingProduct;
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
    if (error) toast.error("Failed to save product");
    else { toast.success("Product updated"); setShowEditDialog(false); fetchProducts(); }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) { toast.error("Product name is required"); return; }
    setSaving(true);
    const slug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 80) + `-${Date.now()}`;
    const { error } = await supabase.from("products").insert({ ...newProduct, slug });
    setSaving(false);
    if (error) toast.error("Failed to add product: " + error.message);
    else {
      toast.success("Product added");
      setShowAddDialog(false);
      setNewProduct(emptyProduct);
      fetchProducts();
    }
  };

  // ---- Selection & Bulk ----
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllOnPage = () => setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = async (fields: Record<string, any>) => {
    if (selectedIds.size === 0) return;
    const { error } = await supabase.from("products").update(fields).in("id", Array.from(selectedIds));
    if (error) toast.error("Bulk update failed");
    else { toast.success(`${selectedIds.size} products updated`); fetchProducts(); }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) return;
    const ids = Array.from(selectedIds);
    // Delete dependents first
    for (const table of ["product_images", "product_features", "product_colors", "product_textures", "product_variations"]) {
      await supabase.from(table).delete().in("product_id", ids);
    }
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) toast.error("Bulk delete failed");
    else { toast.success("Products deleted"); fetchProducts(); }
  };

  const handleBulkPrice = async () => {
    if (selectedIds.size === 0 || !bulkPriceValue) return;
    const val = parseFloat(bulkPriceValue);
    if (isNaN(val)) { toast.error("Enter a valid number"); return; }

    setSaving(true);
    const ids = Array.from(selectedIds);

    if (bulkPriceMode === "set") {
      await supabase.from("products").update({ price: val }).in("id", ids);
    } else {
      // Need to fetch current prices and compute new ones
      const { data: current } = await supabase.from("products").select("id, price").in("id", ids);
      if (current) {
        const updates = current.map((p: any) => {
          const currentPrice = typeof p.price === "string" ? parseFloat(p.price) : p.price;
          let newPrice = currentPrice;
          switch (bulkPriceMode) {
            case "increase_pct": newPrice = currentPrice * (1 + val / 100); break;
            case "decrease_pct": newPrice = currentPrice * (1 - val / 100); break;
            case "increase_amt": newPrice = currentPrice + val; break;
            case "decrease_amt": newPrice = currentPrice - val; break;
          }
          return supabase.from("products").update({ price: Math.max(0, Math.round(newPrice * 100) / 100) }).eq("id", p.id);
        });
        await Promise.all(updates);
      }
    }
    setSaving(false);
    toast.success(`Prices updated for ${ids.length} products`);
    setShowBulkPriceDialog(false);
    setBulkPriceValue("");
    fetchProducts();
  };

  // ---- Image Backfill ----
  const runImageBackfill = async () => {
    setBackfillRunning(true);
    toast.info("Starting full catalog image repair in safe batches...");
    let totalInserted = 0;
    try {
      let categoryStart = 0;
      let productOffset = 0;

      for (let iteration = 0; iteration < 200; iteration++) {
        const res = await supabase.functions.invoke("import-catalog", {
          body: { mode: "repair-images", batch_start: categoryStart, batch_size: 2, limit: 12, product_offset: productOffset },
        });
        if (res.error) throw res.error;

        const d = res.data || {};
        totalInserted += d?.images_inserted || 0;
        toast.info(`Repair batch ${iteration + 1}: ${d?.processed_products || 0} checked, ${d?.images_inserted || 0} repaired`);

        if (typeof d?.next_product_offset === "number") {
          productOffset = d.next_product_offset;
          continue;
        }

        if (typeof d?.next_batch === "number") {
          categoryStart = d.next_batch;
          productOffset = 0;
          continue;
        }

        break;
      }
      toast.success(`Image backfill complete! ${totalInserted} images added.`);
      fetchProducts();
    } catch (err: any) {
      toast.error("Backfill error: " + err.message);
    }
    setBackfillRunning(false);
  };

  // ---- CSV Export ----
  const exportCSV = () => {
    const headers = ["Name", "SKU", "Category", "Subcategory", "Price", "Compare At", "Stock", "In Stock", "Featured", "Brand", "Badge"];
    const rows = filteredProducts.map((p) => [
      p.name, p.sku || "", p.category, p.subcategory || "", p.price, p.compare_at_price || "",
      p.stock_quantity ?? 0, p.in_stock ? "Yes" : "No", p.featured ? "Yes" : "No", p.brand || "", p.badge || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Product Form ----
  const ProductForm = ({
    data,
    onChange,
    onSave,
    saveLabel,
    showImages = false,
  }: {
    data: any;
    onChange: (d: any) => void;
    onSave: () => void;
    saveLabel: string;
    showImages?: boolean;
  }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Product Name *</Label>
          <Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>SKU</Label>
          <Input value={data.sku || ""} onChange={(e) => onChange({ ...data, sku: e.target.value || null })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Price ($)</Label>
          <Input type="number" step="0.01" value={data.price} onChange={(e) => onChange({ ...data, price: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="space-y-2">
          <Label>Compare At ($)</Label>
          <Input type="number" step="0.01" value={data.compare_at_price || ""} onChange={(e) => onChange({ ...data, compare_at_price: e.target.value ? parseFloat(e.target.value) : null })} />
        </div>
        <div className="space-y-2">
          <Label>Stock Qty</Label>
          <Input type="number" value={data.stock_quantity ?? 0} onChange={(e) => onChange({ ...data, stock_quantity: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={data.category} onValueChange={(v) => onChange({ ...data, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Input value={data.subcategory || ""} onChange={(e) => onChange({ ...data, subcategory: e.target.value || null })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Brand</Label>
          <Input value={data.brand || ""} onChange={(e) => onChange({ ...data, brand: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Badge</Label>
          <Input value={data.badge || ""} placeholder="e.g. New Arrival, On Sale" onChange={(e) => onChange({ ...data, badge: e.target.value || null })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={3} value={data.description || ""} onChange={(e) => onChange({ ...data, description: e.target.value })} />
      </div>
      {showImages && data.id && (
        <ProductImageUpload
          productId={data.id}
          images={productImages}
          onImagesChange={() => { fetchProductImages(data.id); fetchProducts(); }}
        />
      )}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={data.in_stock} onCheckedChange={(v) => onChange({ ...data, in_stock: v })} />
          <Label>In Stock</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={data.featured || false} onCheckedChange={(v) => onChange({ ...data, featured: v })} />
          <Label>Featured</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => { setShowEditDialog(false); setShowAddDialog(false); }}>Cancel</Button>
        <Button onClick={onSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {saveLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">{totalCount} products in catalog</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runImageBackfill} disabled={backfillRunning} className="gap-2">
              {backfillRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {backfillRunning ? "Running..." : "Backfill Images"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products, SKU, brand..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={(v: any) => { setStockFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-500 text-black font-bold">{selectedIds.size} selected</Badge>
                <div className="h-5 w-px bg-amber-300" />
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ in_stock: true })}>Mark In Stock</Button>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ in_stock: false })}>Mark Out</Button>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ featured: true })}>Feature</Button>
                <Button variant="outline" size="sm" onClick={() => bulkUpdate({ featured: false })}>Unfeature</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowBulkPriceDialog(true)}>
                  <DollarSign className="h-3.5 w-3.5" /> Bulk Pricing
                </Button>
                <div className="h-5 w-px bg-amber-300" />
                <Select onValueChange={(v) => { if (v !== "none") bulkUpdate({ category: v }); }}>
                  <SelectTrigger className="w-[160px] h-8 text-xs"><Tag className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Change Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Change Category</SelectItem>
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
                <div className="h-5 w-px bg-amber-300" />
                <Button variant="destructive" size="sm" onClick={bulkDelete}>Delete</Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/40 border-b border-border/60">
                    <tr>
                      <th className="text-left px-4 py-3">
                        <input type="checkbox" onChange={(e) => e.target.checked ? selectAllOnPage() : clearSelection()} className="h-4 w-4 accent-amber-500" aria-label="Select all" />
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Featured</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="h-4 w-4 accent-amber-500" />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg border border-border/60 bg-muted/30 overflow-hidden flex-shrink-0">
                              {product.primary_image ? (
                                <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                                  <ImagePlus className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{product.sku || product.brand || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          {product.subcategory && <p className="text-[10px] text-muted-foreground mt-0.5">{product.subcategory}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            {Number(product.price) > 0 ? (
                              <span className="font-semibold text-foreground">${Number(product.price).toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Contact</span>
                            )}
                            {product.compare_at_price && Number(product.compare_at_price) > 0 && (
                              <p className="text-xs text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggleStock(product.id, product.in_stock)}>
                            <Badge className={product.in_stock ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                              {product.in_stock ? `${product.stock_quantity ?? 0} in stock` : "Out"}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <Switch checked={product.featured || false} onCheckedChange={() => handleToggleFeatured(product.id, product.featured || false)} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProduct(product); fetchProductImages(product.id); setShowEditDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id, product.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No products found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/60">
                <p className="text-sm text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
            {editingProduct && (
              <ProductForm data={editingProduct} onChange={setEditingProduct} onSave={handleSaveProduct} saveLabel="Save Changes" showImages />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <ProductForm data={newProduct} onChange={setNewProduct} onSave={handleAddProduct} saveLabel="Add Product" />
          </DialogContent>
        </Dialog>

        {/* Bulk Price Dialog */}
        <Dialog open={showBulkPriceDialog} onOpenChange={setShowBulkPriceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Price Update</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Adjust prices for {selectedIds.size} selected products.</p>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pricing Method</Label>
                <Select value={bulkPriceMode} onValueChange={(v: any) => setBulkPriceMode(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set Exact Price</SelectItem>
                    <SelectItem value="increase_pct">Increase by %</SelectItem>
                    <SelectItem value="decrease_pct">Decrease by %</SelectItem>
                    <SelectItem value="increase_amt">Increase by $</SelectItem>
                    <SelectItem value="decrease_amt">Decrease by $</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {bulkPriceMode === "set" ? "New Price ($)" : bulkPriceMode.includes("pct") ? "Percentage (%)" : "Amount ($)"}
                </Label>
                <div className="relative">
                  {bulkPriceMode.includes("pct") ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input type="number" step="0.01" className="pl-10" value={bulkPriceValue} onChange={(e) => setBulkPriceValue(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowBulkPriceDialog(false)}>Cancel</Button>
                <Button onClick={handleBulkPrice} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Apply Prices
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
