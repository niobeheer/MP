import fs from "node:fs";
import path from "node:path";
import daisyconFeed from "../netlify/functions/daisycon-provider-feed.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const approvals = JSON.parse(read("DAISYCON-GOEDKEURINGEN-v132.json"));
assert(approvals.approved_count === 11 && approvals.approvals.length === 11, "Niet alle 11 Daisycon-goedkeuringen zijn vastgelegd");
for (const approval of approvals.approvals) {
  assert(fs.existsSync(path.join(root, approval.route.slice(1), "index.html")), `Aanbiederspagina ontbreekt: ${approval.route}`);
}

const uplandResponse = await daisyconFeed(new Request("https://camping-kiezer.nl/.netlify/functions/daisycon-provider-feed?provider=uplandparcs&limit=10"));
const upland = await uplandResponse.json();
assert(uplandResponse.ok && upland.ok && upland.offers.length >= 1, `UplandParcs-feed mislukt: ${upland.error || uplandResponse.status}`);
for (const offer of upland.offers) {
  const link = new URL(offer.link);
  assert(link.protocol === "https:" && link.hostname === "fr135.net", "UplandParcs trackinghost klopt niet");
  assert(link.searchParams.get("si") === "15690", "UplandParcs programma-ID klopt niet");
  assert(link.searchParams.get("wi") === "424678", "UplandParcs media-ID klopt niet");
  assert(link.searchParams.get("dl"), "UplandParcs deeplink ontbreekt");
}

const choices = read("onze-keuzes/index.html");
const providers = read("aanbieders/index.html");
const uplandPage = read("aanbieders/uplandparcs/index.html");
assert(choices.includes('data-v132-choice="uplandparcs"') && choices.includes("51 keuzes om nu te bekijken"), "UplandParcs ontbreekt bij Onze keuzes");
assert(providers.includes('/aanbieders/uplandparcs/') && providers.includes("via 50 aanbieders"), "UplandParcs ontbreekt in het aanbiedersoverzicht");
assert(uplandPage.includes('data-provider="uplandparcs"') && uplandPage.includes("Vergelijk bewust"), "UplandParcs-pagina is niet compleet");
assert(read("sitemap-core.xml").includes("/aanbieders/uplandparcs/"), "UplandParcs ontbreekt in de sitemap");

const sitemapText = fs.readdirSync(root).filter(name => /^sitemap.*\.xml$/.test(name)).map(read).join("\n");
let noindexInSitemap = 0;
for (const directory of fs.readdirSync(path.join(root, "camping"), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const page = read(`camping/${directory.name}/index.html`);
  if (page.includes('content="noindex,follow"') && sitemapText.includes(`/camping/${directory.name}/</loc>`)) noindexInSitemap += 1;
}
assert(noindexInSitemap === 0, `${noindexInSitemap} noindex-profielen staan nog in de sitemap`);

console.log(JSON.stringify({
  version: "V132",
  daisycon_approved: approvals.approvals.length,
  uplandparcs_feed_offers: upland.offers.length,
  uplandparcs_tracking_and_deeplinks_checked: upland.offers.length,
  our_choices_count: (choices.match(/affiliate-feature-card"/g) || []).length + 1,
  noindex_profiles_in_sitemap: noindexInSitemap,
  failures: 0,
}, null, 2));
