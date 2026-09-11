import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const themesRoot = path.join(root, "themas");
const stylesheet = '<link rel="stylesheet" href="/assets/theme-facility-filter-v118.css">';
const script = '<script src="/assets/theme-facility-filter-v118.js" defer></script>';
let updated = 0;

for (const entry of fs.readdirSync(themesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(themesRoot, entry.name, "index.html");
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('class="commerce-grid"')) continue;
  if (!html.includes(stylesheet)) html = html.replace("</head>", `${stylesheet}</head>`);
  if (!html.includes(script)) html = html.replace("</body>", `${script}</body>`);
  fs.writeFileSync(file, html);
  updated += 1;
}

console.log(JSON.stringify({ version: "V118", theme_pages_with_facility_filter: updated }, null, 2));
