import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Plus,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Printer,
  Receipt,
  RotateCcw,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_address_line1: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip_code: string | null;
  shipping_phone: string | null;
  payment_method: string | null;
  payment_status: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAYMENT_STATUSES = ["unpaid", "paid", "partially_refunded", "refunded"];
const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [shippingLabel, setShippingLabel] = useState("");

  // New order form
  const [newOrder, setNewOrder] = useState({
    shipping_first_name: "",
    shipping_last_name: "",
    shipping_address_line1: "",
    shipping_city: "",
    shipping_state: "",
    shipping_zip_code: "",
    shipping_phone: "",
    subtotal: 0,
    tax: 0,
    shipping_cost: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          `${o.shipping_first_name} ${o.shipping_last_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : orders;

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowDetail(true);
    setRefundAmount("");
    setRefundReason("");
    setShippingLabel("");

    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setOrderItems(data || []);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const handleUpdatePayment = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update payment status");
    } else {
      toast.success("Payment status updated");
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: status });
      }
    }
  };

  const handleUpdateTracking = async (orderId: string, tracking: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ tracking_number: tracking })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update tracking");
    } else {
      toast.success("Tracking number updated");
    }
  };

  const handleSaveFulfillment = async () => {
    if (!selectedOrder) return;
    const trackingInput = (document.getElementById("tracking-input") as HTMLInputElement)?.value || "";
    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingInput,
        notes: `${selectedOrder.notes || ""}${shippingLabel ? `\nLabel: ${shippingLabel}` : ""}`,
      })
      .eq("id", selectedOrder.id);

    if (error) {
      toast.error("Failed to save fulfillment");
    } else {
      toast.success("Fulfillment updated");
      setSelectedOrder({ ...selectedOrder, tracking_number: trackingInput });
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    const amount = Number(refundAmount || 0);
    const refundNote = `Refund ${amount ? `$${amount.toFixed(2)}` : ""}${refundReason ? ` - ${refundReason}` : ""}`;
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "refunded",
        notes: `${selectedOrder.notes || ""}\n${refundNote}`,
      })
      .eq("id", selectedOrder.id);

    if (error) {
      toast.error("Refund failed");
    } else {
      toast.success("Order marked refunded");
      setSelectedOrder({ ...selectedOrder, payment_status: "refunded" });
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    const wnd = window.open("", "PRINT", "width=800,height=900");
    if (!wnd) return;
    const itemsHtml = orderItems
      .map(
        (it) =>
          `<tr><td>${it.product_name}</td><td>${it.quantity}</td><td>$${Number(it.unit_price).toFixed(
            2
          )}</td><td>$${Number(it.total_price).toFixed(2)}</td></tr>`
      )
      .join("");
    wnd.document.write(`
      <html>
        <head>
          <title>Receipt ${selectedOrder.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
            th { background: #f5f5f5; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Receipt</h1>
          <p><strong>Order:</strong> ${selectedOrder.order_number}<br/>
             <strong>Date:</strong> ${new Date(selectedOrder.created_at).toLocaleString()}<br/>
             <strong>Status:</strong> ${selectedOrder.status}</p>
          <p><strong>Ship to:</strong><br/>
            ${selectedOrder.shipping_first_name || ""} ${selectedOrder.shipping_last_name || ""}<br/>
            ${selectedOrder.shipping_address_line1 || ""}<br/>
            ${selectedOrder.shipping_city || ""}, ${selectedOrder.shipping_state || ""} ${selectedOrder.shipping_zip_code || ""}</p>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin-top:12px"><strong>Subtotal:</strong> $${Number(selectedOrder.subtotal).toFixed(2)}<br/>
             <strong>Tax:</strong> $${Number(selectedOrder.tax).toFixed(2)}<br/>
             <strong>Shipping:</strong> $${Number(selectedOrder.shipping_cost).toFixed(2)}<br/>
             <strong>Discount:</strong> $${Number(selectedOrder.discount).toFixed(2)}<br/>
             <strong>Total:</strong> $${Number(selectedOrder.total).toFixed(2)}</p>
        </body>
      </html>
    `);
    wnd.document.close();
    wnd.focus();
    wnd.print();
    wnd.close();
  };

  const handleCreateOrder = async () => {
    setSaving(true);
    const { error } = await supabase.from("orders").insert({
      ...newOrder,
      order_number: "",
      status: "pending",
      payment_status: "unpaid",
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to create order");
    } else {
      toast.success("Order created");
      setShowCreate(false);
      fetchOrders();
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-500 mt-1">{totalCount} total orders</p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by order # or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
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
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Payment</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm font-medium text-slate-900">
                            {order.order_number}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {order.shipping_first_name} {order.shipping_last_name}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={statusColors[order.status] || "bg-gray-100"}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {order.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          ${Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          No orders found
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

        {/* Order Detail Dialog */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Order {selectedOrder.order_number}</p>
                    <p className="text-xl font-semibold">${Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrintReceipt}>
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handlePrintReceipt}>
                      <Receipt className="h-4 w-4 mr-1" /> Receipt
                    </Button>
                  </div>
                </div>

                {/* Status Management */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Order Status</Label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(v) => handleUpdateStatus(selectedOrder.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={selectedOrder.payment_status}
                      onValueChange={(v) => handleUpdatePayment(selectedOrder.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tracking */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Tracking Number
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={selectedOrder.tracking_number || ""}
                      id="tracking-input"
                      placeholder="Enter tracking number"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById("tracking-input") as HTMLInputElement;
                        handleUpdateTracking(selectedOrder.id, input.value);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {/* Fulfillment extras */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Shipping Label URL
                    </Label>
                    <Input
                      value={shippingLabel}
                      onChange={(e) => setShippingLabel(e.target.value)}
                      placeholder="https://label-url.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={selectedOrder.notes || ""}
                      onChange={(e) =>
                        setSelectedOrder((o) => (o ? { ...o, notes: e.target.value } : o))
                      }
                      placeholder="Internal notes"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button variant="outline" onClick={handleSaveFulfillment}>
                      Save Fulfillment
                    </Button>
                  </div>
                </div>

                {/* Refund */}
                <div className="space-y-2 border border-slate-200 rounded-lg p-4">
                  <Label className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" /> Refund / Partial Refund
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Amount"
                    />
                    <Input
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Reason / reference"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleRefund}>
                      Mark Refunded
                    </Button>
                    <p className="text-xs text-slate-500">
                      Updates payment status to refunded and logs note.
                    </p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Shipping Address</h4>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}
                    <br />
                    {selectedOrder.shipping_address_line1}
                    <br />
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip_code}
                    {selectedOrder.shipping_phone && (
                      <>
                        <br />
                        Phone: {selectedOrder.shipping_phone}
                      </>
                    )}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Order Items</h4>
                  {orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.product_image && (
                              <img src={item.product_image} alt="" className="w-10 h-10 rounded object-cover" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.product_name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold">${Number(item.total_price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No items</p>
                  )}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span>${Number(selectedOrder.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span>${Number(selectedOrder.shipping_cost).toFixed(2)}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Notes:</strong> {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Order Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={newOrder.shipping_first_name}
                    onChange={(e) => setNewOrder({ ...newOrder, shipping_first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={newOrder.shipping_last_name}
                    onChange={(e) => setNewOrder({ ...newOrder, shipping_last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={newOrder.shipping_address_line1}
                  onChange={(e) => setNewOrder({ ...newOrder, shipping_address_line1: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={newOrder.shipping_city}
                    onChange={(e) => setNewOrder({ ...newOrder, shipping_city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={newOrder.shipping_state}
                    onChange={(e) => setNewOrder({ ...newOrder, shipping_state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input
                    value={newOrder.shipping_zip_code}
                    onChange={(e) => setNewOrder({ ...newOrder, shipping_zip_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newOrder.total}
                    onChange={(e) => setNewOrder({ ...newOrder, total: parseFloat(e.target.value) || 0, subtotal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newOrder.shipping_phone}
                    onChange={(e) => setNewOrder({ ...newOrder, shipping_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={handleCreateOrder} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
