#!/usr/bin/env node
/**
 * Happy Homes Industries Catalog Import Script
 *
 * Scrapes all furniture products from https://www.happyhomesindustries.com/
 * and imports them into the Supabase catalog, replacing all existing products.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=your-key node scripts/import-happy-homes.mjs
 *
 * Get your service_role key from:
 *   Supabase Dashboard -> Settings -> API -> service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.happyhomesindustries.com';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rymeisumjtkuorrkdirb.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required.');
  console.error('');
  console.error('Get it from: Supabase Dashboard -> Settings -> API -> service_role (secret)');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_SERVICE_KEY=eyJ... node scripts/import-happy-homes.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Complete category page mappings - every category from the supplier site
const CATEGORIES = [
  { path: 'stationary-sofa--loveseats.html', category: 'Living Room', subcategory: 'Sofas & Loveseats' },
  { path: 'store/c21/Stationary_Sectionals.html', category: 'Living Room', subcategory: 'Sectionals' },
  { path: 'stationary-sectionals.html', category: 'Living Room', subcategory: 'Sectionals' },
  { path: 'reclining-sofa--loveseats.html', category: 'Living Room', subcategory: 'Reclining Sofas' },
  { path: 'RECLINING-SECTIONALS.html', category: 'Living Room', subcategory: 'Reclining Sectionals' },
  { path: 'reclining-sectionals.html', category: 'Living Room', subcategory: 'Reclining Sectionals' },
  { path: 'recliners--lift-chairs.html', category: 'Living Room', subcategory: 'Recliners & Lift Chairs' },
  { path: 'sleepers--futons.html', category: 'Living Room', subcategory: 'Sleepers & Futons' },
  { path: 'occasional-tables.html', category: 'Living Room', subcategory: 'Occasional Tables' },
  { path: 'tv-stands.html', category: 'Living Room', subcategory: 'TV Stands' },
  { path: 'Beds.html', category: 'Bedroom', subcategory: 'Beds' },
  { path: 'beds.html', category: 'Bedroom', subcategory: 'Beds' },
  { path: 'bedrooms.html', category: 'Bedroom', subcategory: 'Bedroom Sets' },
  { path: 'daybeds.html', category: 'Bedroom', subcategory: 'Daybeds' },
  { path: 'bunk-beds.html', category: 'Bedroom', subcategory: 'Bunk Beds' },
  { path: 'Mattresses.html', category: 'Bedroom', subcategory: 'Mattresses' },
  { path: 'mattresses.html', category: 'Bedroom', subcategory: 'Mattresses' },
  { path: 'vanities--mirrors.html', category: 'Bedroom', subcategory: 'Vanities & Mirrors' },
  { path: 'Dining-Rooms.html', category: 'Dining Room', subcategory: 'Dining Sets' },
  { path: 'dining-rooms.html', category: 'Dining Room', subcategory: 'Dining Sets' },
  { path: 'barstools.html', category: 'Dining Room', subcategory: 'Barstools' },
  { path: 'office--bookcase.html', category: 'Office', subcategory: 'Office Furniture' },
  { path: 'Accessories.html', category: 'Accessories', subcategory: null },
  { path: 'accessories.html', category: 'Accessories', subcategory: null },
  { path: 'new-arrivals.html', category: 'New Arrivals', subcategory: null },
];

function cleanName(name) {
  return name
    .replace(/\*\*[^*]*\*\*/g, '')
    .replace(/\(ETA[^)]*\)/gi, '')
    .replace(/\(\d+\s*LEFT\)/gi, '')
    .replace(/\*{2,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSlug(name, storeId) {
  const clean = cleanName(name)
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  return `${clean}-${storeId}`;
}

function extractBadge(name) {
  if (/NEW\s*ARRIVAL/i.test(name)) return 'New Arrival';
  if (/ON\s*SALE/i.test(name)) return 'On Sale';
  if (/GREAT\s*VALUE/i.test(name)) return 'Great Value';
  if (/COMING\s*SOON/i.test(name)) return 'Coming Soon';
  if (/BEST\s*SELLER/i.test(name)) return 'Best Seller';
  if (/LIMITED/i.test(name)) return 'Limited Edition';
  return null;
}

function parseProductsFromHTML(html) {
  const $ = cheerio.load(html);
  const products = [];
  const seenOnPage = new Set();

  // Find all product links pointing to /store/p####/
  $('a[href*="/store/p"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const match = href.match(/\/store\/(p\d+)\/(.*?)\.html/);
    if (!match) return;

    const storeId = match[1];
    if (seenOnPage.has(storeId)) return;
    seenOnPage.add(storeId);

    // Extract name from URL path (fallback)
    const nameFromUrl = decodeURIComponent(match[2])
      .replace(/_/g, ' ')
      .replace(/%2C/g, ',')
      .replace(/%26/g, '&')
      .replace(/%2F/g, '/');

    // Try to get the product name from text content
    const nameEl = $el.find('[class*="product-name"], [class*="product-title"]');
    const name = (nameEl.length > 0 ? nameEl.first().text().trim() : '') || nameFromUrl;

    // Get image URL - try multiple attributes
    const img = $el.find('img').first();
    let imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-image') || '';
    imageUrl = imageUrl.split('?')[0]; // Remove query params like ?width=640

    // Check sold out status
    const parentText = $el.closest('li, div, [class*="product"]').text().toLowerCase();
    const soldOut = parentText.includes('sold out');

    // Store the product detail URL for later scraping
    const detailUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    if (name && imageUrl) {
      products.push({ storeId, name, image: imageUrl, soldOut, detailUrl });
    }
  });

  // Fallback: regex-based parsing if cheerio found nothing
  if (products.length === 0) {
    const linkRegex = /href="\/store\/(p\d+)\/([^"]+)\.html"/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const storeId = linkMatch[1];
      if (seenOnPage.has(storeId)) continue;
      seenOnPage.add(storeId);

      const nameFromUrl = decodeURIComponent(linkMatch[2]).replace(/_/g, ' ');
      const detailUrl = `${BASE_URL}/store/${storeId}/${linkMatch[2]}.html`;

      // Find nearest image
      const afterLink = html.substring(linkMatch.index);
      const imgMatch = afterLink.match(/(?:src|data-src)="(\/uploads\/[^"]+)"/);
      const imageUrl = imgMatch ? imgMatch[1].split('?')[0] : '';

      if (imageUrl) {
        products.push({ storeId, name: nameFromUrl, image: imageUrl, soldOut: false, detailUrl });
      }
    }
  }

  return products;
}

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CatalogImporter/1.0)',
        'Accept': 'text/html',
      }
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    console.error(`    Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

async function fetchProductDetails(url) {
  try {
    const html = await fetchPage(url);
    if (!html) return null;

    const $ = cheerio.load(html);
    const details = {};

    // Extract description from product page
    const descText = $('.wsite-form-sublabel, .paragraph, [class*="description"], [class*="product-description"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(t => t.length > 20)
      .join(' ');
    if (descText) details.description = descText.substring(0, 500);

    // Extract dimensions
    const pageText = $('body').text();
    const dimMatch = pageText.match(/(\d+["″]?\s*[xX×]\s*\d+["″]?\s*[xX×]?\s*\d*["″]?[LlWwHhDd]*)/);
    if (dimMatch) details.dimensions = dimMatch[1];

    // Extract additional images
    const images = [];
    $('img[src*="/uploads/"]').each((_, el) => {
      let src = $(el).attr('src') || '';
      src = src.split('?')[0];
      if (src && !images.includes(src)) images.push(src);
    });
    if (images.length > 0) details.additionalImages = images;

    // Extract price if available
    const priceMatch = pageText.match(/\$\s*(\d+[,.]?\d*\.?\d{0,2})/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(',', ''));
      if (price > 0) details.price = price;
    }

    return details;
  } catch (err) {
    return null;
  }
}

async function scrapeCategory({ path, category, subcategory }) {
  const allProducts = [];
  let page = 1;

  while (page <= 10) { // Increased from 5 to 10 pages
    const url = page === 1
      ? `${BASE_URL}/${path}`
      : `${BASE_URL}/${path}?page=${page}`;

    process.stdout.write(`  Fetching ${path}${page > 1 ? ` (page ${page})` : ''}...`);
    const html = await fetchPage(url);

    if (!html) {
      console.log(' failed');
      break;
    }

    const products = parseProductsFromHTML(html);
    console.log(` ${products.length} products`);

    if (products.length === 0) break;

    allProducts.push(...products.map(p => ({
      ...p,
      category,
      subcategory,
    })));

    // Check for next page
    const hasNext = html.includes(`page=${page + 1}`) ||
      (page === 1 && /Next\s*<\/a>/i.test(html));

    if (!hasNext) break;
    page++;

    // Be respectful to the server
    await new Promise(r => setTimeout(r, 300));
  }

  return allProducts;
}

async function main() {
  console.log('=== Happy Homes Industries Catalog Import ===\n');

  // Step 1: Scrape all categories
  console.log('Step 1: Scraping products from happyhomesindustries.com...\n');
  let allProducts = [];

  for (const cat of CATEGORIES) {
    const products = await scrapeCategory(cat);
    allProducts.push(...products);
    await new Promise(r => setTimeout(r, 500));
  }

  // Step 2: Deduplicate by storeId (first occurrence wins)
  const seen = new Set();
  const uniqueProducts = allProducts.filter(p => {
    if (seen.has(p.storeId)) return false;
    seen.add(p.storeId);
    return true;
  });

  console.log(`\nTotal scraped: ${allProducts.length}`);
  console.log(`Unique products: ${uniqueProducts.length}\n`);

  if (uniqueProducts.length === 0) {
    console.error('No products found! The website structure may have changed.');
    console.error('Please check https://www.happyhomesindustries.com/ manually.');
    process.exit(1);
  }

  // Step 2.5: Fetch detail pages for richer data (batch of 5 at a time)
  console.log('Step 2: Fetching product details...');
  const productDetails = {};
  for (let i = 0; i < uniqueProducts.length; i += 5) {
    const batch = uniqueProducts.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(p => fetchProductDetails(p.detailUrl))
    );
    batch.forEach((p, idx) => {
      if (results[idx]) productDetails[p.storeId] = results[idx];
    });
    process.stdout.write(`  Progress: ${Math.min(i + 5, uniqueProducts.length)}/${uniqueProducts.length}\r`);
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(`\n  Fetched details for ${Object.keys(productDetails).length} products`);

  // Step 3: Wipe old catalog
  console.log('\nStep 3: Wiping old catalog...');
  const tables = [
    'product_features',
    'product_variations',
    'product_textures',
    'product_colors',
    'product_images',
    'products'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().not('id', 'is', null);
    if (error) console.error(`  Error clearing ${table}: ${error.message}`);
    else console.log(`  Cleared ${table}`);
  }

  // Step 4: Insert products in batches
  console.log('\nStep 4: Inserting products...');
  let insertedCount = 0;
  const totalBatches = Math.ceil(uniqueProducts.length / 50);

  for (let i = 0; i < uniqueProducts.length; i += 50) {
    const batch = uniqueProducts.slice(i, i + 50).map(p => {
      const details = productDetails[p.storeId] || {};
      const cleanedName = cleanName(p.name);
      const brand = /^Ashley/i.test(cleanedName) ? 'Ashley Furniture' : 'Happy Homes Industries';
      return {
        name: cleanedName,
        slug: generateSlug(p.name, p.storeId),
        category: p.category === 'New Arrivals' ? guessCategoryFromName(cleanedName) : p.category,
        subcategory: p.subcategory,
        brand,
        price: details.price || 0,
        in_stock: !p.soldOut,
        stock_quantity: p.soldOut ? 0 : 10,
        featured: false,
        badge: extractBadge(p.name),
        description: details.description || `${cleanedName} by ${brand}. Premium quality furniture for your home.`,
        dimensions: details.dimensions ? { raw: details.dimensions } : null,
      };
    });

    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.error(`  Batch ${Math.floor(i/50)+1} error: ${error.message}`);
      for (const product of batch) {
        const { error: e } = await supabase.from('products').insert(product);
        if (e) console.error(`    Failed: ${product.slug}: ${e.message}`);
        else insertedCount++;
      }
    } else {
      insertedCount += batch.length;
    }

    process.stdout.write(`  Progress: ${Math.floor(i/50)+1}/${totalBatches} batches\r`);
  }
  console.log(`\n  Inserted ${insertedCount} products`);

  // Step 5: Insert product images (primary + additional)
  console.log('\nStep 5: Inserting product images...');
  let imageCount = 0;

  for (let i = 0; i < uniqueProducts.length; i += 50) {
    const batch = uniqueProducts.slice(i, i + 50);
    const slugs = batch.map(p => generateSlug(p.name, p.storeId));

    const { data: productsData } = await supabase
      .from('products')
      .select('id, slug')
      .in('slug', slugs);

    if (!productsData || productsData.length === 0) continue;

    const slugToId = Object.fromEntries(productsData.map(p => [p.slug, p.id]));

    const images = [];
    for (const p of batch) {
      const slug = generateSlug(p.name, p.storeId);
      const productId = slugToId[slug];
      if (!productId) continue;

      // Primary image
      if (p.image) {
        images.push({
          product_id: productId,
          url: p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image}`,
          alt_text: cleanName(p.name),
          is_primary: true,
          display_order: 1,
        });
      }

      // Additional images from detail page
      const details = productDetails[p.storeId];
      if (details?.additionalImages) {
        details.additionalImages.slice(0, 5).forEach((imgUrl, idx) => {
          const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`;
          if (fullUrl !== (p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image}`)) {
            images.push({
              product_id: productId,
              url: fullUrl,
              alt_text: `${cleanName(p.name)} - Image ${idx + 2}`,
              is_primary: false,
              display_order: idx + 2,
            });
          }
        });
      }
    }

    if (images.length > 0) {
      const { error } = await supabase.from('product_images').insert(images);
      if (error) console.error(`  Error inserting image batch: ${error.message}`);
      else imageCount += images.length;
    }
  }
  console.log(`  Inserted ${imageCount} images`);

  // Step 6: Mark featured products (one per major category)
  console.log('\nStep 6: Setting featured products...');
  const { data: allProds } = await supabase
    .from('products')
    .select('id, category')
    .eq('in_stock', true)
    .order('created_at', { ascending: true })
    .limit(500);

  if (allProds) {
    const categoriesSeen = new Set();
    const toFeature = [];
    for (const p of allProds) {
      if (!categoriesSeen.has(p.category) && toFeature.length < 12) {
        categoriesSeen.add(p.category);
        toFeature.push(p.id);
      }
    }

    for (const id of toFeature) {
      await supabase.from('products').update({ featured: true }).eq('id', id);
    }
    console.log(`  Set ${toFeature.length} products as featured`);
  }

  // Summary
  console.log('\n=== Import Complete ===');
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Total products in catalog: ${count}`);

  // Category breakdown
  const { data: cats } = await supabase
    .from('products')
    .select('category');

  if (cats) {
    const breakdown = {};
    cats.forEach(p => {
      breakdown[p.category] = (breakdown[p.category] || 0) + 1;
    });
    console.log('\nCategory breakdown:');
    Object.entries(breakdown).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} products`);
    });
  }
}

function guessCategoryFromName(name) {
  const lower = name.toLowerCase();
  if (/sofa|sectional|recliner|loveseat|futon|sleeper|couch/i.test(lower)) return 'Living Room';
  if (/bed|mattress|nightstand|dresser|daybed|bunk/i.test(lower)) return 'Bedroom';
  if (/dining|table.*chair|barstool|counter/i.test(lower)) return 'Dining Room';
  if (/desk|office|bookcase/i.test(lower)) return 'Office';
  return 'Accessories';
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
