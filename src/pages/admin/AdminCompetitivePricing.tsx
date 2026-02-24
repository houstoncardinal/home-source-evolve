// @ts-nocheck
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Loader2, TrendingUp, TrendingDown, Minus, Globe, Clock,
  ArrowUpRight, ArrowDownRight, BarChart3, Target, Zap, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface CompetitorScan {
  id: string;
  competitor_url: string;
  competitor_name: string;
  status: string;
  total_products_found: number;
  matches_found: number;
  created_at: string;
  completed_at: string | null;
}

interface CompetitorProduct {
  id: string;
  scan_id: string;
  competitor_name: string;
  competitor_product_name: string;
  competitor_price: number;
  competitor_url: string;
  our_price: number | null;
  price_difference: number | null;
  price_difference_pct: number | null;
  recommendation: string;
}

const recommendationConfig: Record<string, { label: string; color: string; icon: any }> = {
  price_competitive: { label: "Competitive", color: "bg-emerald-100 text-emerald-800", icon: TrendingUp },
  consider_lowering: { label: "Consider Lowering", color: "bg-amber-100 text-amber-800", icon: TrendingDown },
  significantly_overpriced: { label: "Overpriced", color: "bg-red-100 text-red-800", icon: ArrowUpRight },
  underpriced: { label: "Underpriced", color: "bg-blue-100 text-blue-800", icon: ArrowDownRight },
  no_match: { label: "No Match", color: "bg-slate-100 text-slate-600", icon: Minus },
};

export default function AdminCompetitivePricing() {
  const [scans, setScans] = useState<CompetitorScan[]>([]);
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [filterRecommendation, setFilterRecommendation] = useState<string>("all");

  useEffect(() => {
    fetchScans();
  }, []);

  useEffect(() => {
    if (selectedScan) fetchProducts(selectedScan);
  }, [selectedScan]);

  const fetchScans = async () => {
    const { data } = await supabase
      .from("competitor_scans")
      .select("*")
      .order("created_at", { ascending: false });
    setScans(data || []);
    if (data?.[0]) setSelectedScan(data[0].id);
    setLoading(false);
  };

  const fetchProducts = async (scanId: string) => {
    const { data } = await supabase
      .from("competitor_products")
      .select("*")
      .eq("scan_id", scanId)
      .order("price_difference_pct", { ascending: false });
    setProducts(data || []);
  };

  const runScan = async () => {
    if (!competitorUrl.trim()) {
      toast.error("Please enter a competitor URL");
      return;
    }
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("competitive-pricer", {
        body: { competitor_url: competitorUrl, competitor_name: competitorName },
      });
      if (error) throw error;
      toast.success(`Scan complete! Found ${data.products_found} products, ${data.matches} matches`);
      setCompetitorUrl("");
      setCompetitorName("");
      await fetchScans();
      if (data.scan_id) setSelectedScan(data.scan_id);
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const filteredProducts = filterRecommendation === "all"
    ? products
    : products.filter((p) => p.recommendation === filterRecommendation);

  // Stats
  const matchedProducts = products.filter((p) => p.our_price);
  const avgDifference = matchedProducts.length
    ? matchedProducts.reduce((s, p) => s + (p.price_difference_pct || 0), 0) / matchedProducts.length
    : 0;
  const competitive = matchedProducts.filter((p) => p.recommendation === "price_competitive").length;
  const needsAttention = matchedProducts.filter((p) =>
    ["consider_lowering", "significantly_overpriced"].includes(p.recommendation)
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Competitive Pricing</h1>
          <p className="text-slate-500 mt-1">Scrape competitor sites and compare pricing with AI-powered analysis</p>
        </div>

        {/* New Scan Card */}
        <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              New Competitor Scan
            </CardTitle>
            <CardDescription>Enter a competitor's product page URL to scrape and compare prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="https://competitor.com/products"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Competitor name (optional)"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="sm:w-48"
              />
              <Button onClick={runScan} disabled={scanning} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {scanning ? "Scanning..." : "Run Scan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {matchedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50"><Target className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Products Found</p>
                    <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Competitive</p>
                    <p className="text-2xl font-bold text-emerald-700">{competitive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50"><BarChart3 className="h-5 w-5 text-amber-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Avg Price Diff</p>
                    <p className="text-2xl font-bold text-slate-900">{avgDifference.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50"><TrendingDown className="h-5 w-5 text-red-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Needs Attention</p>
                    <p className="text-2xl font-bold text-red-700">{needsAttention}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scan History + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scan History Sidebar */}
          <Card className="border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" /> Scan History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {scans.length === 0 && !loading && (
                <p className="text-sm text-slate-400 text-center py-4">No scans yet. Run your first scan above!</p>
              )}
              {scans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => setSelectedScan(scan.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedScan === scan.id ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-3 w-3 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900 truncate">{scan.competitor_name}</p>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{scan.competitor_url}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {scan.total_products_found} products
                    </Badge>
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                      {scan.matches_found} matches
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="border-slate-200 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Price Comparison Results</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {["all", "price_competitive", "consider_lowering", "significantly_overpriced", "underpriced", "no_match"].map((f) => (
                  <Button
                    key={f}
                    variant={filterRecommendation === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterRecommendation(f)}
                    className="text-xs capitalize"
                  >
                    {f === "all" ? "All" : f.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  {selectedScan ? "No products match this filter" : "Select a scan to view results"}
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredProducts.map((product) => {
                    const config = recommendationConfig[product.recommendation] || recommendationConfig.no_match;
                    const Icon = config.icon;
                    return (
                      <div key={product.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-slate-900 truncate">{product.competitor_product_name}</p>
                          <p className="text-xs text-slate-500">{product.competitor_name}</p>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Their Price</p>
                            <p className="font-semibold text-slate-900">${Number(product.competitor_price).toFixed(2)}</p>
                          </div>
                          {product.our_price && (
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Our Price</p>
                              <p className="font-semibold text-slate-900">${Number(product.our_price).toFixed(2)}</p>
                            </div>
                          )}
                          {product.price_difference_pct !== null && (
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Difference</p>
                              <p className={`font-semibold ${product.price_difference_pct > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                {product.price_difference_pct > 0 ? "+" : ""}{Number(product.price_difference_pct).toFixed(1)}%
                              </p>
                            </div>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
