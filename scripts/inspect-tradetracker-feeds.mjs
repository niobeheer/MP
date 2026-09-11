const feeds = [
  {
    id: "1634850",
    format: "xml-v2",
    url: "https://pf.tradetracker.net/?aid=514819&encoding=utf-8&type=xml-v2&fid=1634850&categoryType=2&additionalType=2",
  },
  {
    id: "250953",
    format: "xml-v2",
    url: "https://pf.tradetracker.net/?aid=514819&encoding=utf-8&type=xml-v2&fid=250953&categoryType=2&additionalType=2",
  },
  {
    id: "1163607",
    format: "json",
    url: "https://pf.tradetracker.net/?aid=514819&encoding=utf-8&type=json&fid=1163607&categoryType=2&additionalType=2",
  },
];

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

function parseXml(body) {
  return [...body.matchAll(/<product\s+ID=["']([^"']+)["'][^>]*>([\s\S]*?)<\/product>/gi)].map(match => {
    const block = match[2];
    return {
      id: match[1],
      campaignID: xmlText(block, "campaignID"),
      name: xmlText(block, "name"),
      url: xmlText(block, "URL"),
      category: xmlProperty(block, "category"),
      country: xmlProperty(block, "country") || xmlProperty(block, "country2"),
      city: xmlProperty(block, "city"),
    };
  });
}

function parseJson(body) {
  const parsed = JSON.parse(body);
  return (parsed.products || []).map(product => ({
    id: String(product.ID || ""),
    campaignID: String(product.campaignID || ""),
    name: String(product.name || ""),
    url: String(product.URL || ""),
    category: String(product.properties?.category?.[0] || ""),
    country: String(product.properties?.country?.[0] || ""),
    city: String(product.properties?.city?.[0] || ""),
  }));
}

const results = [];
for (const feed of feeds) {
  const response = await fetch(feed.url, {
    headers: {accept: feed.format === "json" ? "application/json" : "application/xml", "user-agent": "CampingKiezerFeedInspector/103"},
  });
  if (!response.ok) throw new Error(`Feed ${feed.id}: HTTP ${response.status}`);
  const body = await response.text();
  const products = feed.format === "json" ? parseJson(body) : parseXml(body);
  results.push({
    ...feed,
    bytes: Buffer.byteLength(body),
    products,
    summary: {
      products: products.length,
      campaigns: [...new Set(products.map(item => item.campaignID).filter(Boolean))],
      domains: [...new Set(products.map(item => {
        try { return new URL(item.url).hostname; } catch { return ""; }
      }).filter(Boolean))],
      categories: [...new Set(products.map(item => item.category).filter(Boolean))].sort(),
      countries: [...new Set(products.map(item => item.country).filter(Boolean))].sort(),
      sample: products.slice(0, 3),
    },
  });
}

const overlap = [];
for (let i = 0; i < results.length; i += 1) {
  for (let j = i + 1; j < results.length; j += 1) {
    const left = new Set(results[i].products.map(item => item.id));
    const shared = results[j].products.filter(item => left.has(item.id));
    overlap.push({left: results[i].id, right: results[j].id, shared_ids: shared.length, sample: shared.slice(0, 5).map(item => ({id: item.id, name: item.name}))});
  }
}

console.log(JSON.stringify({
  generated_at: new Date().toISOString(),
  feeds: results.map(({products, ...result}) => result),
  overlap,
}, null, 2));
