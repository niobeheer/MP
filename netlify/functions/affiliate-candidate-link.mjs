const CANDIDATES = {
  duinrell: {network: "awin", hosts: ["duinrell.nl", "www.duinrell.nl"]},
  "camping-and-co": {network: "awin", hosts: ["nl.camping-and-co.com"]},
  "maasresidence-thorn": {network: "awin", hosts: ["parcmaasresidencethorn.nl", "www.parcmaasresidencethorn.nl"]},
  hardloop: {network: "awin", hosts: ["nl.hardloop.com"]},
  "landal-de": {network: "awin", hosts: ["landal.com", "www.landal.com"]},
  "eurocamp-de": {network: "awin", hosts: ["eurocamp.de", "www.eurocamp.de"]},
  roompot: {network: "tradedoubler", hosts: ["roompot.nl", "www.roompot.nl"]},
  goboony: {network: "tradedoubler", hosts: ["goboony.nl", "www.goboony.nl"]},
};

const TRACKING_HOSTS = {
  awin: ["awin1.com", "www.awin1.com"],
  tradedoubler: ["clk.tradedoubler.com"],
};

function approvedProviders() {
  return new Set(String(process.env.AFFILIATE_APPROVED_PROVIDERS || "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean));
}

function destinationFor(provider, raw) {
  try {
    const url = new URL(raw);
    const config = CANDIDATES[provider];
    return url.protocol === "https:" && config?.hosts.includes(url.hostname) ? url : null;
  } catch (_error) {
    return null;
  }
}

function trackingTarget(provider, destination) {
  const config = CANDIDATES[provider];
  const envKey = `AFFILIATE_TEMPLATE_${provider.replaceAll("-", "_").toUpperCase()}`;
  const template = String(process.env[envKey] || "").trim();
  if (!template.includes("{url}")) return null;
  try {
    const target = new URL(template.replaceAll("{url}", encodeURIComponent(destination.href)));
    return target.protocol === "https:" && TRACKING_HOSTS[config.network].includes(target.hostname) ? target : null;
  } catch (_error) {
    return null;
  }
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export default async request => {
  const incoming = new URL(request.url);
  const provider = String(incoming.searchParams.get("provider") || "").trim().toLowerCase();
  const config = CANDIDATES[provider];
  if (!config) return new Response("Onbekende aanbieder", {status: 404});
  if (!approvedProviders().has(provider)) return new Response("Partnerkoppeling nog niet actief", {status: 409, headers: {"cache-control": "no-store"}});

  const destination = destinationFor(provider, incoming.searchParams.get("url") || "");
  if (!destination) return new Response("Ongeldige partnerbestemming", {status: 400});
  const target = trackingTarget(provider, destination);
  if (!target) return new Response("Trackingconfiguratie ontbreekt of is ongeldig", {status: 503, headers: {"cache-control": "no-store"}});

  const exactTarget = target.href;
  const scriptTarget = JSON.stringify(exactTarget).replaceAll("<", "\\u003c");
  const htmlTarget = escapeHtml(exactTarget);
  const body = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${htmlTarget}"><title>Doorsturen naar partner</title></head><body><p>Je wordt doorgestuurd naar ${escapeHtml(provider)}.</p><p><a href="${htmlTarget}" rel="sponsored nofollow">Ga verder</a></p><script>location.replace(${scriptTarget});</script></body></html>`;
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-partner-provider": provider,
      "x-partner-network": config.network,
      "x-partner-tracking": "active",
      "x-robots-tag": "noindex, nofollow",
      "referrer-policy": "no-referrer",
    },
  });
};
