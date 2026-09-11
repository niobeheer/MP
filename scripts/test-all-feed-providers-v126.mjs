import tradeTrackerFeed from "../netlify/functions/tradetracker-feed.mjs";
import daisyconFeed from "../netlify/functions/daisycon-provider-feed.mjs";
import bungalowFeed from "../netlify/functions/bungalow-feed.mjs";

const tradeTrackerProviders = [
  "ackersate", "acsi-eurocampings", "acsi-reizen", "allcamps", "ardoer",
  "de-boshoek", "de-vossenburcht", "easyatent", "europarcs", "farmcamps",
  "gusto-camp", "kampeerwereld", "leistert", "lux-camp", "norgerberg",
  "ommerland", "rcn", "suncamp", "topparken", "zandstuve",
];
const daisyconProviders = ["vipio", "campings-com", "vodatent", "vodatent-com", "tendi", "uplandparcs"];
const choiceFeedImages = new Set(["easyatent", "farmcamps", "leistert", "lux-camp", "norgerberg", "rcn"]);

async function test(handler, provider, network) {
  let response;
  let payload;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    response = await handler(new Request(`https://camping-kiezer.nl/.netlify/functions/feed?provider=${provider}&limit=12`));
    payload = await response.json();
    if (response.ok && payload.ok) break;
    if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 750));
  }
  if (!response.ok || !payload.ok || !payload.feed_total || payload.offers.length < 1) {
    throw new Error(`${network}/${provider}: ${payload.error || "geen bruikbaar aanbod"}`);
  }
  for (const offer of payload.offers) {
    const link = new URL(offer.link);
    if (link.protocol !== "https:") throw new Error(`${network}/${provider}: onveilige trackinglink`);
  }
  const imageOffers = payload.offers.filter(offer => {
    try { return new URL(offer.image).protocol === "https:"; } catch { return false; }
  });
  if (choiceFeedImages.has(provider) && !imageOffers.length) throw new Error(`${network}/${provider}: geen bruikbaar feedbeeld voor Onze keuzes`);
  return { network, provider, feed_total: payload.feed_total, sample_offers: payload.offers.length, sample_images: imageOffers.length };
}

const tests = [
  ...tradeTrackerProviders.map(provider => test(tradeTrackerFeed, provider, "TradeTracker")),
  ...daisyconProviders.map(provider => test(daisyconFeed, provider, "Daisycon")),
  test(bungalowFeed, "bungalow-net", "Daisycon"),
];
const results = await Promise.all(tests);
console.log(JSON.stringify({ version: "V126", providers_tested: results.length, feed_image_choices_tested: choiceFeedImages.size, failures: 0, results }, null, 2));
