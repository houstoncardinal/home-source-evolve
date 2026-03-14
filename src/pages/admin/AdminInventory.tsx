import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Package, TrendingDown, Search, Download, ArrowUpDown, Save, RefreshCw } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  stock_quantity: number | null;
  reorder_point: number | null;
  in_stock: boolean | null;
  price: number;
}

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [editedQuantities, setEditedQuantities] = useState<Record<string, string>>({});
  const [editedReorderPoints, setEditedReorderPoints] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState<"name" | "stock_quantity" | "reorder_point">("stock_quantity");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, category, stock_quantity, reorder_point, in_stock, price")
      .order("stock_quantity", { ascending: true });
    if (error) { toast.error("Failed to load inventory"); return; }
    setItems((data as InventoryItem[]) || []);
    setLoading(false);
  };

  const lowStockCount = items.filter(i => (i.stock_quantity ?? 0) <= (i.reorder_point ?? 10) && (i.stock_quantity ?? 0) > 0).length;
  const outOfStockCount = items.filter(i => (i.stock_quantity ?? 0) === 0 || !i.in_stock).length;
  const totalValue = items.reduce((sum, i) => sum + (i.stock_quantity ?? 0) * (typeof i.price === "string" ? parseFloat(i.price) : i.price), 0);

  const filtered = items
    .filter(i => {
      if (filter === "low") return (i.stock_quantity ?? 0) <= (i.reorder_point ?? 10) && (i.stock_quantity ?? 0) > 0;
      if (filter === "out") return (i.stock_quantity ?? 0) === 0 || !i.in_stock;
      return true;
    })
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const handleBulkSave = async () => {
    setSaving(true);
    const updates: Array<Promise<any>> = [];

    for (const [id, qty] of Object.entries(editedQuantities)) {
      const num = parseInt(qty);
      if (!isNaN(num)) {
        updates.push(
          supabase.from("products").update({ stock_quantity: num, in_stock: num > 0 }).eq("id", id).then()
        );
      }
    }
    for (const [id, rp] of Object.entries(editedReorderPoints)) {
      const num = parseInt(rp);
      if (!isNaN(num)) {
        updates.push(
          supabase.from("products").update({ reorder_point: num } as any).eq("id", id).then()
        );
      }
    }

    await Promise.all(updates);
    setEditedQuantities({});
    setEditedReorderPoints({});
    await fetchInventory();
    toast.success("Inventory updated successfully");
    setSaving(false);
  };

  const hasEdits = Object.keys(editedQuantities).length > 0 || Object.keys(editedReorderPoints).length > 0;

  const exportCSV = () => {
    const headers = ["Name", "SKU", "Category", "Stock Qty", "Reorder Point", "In Stock", "Unit Price", "Stock Value"];
    const rows = filtered.map(i => [
      i.name, i.sku || "", i.category, i.stock_quantity ?? 0, i.reorder_point ?? 10,
      i.in_stock ? "Yes" : "No", i.price,
      ((i.stock_quantity ?? 0) * (typeof i.price === "string" ? parseFloat(i.price) : i.price)).toFixed(2)
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Inventory Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor stock levels, set reorder points, and manage inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInventory} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            {hasEdits && (
              <Button size="sm" onClick={handleBulkSave} disabled={saving} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Products</p>
                  <p className="text-2xl font-bold mt-1">{items.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Low Stock</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{lowStockCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Out of Stock</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{outOfStockCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Stock Value</p>
                  <p className="text-2xl font-bold mt-1">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "low", "out"] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? "bg-foreground text-background" : ""}
              >
                {f === "all" ? "All" : f === "low" ? `Low Stock (${lowStockCount})` : `Out of Stock (${outOfStockCount})`}
              </Button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <Card className="bg-white border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                    <span className="flex items-center gap-1">Product <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("stock_quantity")}>
                    <span className="flex items-center gap-1">Stock <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("reorder_point")}>
                    <span className="flex items-center gap-1">Reorder Point <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No products found</TableCell></TableRow>
                ) : filtered.map(item => {
                  const qty = editedQuantities[item.id] !== undefined ? editedQuantities[item.id] : String(item.stock_quantity ?? 0);
                  const rp = editedReorderPoints[item.id] !== undefined ? editedReorderPoints[item.id] : String(item.reorder_point ?? 10);
                  const stockNum = parseInt(qty);
                  const rpNum = parseInt(rp);
                  const isLow = stockNum <= rpNum && stockNum > 0;
                  const isOut = stockNum === 0 || !item.in_stock;
                  const stockValue = stockNum * (typeof item.price === "string" ? parseFloat(item.price) : item.price);

                  return (
                    <TableRow key={item.id} className={isOut ? "bg-red-50/40" : isLow ? "bg-amber-50/40" : ""}>
                      <TableCell className="font-medium max-w-[200px] truncate">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">{item.sku || "—"}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{item.category}</Badge></TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={e => setEditedQuantities(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-20 h-8 text-sm bg-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={rp}
                          onChange={e => setEditedReorderPoints(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-20 h-8 text-sm bg-white"
                        />
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">${stockValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
