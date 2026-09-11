import fs from "node:fs";
import path from "node:path";
import feed from "../netlify/functions/tradetracker-feed.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const response = await feed(new Request("https://camping-kiezer.nl/.netlify/functions/tradetracker-feed?provider=farmcamps&limit=50"));
const payload = await response.json();
assert(response.ok && payload.ok, `FarmCamps-feed mislukt: ${payload.error || response.status}`);
assert(payload.feed_total >= 1 && payload.offers.length >= 1, "FarmCamps-feed bevat geen aanbod");

for (const offer of payload.offers) {
  const link = new URL(offer.link);
  assert(link.protocol === "https:" && link.hostname === "farmcamps.com", `Ongeldige FarmCamps-host: ${offer.link}`);
  assert(decodeURIComponent(link.href).includes("12236_2433764_514819_"), `Trackinghandtekening ontbreekt: ${offer.link}`);
  const destination = new URL(link.searchParams.get("r"));
  assert(destination.protocol === "https:" && destination.hostname === "farmcamps.com", `Ongeldige deeplink: ${offer.link}`);
  const image = new URL(offer.image);
  assert(image.protocol === "https:", `Onveilig FarmCamps-beeld: ${offer.image}`);
}

const providerPage = read("aanbieders/farmcamps/index.html");
assert(providerPage.includes('data-provider="farmcamps"'), "FarmCamps-aanbiederspagina mist feedkoppeling");
assert(!/slider|carousel/i.test(providerPage), "FarmCamps-aanbiederspagina bevat nog een slider/carrousel");
assert(!/<section class="page-hero"[^>]*>[\s\S]*?<img\b/i.test(providerPage), "FarmCamps-header bevat nog statisch beeld");

const choicesImages = read("assets/choice-feed-images-v126.js");
assert(choicesImages.includes('data-v107-feed-choice="farmcamps"'), "Onze keuzes schakelt FarmCamps niet om naar feedbeeld");
assert(choicesImages.includes("feedImageProvider = 'farmcamps'"), "FarmCamps-feedbeeldconfiguratie ontbreekt");

console.log(JSON.stringify({
  version: "V130",
  farmcamps_feed_total: payload.feed_total,
  offers_checked: payload.offers.length,
  tracking_signature: "12236_2433764_514819_",
  deeplinks_checked: payload.offers.length,
  feed_images_checked: payload.offers.length,
  static_header_image: false,
  slider_present: false,
  our_choices_uses_feed_image: true,
  failures: 0,
}, null, 2));
