import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Store, Truck, Receipt, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminSettings() {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: "",
    store_email: "",
    store_phone: "",
    store_address: "",
    store_description: "",
    currency: "USD",
    tax_rate: "0.08",
    free_shipping_threshold: "2000",
    shipping_flat_rate: "99",
  });

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("shop_settings").select("key, value");
      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((row) => {
        const val = row.value;
        settingsMap[row.key] = typeof val === "string" ? val : JSON.stringify(val);
      });
      setSettings((prev) => ({ ...prev, ...settingsMap }));
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const jsonValue = isNaN(Number(value)) ? JSON.stringify(value) : Number(value);
        const { error } = await supabase
          .from("shop_settings")
          .upsert({ key, value: jsonValue as any }, { onConflict: "key" });
        if (error) throw error;
      }
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated");
      setNewPassword("");
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
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your store configuration</p>
        </div>

        {/* Store Information */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-amber-500" />
              Store Information
            </CardTitle>
            <CardDescription>Basic information about your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={settings.store_email}
                  onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings.store_phone}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Store Address</Label>
              <Input
                value={settings.store_address}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Store Description</Label>
              <Textarea
                value={settings.store_description}
                onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5 text-amber-500" />
              Shipping
            </CardTitle>
            <CardDescription>Configure shipping rates and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Flat Rate Shipping ($)</Label>
                <Input
                  type="number"
                  value={settings.shipping_flat_rate}
                  onChange={(e) => setSettings({ ...settings, shipping_flat_rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Free Shipping Threshold ($)</Label>
                <Input
                  type="number"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-amber-500" />
              Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-xs">
              <Label>Tax Rate (decimal, e.g. 0.08 = 8%)</Label>
              <Input
                type="number"
                step="0.001"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-amber-500" />
              Account Security
            </CardTitle>
            <CardDescription>Signed in as {user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 max-w-md">
              <Input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
