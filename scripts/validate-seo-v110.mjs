import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
const rel = (file) => path.relative(root, file).replaceAll('\\', '/');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const errors = [];
let headers = 0;
let claimHeaders = 0;
let queryLinks = 0;
let brokenOgImages = 0;
const missingAssets = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('class="site-header"')) {
    headers += 1;
    const count = (html.match(/data-v110-global-claim/g) || []).length;
    claimHeaders += count;
    if (count !== 1) errors.push(`${rel(file)} heeft ${count} V110-claimknoppen in de header`);
  }
  const cssVersion = html.match(/\/assets\/style\.css\?v=(\d+)/)?.[1];
  if (html.includes('/assets/style.css?') && (!cssVersion || Number(cssVersion) < 110)) errors.push(`${rel(file)} gebruikt CSS ouder dan v110`);
  const queries = html.match(/href="\/zoeken\?[^"#]+"/g) || [];
  queryLinks += queries.length;
  if (queries.length) errors.push(`${rel(file)} bevat nog ${queries.length} geblokkeerde zoeklink(s)`);
  const broken = html.match(/camp-3\.jpg/g) || [];
  brokenOgImages += broken.length;
  if (broken.length) errors.push(`${rel(file)} verwijst nog naar camp-3.jpg`);
  for (const match of html.matchAll(/(?:src|href|content)=["'](\/assets\/[^"'?#]+)(?:\?[^"']*)?["']/g)) {
    const assetPath = match[1].slice(1);
    if (!fs.existsSync(path.join(root, assetPath))) missingAssets.add(assetPath);
  }
}

const priority = ['camping-de-vossenburcht','vakantiepark-ackersate','kampeerdorp-de-zandstuve','recreatiepark-de-boshoek','rcn-zeewolde','molecaten-park-waterdunen','landal-rabbit-hill','ardoer-camping-t-noorder-sandt'];
const imageSources = new Set();
for (const slug of priority) {
  const file = `camping/${slug}/index.html`;
  const html = read(file);
  if (!html.includes(`data-v110-profile-visual="${slug}"`)) errors.push(`${file} mist profielbeeld`);
  const image = (html.match(/data-v110-profile-visual[^>]*>[\s\S]*?<img[^>]*src="([^"]+)/i) || [])[1];
  if (!image) errors.push(`${file} mist afbeeldingsbron`);
  else {
    if (imageSources.has(image)) errors.push(`${file} hergebruikt prioriteitsbeeld ${image}`);
    imageSources.add(image);
    if (image.startsWith('/assets/') && !fs.existsSync(path.join(root, image.slice(1)))) errors.push(`${file} mist lokaal beeld ${image}`);
  }
  for (const required of ['property="og:image"', 'name="twitter:image"', 'index,follow,max-image-preview:large', '/claim-uw-camping/?profiel=']) {
    if (!html.includes(required)) errors.push(`${file} mist ${required}`);
  }
}

const formExpectations = {
  'claim-uw-camping/index.html': ['name="camping-claim"', 'action="/bedankt.html"'],
  'contact.html': ['name="contact"', 'action="/bedankt"'],
  'voor-campings/index.html': ['name="camping-pakket-aanvraag"', 'action="/bedankt.html"'],
  'voor-ketens/index.html': ['name="keten-aanvraag"', 'action="/bedankt.html"'],
  'seizoensplaats-verhuren/index.html': ['name="particuliere-seizoensplaats"', 'action="/seizoensplaats-aangemeld/"'],
};
for (const [file, tokens] of Object.entries(formExpectations)) {
  const html = read(file);
  for (const token of ['method="POST"', 'data-netlify="true"', ...tokens]) if (!html.includes(token)) errors.push(`${file} mist ${token}`);
}

if (!read('robots.txt').includes('Disallow: /zoeken?')) errors.push('robots.txt moet queryresultaten blijven blokkeren');
if (!read('assets/style.css').includes('/* V110 */')) errors.push('CSS mist V110-stijlen');
if (!read('netlify.toml').includes('validate-seo-v110.mjs')) errors.push('Netlify-build mist V110-validator');
const compareScript = read('assets/compare-v73.js');
for (const token of ['campings-search-v74.json', 'compare-differences', 'compare-copy', 'data-remove-id', 'CampingCompare']) {
  if (!compareScript.includes(token)) errors.push(`Vergelijkfunctie mist ${token}`);
}
for (const asset of missingAssets) errors.push(`Intern asset ontbreekt: ${asset}`);

if (errors.length) {
  console.error(errors.slice(0, 200).join('\n'));
  if (errors.length > 200) console.error(`... en nog ${errors.length - 200} fouten`);
  process.exit(1);
}

const report = {
  version: 'V110',
  checked_at: '2026-08-27',
  html_files: htmlFiles.length,
  headers,
  header_claims: claimHeaders,
  blocked_query_links: queryLinks,
  broken_camp_3_jpg_references: brokenOgImages,
  priority_profiles_with_unique_images: imageSources.size,
  registered_netlify_forms_expected: Object.keys(formExpectations).length,
  missing_internal_assets: missingAssets.size,
  comparison_script_restored: true,
  status: 'passed',
};
fs.writeFileSync(path.join(root, 'CampingKiezer-V110-QA-2026-08-27.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
