import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const manifest = JSON.parse(read("commercial/approved-campaigns-v107.json"));
const health = JSON.parse(read("health.json"));
const page = read("onze-keuzes/index.html");
const failures = [];

const feedProviders = [
  ...manifest.tradetracker.map(item => ({
    key: item.route.split("/").filter(Boolean).at(-1),
    route: item.route,
    name: item.name,
  })),
  ...manifest.daisycon
    .filter(item => item.integration === "product-feed")
    .map(item => ({
      key: item.route.split("/").filter(Boolean).at(-1),
      route: item.route,
      name: item.name,
    })),
];
const uniqueProviders = [...new Map(feedProviders.map(item => [item.route, item])).values()];
const withoutFeed = manifest.daisycon.filter(item => item.feed_count === 0);
const cards = [...page.matchAll(/<article class="affiliate-feature-card"[^>]*data-v107-feed-choice="([^"]+)"[\s\S]*?<\/article>/g)];

if (manifest.version !== "V107") failures.push(`Manifestversie is ${manifest.version}`);
if (manifest.our_choices?.feed_provider_count !== 17) failures.push("Manifest verwacht niet exact 17 feedaanbieders");
if (health.version < 107) failures.push(`health.json versie is ${health.version}`);
if (!["v107-all-feed-providers-in-onze-keuzes", "v108-sunny-homepage-all-feed-providers", "v112-youtube-kindercampings-landing-page", "v114-affiliate-expansion-ready", "v116-tradetracker-complete", "v118-theme-facility-filters", "v119-commercial-seasonal-advertising", "v120-unified-photographic-design", "v121-unified-design-comparison-complete", "v126-complete-approved-providers-rental-alphabetical-navigation"].includes(health.release)) failures.push("Onjuiste releasecode voor de V107-keuzepagina");
if (health.our_choices_feed_providers !== 17) failures.push("health.json meldt niet 17 keuzes");
if (uniqueProviders.length !== 17) failures.push(`Manifest bevat ${uniqueProviders.length} unieke feedaanbieders in plaats van 17`);
if (cards.length !== 17) failures.push(`Onze keuzes bevat ${cards.length} feedkaarten in plaats van 17`);
if (!page.includes("Zesentwintig keuzes om nu te bekijken") && !page.includes("37 keuzes om nu te bekijken")) failures.push("Kop voor 26 of 37 keuzes ontbreekt");
if (!page.includes("https://camping-kiezer.nl/onze-keuzes/")) failures.push("Canonical met correcte domeinnaam ontbreekt");

for (const provider of uniqueProviders) {
  const marker = `data-v107-feed-choice="${provider.key}"`;
  const markerCount = page.split(marker).length - 1;
  if (markerCount !== 1) failures.push(`${provider.name}: ${markerCount} kaarten gevonden`);
  if (!page.includes(`href="${provider.route}"`)) failures.push(`${provider.name}: interne aanbiederslink ontbreekt`);
  if (!page.includes(`data-provider="${provider.key}"`)) failures.push(`${provider.name}: providercode ontbreekt`);
  const providerPage = path.join(root, provider.route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(providerPage)) failures.push(`${provider.name}: aanbiederspagina ontbreekt`);
}

for (const provider of withoutFeed) {
  const key = provider.route.split("/").filter(Boolean).at(-1);
  if (page.includes(`data-v107-feed-choice="${key}"`)) failures.push(`${provider.name}: staat als feedkeuze terwijl geen feed beschikbaar is`);
}

for (const card of cards) {
  const html = card[0];
  const key = card[1];
  if (!/<img src="(?:https:\/\/|\/assets\/)/.test(html)) failures.push(`${key}: geen geldige externe of lokale afbeelding`);
  if (!/href="\/aanbieders\//.test(html)) failures.push(`${key}: kaart linkt niet intern naar aanbiederspagina`);
  if (/rel="sponsored/.test(html)) failures.push(`${key}: interne kaart is onterecht als externe partnerlink gemarkeerd`);
}

if (failures.length) {
  console.error(JSON.stringify({version: "V107", failures: failures.length, details: failures}, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  version: "V107",
  feed_providers_in_our_choices: uniqueProviders.length,
  cards: cards.length,
  excluded_without_feed: withoutFeed.map(item => item.name),
  failures: 0,
}, null, 2));
