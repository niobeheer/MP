const MEDIA_ID = "424678";
const PROVIDERS = {
  vipio: {name: "Vipio", programID: "15569", trackingHost: "fr135.net"},
  "campings-com": {name: "Campings.com", programID: "16264", trackingHost: "jf79.net"},
  vodatent: {name: "Vodatent", programID: "15258", trackingHost: "fr135.net"},
  "vodatent-com": {name: "Vodatent.com", programID: "15967", trackingHost: "fr135.net"},
  tendi: {name: "Tendi", programID: "21545", trackingHost: "glp8.net"},
  uplandparcs: {name: "UplandParcs", programID: "15690", trackingHost: "fr135.net"},
};
const COUNTRY_NAMES = {
  AT: "Oostenrijk", BE: "België", CH: "Zwitserland", CZ: "Tsjechië", DE: "Duitsland",
  DK: "Denemarken", ES: "Spanje", FR: "Frankrijk", HR: "Kroatië", HU: "Hongarije",
  IT: "Italië", LU: "Luxemburg", NL: "Nederland", PL: "Polen", PT: "Portugal", SI: "Slovenië",
};
const cache = new Map();
const norm = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function safeTrackingLink(value, provider) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && url.hostname === provider.trackingHost && url.searchParams.get("si") === provider.programID && url.searchParams.get("wi") === MEDIA_ID ? url.href : "";
  } catch {
    return "";
  }
}

function safeProduct(raw, provider) {
  const update = raw?.update_info || {};
  const product = raw?.product_info || {};
  const price = Number(product.price || product.accommodation_lowest_price);
  const countryCode = String(product.destination_country || "").toUpperCase();
  const image = (Array.isArray(product.images) ? product.images.find(item => item?.tag === "default")?.location || product.images[0]?.location : "") || "";
  return {
    id: String(update.daisycon_unique_id || product.sku || ""),
    title: String(product.title || product.accommodation_name || ""),
    accommodation_name: String(product.accommodation_name || ""),
    type: String(product.accommodation_type || product.category || ""),
    city: String(product.destination_city || ""),
    region: String(product.destination_region || ""),
    country: COUNTRY_NAMES[countryCode] || countryCode,
    country_code: countryCode,
    price: Number.isFinite(price) && price > 0 ? price : null,
    arrival_date: String(product.arrival_date || product.available_from || ""),
    duration_days: Number(product.duration_days) || null,
    max_people: Number(product.max_nr_people) || null,
    stars: Number(product.star_rating) || null,
    description: String(product.description_short || product.description || "").replace(/\s+/g, " ").trim(),
    image: String(image),
    link: safeTrackingLink(product.link, provider),
  };
}

async function load(providerKey, provider) {
  const cached = cache.get(providerKey);
  if (cached?.expires > Date.now()) return cached;
  const first = new URL("https://daisycon.io/datafeed/");
  first.search = new URLSearchParams({
    media_id: MEDIA_ID,
    standard_id: "16",
    language_code: "nl",
    locale_id: "1",
    type: "JSON",
    program_id: provider.programID,
    html_transform: "none",
    rawdata: "false",
    encoding: "utf8",
    general: "false",
    records: "1000",
  });
  let next = first.href;
  let pages = 0;
  const products = [];
  let reportedTotal = 0;
  while (next && pages < 10) {
    const response = await fetch(next, {headers: {accept: "application/json", "user-agent": "CampingKiezerDaisyconFeed/106"}});
    if (!response.ok) throw new Error(`${provider.name} feed HTTP ${response.status}`);
    const json = await response.json();
    const programs = json?.datafeed?.programs || [];
    for (const program of programs) {
      reportedTotal = Math.max(reportedTotal, Number(program?.program_info?.product_count) || 0);
      for (const raw of (program.products || [])) products.push(safeProduct(raw, provider));
    }
    next = response.headers.get("x-next-url") || "";
    pages += 1;
  }
  const unique = [...new Map(products.filter(item => item.id && item.title && item.link).map(item => [item.id, item])).values()];
  if (!unique.length) throw new Error(`${provider.name} feed bevat geen bruikbaar aanbod`);
  const result = {expires: Date.now() + 30 * 60 * 1000, products: unique, reportedTotal, pages};
  cache.set(providerKey, result);
  return result;
}

export default async request => {
  const url = new URL(request.url);
  const providerKey = String(url.searchParams.get("provider") || "").trim().toLowerCase();
  const provider = PROVIDERS[providerKey];
  if (!provider) return new Response(JSON.stringify({ok: false, offers: [], error: "Onbekende aanbieder"}), {status: 400, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}});
  const q = norm(url.searchParams.get("q"));
  const country = norm(url.searchParams.get("country"));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") || 24)));
  try {
    const feed = await load(providerKey, provider);
    const countries = [...new Set(feed.products.map(item => item.country).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl"));
    const filtered = feed.products.filter(item => {
      const haystack = norm(`${item.title} ${item.accommodation_name} ${item.type} ${item.city} ${item.region} ${item.country} ${item.description}`);
      return (!q || haystack.includes(q)) && (!country || norm(item.country) === country);
    });
    return new Response(JSON.stringify({ok: true, provider: provider.name, feed_total: feed.products.length, reported_total: feed.reportedTotal, filtered_total: filtered.length, countries, offset, limit, offers: filtered.slice(offset, offset + limit)}), {headers: {"content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300, stale-while-revalidate=1800", "x-robots-tag": "noindex"}});
  } catch (error) {
    return new Response(JSON.stringify({ok: false, provider: provider.name, offers: [], error: String(error?.message || error)}), {status: 200, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}});
  }
};
