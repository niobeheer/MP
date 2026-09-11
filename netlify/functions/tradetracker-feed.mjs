const FEEDS = {
  ackersate: {
    provider: "Vakantiepark Ackersate",
    format: "json",
    campaignID: "29886",
    feedID: "1501781",
    domain: "www.ackersate.nl",
  },
  "acsi-eurocampings": {
    provider: "ACSI Eurocampings",
    format: "json",
    campaignID: "30368",
    feedID: "1624201",
    domain: "partner.eurocampings.nl",
  },
  "acsi-reizen": {
    provider: "ACSI Reizen",
    format: "xml-v2",
    campaignID: "1852",
    feedID: "1634850",
    domain: "www.acsireizen.nl",
  },
  allcamps: {
    provider: "Allcamps",
    format: "json",
    campaignID: "2657",
    feedID: "2166132",
    domain: "www.allcamps.nl",
  },
  suncamp: {
    provider: "Suncamp",
    format: "json",
    campaignID: "1854",
    feedID: "1163607",
    domain: "www.suncamp.nl",
  },
  ardoer: {
    provider: "Ardoer",
    format: "json",
    campaignID: "589",
    feedID: "2554028",
    domain: "www.ardoer.com",
  },
  "de-boshoek": {
    provider: "Recreatiepark De Boshoek",
    format: "json",
    campaignID: "17578",
    feedID: "1425497",
    domain: "www.deboshoek.nl",
  },
  "de-vossenburcht": {
    provider: "Vakantiepark De Vossenburcht",
    format: "json",
    campaignID: "15663",
    feedID: "735700",
    domain: "www.devossenburcht.nl",
  },
  easyatent: {
    provider: "Easyatent",
    format: "json",
    campaignID: "31300",
    feedID: "2530953",
  },
  europarcs: {
    provider: "EuroParcs",
    format: "json",
    campaignID: "32702",
    feedID: "2543782",
    domain: "www.europarcs.nl",
  },
  farmcamps: {
    provider: "FarmCamps",
    format: "json",
    campaignID: "12236",
    feedID: "2433764",
    domain: "farmcamps.com",
  },
  "gusto-camp": {
    provider: "Gusto Camp",
    format: "json",
    campaignID: "1217",
    feedID: "2378774",
    domain: "deals.gustocamp.nl",
  },
  kampeerwereld: {
    provider: "Kampeerwereld Hendriks",
    format: "json",
    campaignID: "14070",
    feedID: "912905",
  },
  leistert: {
    provider: "De Leistert",
    format: "json",
    campaignID: "27046",
    feedID: "1257652",
  },
  "lux-camp": {
    provider: "LuxCamp",
    format: "json",
    campaignID: "30667",
    feedID: "2218660",
  },
  norgerberg: {
    provider: "De Norgerberg",
    format: "json",
    campaignID: "34001",
    feedID: "1857414",
  },
  ommerland: {
    provider: "Vakantiepark Ommerland",
    format: "json",
    campaignID: "32248",
    feedID: "2230178",
  },
  rcn: {
    provider: "RCN Vakantieparken",
    format: "json",
    campaignID: "19098",
    feedID: "2004232",
  },
  topparken: {
    provider: "TopParken",
    format: "json",
    campaignID: "30138",
    feedID: "2412602",
  },
  zandstuve: {
    provider: "Kampeerdorp De Zandstuve",
    format: "json",
    campaignID: "6475",
    feedID: "1449416",
    domain: "www.zandstuve.nl",
  },
};

const AID = "514819";
const cache = new Map();
const norm = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const decodeXml = value => String(value || "")
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"')
  .replaceAll("&#039;", "'");

function xmlText(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return decodeXml(match?.[1]?.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim());
}

function xmlProperty(block, name) {
  const match = block.match(new RegExp(`<property\\s+name=["']${name}["'][^>]*>[\\s\\S]*?<value[^>]*>([\\s\\S]*?)</value>[\\s\\S]*?</property>`, "i"));
  return decodeXml(match?.[1]?.trim());
}

function safeTrackedLink(value, config) {
  try {
    const url = new URL(String(value || ""));
    const signature = `${config.campaignID}_${config.feedID}_${AID}_`;
    const signatureStyle = decodeURIComponent(url.href).includes(signature);
    const queryStyle = url.searchParams.get("c") === config.campaignID && url.searchParams.get("m") === config.feedID && url.searchParams.get("a") === AID;
    const allowedDomain = !config.domain || url.hostname === config.domain;
    return url.protocol === "https:" && !url.username && !url.password && allowedDomain && (signatureStyle || queryStyle) ? url.href : "";
  } catch {
    return "";
  }
}

function parseXml(body, config) {
  return [...body.matchAll(/<product\s+ID=["']([^"']+)["'][^>]*>([\s\S]*?)<\/product>/gi)].map(match => {
    const block = match[2];
    const campaignID = xmlText(block, "campaignID");
    const link = campaignID === config.campaignID ? safeTrackedLink(xmlText(block, "URL"), config) : "";
    const price = Number(xmlText(block, "price"));
    return {
      id: match[1],
      title: xmlText(block, "name"),
      country: xmlProperty(block, "country") || xmlProperty(block, "country2"),
      city: xmlProperty(block, "city"),
      category: xmlProperty(block, "category"),
      duration: xmlProperty(block, "duration"),
      pets_allowed: xmlProperty(block, "petsAllowed") === "true",
      price: Number.isFinite(price) && price > 0 ? price : null,
      image: xmlText(block, "image"),
      description: xmlText(block, "description").replace(/\s+/g, " ").trim(),
      link,
    };
  }).filter(item => item.id && item.title && item.link);
}

function first(properties, key) {
  const value = properties?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseJson(body, config) {
  const parsed = JSON.parse(body);
  return (parsed.products || []).map(product => {
    const campaignID = String(product.campaignID || "");
    const link = campaignID === config.campaignID ? safeTrackedLink(product.URL, config) : "";
    const price = Number(product.price?.amount);
    return {
      id: String(product.ID || ""),
      title: String(product.name || ""),
      country: String(first(product.properties, "country") || ""),
      city: String(first(product.properties, "city") || ""),
      category: String(first(product.properties, "category") || "camping"),
      duration: String(first(product.properties, "duration") || ""),
      pets_allowed: String(first(product.properties, "petsAllowed") || "") === "true",
      swimming_pool: String(first(product.properties, "swimmingPool") || "") === "true",
      stars: String(first(product.properties, "stars") || ""),
      rating: Number(first(product.properties, "rating")) || null,
      price: Number.isFinite(price) && price > 0 ? price : null,
      image: String(product.images?.[0] || ""),
      description: String(product.description || "").replace(/\s+/g, " ").trim(),
      link,
    };
  }).filter(item => item.id && item.title && item.link);
}

async function load(provider, config) {
  const cached = cache.get(provider);
  if (cached?.expires > Date.now()) return cached;
  const feedUrl = new URL("https://pf.tradetracker.net/");
  feedUrl.search = new URLSearchParams({
    aid: AID,
    encoding: "utf-8",
    type: config.format,
    fid: config.feedID,
    categoryType: "2",
    additionalType: "2",
  });
  const response = await fetch(feedUrl, {
    headers: {accept: config.format === "json" ? "application/json" : "application/xml", "user-agent": "CampingKiezerProviderFeed/106"},
  });
  if (!response.ok) throw new Error(`${config.provider} feed HTTP ${response.status}`);
  const body = await response.text();
  const products = config.format === "json" ? parseJson(body, config) : parseXml(body, config);
  if (!products.length) throw new Error(`${config.provider} feed bevat geen bruikbaar aanbod`);
  const result = {expires: Date.now() + 30 * 60 * 1000, products};
  cache.set(provider, result);
  return result;
}

export default async request => {
  const url = new URL(request.url);
  const provider = String(url.searchParams.get("provider") || "").trim().toLowerCase();
  const config = FEEDS[provider];
  if (!config) return new Response(JSON.stringify({ok: false, offers: [], error: "Onbekende aanbieder"}), {status: 400, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}});
  const q = norm(url.searchParams.get("q"));
  const country = norm(url.searchParams.get("country"));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 24)));
  try {
    const feed = await load(provider, config);
    const countries = [...new Set(feed.products.map(item => item.country).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl"));
    const filtered = feed.products.filter(item => {
      const haystack = norm(`${item.title} ${item.city} ${item.country} ${item.category}`);
      return (!q || haystack.includes(q)) && (!country || norm(item.country) === country);
    });
    return new Response(JSON.stringify({
      ok: true,
      provider: config.provider,
      feed_total: feed.products.length,
      filtered_total: filtered.length,
      countries,
      offset,
      limit,
      offers: filtered.slice(offset, offset + limit),
    }), {headers: {"content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300, stale-while-revalidate=1800", "x-robots-tag": "noindex"}});
  } catch (error) {
    return new Response(JSON.stringify({ok: false, provider: config.provider, offers: [], error: String(error?.message || error)}), {status: 200, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}});
  }
};
