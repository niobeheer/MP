import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const rel = (file) => path.relative(root, file).replaceAll('\\', '/');
const errors = [];

const home = read('index.html');
for (const blocked of ['/zoeken?fac=waterfront', '/zoeken?aud=family', '/zoeken?fac=private_sanitary', '/zoeken?aud=dogs', '/zoeken?kind=Natuur', '/zoeken?aud=adults_only', '/zoeken?prov=']) {
  if (home.includes(`href="${blocked}`)) errors.push(`Homepage bevat nog geblokkeerde SEO-link: ${blocked}`);
}
for (const required of ['/regios/gelderland/', '/themas/zwembad/', '/themas/prive-sanitair/', '/themas/adults-only/', '/ketens/europarcs/', 'data-v109-priority-profiles', '/assets/hero-camping-family-v108.webp']) {
  if (!home.includes(required)) errors.push(`Homepage mist: ${required}`);
}

const intentionalIndex = ['regios/nederland/index.html', 'themas/adults-only/index.html'];
for (const file of intentionalIndex) {
  const html = read(file);
  if (!html.includes('index,follow,max-image-preview:large')) errors.push(`${file} is niet indexeerbaar`);
  if (/noindex/i.test((html.match(/<meta\b(?=[^>]*name=["']robots["'])[^>]*content=["']([^"']+)/i) || [])[1] || '')) errors.push(`${file} bevat nog noindex`);
}

for (const file of ['ketens/oostappen/index.html', 'ketens/topparken/index.html', 'regios/flevoland/stroom/index.html', 'regios/friesland/trekkershutten/index.html', 'regios/limburg/glamping/index.html']) {
  if (!read(file).includes('noindex,follow')) errors.push(`${file} had als dunne pagina noindex moeten houden`);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('/assets/style.css?v=98')) errors.push(`${rel(file)} gebruikt oude CSS-versie`);
  if (html.includes('Eigenaar? Claim uw camping')) errors.push(`${rel(file)} bevat nog claimlink in bovenbalk`);
  if (html.includes('class="v80-header-actions"')) errors.push(`${rel(file)} bevat nog commerciële headeractie`);
}

const sitemapFiles = walk(root).filter((file) => /^sitemap.*\.xml$/.test(path.basename(file)));
const sitemapXml = sitemapFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const url of ['https://camping-kiezer.nl/regios/nederland/', 'https://camping-kiezer.nl/themas/adults-only/']) {
  if (!sitemapXml.includes(`<loc>${url}</loc>`)) errors.push(`Sitemap mist ${url}`);
}
const noindexUrls = new Set();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const robots = (html.match(/<meta\b(?=[^>]*name=["']robots["'])[^>]*content=["']([^"']+)/i) || [])[1] || '';
  const relative = rel(file);
  const pathname = relative.endsWith('/index.html') ? `/${relative.slice(0, -'index.html'.length)}` : `/${relative.replace(/\.html$/, '')}`;
  if (/noindex/i.test(robots)) noindexUrls.add(`https://camping-kiezer.nl${pathname}`);
}
for (const url of noindexUrls) if (sitemapXml.includes(`<loc>${url}</loc>`)) errors.push(`Noindex-URL staat in sitemap: ${url}`);

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const robots = (html.match(/<meta\b(?=[^>]*name=["']robots["'])[^>]*content=["']([^"']+)/i) || [])[1] || '';
  if (/noindex/i.test(robots)) continue;
  const fields = [
    [titles, (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ''],
    [descriptions, (html.match(/<meta\b(?=[^>]*name=["']description["'])[^>]*content=["']([^"']+)/i) || [])[1] || ''],
    [canonicals, (html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)/i) || [])[1] || ''],
  ];
  for (const [map, value] of fields) {
    if (!value) errors.push(`${rel(file)} mist metadata`);
    else map.set(value, [...(map.get(value) || []), rel(file)]);
  }
}
for (const [label, map] of [['title', titles], ['description', descriptions], ['canonical', canonicals]]) {
  for (const [value, files] of map) if (files.length > 1) errors.push(`Dubbele ${label}: ${value} (${files.slice(0, 4).join(', ')})`);
}

for (const file of ['index.html', 'regios/nederland/index.html', 'themas/adults-only/index.html', 'kennisbank/index.html']) {
  const html = read(file);
  if (!html.includes('v109')) errors.push(`${file} mist V109-content`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({ html: htmlFiles.length, noindex: noindexUrls.size, sitemapFiles: sitemapFiles.length, duplicateTitles: 0, duplicateDescriptions: 0, duplicateCanonicals: 0, status: 'passed' }, null, 2));
