import fs from "node:fs";
import path from "node:path";
import handler from "../netlify/functions/tradetracker-feed.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, content) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
};
const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const slugify = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const providers = [
  {key: "acsi-eurocampings", name: "ACSI Eurocampings"},
  {key: "allcamps", name: "Allcamps"},
  {key: "lux-camp", name: "LuxCamp"},
  {key: "suncamp", name: "Suncamp"},
];
const countries = [
  ["Albanië", "albanië", "bergen, kust en kleinschalige campings", "Let extra op bereikbaarheid, schaduw en de afstand tot winkels of strand."],
  ["België", "belgië", "Ardennen, kust en korte reistijd", "Vergelijk ligging, hoogteverschil en afstand tot Nederland."],
  ["Denemarken", "denemarken", "familiecampings, stranden en eilanden", "Controleer veerverbindingen, windbeschutting en zwemvoorzieningen."],
  ["Duitsland", "duitsland", "meren, middelgebergte en natuurparken", "Vergelijk milieuzones, aankomsttijden en toeristenbelasting."],
  ["Frankrijk", "frankrijk", "Atlantische kust, Middellandse Zee en binnenland", "Vergelijk tolroute, schaduw, zwembadregels en afstand tot zee."],
  ["Griekenland", "griekenland", "strandcampings en zonzekere bestemmingen", "Controleer ferry, airconditioning, schaduw en lokale bereikbaarheid."],
  ["Hongarije", "hongarije", "Balaton, thermale baden en ruime campings", "Vergelijk zwemwater, schaduw en betaalmogelijkheden ter plaatse."],
  ["Italië", "italië", "meren, Adriatische kust en Toscane", "Controleer badmutsregels, toeristenbelasting en ligging van de staanplaats."],
  ["Kroatië", "kroatië", "Adriatische kust, eilanden en helder zwemwater", "Vergelijk kiezelstrand, schaduw, terreinhelling en ferrykosten."],
  ["Luxemburg", "luxemburg", "groene dalen en korte autoritten", "Let op hoogteverschil, rivierligging en bereikbaarheid met caravan."],
  ["Montenegro", "montenegro", "bergen, baaien en kleinschalig kamperen", "Controleer toegangswegen, grensdocumenten en voorzieningen vooraf."],
  ["Noorwegen", "noorwegen", "fjorden, bergen en rondreizen", "Vergelijk ferrykosten, rijafstanden en voorzieningen buiten het hoogseizoen."],
  ["Oostenrijk", "oostenrijk", "Alpen, meren en actieve vakanties", "Controleer vignet, hellingspercentage en inbegrepen gastenkaarten."],
  ["Polen", "polen", "meren, Baltische kust en natuurgebieden", "Vergelijk sanitaire voorzieningen, betaalwijze en afstand tussen etappes."],
  ["Portugal", "portugal", "Atlantische kust en overwinteren", "Controleer schaduw, wind, huurauto en afstand tot strand of dorp."],
  ["Slovenië", "slovenië", "Alpen, rivieren en compacte rondreizen", "Vergelijk rivierligging, bergwegen en lokale toeristenbelasting."],
  ["Spanje", "spanje", "Costa's, binnenland en overwinteren", "Controleer perceelgrootte, schaduw, airconditioning en lokale toeslagen."],
  ["Tsjechië", "tsjechië", "meren, bossen en cultuursteden", "Vergelijk wegkwaliteit, betaalmogelijkheden en afstand tot uitstapjes."],
  ["Zweden", "zweden", "meren, bossen en lange zomerdagen", "Controleer rijafstanden, muggenperiode en voorzieningen buiten het hoogseizoen."],
  ["Zwitserland", "zwitserland", "Alpen, bergmeren en treinverbindingen", "Vergelijk vignet, bergpassen, prijsniveau en openbaar vervoer."],
];

async function offersFor(provider, country) {
  const response = await handler(new Request(`https://camping-kiezer.nl/.netlify/functions/tradetracker-feed?provider=${provider.key}&country=${encodeURIComponent(country)}&limit=50`));
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(`${provider.name}/${country}: ${payload.error || response.status}`);
  return payload.offers.map(offer => ({...offer, provider: provider.name, providerKey: provider.key}));
}

function normalizedTitle(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\b(camping|vakantiepark|camping village|camping resort)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function roundRobin(groups, max = 24) {
  const result = [];
  const seen = new Set();
  for (let index = 0; result.length < max; index += 1) {
    let added = false;
    for (const group of groups) {
      const offer = group[index];
      if (!offer) continue;
      added = true;
      const key = normalizedTitle(offer.title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(offer);
      if (result.length === max) break;
    }
    if (!added) break;
  }
  return result;
}

function card(offer, country) {
  const price = offer.price ? `<strong>Vanaf € ${Number(offer.price).toLocaleString("nl-NL", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>` : `<strong>Bekijk actuele prijs</strong>`;
  const image = /^https:\/\//.test(offer.image || "") ? `<img src="${esc(offer.image)}" alt="${esc(offer.title)} in ${esc(country)}" loading="lazy" decoding="async">` : `<div class="europe-card-placeholder" aria-hidden="true">⛺</div>`;
  return `<article class="europe-offer-card" data-country="${esc(country)}" data-provider="${esc(offer.provider)}" data-search="${esc(`${offer.title} ${offer.city} ${offer.provider}`.toLowerCase())}">${image}<div><span>${esc(offer.provider)}</span><h2>${esc(offer.title)}</h2><p>${esc(offer.city || country)}${offer.category ? ` · ${esc(offer.category)}` : ""}</p>${price}<a class="btn btn-brand" href="${esc(offer.link)}" target="_blank" rel="sponsored nofollow noopener" data-affiliate-network="tradetracker" data-v134-europe="${esc(country)}">Bekijk prijs en beschikbaarheid →</a></div></article>`;
}

function basePage({title, description, canonical, main, schema}) {
  let html = read("aanbieders/acsi-eurocampings/index.html");
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(canonical)}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "")
    .replace(/<main>[\s\S]*?<\/main>/, `<main>${main}</main>`)
    .replace(/<(div|nav|p|span)\b[^>]*class=["'][^"']*\bcrumbs\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/g, "")
    .replace('<link rel="stylesheet" href="/assets/visual-system-v120.css">', '<link rel="stylesheet" href="/assets/visual-system-v120.css"><link rel="stylesheet" href="/assets/europe-v134.css">')
    .replace('<script src="/assets/tradetracker-directory.js" defer></script>', '<script src="/assets/europe-v134.js" defer></script>');
  return html;
}

const data = [];
for (const [country, slug, theme, advice] of countries) {
  const groups = [];
  for (const provider of providers) groups.push(await offersFor(provider, country));
  const offers = roundRobin(groups);
  if (!offers.length) throw new Error(`Geen aanbod voor ${country}`);
  const description = `Vergelijk ${offers.length} actuele campings in ${country} die je via een Nederlandstalige aanbieder kunt boeken. Bekijk prijzen, plaatsen en beschikbaarheid.`;
  const cards = offers.map(offer => card(offer, country)).join("");
  const providerNames = [...new Set(offers.map(offer => offer.provider))];
  const main = `<section class="page-hero europe-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / <a href="/europa/">Europa</a> / ${esc(country)}</div><div class="eyebrow">Nederlandstalig boeken</div><h1>Campings in ${esc(country)}</h1><p>${esc(theme)}. Vergelijk een actuele selectie uit goedgekeurde Nederlandse campingaanbieders.</p></div></section><section class="section"><div class="container"><div class="europe-facts"><div><strong>${offers.length}</strong><span>actuele campings</span></div><div><strong>${providerNames.length}</strong><span>Nederlandstalige aanbieders</span></div><div><strong>Direct</strong><span>naar prijs en beschikbaarheid</span></div></div><div class="europe-advice"><h2>Waar let je op in ${esc(country)}?</h2><p>${esc(advice)} Prijzen en beschikbaarheid kunnen veranderen; controleer de definitieve reissom en voorwaarden altijd bij de aanbieder.</p></div><form class="europe-filter" data-europe-filter><label><strong>Zoek binnen deze selectie</strong><input type="search" placeholder="Naam, plaats of aanbieder" data-europe-query></label><label><strong>Aanbieder</strong><select data-europe-provider><option value="">Alle aanbieders</option>${providerNames.map(name => `<option>${esc(name)}</option>`).join("")}</select></label></form><p data-europe-count>${offers.length} campings zichtbaar</p><div class="europe-offer-grid" data-europe-grid>${cards}</div><p class="affiliate-home-note">Affiliate-uitleg: bij een boeking via een knop kan CampingKiezer een vergoeding ontvangen. Jij betaalt daardoor niet meer.</p></div></section><section class="section alt"><div class="container"><h2>Andere Europese campinglanden</h2><div class="europe-country-links">${countries.filter(item => item[0] !== country).map(item => `<a href="/europa/${item[1]}/">${esc(item[0])}</a>`).join("")}</div></div></section>`;
  const schema = {"@context":"https://schema.org","@type":"CollectionPage",name:`Campings in ${country} die je in het Nederlands kunt boeken`,url:`https://camping-kiezer.nl/europa/${slug}/`,description,mainEntity:{"@type":"ItemList",numberOfItems:offers.length,itemListElement:offers.map((offer, index) => ({"@type":"ListItem",position:index + 1,name:offer.title,url:offer.link}))}};
  write(`europa/${slug}/index.html`, basePage({title:`Campings in ${country} Nederlands boeken | CampingKiezer`, description, canonical:`https://camping-kiezer.nl/europa/${slug}/`, main, schema}));
  data.push({country, slug, theme, advice, offers: offers.length, providers: providerNames, sample: offers.map(({id,title,city,provider,link}) => ({id,title,city,provider,link}))});
}

const totalOffers = data.reduce((sum, item) => sum + item.offers, 0);
const hubCards = data.map((item, index) => `<a class="europe-country-card" href="/europa/${item.slug}/"><img src="/assets/camp-${index % 6 + 1}.webp" alt="Campings in ${esc(item.country)}" loading="lazy" decoding="async"><div><span>${item.offers} actuele campings</span><h2>${esc(item.country)}</h2><p>${esc(item.theme)}</p><strong>Vergelijk in het Nederlands →</strong></div></a>`).join("");
const hubDescription = `Vergelijk ${totalOffers} actuele campingresultaten in 20 Europese landen en boek via Nederlandstalige aanbieders met gecontroleerde affiliate-links.`;
const hubMain = `<section class="page-hero europe-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / Europa</div><div class="eyebrow">Campings buiten Nederland</div><h1>Campings in Europa die je in het Nederlands kunt boeken</h1><p>Van Frankrijk en Italië tot Kroatië, Spanje en Scandinavië: vergelijk actuele campings via goedgekeurde Nederlandstalige aanbieders.</p><a class="btn btn-brand" href="#landen">Bekijk 20 landen →</a></div></section><section class="section" id="landen"><div class="container"><div class="europe-facts"><div><strong>20</strong><span>Europese landen</span></div><div><strong>${totalOffers}</strong><span>actuele campingresultaten</span></div><div><strong>4</strong><span>Nederlandstalige boekingspartners</span></div></div><div class="section-head"><div><div class="eyebrow">Kies jouw vakantieland</div><h2>Vergelijk per land</h2><p>Elke landenpagina bevat echte campings uit actuele feeds, een Nederlandse boekingsroute en een directe deeplink naar prijs en beschikbaarheid.</p></div></div><div class="europe-country-grid">${hubCards}</div></div></section><section class="section alt"><div class="container v109-seo-grid"><div><div class="eyebrow">Slim vergelijken</div><h2>Niet alleen de vanafprijs telt</h2><p>Vergelijk de totale reissom, ligging, type verblijf, reisafstand en voorwaarden. Controleer bij de aanbieder altijd wat inbegrepen is en of lokale toeslagen ter plaatse gelden.</p><div class="v109-check-grid"><article><span>01</span><p>Kies land en gewenste reisafstand.</p></article><article><span>02</span><p>Vergelijk meerdere Nederlandstalige aanbieders.</p></article><article><span>03</span><p>Controleer de definitieve eindsom en voorwaarden.</p></article></div></div><figure><img src="/assets/hero-camping-family-v108.webp" alt="Kamperen in Europa" loading="lazy" decoding="async"><figcaption>Actueel aanbod via goedgekeurde partners</figcaption></figure></div></section>`;
write("europa/index.html", basePage({title:"Campings in Europa Nederlands boeken | CampingKiezer",description:hubDescription,canonical:"https://camping-kiezer.nl/europa/",main:hubMain,schema:{"@context":"https://schema.org","@type":"CollectionPage",name:"Campings in Europa die je in het Nederlands kunt boeken",url:"https://camping-kiezer.nl/europa/",description:hubDescription,mainEntity:{"@type":"ItemList",numberOfItems:data.length,itemListElement:data.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.country,url:`https://camping-kiezer.nl/europa/${item.slug}/`}))}}}));

write("commercial/europe-campings-v134.json", JSON.stringify({version:"V134",checked_at:"2026-09-04",countries:data.length,displayed_unique_campings:totalOffers,providers:providers.map(item=>item.name),data}, null, 2) + "\n");

let sitemap = read("sitemap-core.xml");
const urls = ["https://camping-kiezer.nl/europa/", ...data.map(item => `https://camping-kiezer.nl/europa/${item.slug}/`)];
for (const url of urls) if (!sitemap.includes(`<loc>${url}</loc>`)) sitemap = sitemap.replace("</urlset>", `<url><loc>${url}</loc><lastmod>2026-09-04</lastmod><changefreq>daily</changefreq></url></urlset>`);
write("sitemap-core.xml", sitemap);

const europePromo = `<section class="section alt" data-v134-europe-promo><div class="container v109-seo-grid"><div><div class="eyebrow">Nieuw: heel Europa</div><h2>Campings in 20 Europese landen</h2><p>Vergelijk 359 actuele campingresultaten in onder meer Frankrijk, Italië, Kroatië, Spanje, Duitsland en Oostenrijk. Alle boekingsroutes lopen via goedgekeurde Nederlandstalige aanbieders.</p><a class="btn btn-brand" href="/europa/">Bekijk campings in Europa →</a></div><figure><img src="/assets/camp-5.webp" alt="Campingvakantie in Europa" loading="lazy" decoding="async"><figcaption>Nederlandstalig vergelijken en boeken</figcaption></figure></div></section>`;
for (const relative of ["index.html", "campings/index.html"]) {
  let html = read(relative);
  if (!html.includes("data-v134-europe-promo")) html = html.replace("</main>", `${europePromo}</main>`);
  write(relative, html);
}

for (const file of []) void file;
const htmlFiles = [];
const walk = directory => { for (const entry of fs.readdirSync(directory, {withFileTypes:true})) { const full = path.join(directory, entry.name); if (entry.isDirectory() && entry.name !== "deliverables") walk(full); else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full); } };
walk(root);
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/Vind, vergelijk en boek jouw volgende plek in Nederland(?: en Europa)+/g, "Vind, vergelijk en boek jouw volgende plek in Nederland en Europa");
  html = html.replace(/<(div|nav|p|span)\b[^>]*class=["'][^"']*\bcrumbs\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/g, "");
  if (!html.includes('href="/europa/"') && html.includes('<h4>Ontdekken</h4>')) html = html.replace('<h4>Ontdekken</h4>', '<h4>Ontdekken</h4><a href="/europa/">Campings in Europa</a>');
  fs.writeFileSync(file, html);
}

console.log(JSON.stringify({version:"V134",countries:data.length,displayed_unique_campings:totalOffers,html_pages_updated:htmlFiles.length,providers:providers.map(item=>item.name)}, null, 2));
