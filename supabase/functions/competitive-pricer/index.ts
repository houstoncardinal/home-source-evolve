import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitor_url, competitor_name } = await req.json();

    if (!competitor_url) {
      return new Response(
        JSON.stringify({ success: false, error: "competitor_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create scan record
    const { data: scan, error: scanErr } = await supabase
      .from("competitor_scans")
      .insert({ competitor_url, competitor_name: competitor_name || new URL(competitor_url).hostname, status: "scraping" })
      .select()
      .single();

    if (scanErr) throw scanErr;

    // Step 1: Scrape the competitor page
    let formattedUrl = competitor_url.trim();
    if (!formattedUrl.startsWith("http")) formattedUrl = `https://${formattedUrl}`;

    console.log("Scraping:", formattedUrl);

    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: formattedUrl,
        formats: [{ type: "json", prompt: "Extract all product listings from this page. For each product, extract: product name, price (as a number), and the product URL if available. Return as an array of objects with fields: name, price, url" }],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeRes.json();
    const extractedProducts = scrapeData?.data?.json || scrapeData?.json || [];

    console.log(`Found ${Array.isArray(extractedProducts) ? extractedProducts.length : 0} products from scrape`);

    if (!Array.isArray(extractedProducts) || extractedProducts.length === 0) {
      await supabase.from("competitor_scans").update({
        status: "completed",
        total_products_found: 0,
        matches_found: 0,
        completed_at: new Date().toISOString(),
      }).eq("id", scan.id);

      return new Response(
        JSON.stringify({ success: true, scan_id: scan.id, products_found: 0, matches: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get our products for comparison
    const { data: ourProducts } = await supabase
      .from("products")
      .select("id, name, price, category");

    // Step 3: Use AI to match competitor products to ours
    let matches: any[] = [];

    if (lovableKey && ourProducts && ourProducts.length > 0) {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a product matching expert. Match competitor products to our catalog based on similarity of name/description. Return JSON array of matches.`,
            },
            {
              role: "user",
              content: `Our products:\n${JSON.stringify(ourProducts.slice(0, 100).map(p => ({ id: p.id, name: p.name, price: p.price })))}\n\nCompetitor products:\n${JSON.stringify(extractedProducts.slice(0, 50))}\n\nFor each competitor product, find the best matching product from our catalog (if any). Return a JSON array of objects with: competitor_product_name, competitor_price, our_product_id (or null), our_price (or null), recommendation (one of: "price_competitive", "consider_lowering", "significantly_overpriced", "underpriced", "no_match"). Only include valid JSON array, no markdown.`,
            },
          ],
          temperature: 0.1,
        }),
      });

      const aiData = await aiRes.json();
      const content = aiData?.choices?.[0]?.message?.content || "[]";

      try {
        // Try to parse the JSON, handling potential markdown wrapping
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
        }
        matches = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse AI response:", content);
        matches = [];
      }
    }

    // Step 4: Store results
    const competitorProducts = extractedProducts.map((cp: any) => {
      const match = matches.find((m: any) => m.competitor_product_name === cp.name);
      const competitorPrice = typeof cp.price === "number" ? cp.price : parseFloat(String(cp.price).replace(/[^0-9.]/g, "")) || 0;
      const ourPrice = match?.our_price || null;
      const priceDiff = ourPrice && competitorPrice ? ourPrice - competitorPrice : null;
      const priceDiffPct = ourPrice && competitorPrice ? ((ourPrice - competitorPrice) / competitorPrice) * 100 : null;

      return {
        scan_id: scan.id,
        competitor_name: competitor_name || new URL(competitor_url).hostname,
        competitor_product_name: cp.name || "Unknown Product",
        competitor_price: competitorPrice,
        competitor_url: cp.url || "",
        product_id: match?.our_product_id || null,
        our_price: ourPrice,
        price_difference: priceDiff,
        price_difference_pct: priceDiffPct,
        recommendation: match?.recommendation || "no_match",
      };
    });

    if (competitorProducts.length > 0) {
      await supabase.from("competitor_products").insert(competitorProducts);
    }

    const matchCount = competitorProducts.filter((p: any) => p.product_id).length;

    await supabase.from("competitor_scans").update({
      status: "completed",
      total_products_found: competitorProducts.length,
      matches_found: matchCount,
      completed_at: new Date().toISOString(),
    }).eq("id", scan.id);

    return new Response(
      JSON.stringify({
        success: true,
        scan_id: scan.id,
        products_found: competitorProducts.length,
        matches: matchCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Competitive pricer error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
