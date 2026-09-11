import {readFile, writeFile} from "node:fs/promises";

const file = new URL("../aanbieders/allcamps/index.html", import.meta.url);
let html = await readFile(file, "utf8");
html = html.replace("/assets/style.css?v=98", "/assets/style.css?v=106");

if (!html.includes("data-tradetracker-search")) {
  const marker = "</div></section><section class=\"section\">";
  const dynamicSection = `</div></section><section class="section affiliate-home-section"><div class="container"><div class="section-head"><div><div class="eyebrow">Actueel aanbod</div><h2>Zoek binnen Allcamps</h2><p>Naast onze geselecteerde Nederlandse campings kun je hier het actuele Allcamps-aanbod doorzoeken.</p></div></div><form class="provider-search" data-tradetracker-search><label for="allcamps-q"><strong>Zoek binnen Allcamps</strong></label><div><input id="allcamps-q" name="q" placeholder="Camping, plaats of verblijfstype"><select name="country" data-tradetracker-country aria-label="Kies een land"><option value="">Alle landen</option></select><button class="btn btn-brand" type="submit">Zoeken</button></div></form><p data-tradetracker-count>Aanbod laden…</p><div class="partner-list-grid" data-tradetracker-directory data-provider="allcamps" data-provider-name="Allcamps"></div></div></section><section class="section">`;
  if (!html.includes(marker)) throw new Error("Allcamps section marker ontbreekt");
  html = html.replace(marker, dynamicSection);
}

if (!html.includes("/assets/tradetracker-directory.js")) {
  html = html.replace("<script src=\"/assets/app.js\" defer></script></body></html>", "<script src=\"/assets/app.js\" defer></script><script src=\"/assets/tradetracker-directory.js\" defer></script></body></html>");
}

await writeFile(file, html);
console.log(JSON.stringify({route: "/aanbieders/allcamps/", feed: "2166132", upgraded: true}));
