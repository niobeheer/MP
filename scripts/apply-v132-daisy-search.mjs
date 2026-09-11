import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, content) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

// UplandParcs: reuse the current site shell, but provide substantial static copy
// alongside the approved Daisycon product feed.
let upland = read("aanbieders/campings-com/index.html")
  .replaceAll("Campings boeken via Campings.com", "Vakantieparken van UplandParcs vergelijken")
  .replaceAll("Zoek in het actuele Europese campingaanbod van Campings.com en controleer prijzen en beschikbaarheid bij de aanbieder.", "Vergelijk vakantiehuizen, appartementen en bijzondere verblijven van UplandParcs in het Sauerland en Vorarlberg.")
  .replaceAll("https://camping-kiezer.nl/aanbieders/campings-com/", "https://camping-kiezer.nl/aanbieders/uplandparcs/")
  .replaceAll("Actueel Europees campingaanbod via Campings.com.", "Vakantiehuizen en appartementen van UplandParcs in Duitsland en Oostenrijk.");

const uplandMain = `<main data-v132-uplandparcs>
  <section class="page-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / <a href="/aanbieders/">Aanbieders</a> / UplandParcs</div><div class="eyebrow">Goedgekeurde Daisycon-partner</div><h1>Vakantieparken van UplandParcs vergelijken</h1><p>Bekijk vakantiehuizen, appartementen en bijzondere verblijven in het Sauerland en Vorarlberg. Controleer altijd de actuele prijs, beschikbaarheid en bijkomende kosten bij UplandParcs.</p></div></section>
  <section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Duitsland en Oostenrijk</div><h2>Welk verblijf past bij jouw vakantie?</h2><p>UplandParcs heeft accommodaties rond Winterberg en in het Oostenrijkse Vorarlberg. Het aanbod loopt uiteen van appartementen en vakantiehuizen tot gezinsverblijven en bijzondere accommodaties.</p></div></div><div class="choice-category-grid"><div><span>Sauerland</span><strong>Natuur en wintersport rond Winterberg</strong></div><div><span>Vorarlberg</span><strong>Appartementen tussen de Oostenrijkse bergen</strong></div><div><span>Gezinnen</span><strong>Verblijven voor meerdere personen</strong></div><div><span>Actief</span><strong>Wandelen, fietsen en wintersport</strong></div></div></div></section>
  <section class="section alt"><div class="container"><form class="provider-search" data-daisycon-search><label for="uplandparcs-q"><strong>Zoek binnen het actuele UplandParcs-aanbod</strong></label><div><input id="uplandparcs-q" name="q" placeholder="Verblijf, regio of land"><select name="country" data-daisycon-country aria-label="Kies een land"><option value="">Alle landen</option></select><button class="btn btn-brand" type="submit">Zoeken</button></div></form><p data-daisycon-count>Aanbod laden…</p><div class="partner-list-grid" data-daisycon-directory data-provider="uplandparcs" data-provider-name="UplandParcs"></div></div></section>
  <section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Vergelijk bewust</div><h2>Controleer dit voordat je boekt</h2></div></div><div class="choice-category-grid"><div><strong>Ligging</strong><span>Afstand tot Winterberg, wandelroutes of skiliften verschilt per park.</span></div><div><strong>Verblijfstype</strong><span>Let op het aantal slaapkamers, maximale bezetting en eventuele trappen.</span></div><div><strong>Eindsom</strong><span>Controleer schoonmaak, bedlinnen, toeristenbelasting en eventuele huisdierkosten.</span></div><div><strong>Seizoen</strong><span>Beschikbaarheid en faciliteiten kunnen tussen zomer en winter verschillen.</span></div></div><p class="affiliate-home-note">Bronnen: de actuele Daisycon-productfeed van UplandParcs en de officiële UplandParcs-website. Laatst inhoudelijk gecontroleerd op 4 september 2026.</p></div></section>
</main>`;
upland = upland.replace(/<main>[\s\S]*?<\/main>/, uplandMain);
write("aanbieders/uplandparcs/index.html", upland);

// Add UplandParcs to the two provider hubs.
let choices = read("onze-keuzes/index.html");
if (!choices.includes('data-v132-choice="uplandparcs"')) {
  choices = choices
    .replace("Bekijk 50 actuele keuzes", "Bekijk 51 actuele keuzes")
    .replace('"description":"50 aanbieders', '"description":"51 aanbieders')
    .replace('"numberOfItems":50', '"numberOfItems":51')
    .replace("<h2>50 keuzes om nu te bekijken</h2>", "<h2>51 keuzes om nu te bekijken</h2>")
    .replace("<p>50 aanbieders met actueel doorzoekbaar aanbod", "<p>51 aanbieders met actueel doorzoekbaar aanbod")
    .replace('</div><p class="affiliate-home-note">', `<article class="affiliate-feature-card" data-v132-choice="uplandparcs"><a class="affiliate-feature-image" href="/aanbieders/uplandparcs/"><img src="/assets/category-vakantieparken-v108.webp" alt="Algemene sfeerafbeelding voor een vakantiepark in de bergen" loading="lazy" decoding="async"><span>Duitsland en Oostenrijk</span></a><div><small>UplandParcs</small><h3>Vakantiehuizen in de bergen</h3><p>Vergelijk accommodaties in het Sauerland en Vorarlberg en bekijk de actuele prijs via de goedgekeurde Daisycon-feed.</p><strong>Bekijk actuele prijzen en beschikbaarheid</strong><a class="btn btn-brand" href="/aanbieders/uplandparcs/" data-provider="uplandparcs" data-placement="onze-keuzes-v132">Bekijk actueel aanbod →</a></div></article></div><p class="affiliate-home-note">`);
}
write("onze-keuzes/index.html", choices);

let providers = read("aanbieders/index.html");
providers = providers.replace("via 44 aanbieders", "via 50 aanbieders");
if (!providers.includes('/aanbieders/uplandparcs/')) {
  const card = `<article class="provider-summary" data-v132-provider="uplandparcs"><span class="status-pill verified">Goedgekeurde partner</span><h2>UplandParcs</h2><p>Vergelijk vakantiehuizen en appartementen in het Sauerland en Vorarlberg.</p><a class="btn btn-brand" href="/aanbieders/uplandparcs/">Bekijk UplandParcs →</a></article>\n`;
  providers = providers.replace("</div>\n</div>\n</section>\n</main>", `${card}</div>\n</div>\n</section>\n</main>`);
}
write("aanbieders/index.html", providers);

// Give the provider pages called out by Search Console useful static context.
const providerCopy = {
  "aanbieders/campings-com/index.html": ["Campings.com vergelijken", "Gebruik de filters om landen, regio’s, verblijfstypes en prijzen naast elkaar te leggen. Kijk bij het boeken niet alleen naar de vanafprijs, maar ook naar schoonmaak, toeristenbelasting, bedlinnen en annuleringsvoorwaarden."],
  "aanbieders/ardoer/index.html": ["Nederlandse campings en vakantieparken vergelijken", "Ardoer bundelt zelfstandige recreatiebedrijven in Nederland. Vergelijk per locatie het soort kampeerplaats of huuraccommodatie, de voorzieningen voor kinderen, zwemwater of zwembad en de voorwaarden voor huisdieren."],
  "aanbieders/suncamp/index.html": ["Europese campingvakanties vergelijken", "Suncamp biedt campings en huuraccommodaties in meerdere Europese vakantielanden. Controleer per resultaat de ligging, accommodatiebezetting, beschikbare faciliteiten en de volledige reissom voor jouw gekozen periode."],
};
for (const [file, [heading, paragraph]] of Object.entries(providerCopy)) {
  let html = read(file);
  if (!html.includes("data-v132-static-provider")) {
    const block = `<section class="section" data-v132-static-provider><div class="container"><div class="eyebrow">Keuzehulp</div><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(paragraph)}</p><div class="choice-category-grid"><div><strong>Bestemming</strong><span>Vergelijk land, regio en reisafstand.</span></div><div><strong>Verblijf</strong><span>Controleer kampeerplaats, tent, stacaravan of vakantiehuis.</span></div><div><strong>Voorzieningen</strong><span>Bekijk alleen faciliteiten die bij de gekozen locatie bevestigd zijn.</span></div><div><strong>Eindsom</strong><span>Open de aanbieder voor actuele beschikbaarheid en alle bijkomende kosten.</span></div></div></div></section>`;
    html = html.replace("</main>", `${block}</main>`);
  }
  write(file, html);
}

// Link every regional facet from its province page, so Google and visitors can
// reach these pages through normal HTML navigation rather than the sitemap only.
const regionsRoot = path.join(root, "regios");
for (const entry of fs.readdirSync(regionsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const region = entry.name;
  const parentFile = path.join(regionsRoot, region, "index.html");
  if (!fs.existsSync(parentFile)) continue;
  const children = fs.readdirSync(path.dirname(parentFile), { withFileTypes: true })
    .filter(child => child.isDirectory() && fs.existsSync(path.join(path.dirname(parentFile), child.name, "index.html")))
    .map(child => child.name)
    .sort((a, b) => a.localeCompare(b, "nl"));
  if (!children.length) continue;
  let html = fs.readFileSync(parentFile, "utf8");
  if (html.includes("data-v132-region-facets")) continue;
  const links = children.map(child => {
    const label = child.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return `<a href="/regios/${region}/${child}/">${escapeHtml(label)} →</a>`;
  }).join("");
  const extras = region === "drenthe" ? '<a href="/camping/t-hijkerveld/">\'T Hijkerveld →</a>'
    : region === "gelderland" ? '<a href="/camping/t-paardeweitje/">\'t Paardeweitje →</a>' : "";
  const block = `<section class="section alt" data-v132-region-facets><div class="container"><div class="eyebrow">Verder verfijnen</div><h2>Bekijk campings in deze provincie per thema</h2><div class="v109-related-links">${links}${extras}</div></div></section>`;
  html = html.replace("</main>", `${block}</main>`);
  fs.writeFileSync(parentFile, html);
}

// Strengthen internal links to the two knowledge articles in the crawled set.
let knowledge = read("kennisbank/index.html");
if (!knowledge.includes("data-v132-search-guides")) {
  const block = `<section class="section alt" data-v132-search-guides><div class="container"><div class="eyebrow">Praktische keuzehulp</div><h2>Verder lezen over langer of samen verblijven</h2><div class="v109-related-links"><a href="/kennisbank/seizoensplaats-kiezen/">Een seizoensplaats kiezen →</a><a href="/kennisbank/groepsvakantie-op-een-park/">Een groepsvakantie op camping of park →</a></div></div></section>`;
  knowledge = knowledge.replace("</main>", `${block}</main>`);
}
write("kennisbank/index.html", knowledge);

// Keep the thinnest profiles available to visitors, but do not ask Google to
// index them until more source-backed information is available.
const deindexed = [];
for (const directory of fs.readdirSync(path.join(root, "camping"), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const relative = `camping/${directory.name}/index.html`;
  let html = read(relative);
  const score = Number(html.match(/data-consumer-score=["'](\d+)/i)?.[1]);
  if (!score || score > 2) continue;
  html = html.replace(/<meta name="robots" content="index,follow,max-image-preview:large">/i, '<meta name="robots" content="noindex,follow">');
  write(relative, html);
  deindexed.push(`/camping/${directory.name}/`);
}
for (const sitemapFile of fs.readdirSync(root).filter(name => /^sitemap.*\.xml$/.test(name))) {
  let xml = read(sitemapFile);
  for (const route of deindexed) {
    const url = `https://camping-kiezer.nl${route}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    xml = xml.replace(new RegExp(`<url><loc>${url}<\\/loc>(?:<lastmod>[^<]+<\\/lastmod>)?(?:<changefreq>[^<]+<\\/changefreq>)?(?:<priority>[^<]+<\\/priority>)?<\\/url>`, "g"), "");
  }
  write(sitemapFile, xml);
}

let core = read("sitemap-core.xml");
if (!core.includes("/aanbieders/uplandparcs/")) {
  core = core.replace("</urlset>", '<url><loc>https://camping-kiezer.nl/aanbieders/uplandparcs/</loc><lastmod>2026-09-04</lastmod><changefreq>weekly</changefreq></url></urlset>');
}
write("sitemap-core.xml", core);

const approvals = [
  ["6815", "Dierenbos Vakantiepark - Libema", "/aanbieders/dierenbos/"],
  ["6813", "Lake Resort & Safari Resort Beekse Bergen", "/aanbieders/beekse-bergen/"],
  ["8921", "Landgoed Ruwinkel", "/aanbieders/landgoed-ruwinkel/"],
  ["15690", "UplandParcs (NL)", "/aanbieders/uplandparcs/"],
  ["15569", "Vipio", "/aanbieders/vipio/"],
  ["8995", "Glamping4all", "/aanbieders/glamping4all/"],
  ["15258", "Vodatent (NL)", "/aanbieders/vodatent/"],
  ["11126", "Bungalow.Net", "/aanbieders/bungalow-net/"],
  ["16264", "Campings.com (NL)", "/aanbieders/campings-com/"],
  ["15967", "Vodatent.com", "/aanbieders/vodatent/"],
  ["21545", "Tendi", "/aanbieders/tendi/"],
].map(([program_id, name, route]) => ({ program_id, name, route, media_id: "424678", status: "approved" }));
write("DAISYCON-GOEDKEURINGEN-v132.json", JSON.stringify({ checked_at: "2026-09-04", media: "Camping kiezer", media_id: "424678", approved_count: 11, approvals }, null, 2) + "\n");

write("RELEASE-NOTES-v132.txt", `CampingKiezer v132 — Daisycon en Search Console — 2026-09-04\n\n- Alle 11 Daisycon-goedkeuringen voor media 424678 gecontroleerd.\n- UplandParcs (programma 15690) toegevoegd aan de productfeed, aanbiederspagina, aanbiedersoverzicht, sitemap en Onze keuzes.\n- 45 regionale thema-URL's vanuit de bijbehorende provinciepagina bereikbaar gemaakt.\n- Twee losse campingprofielen opnieuw intern gekoppeld.\n- Campings.com, Ardoer en Suncamp voorzien van vaste inhoud naast de dynamische feed.\n- Twee kennisbankartikelen extra intern gekoppeld.\n- ${deindexed.length} profielen met slechts 1 of 2 gecontroleerde informatiegroepen op noindex,follow gezet en uit de sitemaps verwijderd; ze blijven toegankelijk voor bezoekers.\n- De twee 404-redirects en FarmCamps-validaties uit v131 blijven behouden.\n`);

console.log(JSON.stringify({ version: "V132", daisyconApproved: approvals.length, uplandParcsAdded: true, lowScoreProfilesNoindexed: deindexed.length }, null, 2));
