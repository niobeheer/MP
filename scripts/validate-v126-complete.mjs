import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const manifest = JSON.parse(read("commercial/approved-campaigns-v126.json"));
const home = read("index.html");
const choices = read("onze-keuzes/index.html");
const privatePage = read("seizoensplaats-verhuren/index.html");
const failures = [];
const expectedNav = ["Home", "Bungalowparken", "Camperplaatsen", "Campings", "Chalet verhuren", "Ketens", "Onze keuzes", "Tips"];
const expectedFooterGroups = {
  Aanbod: ["Bungalowparken", "Camperplaatsen", "Campings", "Chalet of caravan verhuren", "Glamping", "Vakantieparken"],
  CampingKiezer: ["Bedrijfsinformatie", "Bronnenbeleid", "Contact", "Cookies", "Methodologie", "Over ons", "Privacy", "Redactiebeleid", "Voorwaarden"],
  Ontdekken: ["Campings vergelijken", "Kennisbank &amp; tips", "Ketens en parken", "Online beschikbaarheid", "Onze keuzes"],
  Zakelijk: ["Adverteren", "Claim uw camping", "Tarieven", "Voor campings", "Voor ketens"],
};

if (manifest.tradetracker_external_approved !== 29) failures.push("TradeTracker-totaal is niet 29");
if (manifest.daisycon_approved_campaigns !== 10) failures.push("Daisycon-totaal is niet 10");
if (manifest.unique_public_providers !== 37) failures.push("Unieke aanbieders zijn niet 37");
for (const [name, html] of [["home", home], ["onze-keuzes", choices]]) {
  const cards = [...html.matchAll(/<article class="affiliate-feature-card"[\s\S]*?<\/article>/g)].map(match => match[0]);
  const keys = cards.map(card => card.match(/data-provider="([^"]+)"/)?.[1]).filter(Boolean);
  if (cards.length !== 37) failures.push(`${name}: ${cards.length} kaarten in plaats van 37`);
  if (new Set(keys).size !== 37) failures.push(`${name}: ${new Set(keys).size} unieke providercodes in plaats van 37`);
  const labels = cards.map(card => (card.match(/<small>([\s\S]*?)<\/small>/)?.[1] || "").replace(/<[^>]+>/g, ""));
  const sorted = [...labels].sort((a, b) => a.localeCompare(b, "nl", { sensitivity: "base" }));
  if (JSON.stringify(labels) !== JSON.stringify(sorted)) failures.push(`${name}: aanbieders staan niet alfabetisch`);
  for (const card of cards) if (!/<img [^>]*src="[^"]+"/.test(card)) failures.push(`${name}: kaart zonder afbeelding`);
}

for (const item of manifest.providers) {
  const key = item.route.split("/").filter(Boolean).at(-1);
  for (const [name, html] of [["home", home], ["onze-keuzes", choices]]) {
    if (!html.includes(`data-provider="${key}"`)) failures.push(`${name}: ${item.name} ontbreekt`);
    if (!html.includes(`href="${item.route}"`)) failures.push(`${name}: route ${item.route} ontbreekt`);
  }
  if (!fs.existsSync(path.join(root, item.route.replace(/^\//, ""), "index.html"))) failures.push(`${item.name}: aanbiederspagina ontbreekt`);
}

for (const key of ["easyatent", "leistert", "lux-camp", "norgerberg", "rcn"]) {
  if (!home.includes(`data-feed-image-provider="${key}"`) || !choices.includes(`data-feed-image-provider="${key}"`)) failures.push(`${key}: feedbeeldkoppeling ontbreekt`);
}
for (const key of ["arden-parks-comblain", "arden-parks-durbuy", "de-twee-bruggen", "eperwoud", "molecaten", "topparken"]) {
  if (!home.includes(`/assets/choice-${key}-v126.webp`) || !fs.existsSync(path.join(root, `assets/choice-${key}-v126.webp`))) failures.push(`${key}: passend lokaal beeld ontbreekt`);
}

if (!home.includes('<section class="section v122-private-offer"')) failures.push("Homepage: particulier verhuurblok ontbreekt");
if (!home.includes('href="/seizoensplaats-verhuren/"')) failures.push("Homepage: verhuurlink ontbreekt");
for (const token of ['name="particuliere-seizoensplaats"', 'data-netlify="true"', 'action="/seizoensplaats-aangemeld/"']) if (!privatePage.includes(token)) failures.push(`Verhuurformulier: ${token} ontbreekt`);

const htmlFiles = [];
const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
};
walk(root);
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (html.includes('<header class="site-header">')) {
    const nav = html.match(/<nav class="nav" aria-label="Hoofdnavigatie">([\s\S]*?)<\/nav>/)?.[1] || "";
    const labels = [...nav.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map(match => match[1]);
    if (JSON.stringify(labels) !== JSON.stringify(expectedNav)) failures.push(`${path.relative(root, file)}: afwijkende header`);
  }
  if (html.includes('<footer class="footer">')) {
    for (const [group, labels] of Object.entries(expectedFooterGroups)) {
      const section = html.match(new RegExp(`<h4>${group}<\\/h4>([\\s\\S]*?)(?=<\\/div>)`))?.[1] || "";
      const actual = [...section.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)].map(match => match[1]);
      if (JSON.stringify(actual) !== JSON.stringify(labels)) failures.push(`${path.relative(root, file)}: footer ${group} niet gelijk/alfabetisch`);
    }
  }
}

console.log(JSON.stringify({ version: "V126", html_files: htmlFiles.length, approved_providers: manifest.unique_public_providers, homepage_choices: 37, our_choices: 37, failures: failures.length, details: failures.slice(0, 100) }, null, 2));
if (failures.length) process.exit(1);
