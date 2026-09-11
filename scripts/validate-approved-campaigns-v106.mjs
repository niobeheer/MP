import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = relative => fs.readFileSync(new URL(relative, root), "utf8");
const manifest = JSON.parse(read("commercial/approved-campaigns-v106.json"));
const hub = read("aanbieders/index.html");
const sitemap = read("sitemap-core.xml");
const redirects = read("_redirects");
const ttFunction = read("netlify/functions/tradetracker-feed.mjs");
const daisyFunction = read("netlify/functions/daisycon-provider-feed.mjs");
const bungalowFunction = read("netlify/functions/bungalow-feed.mjs");
const failures = [];

if (manifest.daisycon.length !== 10) failures.push("Daisycon moet tien goedgekeurde campagnes bevatten");
if (manifest.tradetracker.length !== 12) failures.push("TradeTracker moet twaalf relevante goedgekeurde campagnes bevatten");
const hubProviderCount = (hub.match(/<article class="provider-summary">/g) || []).length;
if (hubProviderCount < 32) failures.push(`Aanbiedersoverzicht moet minimaal 32 unieke aanbieders tonen, gevonden ${hubProviderCount}`);

const routes = [...new Set([...manifest.daisycon, ...manifest.tradetracker].map(item => item.route))];
for (const route of routes) {
  const relative = `${route.replace(/^\//, "")}index.html`;
  if (!fs.existsSync(new URL(relative, root))) failures.push(`${route}: pagina ontbreekt`);
  if (!sitemap.includes(`https://camping-kiezer.nl${route}`)) failures.push(`${route}: ontbreekt in sitemap`);
  if (!redirects.includes(`${route.replace(/\/$/, "")} ${route} 301`)) failures.push(`${route}: slashredirect ontbreekt`);
}

for (const campaign of manifest.tradetracker) {
  if (!ttFunction.includes(`campaignID: "${campaign.campaign_id}"`) || !ttFunction.includes(`feedID: "${campaign.feed_id}"`)) failures.push(`${campaign.name}: functieconfiguratie ontbreekt`);
}
for (const campaign of manifest.daisycon.filter(item => ["15569", "16264", "15258", "21545"].includes(item.program_id))) {
  if (!daisyFunction.includes(`programID: "${campaign.program_id}"`)) failures.push(`${campaign.name}: Daisycon-feedconfiguratie ontbreekt`);
}
if (!bungalowFunction.includes("program_id=11126")) failures.push("Bungalow.Net: Daisycon-feedconfiguratie ontbreekt");

for (const programID of manifest.daisycon_without_feed) {
  const campaign = manifest.daisycon.find(item => item.program_id === programID);
  const html = read(`${campaign.route.replace(/^\//, "")}index.html`);
  if (!html.includes(`si=${programID}&amp;`) || !html.includes("wi=424678")) failures.push(`${campaign.name}: deeplinktracking ontbreekt`);
  for (const match of html.matchAll(/<a[^>]+href="https:[^"]+"[^>]*>/g)) {
    if (!match[0].includes('rel="sponsored nofollow noopener"')) failures.push(`${campaign.name}: externe partnerlink mist rel-attributen`);
  }
}

const dierenbos = read("aanbieders/dierenbos/index.html");
for (const label of ["Vakantiehuisjes", "Glamping", "Camping", "Aanbiedingen", "kinderstoel", "bolderkar"]) if (!dierenbos.includes(label)) failures.push(`Dierenbos: ${label} ontbreekt`);
const beekse = read("aanbieders/beekse-bergen/index.html");
for (const label of ["Vakantiehuisjes", "Glamping", "Camping", "Lake Resort"]) if (!beekse.includes(label)) failures.push(`Beekse Bergen: ${label} ontbreekt`);
const allcamps = read("aanbieders/allcamps/index.html");
for (const label of ["data-tradetracker-search", 'data-provider="allcamps"', "/assets/tradetracker-directory.js"]) if (!allcamps.includes(label)) failures.push(`Allcamps: ${label} ontbreekt`);
const featuredImageCount = manifest.daisycon_without_feed.reduce((count, programID) => {
  const campaign = manifest.daisycon.find(item => item.program_id === programID);
  return count + (read(`${campaign.route.replace(/^\//, "")}index.html`).match(/<img /g) || []).length;
}, 0);
if (featuredImageCount !== 13) failures.push(`Uitgelichte aanbieders: verwacht 13 beelden, gevonden ${featuredImageCount}`);

console.log(JSON.stringify({version:"V106", daisycon_campaigns:manifest.daisycon.length, tradetracker_campaigns:manifest.tradetracker.length, unique_provider_routes:routes.length, hub_providers:hubProviderCount, failures:failures.length, details:failures}, null, 2));
if (failures.length) process.exit(1);
