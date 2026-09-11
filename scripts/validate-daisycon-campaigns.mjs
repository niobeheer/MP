import fs from "node:fs";

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("commercial/daisycon-campaigns-v105.json"));
const hub = read("aanbieders/index.html");
const booking = read("boeken/index.html");
const functionCode = read("netlify/functions/daisycon-provider-feed.mjs");
const clientCode = read("assets/daisycon-directory.js");
const sitemap = read("sitemap-core.xml");
const redirects = read("_redirects");
const failures = [];

if (manifest.media_id !== "424678") failures.push("Onjuist Daisycon-media-ID");
if (manifest.campaigns.length !== 6) failures.push("Er moeten zes nieuw goedgekeurde Daisycon-campagnes zijn");

for (const campaign of manifest.campaigns) {
  const hubLabel = campaign.hub_label || campaign.name.replace(" (NL)", "");
  if (!hub.includes(hubLabel)) failures.push(`${campaign.name}: ontbreekt op aanbiedersoverzicht`);
  if (campaign.integration === "product-feed") {
    const path = `${campaign.route.replace(/^\//, "")}index.html`;
    if (!fs.existsSync(new URL(`../${path}`, import.meta.url))) failures.push(`${campaign.name}: aanbiederspagina ontbreekt`);
    const page = read(path);
    const provider = campaign.program_id === "15569" ? "vipio" : "campings-com";
    for (const [label, haystack, needle] of [
      ["programma-ID in functie", functionCode, campaign.program_id],
      ["trackinghost in functie", functionCode, campaign.tracking_host],
      ["provider op pagina", page, `data-provider=\"${provider}\"`],
      ["directory-script", page, "/assets/daisycon-directory.js"],
      ["route in sitemap", sitemap, `https://camping-kiezer.nl${campaign.route}`],
      ["route in redirects", redirects, campaign.route.replace(/\/$/, "")],
      ["route op boekingspagina", booking, campaign.route],
    ]) if (!haystack.includes(needle)) failures.push(`${campaign.name}: ${label} ontbreekt`);
  } else {
    const url = new URL(campaign.tracking_url);
    if (url.protocol !== "https:" || url.searchParams.get("si") !== campaign.program_id || url.searchParams.get("wi") !== "424678") failures.push(`${campaign.name}: ongeldige trackinglink`);
    const routeFile = `${campaign.route.replace(/^\//, "")}index.html`;
    const routeHtml = fs.existsSync(new URL(`../${routeFile}`, import.meta.url)) ? read(routeFile) : "";
    if (!routeHtml.includes(`si=${campaign.program_id}&amp;`) || !routeHtml.includes("wi=424678")) failures.push(`${campaign.name}: trackinglinks ontbreken op aanbiederspagina`);
  }
}

if (!clientCode.includes("sponsored nofollow noopener")) failures.push("Gesponsorde linkattributen ontbreken in feeddirectory");
console.log(JSON.stringify({version: manifest.version, campaigns: manifest.campaigns.length, product_feeds: manifest.campaigns.filter(item => item.integration === "product-feed").length, verified_deeplinks: manifest.campaigns.filter(item => item.integration === "verified-deeplink").length, failures: failures.length, details: failures}, null, 2));
if (failures.length) process.exit(1);
