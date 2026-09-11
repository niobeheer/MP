import fs from "node:fs";
import path from "node:path";
import partnerLink from "../netlify/functions/partner-link.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const htmlFiles = [];
const walk = directory => {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
};
walk(root);

const hrefs = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/href=["']([^"']*\/\.netlify\/functions\/partner-link\?provider=allcamps[^"']*)["']/gi)) {
    hrefs.push(match[1].replaceAll("&amp;", "&"));
  }
}

const failures = [];
const destinations = new Set();
for (const href of hrefs) {
  const requestUrl = new URL(href, "https://camping-kiezer.nl/");
  const destination = requestUrl.searchParams.get("url") || "";
  destinations.add(destination);
  const response = await partnerLink(new Request(requestUrl));
  const body = await response.text();
  if (response.status !== 200) failures.push({href, reason: `status ${response.status}`});
  if (response.headers.has("location")) failures.push({href, reason: "HTTP redirect mag geen querystring doorgeven"});
  if (!body.includes("location.replace(") || !body.includes("Ga verder naar Allcamps")) {
    failures.push({href, reason: "veilige browser-doorstuurpagina ontbreekt"});
  }
  if (!destination.startsWith("https://www.allcamps.nl/") && !destination.startsWith("https://allcamps.nl/")) {
    failures.push({href, reason: "ongeldige Allcamps-bestemming"});
  }
}

if (!hrefs.length) failures.push({reason: "geen Allcamps-links gevonden"});
console.log(JSON.stringify({allcamps_links: hrefs.length, unique_destinations: destinations.size, failures: failures.length, details: failures}, null, 2));
if (failures.length) process.exit(1);
