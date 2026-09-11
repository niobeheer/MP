import fs from "node:fs";
import path from "node:path";
import tradeTrackerFeed from "../netlify/functions/tradetracker-feed.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const approvals = JSON.parse(read("TRADETRACKER-GOEDKEURINGEN-v129.json"));
const providerMap = JSON.parse(read("commercial/approved-campaigns-v129.json")).providers.filter(item => item.network === "TradeTracker");
const europe = JSON.parse(read("commercial/europe-campings-v134.json"));
const choices = read("onze-keuzes/index.html");
const sitemap = read("sitemap-core.xml");
const failures = [];
const mapped = new Map(providerMap.map(item => [String(item.campaign_id), item]));

function checkCanonicalLink(value, campaign, where) {
  let url;
  try { url = new URL(String(value).replaceAll("&amp;", "&")); }
  catch { failures.push(`${campaign.name}: ongeldige link in ${where}`); return; }
  if (url.protocol !== "https:" || url.hostname !== "tc.tradetracker.net") failures.push(`${campaign.name}: verkeerde trackinghost in ${where}`);
  if (url.searchParams.get("c") !== campaign.campaign_id) failures.push(`${campaign.name}: campagne-ID fout in ${where}`);
  if (url.searchParams.get("a") !== "514819") failures.push(`${campaign.name}: site-ID fout in ${where}`);
  if (!url.searchParams.get("u")) failures.push(`${campaign.name}: deeplinkbestemming ontbreekt in ${where}`);
}

if (approvals.real_partner_campaigns !== 42 || approvals.campaigns.length !== 42) failures.push("Niet exact 42 echte TradeTracker-campagnes vastgelegd");
if (new Set(approvals.campaigns.map(item => item.campaign_id)).size !== 42) failures.push("TradeTracker-campagne-ID's zijn niet uniek");

for (const campaign of approvals.campaigns) {
  const provider = mapped.get(campaign.campaign_id);
  if (!provider) { failures.push(`${campaign.name}: geen openbare aanbiedersroute`); continue; }
  const file = path.join(root, provider.route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) failures.push(`${campaign.name}: aanbiederspagina ontbreekt`);
  if (!choices.includes(`data-campaign-id="${campaign.campaign_id}"`)) failures.push(`${campaign.name}: ontbreekt in goedgekeurde partnerlijst bij Onze keuzes`);
  checkCanonicalLink(campaign.published_url, campaign, "goedkeuringsregister");
}

const feedProviders = ["ackersate","acsi-eurocampings","acsi-reizen","allcamps","ardoer","de-boshoek","de-vossenburcht","easyatent","europarcs","farmcamps","gusto-camp","kampeerwereld","leistert","lux-camp","norgerberg","ommerland","rcn","suncamp","topparken","zandstuve"];
let liveOffers = 0;
for (const key of feedProviders) {
  const response = await tradeTrackerFeed(new Request(`https://camping-kiezer.nl/.netlify/functions/tradetracker-feed?provider=${key}&limit=12`));
  const payload = await response.json();
  if (!response.ok || !payload.ok || !payload.offers?.length) { failures.push(`${key}: live feed niet bruikbaar (${payload.error || response.status})`); continue; }
  liveOffers += payload.offers.length;
  for (const offer of payload.offers) {
    try {
      const decoded = decodeURIComponent(offer.link);
      if (!decoded.includes("514819")) failures.push(`${key}: site-ID ontbreekt in feedlink`);
      if (!/^https:\/\//.test(offer.link)) failures.push(`${key}: feedlink niet HTTPS`);
    } catch { failures.push(`${key}: ongeldige feedlink`); }
  }
}

if (europe.countries !== 20) failures.push("Europa-uitbreiding bevat niet 20 landen");
if (europe.displayed_unique_campings < 300) failures.push("Europa-uitbreiding bevat minder dan 300 actuele campings");
let europeLinks = 0;
for (const country of europe.data) {
  const route = `/europa/${country.slug}/`;
  const file = path.join(root, route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) { failures.push(`${country.country}: landenpagina ontbreekt`); continue; }
  if (!sitemap.includes(`https://camping-kiezer.nl${route}`)) failures.push(`${country.country}: ontbreekt in sitemap`);
  const html = fs.readFileSync(file, "utf8");
  const links = [...html.matchAll(/<a\b[^>]*href="(https:\/\/[^"#]+)"[^>]*data-v134-europe=/g)].map(match => match[1]);
  if (links.length !== country.offers) failures.push(`${country.country}: ${links.length}/${country.offers} campinglinks gevonden`);
  for (const link of links) {
    const decoded = decodeURIComponent(link.replaceAll("&amp;", "&"));
    const canonical = new URL(link.replaceAll("&amp;", "&"));
    const queryStyle = canonical.searchParams.get("a") === "514819" && Boolean(canonical.searchParams.get("u"));
    const signatureStyle = decoded.includes("_514819_") && decoded.includes("https");
    if (!queryStyle && !signatureStyle) failures.push(`${country.country}: onvolledige deeplink`);
  }
  europeLinks += links.length;
}
if (!fs.existsSync(path.join(root, "europa/index.html")) || !sitemap.includes("https://camping-kiezer.nl/europa/")) failures.push("Europa-hub ontbreekt of staat niet in sitemap");

const report = {version:"V134",checked_at:new Date().toISOString(),tradetracker_campaigns:approvals.campaigns.length,provider_routes:mapped.size,our_choices_approved_entries:approvals.campaigns.filter(item=>choices.includes(`data-campaign-id="${item.campaign_id}"`)).length,live_feed_providers:feedProviders.length,live_feed_offers_checked:liveOffers,europe_countries:europe.countries,europe_campings:europe.displayed_unique_campings,europe_deeplinks_checked:europeLinks,failures:failures.length,details:failures};
fs.writeFileSync(path.join(root, "CampingKiezer-V134-TRADETRACKER-EUROPA-QA-2026-09-04.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
