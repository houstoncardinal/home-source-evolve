import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign, Copy, ToggleLeft, ToggleRight } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  applies_to: string;
  category_filter: string | null;
}

const emptyCoupon: Partial<Coupon> = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  minimum_order: 0,
  max_uses: null,
  is_active: true,
  applies_to: "all",
  category_filter: null,
};

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Coupon>>(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editing.code?.trim()) { toast.error("Coupon code is required"); return; }
    setSaving(true);
    const payload = {
      code: editing.code.toUpperCase().trim(),
      description: editing.description || "",
      discount_type: editing.discount_type || "percentage",
      discount_value: editing.discount_value || 0,
      minimum_order: editing.minimum_order || 0,
      max_uses: editing.max_uses || null,
      is_active: editing.is_active ?? true,
      applies_to: editing.applies_to || "all",
      category_filter: editing.category_filter || null,
    };

    if (editing.id) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update coupon");
      else toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) {
        if (error.code === "23505") toast.error("Coupon code already exists");
        else toast.error("Failed to create coupon");
      } else toast.success("Coupon created");
    }

    setDialogOpen(false);
    setSaving(false);
    fetchCoupons();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon deleted");
    fetchCoupons();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    toast.success(current ? "Coupon deactivated" : "Coupon activated");
    fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied");
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "CHS-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setEditing(prev => ({ ...prev, code }));
  };

  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalRedemptions = coupons.reduce((s, c) => s + (c.used_count || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Promotions & Coupons</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes for your store</p>
          </div>
          <Button onClick={() => { setEditing(emptyCoupon); setDialogOpen(true); }} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4" /> Create Coupon
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Coupons</p>
                <p className="text-2xl font-bold mt-1">{coupons.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><Tag className="h-5 w-5 text-blue-600" /></div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{activeCoupons}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Percent className="h-5 w-5 text-emerald-600" /></div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Redemptions</p>
                <p className="text-2xl font-bold mt-1">{totalRedemptions}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center"><DollarSign className="h-5 w-5 text-purple-600" /></div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min. Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : coupons.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No coupons yet. Create your first one!</TableCell></TableRow>
                ) : coupons.map(coupon => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-bold">{coupon.code}</code>
                        <button onClick={() => copyCode(coupon.code)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {coupon.description && <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">{coupon.discount_type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                    </TableCell>
                    <TableCell className="text-sm">{coupon.minimum_order > 0 ? `$${coupon.minimum_order}` : "None"}</TableCell>
                    <TableCell className="text-sm">
                      {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(coupon.id, coupon.is_active)}>
                        {coupon.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs cursor-pointer">Active</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground text-xs cursor-pointer">Inactive</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(coupon); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(coupon.id, coupon.code)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{editing.id ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    value={editing.code || ""}
                    onChange={e => setEditing(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SAVE20"
                    className="font-mono uppercase"
                  />
                  <Button variant="outline" size="sm" onClick={generateCode} className="shrink-0">Generate</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  value={editing.description || ""}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Summer sale 20% off"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Discount Type</label>
                  <select
                    value={editing.discount_type || "percentage"}
                    onChange={e => setEditing(p => ({ ...p, discount_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Discount Value</label>
                  <Input
                    type="number"
                    min="0"
                    value={editing.discount_value || ""}
                    onChange={e => setEditing(p => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Minimum Order ($)</label>
                  <Input
                    type="number"
                    min="0"
                    value={editing.minimum_order || ""}
                    onChange={e => setEditing(p => ({ ...p, minimum_order: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Uses (blank = unlimited)</label>
                  <Input
                    type="number"
                    min="0"
                    value={editing.max_uses ?? ""}
                    onChange={e => setEditing(p => ({ ...p, max_uses: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {saving ? "Saving..." : editing.id ? "Update Coupon" : "Create Coupon"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
