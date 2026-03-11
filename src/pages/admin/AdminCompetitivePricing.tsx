// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, ScanSearch, TrendingUp, TrendingDown, BarChart3,
  Target, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
  Minus, History, Zap, AlertTriangle, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketScanSession {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  total_products: number;
  scanned_products: number;
  failed_products: number;
  triggered_by: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface ProductPricingRange {
  id: string;
  product_id: string;
  market_min: number | null;
  market_max: number | null;
  market_avg: number | null;
  market_median: number | null;
  sources_count: number;
  data_points_count: number;
  last_scanned_at: string | null;
  products: {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    category: string;
    primary_image_url: string | null;
  };
}

interface PricingLog {
  id: string;
  product_id: string;
  product_name: string;
  strategy: string;
  old_price: number;
  suggested_price: number;
  applied_price: number;
  market_avg: number | null;
  was_applied: boolean;
  dry_run: boolean;
  floor_enforced: boolean;
  ceiling_enforced: boolean;
  created_at: string;
}

type PricingStrategy = "premium" | "competitive" | "value";

// ─── Constants ────────────────────────────────────────────────────────────────

const STRATEGY_MULTIPLIERS: Record<PricingStrategy, number> = {
  premium: 1.15,
  competitive: 1.00,
  value: 0.92,
};

const STRATEGY_INFO: Record<PricingStrategy, { label: string; description: string; color: string }> = {
  premium: {
    label: "Premium",
    description: "15% above market average — signals luxury positioning and exclusivity",
    color: "bg-amber-600 hover:bg-amber-700",
  },
  competitive: {
    label: "Competitive",
    description: "At market average — neutrally positioned among comparable products",
    color: "bg-slate-700 hover:bg-slate-800",
  },
  value: {
    label: "Value",
    description: "8% below market average — drives volume among price-sensitive buyers",
    color: "bg-blue-600 hover:bg-blue-700",
  },
};

const FLOOR_PCT = 0.70;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRangesWithImages(raw: any[]): ProductPricingRange[] {
  return (raw || []).map((r: any) => ({
    ...r,
    products: {
      ...r.products,
      primary_image_url:
        Array.isArray(r.products?.product_images)
          ? r.products.product_images.find((img: any) => img.is_primary)?.url || null
          : null,
    },
  }));
}

function calculateSuggestedPrice(range: ProductPricingRange, strategy: PricingStrategy): number | null {
  if (!range.market_avg) return null;
  const currentPrice = Number(range.products.price);
  const marketAvg = Number(range.market_avg);
  const compareAtPrice = range.products.compare_at_price ? Number(range.products.compare_at_price) : null;
  const multiplier = STRATEGY_MULTIPLIERS[strategy];

  let suggested = Math.round(marketAvg * multiplier * 100) / 100;
  const floor = Math.round(currentPrice * FLOOR_PCT * 100) / 100;
  if (suggested < floor) suggested = floor;
  if (compareAtPrice && suggested > compareAtPrice) suggested = compareAtPrice;

  return Math.round(suggested * 100) / 100;
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCompetitivePricing() {
  const [sessions, setSessions] = useState<MarketScanSession[]>([]);
  const [ranges, setRanges] = useState<ProductPricingRange[]>([]);
  const [pricingLogs, setPricingLogs] = useState<PricingLog[]>([]);
  const [activeSession, setActiveSession] = useState<MarketScanSession | null>(null);
  const [strategy, setStrategy] = useState<PricingStrategy>("competitive");
  const [scanning, setScanning] = useState(false);
  const [applying, setApplying] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [applyingProductId, setApplyingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Data Fetching ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [sessionsRes, rangesRes, logsRes] = await Promise.all([
      supabase
        .from("market_scan_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("product_pricing_ranges")
        .select(`
          *,
          products (
            id, name, price, compare_at_price, category,
            product_images (url, is_primary)
          )
        `)
        .order("last_scanned_at", { ascending: false }),
      supabase
        .from("pricing_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const sessionsList: MarketScanSession[] = sessionsRes.data || [];
    setSessions(sessionsList);
    setRanges(mapRangesWithImages(rangesRes.data || []));
    setPricingLogs(logsRes.data || []);

    const running = sessionsList.find((s) => s.status === "running") || null;
    setActiveSession(running);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Live Polling (while scan runs) ───────────────────────────────────────────

  useEffect(() => {
    if (!activeSession || activeSession.status !== "running") return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("market_scan_sessions")
        .select("*")
        .eq("id", activeSession.id)
        .single();

      if (data) {
        setActiveSession(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          await fetchData();
          if (data.status === "completed") {
            toast.success(`Scan complete! ${data.scanned_products} products processed.`);
          } else {
            toast.error(`Scan failed after ${data.scanned_products} products.`);
          }
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status, fetchData]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleScanAll = async () => {
    if (activeSession?.status === "running") {
      toast.info("A scan is already in progress.");
      return;
    }
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-scanner", {
        body: { scan_all: true },
      });
      if (error) throw error;
      toast.info("Market scan started. Prices will update automatically as products are scanned.");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to start scan");
    } finally {
      setScanning(false);
    }
  };

  const handleApplyAll = async () => {
    setApplying(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-pricer", {
        body: { strategy, dry_run: dryRun },
      });
      if (error) throw error;
      if (dryRun) {
        toast.info(`Preview: ${data.changes?.length || 0} price changes calculated. Toggle off Dry Run to apply.`);
      } else {
        toast.success(`Applied ${data.prices_changed} price changes using ${strategy} strategy.`);
      }
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to apply prices");
    } finally {
      setApplying(false);
    }
  };

  const handleApplyOne = async (productId: string) => {
    setApplyingProductId(productId);
    try {
      const { data, error } = await supabase.functions.invoke("auto-pricer", {
        body: { product_ids: [productId], strategy, dry_run: false },
      });
      if (error) throw error;
      toast.success("Price updated.");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to apply price");
    } finally {
      setApplyingProductId(null);
    }
  };

  // ── Derived Stats ─────────────────────────────────────────────────────────────

  const productsWithData = ranges.filter((r) => r.market_avg !== null);
  const overpriced = productsWithData.filter((r) => r.market_max && Number(r.products.price) > Number(r.market_max)).length;
  const underpriced = productsWithData.filter((r) => r.market_min && Number(r.products.price) < Number(r.market_min)).length;

  const avgPositionPct =
    productsWithData.length > 0
      ? productsWithData.reduce((sum, r) => {
          const pct = ((Number(r.products.price) / Number(r.market_avg)) - 1) * 100;
          return sum + pct;
        }, 0) / productsWithData.length
      : null;

  const scanProgress =
    activeSession && activeSession.total_products > 0
      ? (activeSession.scanned_products / activeSession.total_products) * 100
      : 0;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Market Pricing Intelligence</h1>
            <p className="text-slate-500 mt-1">
              AI vision identifies your products across the web and surfaces real market pricing ranges
            </p>
          </div>
          <Button
            onClick={handleScanAll}
            disabled={scanning || activeSession?.status === "running"}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shrink-0"
          >
            {scanning || activeSession?.status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4" />
            )}
            {activeSession?.status === "running" ? "Scanning..." : "Scan All Products"}
          </Button>
        </div>

        {/* Live Scan Progress */}
        {activeSession?.status === "running" && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
                  <p className="text-sm font-semibold text-amber-800">
                    AI is scanning your catalog across major retailers...
                  </p>
                </div>
                <p className="text-sm font-mono text-amber-700">
                  {activeSession.scanned_products} / {activeSession.total_products} products
                </p>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-amber-600 mt-2">
                Checking Wayfair, Pottery Barn, West Elm, Crate & Barrel — using product images for recognition
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Products Tracked</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {loading ? "—" : `${productsWithData.length}/${ranges.length || "?"}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50">
                  <BarChart3 className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Market Position</p>
                  <p className={`text-2xl font-bold ${avgPositionPct == null ? "text-slate-400" : avgPositionPct > 0 ? "text-amber-600" : "text-blue-600"}`}>
                    {avgPositionPct == null
                      ? "—"
                      : `${avgPositionPct > 0 ? "+" : ""}${avgPositionPct.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Above Market</p>
                  <p className="text-2xl font-bold text-red-600">{loading ? "—" : overpriced}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Below Market</p>
                  <p className="text-2xl font-bold text-emerald-600">{loading ? "—" : underpriced}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Strategy + Products Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Scan History Sidebar */}
          <Card className="border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" /> Scan History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[540px] overflow-y-auto">
              {sessions.length === 0 && !loading && (
                <p className="text-xs text-slate-400 text-center py-6">
                  No scans yet. Click "Scan All Products" to start.
                </p>
              )}
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {session.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    {session.status === "running" && <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />}
                    {session.status === "failed" && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                    {session.status === "pending" && <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                    <span className={`text-xs font-medium capitalize ${
                      session.status === "completed" ? "text-emerald-700" :
                      session.status === "running" ? "text-amber-700" :
                      session.status === "failed" ? "text-red-700" : "text-slate-500"
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {session.scanned_products}/{session.total_products} products
                    {session.failed_products > 0 && (
                      <span className="text-red-500 ml-1">({session.failed_products} failed)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Products + Strategy Panel */}
          <div className="lg:col-span-3 space-y-5">

            {/* Strategy Selector */}
            <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-slate-800">Auto-Pricing Strategy</span>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  {(["premium", "competitive", "value"] as PricingStrategy[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                        strategy === s
                          ? STRATEGY_INFO[s].color.split(" ")[0]
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {STRATEGY_INFO[s].label}
                      <span className="ml-1.5 text-xs opacity-75">
                        {s === "premium" ? "×1.15" : s === "competitive" ? "×1.00" : "×0.92"}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">{STRATEGY_INFO[strategy].description}</p>

                {/* Bulk Apply Controls */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setDryRun(!dryRun)}
                      className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${dryRun ? "bg-amber-400" : "bg-slate-300"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${dryRun ? "translate-x-0.5" : "translate-x-5"}`} />
                    </div>
                    <span className="text-sm text-slate-600">
                      {dryRun ? "Dry Run (preview only)" : "Live Mode (applies prices)"}
                    </span>
                  </label>
                  <Button
                    onClick={handleApplyAll}
                    disabled={applying || productsWithData.length === 0}
                    className={`gap-2 text-white ${dryRun ? "bg-slate-500 hover:bg-slate-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    size="sm"
                  >
                    {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                    {dryRun ? "Preview All Prices" : "Apply All Prices"}
                  </Button>
                  {!dryRun && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Live mode — prices will update immediately
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Product Price Intelligence</CardTitle>
                <CardDescription>
                  {productsWithData.length > 0
                    ? `${productsWithData.length} products with market data · Suggested prices shown for ${STRATEGY_INFO[strategy].label} strategy`
                    : "Run a scan to populate market pricing data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : ranges.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ScanSearch className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No market data yet</p>
                    <p className="text-sm mt-1">Click "Scan All Products" above to start</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {ranges.map((range) => {
                      const suggested = calculateSuggestedPrice(range, strategy);
                      const currentPrice = Number(range.products.price);
                      const priceChange = suggested ? suggested - currentPrice : null;
                      const marketMin = range.market_min ? Number(range.market_min) : null;
                      const marketMax = range.market_max ? Number(range.market_max) : null;
                      const marketAvg = range.market_avg ? Number(range.market_avg) : null;

                      const statusConfig =
                        !marketAvg
                          ? { label: "No Data", color: "bg-slate-100 text-slate-500" }
                          : currentPrice > (marketMax || 0)
                          ? { label: "Above Market", color: "bg-red-100 text-red-700" }
                          : currentPrice < (marketMin || 0)
                          ? { label: "Below Market", color: "bg-blue-100 text-blue-700" }
                          : { label: "In Range", color: "bg-emerald-100 text-emerald-700" };

                      return (
                        <div
                          key={range.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          {/* Thumbnail */}
                          {range.products.primary_image_url ? (
                            <img
                              src={range.products.primary_image_url}
                              alt={range.products.name}
                              className="w-12 h-12 object-cover rounded-md shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-slate-100 shrink-0" />
                          )}

                          {/* Name + Category */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{range.products.name}</p>
                            <p className="text-xs text-slate-400 truncate">{range.products.category}</p>
                            {range.sources_count > 0 && (
                              <p className="text-xs text-slate-400">
                                {range.data_points_count} data points · {range.sources_count} sources
                              </p>
                            )}
                          </div>

                          {/* Current Price */}
                          <div className="text-right shrink-0">
                            <p className="text-xs text-slate-400">Current</p>
                            <p className="text-sm font-semibold text-slate-900">{fmt(currentPrice)}</p>
                          </div>

                          {/* Market Range */}
                          <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-xs text-slate-400">Market Range</p>
                            <p className="text-xs text-slate-600">
                              {marketMin && marketMax ? `${fmt(marketMin)} – ${fmt(marketMax)}` : "—"}
                            </p>
                            {marketAvg && (
                              <p className="text-xs text-slate-400">avg {fmt(marketAvg)}</p>
                            )}
                          </div>

                          {/* Suggested Price */}
                          <div className="text-right shrink-0 hidden md:block">
                            <p className="text-xs text-slate-400">Suggested</p>
                            {suggested ? (
                              <p className={`text-sm font-semibold flex items-center justify-end gap-0.5 ${
                                priceChange > 0.01 ? "text-emerald-600" :
                                priceChange < -0.01 ? "text-blue-600" : "text-slate-700"
                              }`}>
                                {fmt(suggested)}
                                {priceChange > 0.01 && <ArrowUpRight className="h-3 w-3" />}
                                {priceChange < -0.01 && <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(priceChange) <= 0.01 && <Minus className="h-3 w-3" />}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400">—</p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>

                          {/* Apply Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!suggested || applyingProductId === range.product_id}
                            onClick={() => handleApplyOne(range.product_id)}
                            className="shrink-0 text-xs h-7 px-2"
                          >
                            {applyingProductId === range.product_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>Apply <ChevronRight className="h-3 w-3" /></>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing History */}
        {pricingLogs.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" /> Pricing History
              </CardTitle>
              <CardDescription>Recent auto-pricing activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 max-h-72 overflow-y-auto">
                {pricingLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between py-2.5 px-1 text-sm ${
                      i < pricingLogs.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium text-slate-900 truncate">{log.product_name}</p>
                      <p className="text-xs text-slate-400">
                        <span className="capitalize">{log.strategy}</span> strategy ·{" "}
                        {new Date(log.created_at).toLocaleString()}
                        {log.dry_run && <span className="ml-1.5 text-amber-500 font-medium">preview</span>}
                        {log.floor_enforced && <span className="ml-1.5 text-orange-500">floor applied</span>}
                        {log.ceiling_enforced && <span className="ml-1.5 text-purple-500">ceiling applied</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 line-through">{fmt(log.old_price)}</p>
                        <p className={`font-semibold ${Number(log.applied_price) > Number(log.old_price) ? "text-emerald-600" : Number(log.applied_price) < Number(log.old_price) ? "text-blue-600" : "text-slate-700"}`}>
                          {fmt(log.applied_price)}
                        </p>
                      </div>
                      {log.was_applied ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Applied</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 text-xs">Preview</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </AdminLayout>
  );
}
