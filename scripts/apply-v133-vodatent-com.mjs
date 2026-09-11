import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, content) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

let page = read("aanbieders/vodatent/index.html")
  .replaceAll("https://camping-kiezer.nl/aanbieders/vodatent/", "https://camping-kiezer.nl/aanbieders/vodatent-com/")
  .replaceAll("via Vodatent", "via Vodatent.com")
  .replaceAll("/ Vodatent<", "/ Vodatent.com<")
  .replaceAll("vodatent-q", "vodatent-com-q")
  .replaceAll("Zoek binnen Vodatent", "Zoek binnen Vodatent.com")
  .replace('data-provider="vodatent"', 'data-provider="vodatent-com"')
  .replace('data-provider-name="Vodatent"', 'data-provider-name="Vodatent.com"');
page = page.replace("</main>", `<section class="section alt" data-v133-vodatent-com><div class="container"><div class="eyebrow">Internationaal aanbod</div><h2>Safaritenten op campings in Europa</h2><p>Deze pagina gebruikt het afzonderlijke goedgekeurde Daisycon-programma van Vodatent.com. Vergelijk bestemming, verblijfsduur, maximale bezetting en de actuele eindsom voordat je boekt.</p><div class="choice-category-grid"><div><strong>Bestemming</strong><span>Vergelijk land, regio en reisafstand.</span></div><div><strong>Safaritent</strong><span>Controleer bedden, sanitair en keukenvoorzieningen.</span></div><div><strong>Camping</strong><span>Bekijk zwembad, speelvoorzieningen en huisdierenregels.</span></div><div><strong>Eindsom</strong><span>Controleer bijkomende kosten en voorwaarden bij de aanbieder.</span></div></div></div></section></main>`);
write("aanbieders/vodatent-com/index.html", page);

let choices = read("onze-keuzes/index.html");
if (!choices.includes('data-v133-choice="vodatent-com"')) {
  choices = choices
    .replace("Bekijk 51 actuele keuzes", "Bekijk 52 actuele keuzes")
    .replace('"description":"51 aanbieders', '"description":"52 aanbieders')
    .replace('"numberOfItems":51', '"numberOfItems":52')
    .replace("<h2>51 keuzes om nu te bekijken</h2>", "<h2>52 keuzes om nu te bekijken</h2>")
    .replace("<p>51 aanbieders met actueel doorzoekbaar aanbod", "<p>52 aanbieders met actueel doorzoekbaar aanbod")
    .replace('</div><p class="affiliate-home-note">', `<article class="affiliate-feature-card" data-v133-choice="vodatent-com"><a class="affiliate-feature-image" href="/aanbieders/vodatent-com/"><img src="/assets/hero-glamping-v108.webp" alt="Algemene sfeerafbeelding van een ingerichte safaritent" loading="lazy" decoding="async"><span>Europees glampingaanbod</span></a><div><small>Vodatent.com</small><h3>Safaritenten in Europa</h3><p>Doorzoek het afzonderlijke internationale Vodatent.com-aanbod via de goedgekeurde Daisycon-feed.</p><strong>Bekijk actuele prijzen en beschikbaarheid</strong><a class="btn btn-brand" href="/aanbieders/vodatent-com/" data-provider="vodatent-com" data-placement="onze-keuzes-v133">Bekijk actueel aanbod →</a></div></article></div><p class="affiliate-home-note">`);
}
write("onze-keuzes/index.html", choices);

let providers = read("aanbieders/index.html").replace("via 50 aanbieders", "via 51 aanbieders");
if (!providers.includes('/aanbieders/vodatent-com/')) {
  const card = `<article class="provider-summary" data-v133-provider="vodatent-com"><span class="status-pill verified">Goedgekeurde partner</span><h2>Vodatent.com</h2><p>Doorzoek het internationale aanbod van safaritenten en glampingaccommodaties.</p><a class="btn btn-brand" href="/aanbieders/vodatent-com/">Bekijk Vodatent.com →</a></article>\n`;
  providers = providers.replace("</div>\n</div>\n</section>\n</main>", `${card}</div>\n</div>\n</section>\n</main>`);
}
write("aanbieders/index.html", providers);

let sitemap = read("sitemap-core.xml");
if (!sitemap.includes("/aanbieders/vodatent-com/")) sitemap = sitemap.replace("</urlset>", '<url><loc>https://camping-kiezer.nl/aanbieders/vodatent-com/</loc><lastmod>2026-09-04</lastmod><changefreq>weekly</changefreq></url></urlset>');
write("sitemap-core.xml", sitemap);

const approvals = JSON.parse(read("DAISYCON-GOEDKEURINGEN-v132.json"));
const international = approvals.approvals.find(item => item.program_id === "15967");
international.route = "/aanbieders/vodatent-com/";
international.provider_key = "vodatent-com";
for (const item of approvals.approvals) {
  if (!item.provider_key) item.provider_key = item.route.split("/").filter(Boolean).at(-1);
}
write("DAISYCON-GOEDKEURINGEN-v133.json", JSON.stringify({ ...approvals, version: "V133", provider_pages: 11 }, null, 2) + "\n");
write("RELEASE-NOTES-v133.txt", `CampingKiezer v133 — volledige Daisycon-splitsing — 2026-09-04\n\n- Vodatent NL (programma 15258) en Vodatent.com (programma 15967) hebben nu elk een eigen aanbiederspagina, feedkoppeling, sitemap-URL en kaart bij Onze keuzes.\n- UplandParcs en alle Search Console-verbeteringen uit v132 blijven behouden.\n- Totaal: 11 Daisycon-programma's op 11 afzonderlijk meetbare aanbiedersroutes, 42 TradeTracker-campagnes en 52 keuzes.\n`);
console.log(JSON.stringify({version: "V133", vodatentComAdded: true, daisyconPrograms: 11, providerPages: 11, choices: 52}, null, 2));
