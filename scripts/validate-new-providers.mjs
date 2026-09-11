import fs from "node:fs";

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("commercial/tradetracker-feeds-v104.json"));
const functionCode = read("netlify/functions/tradetracker-feed.mjs");
const clientCode = read("assets/tradetracker-directory.js");
const hub = read("aanbieders/index.html");
const sitemap = read("sitemap-core.xml");
const redirects = read("_redirects");
const failures = [];

const integrated = manifest.feeds.filter(feed => feed.status === "integrated");
const duplicate = manifest.feeds.find(feed => feed.feed_id === "250953");
if (integrated.length !== 2) failures.push("Er moeten precies twee unieke aanbieders geïntegreerd zijn");
if (duplicate?.duplicate_of !== "1163607" || duplicate?.overlapping_product_ids !== 346) failures.push("De dubbele Suncamp XML-feed is niet correct vastgelegd");

for (const feed of integrated) {
  const pagePath = `${feed.route.replace(/^\//, "")}index.html`;
  if (!fs.existsSync(new URL(`../${pagePath}`, import.meta.url))) failures.push(`Ontbrekende aanbiederspagina: ${feed.route}`);
  const page = read(pagePath);
  const providerKey = feed.provider === "Suncamp" ? "suncamp" : "acsi-reizen";
  for (const [label, haystack, needle] of [
    ["feed-ID in functie", functionCode, feed.feed_id],
    ["campagne-ID in functie", functionCode, feed.campaign_id],
    ["aanbiederslink in hub", hub, feed.route],
    ["aanbiederslink in sitemap", sitemap, `https://camping-kiezer.nl${feed.route}`],
    ["redirect", redirects, feed.route.replace(/\/$/, "")],
    ["directory-script op pagina", page, "/assets/tradetracker-directory.js"],
    ["providercode op pagina", page, `data-provider=\"${providerKey}\"`],
    ["gesponsorde linkattributen", clientCode, "sponsored nofollow noopener"],
  ]) if (!haystack.includes(needle)) failures.push(`${feed.provider}: ${label} ontbreekt`);
}

if (!functionCode.includes('const AID = "514819"')) failures.push("TradeTracker affiliate-site-ID ontbreekt");
if (!functionCode.includes("safeTrackedLink")) failures.push("Tracking-allowlist ontbreekt");

console.log(JSON.stringify({
  version: manifest.version,
  unique_providers: integrated.map(feed => feed.provider),
  integrated_feeds: integrated.map(feed => feed.feed_id),
  duplicate_feed: duplicate?.feed_id,
  duplicate_product_ids: duplicate?.overlapping_product_ids,
  failures: failures.length,
  details: failures,
}, null, 2));

if (failures.length) process.exit(1);
