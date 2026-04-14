import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://www.happyhomesindustries.com";
const IMAGE_BUCKET = "product-images";

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

function cleanName(name: string): string {
  return name.replace(/\*\*[^*]*\*\*/g, "").replace(/\(ETA[^)]*\)/gi, "").replace(/\(\d+\s*LEFT\)/gi, "").replace(/\*{2,}/g, "").replace(/\s+/g, " ").trim();
}

function generateSlug(name: string, storeId: string): string {
  return cleanName(name).toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 80) + `-${storeId}`;
}

function extractBadge(name: string): string | null {
  if (/NEW\s*ARRI/i.test(name)) return "New Arrival";
  if (/ON\s*SALE/i.test(name)) return "On Sale";
  if (/GREAT\s*VALUE/i.test(name)) return "Great Value";
  if (/BEST\s*SELLER/i.test(name)) return "Best Seller";
  return null;
}

function guessCat(name: string): string {
  const l = name.toLowerCase();
  if (/sofa|sectional|recliner|loveseat|futon|sleeper|couch|chaise/i.test(l)) return "Living Room";
  if (/bed|mattress|nightstand|dresser|daybed|bunk/i.test(l)) return "Bedroom";
  if (/dining|table.*chair|barstool|counter/i.test(l)) return "Dining Room";
  if (/desk|office|bookcase/i.test(l)) return "Office";
  return "Accessories";
}

function ensureAbsoluteUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isManagedStorageUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${IMAGE_BUCKET}/`);
}

function extractStoreIdFromSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return slug.match(/-(p\d+)$/i)?.[1] ?? null;
}

function buildCategoryPageUrl(path: string, page: number): string {
  return page === 1 ? `${BASE_URL}/${path}` : `${BASE_URL}/${path}?page=${page}`;
}

function getFileExtension(url: string, contentType: string | null): string {
  const normalizedUrl = url.toLowerCase();
  const cleanUrl = normalizedUrl.split("?")[0];
  const byUrl = cleanUrl.match(/\.([a-z0-9]{3,4})$/)?.[1];
  if (byUrl && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(byUrl)) return byUrl;

  const type = (contentType || "").toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("avif")) return "avif";
  return "jpg";
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" } });
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
}

async function mirrorImageToStorage(supabase: any, sourceUrl: string, storeId: string, slot: number, timeoutMs = 8000): Promise<string> {
  const absoluteUrl = ensureAbsoluteUrl(sourceUrl);
  if (!absoluteUrl) return "";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(absoluteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      console.error(`Failed to fetch image ${absoluteUrl}: ${response.status}`);
      return absoluteUrl;
    }

    const contentType = response.headers.get("content-type");
    const ext = getFileExtension(absoluteUrl, contentType);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const path = `catalog/${storeId}/primary-${slot}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, bytes, {
      upsert: true,
      contentType: contentType || `image/${ext}`,
      cacheControl: "31536000",
    });

    if (uploadError) {
      console.error(`Failed to upload image ${path}: ${uploadError.message}`);
      return absoluteUrl;
    }

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error(`Error mirroring image ${absoluteUrl}:`, error);
    return absoluteUrl;
  }
}

interface Product {
  storeId: string;
  name: string;
  imageUrl: string;
  soldOut: boolean;
  category: string;
  subcategory: string | null;
}

function parseProducts(html: string, category: string, subcategory: string | null): Product[] {
  const products: Product[] = [];
  const seen = new Set<string>();
  const regex = /href="([^"]*\/store\/(p\d+)\/([^"]+)\.html)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const [, href, storeId, nameEnc] = m;
    if (!href.includes("happyhomesindustries.com") && !href.startsWith("/store/")) continue;
    if (seen.has(storeId)) continue;
    seen.add(storeId);

    const name = decodeURIComponent(nameEnc)
      .replace(/_/g, " ")
      .replace(/%2C/g, ",")
      .replace(/%26/g, "&")
      .replace(/%2F/g, "/");

    const ctx = html.substring(Math.max(0, m.index - 800), m.index + 800);
    const imgM = ctx.match(/(?:src|data-src)="([^"]*\/uploads\/[^"]+)"/i);
    let img = imgM ? imgM[1].split("?")[0] : "";
    if (img && !img.startsWith("http")) img = `${BASE_URL}${img}`;

    const nearby = ctx.toLowerCase();
    const soldOut = nearby.includes("sold out") || nearby.includes("wsite-soldout");

    if (name && img) {
      products.push({ storeId, name, imageUrl: img, soldOut, category, subcategory });
    }
  }
  return products;
}

async function scrapeBatch(cats: typeof CATEGORIES): Promise<Product[]> {
  const allProducts: Product[] = [];
  for (const cat of cats) {
    const seenInCategory = new Set<string>();
    let categoryCount = 0;

    for (let page = 1; page <= 10; page++) {
      const html = await fetchHTML(buildCategoryPageUrl(cat.path, page));
      if (!html) break;

      const prods = parseProducts(html, cat.category, cat.subcategory).filter((product) => {
        if (seenInCategory.has(product.storeId)) return false;
        seenInCategory.add(product.storeId);
        return true;
      });

      if (prods.length === 0 && page > 1) break;

      allProducts.push(...prods);
      categoryCount += prods.length;

      const hasNextPage = html.includes(`page=${page + 1}`) || /Next\s*<\/a>/i.test(html);
      if (!hasNextPage) break;
    }

    console.log(`${cat.path}: ${categoryCount} products`);
  }
  return allProducts;
}

async function syncImagesForProducts(
  supabase: any,
  products: Product[],
  options: { limit?: number; productOffset?: number; replaceExisting?: boolean } = {},
) {
  const seenStoreIds = new Set<string>();
  const dedupedProducts = products.filter((product) => {
    if (!product.storeId || seenStoreIds.has(product.storeId)) return false;
    seenStoreIds.add(product.storeId);
    return true;
  });

  const storeIds = Array.from(new Set(dedupedProducts.map((p) => p.storeId).filter(Boolean)));
  const { data: existingProducts, error: productLookupError } = await supabase
    .from("products")
    .select("id, slug");

  if (productLookupError) throw productLookupError;

  const storeIdSet = new Set(storeIds);
  const byStoreId = new Map<string, { id: string; slug: string }>();
  for (const item of existingProducts || []) {
    const extractedStoreId = extractStoreIdFromSlug(item.slug);
    if (extractedStoreId && storeIdSet.has(extractedStoreId) && !byStoreId.has(extractedStoreId)) {
      byStoreId.set(extractedStoreId, item);
    }
  }

  const matched = dedupedProducts
    .map((product) => ({ ...product, productId: byStoreId.get(product.storeId)?.id }))
    .filter((product): product is Product & { productId: string } => Boolean(product.productId));

  if (matched.length === 0) {
    return {
      matched_products: 0,
      images_inserted: 0,
      processed_products: 0,
      next_product_offset: null,
    };
  }

  const start = Math.max(0, options.productOffset ?? 0);
  const limit = Math.max(1, options.limit ?? matched.length);
  const chunk = matched.slice(start, start + limit);

  if (chunk.length === 0) {
    return {
      matched_products: matched.length,
      images_inserted: 0,
      processed_products: 0,
      next_product_offset: null,
    };
  }

  const productIds = chunk.map((product) => product.productId);
  const { data: existingImages, error: existingImagesError } = await supabase
    .from("product_images")
    .select("id, product_id")
    .in("product_id", productIds);

  if (existingImagesError) throw existingImagesError;

  const existingCountByProductId = new Map<string, number>();
  for (const image of existingImages || []) {
    existingCountByProductId.set(image.product_id, (existingCountByProductId.get(image.product_id) || 0) + 1);
  }

  let imagesInserted = 0;
  for (const product of chunk) {
    const existingCount = existingCountByProductId.get(product.productId) || 0;
    if (!options.replaceExisting && existingCount > 0) continue;

    const mirroredUrl = await mirrorImageToStorage(supabase, product.imageUrl, product.storeId, 1);
    if (!mirroredUrl || !isManagedStorageUrl(mirroredUrl)) {
      console.error(`Skipping ${product.storeId} because image mirroring did not return a managed storage URL`);
      continue;
    }

    if (options.replaceExisting && existingCount > 0) {
      const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", product.productId);
      if (deleteError) throw deleteError;
    }

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: product.productId,
      url: mirroredUrl,
      alt_text: cleanName(product.name),
      is_primary: true,
      display_order: 1,
    });
    if (insertError) throw insertError;
    imagesInserted++;
  }

  const nextProductOffset = start + chunk.length < matched.length ? start + chunk.length : null;

  return {
    matched_products: matched.length,
    images_inserted: imagesInserted,
    processed_products: chunk.length,
    next_product_offset: nextProductOffset,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, batch_start, batch_size } = body;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const hdr = { ...corsHeaders, "Content-Type": "application/json" };

    if (mode === "clear") {
      for (const t of ["product_features", "product_variations", "product_textures", "product_colors", "product_images", "products"]) {
        await supabase.from(t).delete().not("id", "is", null);
      }
      return new Response(JSON.stringify({ success: true, message: "Catalog cleared" }), { headers: hdr });
    }

    if (mode === "count") {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: imageCount } = await supabase.from("product_images").select("*", { count: "exact", head: true });
      return new Response(JSON.stringify({ success: true, total: count, image_total: imageCount }), { headers: hdr });
    }

    if (mode === "feature") {
      const { data: prods } = await supabase.from("products").select("id, category").eq("in_stock", true).limit(500);
      if (prods) {
        const cs = new Set<string>();
        const ids: string[] = [];
        for (const p of prods) {
          if (!cs.has(p.category) && ids.length < 12) {
            cs.add(p.category);
            ids.push(p.id);
          }
        }
        for (const id of ids) await supabase.from("products").update({ featured: true }).eq("id", id);
      }
      return new Response(JSON.stringify({ success: true, message: "Featured set" }), { headers: hdr });
    }

    const start = batch_start || 0;
    const size = batch_size || 4;
    const cats = CATEGORIES.slice(start, start + size);
    const scrapedProducts = await scrapeBatch(cats);

    if (mode === "repair-images") {
      const batchLimit = Math.min(Math.max(Number(body.limit) || 12, 1), 25);
      const productOffset = Math.max(Number(body.product_offset) || 0, 0);
      const seen = new Set<string>();
      const unique = scrapedProducts
        .filter((product) => {
          if (seen.has(product.storeId)) return false;
          seen.add(product.storeId);
          return true;
        });
      const result = await syncImagesForProducts(supabase, unique, {
        limit: batchLimit,
        productOffset,
        replaceExisting: false,
      });
      return new Response(JSON.stringify({
        success: true,
        categories_processed: cats.map((c) => c.path),
        total_candidates: unique.length,
        product_offset: productOffset,
        ...result,
        batch_start: start,
        next_batch: result.next_product_offset === null && start + size < CATEGORIES.length ? start + size : null,
      }), { headers: hdr });
    }

    const seen = new Set<string>();
    const slugs = scrapedProducts.map((p) => generateSlug(p.name, p.storeId));
    const { data: existing } = await supabase.from("products").select("slug").in("slug", slugs);
    const existingSlugs = new Set((existing || []).map((e: { slug: string }) => e.slug));

    const unique = scrapedProducts.filter((p) => {
      const slug = generateSlug(p.name, p.storeId);
      if (seen.has(p.storeId) || existingSlugs.has(slug)) return false;
      seen.add(p.storeId);
      return true;
    });

    let inserted = 0;
    for (let i = 0; i < unique.length; i += 50) {
      const batch = unique.slice(i, i + 50).map((p) => {
        const cn = cleanName(p.name);
        const brand = /^Ashley/i.test(cn) ? "Ashley Furniture" : "Happy Homes Industries";
        return {
          name: cn,
          slug: generateSlug(p.name, p.storeId),
          category: p.category === "New Arrivals" ? guessCat(cn) : p.category,
          subcategory: p.subcategory,
          brand,
          price: 0,
          in_stock: !p.soldOut,
          stock_quantity: p.soldOut ? 0 : 10,
          featured: false,
          badge: extractBadge(p.name),
          description: `${cn} by ${brand}. Premium quality furniture for your home.`,
        };
      });
      const { error } = await supabase.from("products").insert(batch);
      if (error) {
        console.error("Batch insert error:", error.message);
        for (const prod of batch) {
          const { error: e } = await supabase.from("products").insert(prod);
          if (!e) inserted++;
        }
      } else {
        inserted += batch.length;
      }
    }

    const syncResult = await syncImagesForProducts(supabase, unique, { replaceExisting: false });

    return new Response(JSON.stringify({
      success: true,
      categories_processed: cats.map((c) => c.path),
      products_inserted: inserted,
      images_inserted: syncResult.images_inserted,
      matched_products: syncResult.matched_products,
      batch_start: start,
      next_batch: start + size < CATEGORIES.length ? start + size : null,
    }), { headers: hdr });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});