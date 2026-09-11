import fs from "node:fs";
import path from "node:path";
import daisyconFeed from "../netlify/functions/daisycon-provider-feed.mjs";
import bungalowFeed from "../netlify/functions/bungalow-feed.mjs";

const root = path.resolve(import.meta.dirname, "..");
const MEDIA_ID = "424678";
const approvals = JSON.parse(fs.readFileSync(path.join(root, "DAISYCON-GOEDKEURINGEN-v133.json"), "utf8"));
const choices = fs.readFileSync(path.join(root, "onze-keuzes/index.html"), "utf8");
const providersIndex = fs.readFileSync(path.join(root, "aanbieders/index.html"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap-core.xml"), "utf8");
const failures = [];

const dynamicDaisy = new Set(["15690", "15569", "15258", "16264", "15967", "21545"]);
const staticDaisy = new Set(["6815", "6813", "8921", "8995"]);

function checkTrackingLink(value, item) {
  let url;
  try { url = new URL(String(value).replaceAll("&amp;", "&")); }
  catch { failures.push(`${item.name}: ongeldige trackinglink`); return; }
  if (url.protocol !== "https:") failures.push(`${item.name}: trackinglink is niet HTTPS`);
  if (url.searchParams.get("si") !== item.program_id) failures.push(`${item.name}: si is niet ${item.program_id}`);
  if (url.searchParams.get("wi") !== MEDIA_ID) failures.push(`${item.name}: wi is niet ${MEDIA_ID}`);
  if (!url.searchParams.get("dl")) failures.push(`${item.name}: deeplinkbestemming ontbreekt`);
}

async function callFeed(handler, key) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await handler(new Request(`https://camping-kiezer.nl/.netlify/functions/feed?provider=${key}&limit=12`));
    const payload = await response.json();
    if (response.ok && payload.ok && payload.offers?.length) return payload;
    if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 750));
    if (attempt === 3) throw new Error(payload.error || "geen bruikbaar aanbod");
  }
}

const results = [];
if (approvals.approved_count !== 11 || approvals.approvals.length !== 11) failures.push("goedkeuringsbestand bevat niet exact 11 programma's");
if (new Set(approvals.approvals.map(item => item.program_id)).size !== 11) failures.push("programma-ID's zijn niet uniek");
if (new Set(approvals.approvals.map(item => item.route)).size !== 11) failures.push("aanbiedersroutes zijn niet uniek");

for (const item of approvals.approvals) {
  const relative = item.route.replace(/^\//, "") + "index.html";
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) { failures.push(`${item.name}: aanbiederspagina ontbreekt`); continue; }
  if (!choices.includes(`href="${item.route}"`)) failures.push(`${item.name}: ontbreekt bij Onze keuzes`);
  if (!providersIndex.includes(`href="${item.route}"`)) failures.push(`${item.name}: ontbreekt in aanbiedersoverzicht`);
  if (!sitemap.includes(`https://camping-kiezer.nl${item.route}`)) failures.push(`${item.name}: ontbreekt in sitemap-core`);

  if (dynamicDaisy.has(item.program_id)) {
    try {
      const payload = await callFeed(daisyconFeed, item.provider_key);
      payload.offers.forEach(offer => checkTrackingLink(offer.link, item));
      results.push({program_id: item.program_id, name: item.name, mode: "live Daisycon-feed", offers_checked: payload.offers.length, feed_total: payload.feed_total, deeplinks_checked: payload.offers.length});
    } catch (error) { failures.push(`${item.name}: ${error.message}`); }
  } else if (item.program_id === "11126") {
    try {
      const payload = await callFeed(bungalowFeed, item.provider_key);
      payload.offers.forEach(offer => checkTrackingLink(offer.link, item));
      results.push({program_id: item.program_id, name: item.name, mode: "live Daisycon-feed", offers_checked: payload.offers.length, feed_total: payload.feed_total, deeplinks_checked: payload.offers.length});
    } catch (error) { failures.push(`${item.name}: ${error.message}`); }
  } else if (staticDaisy.has(item.program_id)) {
    const html = fs.readFileSync(file, "utf8");
    const links = [...html.matchAll(/href=["'](https:[^"']+)["']/gi)]
      .map(match => match[1])
      .filter(link => link.replaceAll("&amp;", "&").includes(`si=${item.program_id}`));
    if (!links.length) failures.push(`${item.name}: geen statische Daisycon-link gevonden`);
    links.forEach(link => checkTrackingLink(link, item));
    results.push({program_id: item.program_id, name: item.name, mode: "statische Daisycon-deeplinks", deeplinks_checked: links.length});
  } else failures.push(`${item.name}: geen controlemethode geconfigureerd`);
}

const report = {
  version: "V133",
  checked_at: new Date().toISOString(),
  media_id: MEDIA_ID,
  approved_programs: approvals.approvals.length,
  unique_provider_routes: new Set(approvals.approvals.map(item => item.route)).size,
  choices_expected: 52,
  live_or_static_programs_checked: results.length,
  deeplinks_checked: results.reduce((sum, item) => sum + item.deeplinks_checked, 0),
  failures: failures.length,
  details: failures,
  results,
};
fs.writeFileSync(path.join(root, "CampingKiezer-V133-DAISY-DEEPLINK-QA-2026-09-04.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
