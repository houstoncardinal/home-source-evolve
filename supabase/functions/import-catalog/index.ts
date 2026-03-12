import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://www.happyhomesindustries.com";

const CATEGORIES = [
  { path: "stationary-sofa--loveseats.html", category: "Living Room", subcategory: "Sofas & Loveseats" },
  { path: "stationary-sectionals.html", category: "Living Room", subcategory: "Sectionals" },
  { path: "reclining-sofa--loveseats.html", category: "Living Room", subcategory: "Reclining Sofas" },
  { path: "reclining-sectionals.html", category: "Living Room", subcategory: "Reclining Sectionals" },
  { path: "recliners--lift-chairs.html", category: "Living Room", subcategory: "Recliners & Lift Chairs" },
  { path: "sleepers--futons.html", category: "Living Room", subcategory: "Sleepers & Futons" },
  { path: "occasional-tables.html", category: "Living Room", subcategory: "Occasional Tables" },
  { path: "tv-stands.html", category: "Living Room", subcategory: "TV Stands" },
  { path: "beds.html", category: "Bedroom", subcategory: "Beds" },
  { path: "bedrooms.html", category: "Bedroom", subcategory: "Bedroom Sets" },
  { path: "daybeds.html", category: "Bedroom", subcategory: "Daybeds" },
  { path: "bunk-beds.html", category: "Bedroom", subcategory: "Bunk Beds" },
  { path: "mattresses.html", category: "Bedroom", subcategory: "Mattresses" },
  { path: "vanities--mirrors.html", category: "Bedroom", subcategory: "Vanities & Mirrors" },
  { path: "dining-rooms.html", category: "Dining Room", subcategory: "Dining Sets" },
  { path: "barstools.html", category: "Dining Room", subcategory: "Barstools" },
  { path: "office--bookcase.html", category: "Office", subcategory: "Office Furniture" },
  { path: "accessories.html", category: "Accessories", subcategory: null },
  { path: "new-arrivals.html", category: "New Arrivals", subcategory: null },
];

interface ScrapedProduct {
  storeId: string;
  name: string;
  imageUrl: string;
  detailUrl: string;
  soldOut: boolean;
  category: string;
  subcategory: string | null;
}

function cleanName(name: string): string {
  return name
    .replace(/\*\*[^*]*\*\*/g, "")
    .replace(/\(ETA[^)]*\)/gi, "")
    .replace(/\(\d+\s*LEFT\)/gi, "")
    .replace(/\*{2,}/g, "")
    .replace(/\\n/g, " ")
    .replace(/\\/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSlug(name: string, storeId: string): string {
  const clean = cleanName(name)
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
  return `${clean}-${storeId}`;
}

function extractBadge(name: string): string | null {
  if (/NEW\s*ARRIVAL/i.test(name)) return "New Arrival";
  if (/ON\s*SALE/i.test(name)) return "On Sale";
  if (/GREAT\s*VALUE/i.test(name)) return "Great Value";
  if (/BEST\s*SELLER/i.test(name)) return "Best Seller";
  if (/LIMITED/i.test(name)) return "Limited Edition";
  return null;
}

function guessCategoryFromName(name: string): string {
  const lower = name.toLowerCase();
  if (/sofa|sectional|recliner|loveseat|futon|sleeper|couch/i.test(lower)) return "Living Room";
  if (/bed|mattress|nightstand|dresser|daybed|bunk/i.test(lower)) return "Bedroom";
  if (/dining|table.*chair|barstool|counter/i.test(lower)) return "Dining Room";
  if (/desk|office|bookcase/i.test(lower)) return "Office";
  return "Accessories";
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CatalogBot/1.0)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseProducts(html: string, category: string, subcategory: string | null): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  const seen = new Set<string>();

  // Match product links: /store/pNNNN/Name.html
  const linkRegex = /href="(\/store\/(p\d+)\/([^"]+)\.html)"/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const [, fullPath, storeId, nameEncoded] = match;
    if (seen.has(storeId)) continue;
    seen.add(storeId);

    const name = decodeURIComponent(nameEncoded).replace(/_/g, " ").replace(/%2C/g, ",").replace(/%26/g, "&");

    // Find nearest image (search backwards and forwards)
    const context = html.substring(Math.max(0, match.index - 500), match.index + 500);
    const imgMatch = context.match(/(?:src|data-src)="([^"]*\/uploads\/[^"]+)"/);
    let imageUrl = imgMatch ? imgMatch[1].split("?")[0] : "";
    if (imageUrl && !imageUrl.startsWith("http")) imageUrl = `${BASE_URL}${imageUrl}`;

    // Check sold out
    const afterContext = html.substring(Math.max(0, match.index - 200), match.index + 200).toLowerCase();
    const soldOut = afterContext.includes("sold out");

    if (name) {
      products.push({
        storeId,
        name,
        imageUrl,
        detailUrl: `${BASE_URL}${fullPath}`,
        soldOut,
        category,
        subcategory,
      });
    }
  }

  return products;
}

async function scrapeCategoryPages(
  path: string,
  category: string,
  subcategory: string | null
): Promise<ScrapedProduct[]> {
  const all: ScrapedProduct[] = [];

  for (let page = 1; page <= 10; page++) {
    const url = page === 1 ? `${BASE_URL}/${path}` : `${BASE_URL}/${path}?page=${page}`;
    const html = await fetchHTML(url);
    if (!html) break;

    const products = parseProducts(html, category, subcategory);
    if (products.length === 0) break;

    all.push(...products);

    if (!html.includes(`page=${page + 1}`)) break;
    await new Promise((r) => setTimeout(r, 300));
  }

  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log: string[] = [];
    const addLog = (msg: string) => { log.push(msg); console.log(msg); };

    addLog("Starting Happy Homes catalog import...");

    // Step 1: Scrape all categories
    let allProducts: ScrapedProduct[] = [];

    for (const cat of CATEGORIES) {
      const products = await scrapeCategoryPages(cat.path, cat.category, cat.subcategory);
      addLog(`${cat.path}: ${products.length} products`);
      allProducts.push(...products);
      await new Promise((r) => setTimeout(r, 300));
    }

    // Deduplicate by storeId
    const seen = new Set<string>();
    const uniqueProducts = allProducts.filter((p) => {
      if (seen.has(p.storeId)) return false;
      seen.add(p.storeId);
      return true;
    });

    addLog(`Total scraped: ${allProducts.length}, unique: ${uniqueProducts.length}`);

    if (uniqueProducts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No products found on website", log }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Clear existing catalog
    addLog("Clearing existing catalog...");
    const tables = ["product_features", "product_variations", "product_textures", "product_colors", "product_images", "products"];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().not("id", "is", null);
      if (error) addLog(`  Error clearing ${table}: ${error.message}`);
    }

    // Step 3: Insert products in batches
    addLog("Inserting products...");
    let insertedCount = 0;

    for (let i = 0; i < uniqueProducts.length; i += 50) {
      const batch = uniqueProducts.slice(i, i + 50).map((p) => {
        const cleanedName = cleanName(p.name);
        const brand = /^Ashley/i.test(cleanedName) ? "Ashley Furniture" : "Happy Homes Industries";
        return {
          name: cleanedName,
          slug: generateSlug(p.name, p.storeId),
          category: p.category === "New Arrivals" ? guessCategoryFromName(cleanedName) : p.category,
          subcategory: p.subcategory,
          brand,
          price: 0,
          in_stock: !p.soldOut,
          stock_quantity: p.soldOut ? 0 : 10,
          featured: false,
          badge: extractBadge(p.name),
          description: `${cleanedName} by ${brand}. Premium quality furniture for your home.`,
        };
      });

      const { error } = await supabase.from("products").insert(batch);
      if (error) {
        addLog(`Batch error: ${error.message}, trying individually...`);
        for (const product of batch) {
          const { error: e } = await supabase.from("products").insert(product);
          if (!e) insertedCount++;
        }
      } else {
        insertedCount += batch.length;
      }
    }

    addLog(`Inserted ${insertedCount} products`);

    // Step 4: Insert product images
    addLog("Inserting product images...");
    let imageCount = 0;

    for (let i = 0; i < uniqueProducts.length; i += 50) {
      const batch = uniqueProducts.slice(i, i + 50);
      const slugs = batch.map((p) => generateSlug(p.name, p.storeId));

      const { data: productsData } = await supabase
        .from("products")
        .select("id, slug")
        .in("slug", slugs);

      if (!productsData || productsData.length === 0) continue;

      const slugToId: Record<string, string> = {};
      productsData.forEach((p: any) => { slugToId[p.slug] = p.id; });

      const images: any[] = [];
      for (const p of batch) {
        const slug = generateSlug(p.name, p.storeId);
        const productId = slugToId[slug];
        if (!productId || !p.imageUrl) continue;

        images.push({
          product_id: productId,
          url: p.imageUrl,
          alt_text: cleanName(p.name),
          is_primary: true,
          display_order: 1,
        });
      }

      if (images.length > 0) {
        const { error } = await supabase.from("product_images").insert(images);
        if (error) addLog(`Image insert error: ${error.message}`);
        else imageCount += images.length;
      }
    }

    addLog(`Inserted ${imageCount} images`);

    // Step 5: Set featured products
    const { data: allProds } = await supabase
      .from("products")
      .select("id, category")
      .eq("in_stock", true)
      .limit(500);

    if (allProds) {
      const catSeen = new Set<string>();
      const toFeature: string[] = [];
      for (const p of allProds) {
        if (!catSeen.has(p.category) && toFeature.length < 12) {
          catSeen.add(p.category);
          toFeature.push(p.id);
        }
      }
      for (const id of toFeature) {
        await supabase.from("products").update({ featured: true }).eq("id", id);
      }
      addLog(`Set ${toFeature.length} products as featured`);
    }

    // Final count
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
    addLog(`Import complete! Total products: ${count}`);

    return new Response(
      JSON.stringify({ success: true, products_imported: insertedCount, images_imported: imageCount, total_in_catalog: count, log }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
