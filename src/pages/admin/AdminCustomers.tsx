import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  total_orders: number;
  total_spent: number;
  notes: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const emptyCustomer = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  address_line1: "",
  city: "",
  state: "",
  zip_code: "",
  notes: "",
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<typeof emptyCustomer & { id?: string }>(emptyCustomer);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [viewOrders, setViewOrders] = useState<any[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, count, error } = await supabase
        .from("customers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      setCustomers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = search
    ? customers.filter(
        (c) =>
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
      )
    : customers;

  const handleSave = async () => {
    setSaving(true);
    const { id, ...data } = editingCustomer;
    const baseNotes = data.notes || "";
    data.notes = tagsInput ? `Tags: ${tagsInput}\n${baseNotes}` : baseNotes;

    if (isEditing && id) {
      const { error } = await supabase.from("customers").update(data).eq("id", id);
      if (error) {
        toast.error("Failed to update customer");
      } else {
        toast.success("Customer updated");
        setShowDialog(false);
        fetchCustomers();
      }
    } else {
      const { error } = await supabase.from("customers").insert(data);
      if (error) {
        toast.error(error.message.includes("unique") ? "Email already exists" : "Failed to create customer");
      } else {
        toast.success("Customer created");
        setShowDialog(false);
        fetchCustomers();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"?`)) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete customer");
    } else {
      toast.success("Customer deleted");
      fetchCustomers();
    }
  };

  const openCreate = () => {
    setEditingCustomer(emptyCustomer);
    setIsEditing(false);
    setTagsInput("");
    setShowDialog(true);
  };

  const openEdit = (customer: Customer) => {
    const tagsLine = customer.notes?.split("\n").find((l) => l.startsWith("Tags:")) || "";
    setTagsInput(tagsLine.replace("Tags:", "").trim());
    setEditingCustomer({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone || "",
      address_line1: customer.address_line1 || "",
      city: customer.city || "",
      state: customer.state || "",
      zip_code: customer.zip_code || "",
      notes: customer.notes || "",
    });
    setIsEditing(true);
    setShowDialog(true);
  };

  const openView = async (customer: Customer) => {
    setViewCustomer(customer);
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    setViewOrders(data || []);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500 mt-1">{totalCount} customers</p>
          </div>
          <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
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
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total Spent</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-xs text-slate-500">Since {new Date(customer.created_at).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-slate-700 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {customer.email}
                            </p>
                            {customer.phone && (
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {customer.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {customer.city && (
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.city}, {customer.state}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {customer.total_orders}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                          ${Number(customer.total_spent).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(customer)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(customer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(customer.id, `${customer.first_name} ${customer.last_name}`)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600">Page {page + 1} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editingCustomer.first_name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editingCustomer.last_name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editingCustomer.address_line1}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address_line1: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={editingCustomer.city}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={editingCustomer.state}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input
                    value={editingCustomer.zip_code}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, zip_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="VIP, Trade, Repeat"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editingCustomer.notes}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEditing ? "Update" : "Create"} Customer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer detail dialog */}
        <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewCustomer?.first_name} {viewCustomer?.last_name}
              </DialogTitle>
            </DialogHeader>
            {viewCustomer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold">{viewCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold">{viewCustomer.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Lifetime Value</p>
                    <p className="font-semibold text-emerald-600">
                      ${Number(viewCustomer.total_spent).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Orders</p>
                    <p className="font-semibold">{viewCustomer.total_orders}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2">Timeline</p>
                  {viewOrders.length === 0 ? (
                    <p className="text-slate-500 text-sm">No orders yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewOrders.map((o) => (
                        <div key={o.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{o.order_number}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(o.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${Number(o.total).toFixed(2)}</p>
                            <Badge variant="outline" className="capitalize mt-1">{o.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
