import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_RETAILERS = [
  { name: "Wayfair", domain: "wayfair.com", searchPath: "/keyword.php?keyword=" },
  { name: "Pottery Barn", domain: "potterybarn.com", searchPath: "/search/results.html?words=" },
  { name: "West Elm", domain: "westelm.com", searchPath: "/search/results.html?words=" },
  { name: "Crate & Barrel", domain: "crateandbarrel.com", searchPath: "/search/results.html?q=" },
];

function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function generateSearchQueries(
  product: { name: string; category: string; brand: string | null; description: string | null; primary_image_url: string | null },
  lovableKey: string
): Promise<string[]> {
  const textContent = `Product: ${product.name}\nCategory: ${product.category}\nBrand: ${product.brand || "Unknown"}\nDescription: ${(product.description || "").slice(0, 300)}\n\nGenerate 3 concise search queries to find this product or close equivalents on furniture retail websites. Focus on key identifiers: style, material, form factor. Return ONLY valid JSON: {"queries":["query1","query2","query3"]}`;

  const messageContent: any[] = [{ type: "text", text: textContent }];

  // Include product image if available for visual recognition
  if (product.primary_image_url) {
    messageContent.push({
      type: "image_url",
      image_url: { url: product.primary_image_url },
    });
  }

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a luxury furniture e-commerce expert. Generate precise search queries to find products on competitor retail websites. Return ONLY valid JSON with no markdown.",
          },
          { role: "user", content: messageContent },
        ],
        temperature: 0.2,
      }),
    });

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '{"queries":[]}';

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
    }

    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.queries) && parsed.queries.length > 0) {
      return parsed.queries.slice(0, 3);
    }
  } catch (err) {
    console.error("Gemini query generation failed:", err);
  }

  // Fallback: construct basic queries from product fields
  const base = `${product.brand ? product.brand + " " : ""}${product.name}`;
  return [base, `${product.category} ${product.name}`, product.name];
}

async function scrapeRetailerForPrices(
  searchUrl: string,
  firecrawlKey: string
): Promise<Array<{ product_name: string; price: number; url: string }>> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: [
          {
            type: "json",
            prompt: "Extract all product listings from this search results page. For each product listing, extract: the product name, the price as a plain number (no currency symbols, no commas), and the product page URL. Return a JSON array of objects with fields: product_name, price, url. Only include items with a valid numeric price greater than 0.",
          },
        ],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const extracted = data?.data?.json || data?.json || [];

    if (!Array.isArray(extracted)) return [];

    return extracted
      .filter((item: any) => {
        const p = typeof item.price === "number" ? item.price : parseFloat(String(item.price || "").replace(/[^0-9.]/g, ""));
        return !isNaN(p) && p > 0;
      })
      .map((item: any) => ({
        product_name: String(item.product_name || item.name || "").trim(),
        price: typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")),
        url: String(item.url || searchUrl),
      }))
      .slice(0, 10); // Cap at 10 results per retailer/query combo
  } catch (err) {
    console.error("Firecrawl scrape failed for", searchUrl, err);
    return [];
  }
}

async function recalculatePricingRanges(
  productId: string,
  sessionId: string,
  supabase: any
): Promise<void> {
  const { data: marketData } = await supabase
    .from("product_market_data")
    .select("price, source_name")
    .eq("product_id", productId);

  if (!marketData || marketData.length === 0) return;

  const prices = marketData.map((d: any) => Number(d.price)).filter((p: number) => p > 0).sort((a: number, b: number) => a - b);
  if (prices.length === 0) return;

  const uniqueSources = new Set(marketData.map((d: any) => d.source_name)).size;
  const min = prices[0];
  const max = prices[prices.length - 1];
  const avg = prices.reduce((s: number, p: number) => s + p, 0) / prices.length;
  const mid = Math.floor(prices.length / 2);
  const median = prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];

  await supabase
    .from("product_pricing_ranges")
    .upsert(
      {
        product_id: productId,
        market_min: Math.round(min * 100) / 100,
        market_max: Math.round(max * 100) / 100,
        market_avg: Math.round(avg * 100) / 100,
        market_median: Math.round(median * 100) / 100,
        sources_count: uniqueSources,
        data_points_count: prices.length,
        last_scanned_at: new Date().toISOString(),
        last_session_id: sessionId,
      },
      { onConflict: "product_id" }
    );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { product_ids, scan_all } = body;

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!firecrawlKey) return errorResponse("FIRECRAWL_API_KEY is not configured", 500);
    if (!lovableKey) return errorResponse("LOVABLE_API_KEY is not configured", 500);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create scan session
    const { data: session, error: sessionErr } = await supabase
      .from("market_scan_sessions")
      .insert({
        status: "running",
        total_products: 0,
        triggered_by: "manual",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionErr) throw sessionErr;

    // Fetch products with primary images
    let productsQuery = supabase
      .from("products")
      .select("id, name, description, category, brand, price");

    if (!scan_all && Array.isArray(product_ids) && product_ids.length > 0) {
      productsQuery = productsQuery.in("id", product_ids);
    }

    const { data: products } = await productsQuery;

    if (!products || products.length === 0) {
      await supabase
        .from("market_scan_sessions")
        .update({ status: "completed", total_products: 0, completed_at: new Date().toISOString() })
        .eq("id", session.id);

      return new Response(
        JSON.stringify({ success: true, session_id: session.id, products_processed: 0, total_data_points: 0, errors: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch primary images for all products in one query
    const { data: images } = await supabase
      .from("product_images")
      .select("product_id, url")
      .in("product_id", products.map((p: any) => p.id))
      .eq("is_primary", true);

    const imageMap: Record<string, string> = {};
    (images || []).forEach((img: any) => { imageMap[img.product_id] = img.url; });

    // Update session with total count
    await supabase
      .from("market_scan_sessions")
      .update({ total_products: products.length })
      .eq("id", session.id);

    const errors: string[] = [];
    let totalDataPoints = 0;

    // Process each product sequentially to avoid rate limits
    for (const product of products) {
      try {
        const primaryImageUrl = imageMap[product.id] || null;

        // Step 1: Generate smart search queries using Gemini Vision
        const queries = await generateSearchQueries(
          {
            name: product.name,
            category: product.category,
            brand: product.brand,
            description: product.description,
            primary_image_url: primaryImageUrl,
          },
          lovableKey
        );

        console.log(`Product "${product.name}" - generated ${queries.length} queries:`, queries);

        // Step 2: Search each retailer with top 2 queries
        const dataRows: any[] = [];

        for (const retailer of TARGET_RETAILERS) {
          for (const query of queries.slice(0, 2)) {
            const searchUrl = `https://${retailer.domain}${retailer.searchPath}${encodeURIComponent(query)}`;
            const results = await scrapeRetailerForPrices(searchUrl, firecrawlKey);

            for (const result of results) {
              dataRows.push({
                session_id: session.id,
                product_id: product.id,
                source_name: retailer.name,
                source_url: result.url,
                matched_product_name: result.product_name,
                price: result.price,
                search_query_used: query,
                confidence_score: 0.70,
                scraped_at: new Date().toISOString(),
              });
            }
          }
        }

        // Step 3: Insert raw market data
        if (dataRows.length > 0) {
          const { error: insertErr } = await supabase
            .from("product_market_data")
            .insert(dataRows);

          if (insertErr) {
            console.error("Insert error for product", product.id, insertErr);
          } else {
            totalDataPoints += dataRows.length;
          }
        }

        // Step 4: Recalculate aggregated pricing ranges
        await recalculatePricingRanges(product.id, session.id, supabase);

        // Step 5: Increment session progress counter
        const { data: currentSession } = await supabase
          .from("market_scan_sessions")
          .select("scanned_products")
          .eq("id", session.id)
          .single();

        await supabase
          .from("market_scan_sessions")
          .update({ scanned_products: (currentSession?.scanned_products || 0) + 1 })
          .eq("id", session.id);

        console.log(`Processed "${product.name}" - ${dataRows.length} price data points found`);

      } catch (err: any) {
        const msg = `Product ${product.id} (${product.name}): ${err.message}`;
        errors.push(msg);
        console.error(msg);

        // Still increment counter even on failure
        const { data: currentSession } = await supabase
          .from("market_scan_sessions")
          .select("scanned_products, failed_products")
          .eq("id", session.id)
          .single();

        await supabase
          .from("market_scan_sessions")
          .update({
            scanned_products: (currentSession?.scanned_products || 0) + 1,
            failed_products: (currentSession?.failed_products || 0) + 1,
          })
          .eq("id", session.id);
      }
    }

    // Finalize session
    const finalStatus = errors.length === products.length ? "failed" : "completed";
    await supabase
      .from("market_scan_sessions")
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        products_processed: products.length - errors.length,
        total_data_points: totalDataPoints,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Market scanner error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
