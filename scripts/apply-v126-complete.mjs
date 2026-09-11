import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, value) => fs.writeFileSync(path.join(root, relative), value);
const esc = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const brand = '<a class="brand" href="/"><span class="brand-mark"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 18h18L12 4 3 18Z"></path><path d="M12 4v15"></path></svg></span>CampingKiezer</a>';
const topbar = '<div class="topbar"><span>Vind, vergelijk en boek jouw volgende plek in Nederland</span><a href="/seizoensplaats-verhuren/">Zelf een chalet of caravan verhuren →</a></div>';
const header = `<header class="site-header"><div class="container header-inner">${brand}<nav class="nav" aria-label="Hoofdnavigatie"><a href="/">Home</a><a href="/bungalowparken/">Bungalowparken</a><a href="/camperplaatsen/">Camperplaatsen</a><a href="/campings/">Campings</a><a href="/seizoensplaats-verhuren/">Chalet verhuren</a><a href="/ketens/">Ketens</a><a href="/onze-keuzes/">Onze keuzes</a><a href="/kennisbank/">Tips</a></nav><a class="header-owner-link v78-global-claim" data-v110-global-claim href="/claim-uw-camping/" aria-label="Claim uw camping"><span>Claim uw camping</span></a><button aria-label="Menu" class="menu-btn" aria-expanded="false">☰</button></div></header>`;
const footer = `<footer class="footer"><div class="container"><div class="footer-grid v80-footer-grid"><div>${brand}<p>Vind en vergelijk campings, bungalowparken, camperplaatsen, glampings en vakantieparken in Nederland.</p></div><div><h4>Aanbod</h4><a href="/bungalowparken/">Bungalowparken</a><a href="/camperplaatsen/">Camperplaatsen</a><a href="/campings/">Campings</a><a href="/seizoensplaats-verhuren/">Chalet of caravan verhuren</a><a href="/glampings/">Glamping</a><a href="/vakantieparken/">Vakantieparken</a></div><div><h4>CampingKiezer</h4><a href="/bedrijfsinformatie/">Bedrijfsinformatie</a><a href="/bronnenbeleid/">Bronnenbeleid</a><a href="/contact">Contact</a><a href="/cookies">Cookies</a><a href="/methodologie/">Methodologie</a><a href="/over-ons">Over ons</a><a href="/privacy">Privacy</a><a href="/redactiebeleid/">Redactiebeleid</a><a href="/voorwaarden">Voorwaarden</a></div><div><h4>Ontdekken</h4><a href="/vergelijken/">Campings vergelijken</a><a href="/kennisbank/">Kennisbank &amp; tips</a><a href="/ketens/">Ketens en parken</a><a href="/boeken/">Online beschikbaarheid</a><a href="/onze-keuzes/">Onze keuzes</a></div><div><h4>Zakelijk</h4><a href="/adverteren/">Adverteren</a><a href="/claim-uw-camping/">Claim uw camping</a><a href="/tarieven/">Tarieven</a><a href="/voor-campings/">Voor campings</a><a href="/voor-ketens/">Voor ketens</a></div></div><div class="footer-bottom"><span>© 2026 CampingKiezer.nl</span></div></div></footer>`;

const additions = [
  { key: "arden-parks-comblain", provider: "Arden Parks Comblain", label: "Belgische Ardennen", title: "Kamperen in de vallei van Comblain", text: "Ruime plaatsen voor tent, caravan en camper en eenvoudige trekkershutten midden in de Ardennen.", image: "/assets/choice-arden-parks-comblain-v126.webp" },
  { key: "arden-parks-durbuy", provider: "Arden Parks Durbuy", label: "Durbuy", title: "Natuurcamping in de Belgische Ardennen", text: "Grote groene kampeerplaatsen en modern sanitair in de bosrijke omgeving van Durbuy.", image: "/assets/choice-arden-parks-durbuy-v126.webp" },
  { key: "de-twee-bruggen", provider: "De Twee Bruggen", label: "Achterhoek", title: "Vijfsterrencamping in Winterswijk", text: "Ruime kampeerplaatsen, lodgetenten en vakantiehuizen met binnenbad, buitenbad en natuurzwemvijver.", image: "/assets/choice-de-twee-bruggen-v126.webp" },
  { key: "easyatent", provider: "Easyatent", label: "Ingerichte tenten", title: "Comfortabel kamperen in een ingerichte tent", text: "Bekijk safaritenten en volledig ingerichte campingtenten op Europese vakantiebestemmingen.", image: "/assets/hero-glamping-v108.webp", feed: "easyatent" },
  { key: "eperwoud", provider: "Het Eperwoud", label: "Veluwe", title: "Safaritenten en kamperen in Epe", text: "Verblijf in een safaritent, chalet of op een groene kampeerplaats aan de rand van de Veluwse bossen.", image: "/assets/choice-eperwoud-v126.webp" },
  { key: "leistert", provider: "De Leistert", label: "Limburg", title: "Kamperen en verblijven bij De Leistert", text: "Bekijk kampeerplaatsen, bungalows en recreatievoorzieningen op dit vakantiepark in Limburg.", image: "/assets/need-pool.webp", feed: "leistert" },
  { key: "lux-camp", provider: "LuxCamp", label: "Luxe campingvakanties", title: "Stacaravans en glamping in Europa", text: "Zoek luxe stacaravans, glamping en campingvakanties op Europese topcampings.", image: "/assets/category-vakantieparken-v108.webp", feed: "lux-camp" },
  { key: "molecaten", provider: "Molecaten", label: "Zee, water en bos", title: "Campings en vakantieparken van Molecaten", text: "Kies uit kampeerplaatsen, chalets, vakantiehuizen en ingerichte tenten op natuurrijke locaties.", image: "/assets/choice-molecaten-v126.webp" },
  { key: "norgerberg", provider: "De Norgerberg", label: "Drenthe", title: "Kamperen en accommodaties in Norg", text: "Bekijk kampeermogelijkheden en comfortabele accommodaties in de Drentse natuur.", image: "/assets/need-naturecamp.webp", feed: "norgerberg" },
  { key: "rcn", provider: "RCN Vakantieparken", label: "Vakantieparken", title: "Campings en vakantieparken van RCN", text: "Zoek kampeerplaatsen, bungalows en andere accommodaties op RCN-parken in Nederland en Frankrijk.", image: "/assets/hero-lake-v108.webp", feed: "rcn" },
  { key: "topparken", provider: "TopParken", label: "Vakantiehuizen", title: "Vakantiehuizen op Nederlandse vakantieparken", text: "Bekijk moderne vakantiehuizen en parkvoorzieningen op verschillende locaties in Nederland.", image: "/assets/choice-topparken-v126.webp" },
];

const newCard = item => `<article class="affiliate-feature-card" data-v126-choice="${esc(item.key)}"><a class="affiliate-feature-image" href="/aanbieders/${esc(item.key)}/"><img src="${esc(item.image)}"${item.feed ? ` data-feed-image-provider="${esc(item.feed)}" data-feed-image-alt="Aanbod via ${esc(item.provider)}"` : ""} alt="${esc(item.title)} via ${esc(item.provider)}" loading="lazy" decoding="async"><span>${esc(item.label)}</span></a><div><small>${esc(item.provider)}</small><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><strong>Bekijk actuele prijzen en beschikbaarheid</strong><a class="btn btn-brand" href="/aanbieders/${esc(item.key)}/" data-provider="${esc(item.key)}" data-placement="onze-keuzes-v126">Bekijk actueel aanbod →</a></div></article>`;
const cardName = card => (card.match(/<small>([\s\S]*?)<\/small>/)?.[1] || "").replace(/<[^>]+>/g, "");
const cardKey = card => card.match(/data-provider="([^"]+)"/)?.[1] || card.match(/data-v\d+(?:-feed)?-choice="([^"]+)"/)?.[1] || card.match(/href="\/aanbieders\/([^/]+)\//)?.[1] || "";
const cardPattern = /<article class="affiliate-feature-card"[\s\S]*?<\/article>/g;

function updateChoices(relative) {
  let html = read(relative);
  const gridStart = html.indexOf('<div class="affiliate-feature-grid">');
  if (gridStart < 0) throw new Error(`${relative}: keuzesgrid ontbreekt`);
  const sectionEnd = html.indexOf("</section>", gridStart);
  if (sectionEnd < 0) throw new Error(`${relative}: einde keuzesectie ontbreekt`);
  const region = html.slice(gridStart, sectionEnd);
  const cards = [...region.matchAll(cardPattern)].map(match => {
    let card = match[0];
    const key = cardKey(card);
    if (key && !card.includes('data-provider="')) {
      card = card.replace(/<a class="btn btn-brand" href="([^"]+)">/, `<a class="btn btn-brand" href="$1" data-provider="${esc(key)}" data-placement="onze-keuzes-v126">`);
    }
    return card;
  });
  const byKey = new Map(cards.map(card => [cardKey(card), card]));
  for (const item of additions) byKey.set(item.key, newCard(item));
  const sorted = [...byKey.values()].sort((a, b) => cardName(a).localeCompare(cardName(b), "nl", { sensitivity: "base" }));
  if (sorted.length !== 37) throw new Error(`${relative}: verwacht 37 unieke keuzes, gevonden ${sorted.length}`);
  const lastCardEnd = region.lastIndexOf("</article>") + "</article>".length;
  const gridEnd = region.indexOf("</div>", lastCardEnd);
  if (gridEnd < 0) throw new Error(`${relative}: einde keuzesgrid ontbreekt`);
  html = html.slice(0, gridStart) + `<div class="affiliate-feature-grid">${sorted.join("")}</div>` + html.slice(gridStart + gridEnd + 6);
  html = html
    .replaceAll("Zesentwintig keuzes om nu te bekijken", "37 keuzes om nu te bekijken")
    .replaceAll("26 keuzes om nu te bekijken", "37 keuzes om nu te bekijken")
    .replaceAll("Zesentwintig aanbieders", "37 aanbieders")
    .replaceAll("26 aanbieders", "37 aanbieders")
    .replaceAll("zesentwintig aanbieders", "37 aanbieders")
    .replaceAll("26 actuele keuzes", "37 actuele keuzes")
    .replaceAll("Bekijk 26", "Bekijk 37");
  if (!html.includes("/assets/choice-feed-images-v126.js")) html = html.replace("</body>", '<script src="/assets/choice-feed-images-v126.js" defer></script></body>');
  write(relative, html);
}

updateChoices("index.html");
updateChoices("onze-keuzes/index.html");

let home = read("index.html");
const privateSection = home.match(/<section class="section v122-private-offer"[\s\S]*?<\/section>/)?.[0];
if (!privateSection) throw new Error("Homepage: particulier verhuurblok ontbreekt");
home = home.replace(privateSection, "");
const heroEnd = home.indexOf("</section>", home.indexOf("<main>"));
home = home.slice(0, heroEnd + 10) + privateSection + home.slice(heroEnd + 10);
write("index.html", home);

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

let headerCount = 0;
let footerCount = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  if (/<header class="site-header">[\s\S]*?<\/header>/.test(html)) {
    html = html.replace(/<div class="topbar">[\s\S]*?<\/div>/, "");
    html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, `${topbar}${header}`);
    headerCount += 1;
  }
  if (/<footer class="footer">[\s\S]*?<\/footer>/.test(html)) {
    html = html.replace(/<footer class="footer">[\s\S]*?<\/footer>/, footer);
    footerCount += 1;
  }
  fs.writeFileSync(file, html);
}

const cssPath = path.join(root, "assets/visual-system-v120.css");
let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes("V126 NAVIGATION")) css += `\n/* V126 NAVIGATION, CHOICES AND PRIVATE RENTAL VISIBILITY */\n.site-header .nav{gap:14px;font-size:13px}.site-header .nav a{white-space:nowrap}.topbar a{margin-left:auto;margin-right:18px}.affiliate-feature-image img[data-feed-image-provider]{background:#dfece5}.v122-private-offer{scroll-margin-top:110px}\n@media(max-width:1180px){.site-header .nav{display:none}.site-header .menu-btn{display:block}.site-header .nav.open{display:flex;position:absolute;top:66px;left:12px;right:12px;flex-direction:column;align-items:stretch;background:white;padding:18px;border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow)}.site-header .header-owner-link.v78-global-claim{margin-left:auto}}\n@media(max-width:680px){.topbar{align-items:center;gap:8px;padding-inline:12px}.topbar span{display:none}.topbar a{margin:0;font-size:12px;text-align:center}.v122-private-offer{padding-top:44px}}\n`;
fs.writeFileSync(cssPath, css);

const audit = JSON.parse(read("commercial/TRADETRACKER-AUDIT-v116.json"));
const daisy = JSON.parse(read("commercial/approved-campaigns-v107.json")).daisycon;
const tt = [...audit.campingkiezer.product_feed_pages, ...audit.campingkiezer.tracked_link_pages];
const unique = new Map();
for (const item of [...tt.map(item => ({ ...item, network: "TradeTracker", integration: item.feed_id ? "product-feed" : "tracking-link" })), ...daisy.map(item => ({ ...item, network: "Daisycon" }))]) unique.set(item.route, item);
const manifest = {
  version: "V126",
  checked_at: "2026-09-01",
  scope: "alle op 1 september 2026 bekende en bevestigde CampingKiezer-campagnes",
  tradetracker_external_approved: tt.length,
  daisycon_approved_campaigns: daisy.length,
  unique_public_providers: unique.size,
  homepage_choices: unique.size,
  our_choices: unique.size,
  providers: [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, "nl")),
};
write("commercial/approved-campaigns-v126.json", JSON.stringify(manifest, null, 2) + "\n");

const healthPath = path.join(root, "health.json");
const health = JSON.parse(fs.readFileSync(healthPath, "utf8"));
Object.assign(health, { version: 126, release: "v126-complete-approved-providers-rental-alphabetical-navigation", approved_unique_providers: 37, homepage_choices: 37, our_choices_total: 37, private_rental_visible_in_header: true, alphabetical_global_navigation: true });
fs.writeFileSync(healthPath, JSON.stringify(health, null, 2) + "\n");

console.log(JSON.stringify({ version: "V126", html_files: htmlFiles.length, headers: headerCount, footers: footerCount, unique_approved_providers: unique.size, choices: 37 }, null, 2));
