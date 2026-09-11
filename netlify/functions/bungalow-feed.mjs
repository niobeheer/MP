const FEED_BASE = "https://daisycon.io/datafeed/?media_id=424678&standard_id=16&language_code=nl&locale_id=1&type=JSON&program_id=11126&html_transform=none&rawdata=true&encoding=utf8&general=true&records=1000";
let cache = {expires: 0, products: [], total: 0};

const norm = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const safeProduct = raw => {
  const update = raw?.update_info || {};
  const p = raw?.product_info || {};
  const media = raw?.media || p?.media || {};
  const imageCandidate = p.image_url || p.image || p.accommodation_image || p.thumbnail_url || media.image_url || media.image || (Array.isArray(p.images) ? (p.images[0]?.url || p.images[0]) : "");
  return {
    id: String(update.daisycon_unique_id || p.sku || ""),
    title: String(p.title || p.accommodation_name || ""),
    city: String(p.destination_city || ""),
    country: String(p.destination_country || "").toUpperCase(),
    type: String(p.accommodation_type || p.category || ""),
    price: Number.isFinite(Number(p.accommodation_lowest_price || p.price)) ? Number(p.accommodation_lowest_price || p.price) : null,
    arrival_date: String(p.arrival_date || ""),
    image: String(imageCandidate || ""),
    link: String(p.link || ""),
  };
};

async function loadFeed() {
  if (cache.expires > Date.now() && cache.products.length) return cache;
  let next = FEED_BASE;
  const all = [];
  let pages = 0;
  while (next && pages < 10) {
    const response = await fetch(next, {headers: {accept: "application/json", "user-agent": "CampingKiezerProviderFeed/42"}});
    if (!response.ok) throw new Error(`Bungalow.Net feed ${response.status}`);
    const json = await response.json();
    const programs = json?.datafeed?.programs || [];
    for (const program of programs) for (const product of (program.products || [])) all.push(safeProduct(product));
    next = response.headers.get("x-next-url") || "";
    pages += 1;
  }
  const products = all.filter(p => p.country === "NL" && p.title && p.link.startsWith("https://lt45.net/"));
  cache = {expires: Date.now() + 30 * 60 * 1000, products, total: all.length};
  return cache;
}

export default async request => {
  const url = new URL(request.url);
  const q = norm(url.searchParams.get("q") || "");
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 24)));
  try {
    const feed = await loadFeed();
    const filtered = q ? feed.products.filter(p => norm(`${p.title} ${p.city} ${p.type}`).includes(q)) : feed.products;
    return new Response(JSON.stringify({ok: true, provider: "Bungalow.Net", feed_total: feed.total, nl_total: filtered.length, offset, limit, offers: filtered.slice(offset, offset + limit)}), {
      headers: {"content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300, stale-while-revalidate=1800", "x-robots-tag": "noindex"},
    });
  } catch (error) {
    return new Response(JSON.stringify({ok: false, provider: "Bungalow.Net", offers: [], error: String(error?.message || error)}), {status: 200, headers: {"content-type": "application/json", "cache-control": "no-store"}});
  }
};
