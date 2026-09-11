import tradeTrackerFeed from "../netlify/functions/tradetracker-feed.mjs";
import daisyconFeed from "../netlify/functions/daisycon-provider-feed.mjs";
import bungalowFeed from "../netlify/functions/bungalow-feed.mjs";

const tradeTrackerProviders = [
  "ackersate",
  "acsi-eurocampings",
  "acsi-reizen",
  "allcamps",
  "suncamp",
  "ardoer",
  "de-boshoek",
  "de-vossenburcht",
  "europarcs",
  "farmcamps",
  "gusto-camp",
  "zandstuve",
];
const daisyconProviders = ["vipio", "campings-com", "vodatent", "tendi"];

async function test(handler, provider, network) {
  const response = await handler(new Request(`https://campingkiezer.nl/.netlify/functions/feed?provider=${provider}&limit=2`));
  const payload = await response.json();
  if (!response.ok || !payload.ok || !payload.feed_total || payload.offers.length < 1) {
    throw new Error(`${network}/${provider}: ${payload.error || "geen bruikbaar aanbod"}`);
  }
  for (const offer of payload.offers) {
    const link = new URL(offer.link);
    if (link.protocol !== "https:") throw new Error(`${network}/${provider}: onveilige trackinglink`);
  }
  return {network, provider, feed_total: payload.feed_total, sample_offers: payload.offers.length};
}

const tests = [
  ...tradeTrackerProviders.map(provider => test(tradeTrackerFeed, provider, "TradeTracker")),
  ...daisyconProviders.map(provider => test(daisyconFeed, provider, "Daisycon")),
  test(bungalowFeed, "bungalow-net", "Daisycon"),
];

const results = await Promise.all(tests);
console.log(JSON.stringify({version: "V106", providers_tested: results.length, failures: 0, results}, null, 2));
