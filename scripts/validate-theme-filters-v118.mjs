import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const themesRoot = path.join(root, "themas");
const health = JSON.parse(fs.readFileSync(path.join(root, "health.json"), "utf8"));
const failures = [];
let pages = 0;

for (const entry of fs.readdirSync(themesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const relative = `themas/${entry.name}/index.html`;
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes('class="commerce-grid"')) continue;
  pages += 1;
  if (!html.includes('/assets/theme-facility-filter-v118.css')) failures.push(`${relative}: filterstijl ontbreekt`);
  if (!html.includes('/assets/theme-facility-filter-v118.js')) failures.push(`${relative}: filterscript ontbreekt`);
}

if (pages !== 29) failures.push(`Verwacht 29 filterbare themapagina's, gevonden ${pages}`);
if (health.version < 118 || health.filterable_theme_pages !== 29) failures.push("health.json meldt de V118-faciliteitenfilters niet");
for (const asset of ["assets/theme-facility-filter-v118.css", "assets/theme-facility-filter-v118.js"]) {
  if (!fs.existsSync(path.join(root, asset))) failures.push(`${asset}: ontbreekt`);
}

console.log(JSON.stringify({ version: "V118", filterable_theme_pages: pages, failures: failures.length, details: failures }, null, 2));
if (failures.length) process.exit(1);
