import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const failures = [];
const requiredPages = ["adverteren/index.html", "seizoensplaats-verhuren/index.html", "seizoensplaats-aangemeld/index.html"];
for (const page of requiredPages) if (!fs.existsSync(path.join(root, page))) failures.push(`${page}: ontbreekt`);

const business = read("adverteren/index.html");
for (const token of ["Handmatig aanbiedersprofiel", "XML, JSON, CSV of API", "Herkenbaar uitgelicht", "vanaf €29 p/m", "vanaf €79 p/m", "geen hogere plek"]) if (!business.includes(token)) failures.push(`adverteren: ${token} ontbreekt`);
const privatePage = read("seizoensplaats-verhuren/index.html");
for (const token of ['name="particuliere-seizoensplaats"', 'data-netlify="true"', 'enctype="multipart/form-data"', 'action="/seizoensplaats-aangemeld/"', "30 dagen · €19", "90 dagen · €39", "Tot 31 oktober · €69", "toestemming_onderverhuur", "Foto’s"]) if (!privatePage.includes(token)) failures.push(`seizoensplaats-verhuren: ${token} ontbreekt`);
for (const [page, marker] of [["themas/seizoenplaatsen/index.html", "data-v119-private-seasonal"], ["zakelijk/index.html", "data-v119-advertising-model"], ["tarieven/index.html", "data-v119-private-rates"], ["voor-campings/index.html", "data-v119-feed-choice"], ["privacy.html", "data-v119-private-privacy"], ["voorwaarden.html", "data-v119-private-terms"]]) if (!read(page).includes(marker)) failures.push(`${page}: V119-integratie ontbreekt`);
const sitemap = read("sitemap-core.xml");
for (const route of ["/adverteren/", "/seizoensplaats-verhuren/"]) if (!sitemap.includes(`https://camping-kiezer.nl${route}`)) failures.push(`${route}: ontbreekt in sitemap`);
const health = JSON.parse(read("health.json"));
if (health.version < 119 || health.business_advertising_routes !== 3 || health.private_seasonal_ad_packages !== 3) failures.push("health.json meldt V119 niet");

console.log(JSON.stringify({ version: "V119", business_advertising_routes: 3, private_packages: 3, netlify_forms: 1, failures: failures.length, details: failures }, null, 2));
if (failures.length) process.exit(1);
