import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      product_ids,
      strategy = "competitive",
      dry_run = false,
    } = body;

    const validStrategies = ["premium", "competitive", "value"];
    if (!validStrategies.includes(strategy)) {
      return errorResponse(`strategy must be one of: ${validStrategies.join(", ")}`);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the active pricing rule for the requested strategy
    const { data: rule, error: ruleErr } = await supabase
      .from("pricing_rules")
      .select("*")
      .eq("strategy", strategy)
      .eq("is_active", true)
      .single();

    if (ruleErr || !rule) {
      return errorResponse(`No active pricing rule found for strategy: ${strategy}`, 404);
    }

    const multiplier = Number(rule.multiplier);
    const floorPct = Number(rule.floor_pct);

    // Fetch product pricing ranges joined with product details
    let rangesQuery = supabase
      .from("product_pricing_ranges")
      .select(`
        product_id,
        market_min,
        market_max,
        market_avg,
        market_median,
        sources_count,
        data_points_count
      `);

    if (Array.isArray(product_ids) && product_ids.length > 0) {
      rangesQuery = rangesQuery.in("product_id", product_ids);
    }

    const { data: ranges, error: rangesErr } = await rangesQuery;
    if (rangesErr) throw rangesErr;

    // Filter to only products with market data
    const validRanges = (ranges || []).filter((r: any) => r.market_avg !== null && Number(r.market_avg) > 0);
    const noDataSkip = (ranges?.length || 0) - validRanges.length;

    if (validRanges.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          strategy,
          dry_run,
          changes: [],
          total_products: 0,
          prices_changed: 0,
          no_data_skip: ranges?.length || 0,
          message: "No products with market data found. Run a market scan first.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current product prices for those with market data
    const productIds = validRanges.map((r: any) => r.product_id);
    const { data: products, error: productsErr } = await supabase
      .from("products")
      .select("id, name, price, compare_at_price")
      .in("id", productIds);

    if (productsErr) throw productsErr;

    const productMap: Record<string, any> = {};
    (products || []).forEach((p: any) => { productMap[p.id] = p; });

    const changes: any[] = [];
    let pricesChanged = 0;

    for (const range of validRanges) {
      const product = productMap[range.product_id];
      if (!product) continue;

      const currentPrice = Number(product.price);
      const marketAvg = Number(range.market_avg);
      const marketMin = range.market_min ? Number(range.market_min) : null;
      const marketMax = range.market_max ? Number(range.market_max) : null;
      const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;

      // Core formula: market average × strategy multiplier
      const rawSuggested = Math.round(marketAvg * multiplier * 100) / 100;

      // Floor enforcement: never drop below current_price × floor_pct
      const floor = Math.round(currentPrice * floorPct * 100) / 100;
      let appliedPrice = rawSuggested;
      let floorEnforced = false;
      let ceilingEnforced = false;

      if (appliedPrice < floor) {
        appliedPrice = floor;
        floorEnforced = true;
      }

      // Ceiling enforcement: never exceed compare_at_price (if set and rule uses it)
      if (rule.ceiling_source === "compare_at_price" && compareAtPrice !== null && appliedPrice > compareAtPrice) {
        appliedPrice = compareAtPrice;
        ceilingEnforced = true;
      }

      appliedPrice = Math.round(appliedPrice * 100) / 100;

      const wasApplied = !dry_run && Math.abs(appliedPrice - currentPrice) > 0.01;

      // Apply the price change if not a dry run and price actually changes
      if (wasApplied) {
        const { error: updateErr } = await supabase
          .from("products")
          .update({ price: appliedPrice })
          .eq("id", product.id);

        if (updateErr) {
          console.error("Failed to update price for product", product.id, updateErr);
          continue;
        }

        pricesChanged++;
      }

      // Always log the change (dry run or applied)
      await supabase.from("pricing_logs").insert({
        product_id: product.id,
        product_name: product.name,
        strategy,
        old_price: currentPrice,
        suggested_price: rawSuggested,
        applied_price: appliedPrice,
        market_avg: marketAvg,
        market_min: marketMin,
        market_max: marketMax,
        was_applied: wasApplied,
        dry_run,
        floor_enforced: floorEnforced,
        ceiling_enforced: ceilingEnforced,
      });

      changes.push({
        product_id: product.id,
        product_name: product.name,
        current_price: currentPrice,
        market_avg: marketAvg,
        market_min: marketMin,
        market_max: marketMax,
        suggested_price: rawSuggested,
        applied_price: appliedPrice,
        floor_enforced: floorEnforced,
        ceiling_enforced: ceilingEnforced,
        strategy,
        multiplier,
        was_applied: wasApplied,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        strategy,
        dry_run,
        changes,
        total_products: validRanges.length,
        prices_changed: pricesChanged,
        no_data_skip: noDataSkip,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Auto pricer error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
