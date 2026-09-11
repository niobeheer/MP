import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
const rel = (file) => path.relative(root, file).replaceAll('\\', '/');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);

const categoryRoutes = {
  camping: '/campings/',
  camperplaats: '/camperplaatsen/',
  glamping: '/glampings/',
  vakantiepark: '/vakantieparken/',
  bungalowpark: '/bungalowparken/',
};
const facilityRoutes = {
  animation: '/themas/animatie/',
  bike_rental: '/themas/fietsverhuur/',
  camper_service: '/camperplaatsen/',
  dogs_allowed: '/themas/huisdieren/',
  electricity: '/themas/stroom/',
  ev_charging: '/themas/laadpaal/',
  indoor_play: '/themas/binnenspeeltuin/',
  indoor_pool: '/themas/binnenzwembad/',
  natural_water: '/themas/zwemwater/',
  outdoor_pool: '/themas/buitenzwembad/',
  playground: '/themas/speeltuin/',
  pool: '/themas/zwembad/',
  private_sanitary: '/themas/prive-sanitair/',
  restaurant: '/themas/horeca/',
  sanitary: '/themas/sanitair/',
  shop: '/themas/supermarkt/',
  shower: '/themas/douche/',
  waterfront: '/themas/zwemwater/',
  wellness: '/themas/wellness/',
  wifi: '/themas/wifi/',
};
const audienceRoutes = {
  adults_only: '/themas/adults-only/',
  dogs: '/themas/huisdieren/',
  family: '/themas/speeltuin/',
  farm: '/themas/boerderijcampings/',
  nature: '/themas/natuurcampings/',
};
const stayRoutes = {
  camper: '/camperplaatsen/',
  chalet: '/themas/chalets/',
  glamping: '/themas/glamping/',
  holiday_home: '/themas/vakantiehuizen/',
  mobile_home: '/themas/stacaravans/',
  safari: '/themas/safaritenten/',
  season: '/themas/seizoenplaatsen/',
  trekkershut: '/themas/trekkershutten/',
};
const chainRoutes = Object.fromEntries(['Ardoer', 'Capfun', 'EuroParcs', 'Landal', 'Molecaten', 'Oostappen', 'RCN', 'Roompot', 'TopParken'].map((name) => [name.toLowerCase(), `/ketens/${name.toLowerCase()}/`]));
const provinceRoutes = Object.fromEntries(['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'Noord-Brabant', 'Noord-Holland', 'Overijssel', 'Utrecht', 'Zeeland', 'Zuid-Holland'].map((name) => [name.toLowerCase(), `/regios/${name.toLowerCase()}/`]));

function cleanSearchHref(rawHref) {
  const query = rawHref.slice('/zoeken?'.length).replaceAll('&amp;', '&');
  const params = new URLSearchParams(query);
  const destination = params.get('bestemming')?.toLowerCase();
  if (destination && provinceRoutes[destination]) return provinceRoutes[destination];
  const chain = params.get('q')?.toLowerCase();
  if (chain && chainRoutes[chain]) return chainRoutes[chain];
  const kind = params.get('kind');
  if (kind === 'Natuur') return '/themas/natuurcampings/';
  if (kind === 'Camping' || kind === 'Minicamping') return '/campings/';
  const category = params.get('category');
  const stay = params.get('stay');
  const facility = params.get('fac');
  const audience = params.get('aud');
  if (category === 'glamping') return '/themas/glamping/';
  if (params.get('com') === 'direct_booking') return '/boeken/';
  if (stay && stayRoutes[stay]) return stayRoutes[stay];
  if (facility && facilityRoutes[facility]) return facilityRoutes[facility];
  if (audience && audienceRoutes[audience]) return audienceRoutes[audience];
  if (category && categoryRoutes[category]) return categoryRoutes[category];
  throw new Error(`Geen schone route voor ${rawHref}`);
}

let headerClaimsAdded = 0;
let searchLinksReplaced = 0;
let ogImageRepairs = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = html.replace(/\/assets\/style\.css\?v=\d+/g, '/assets/style.css?v=110');
  const brokenOgMatches = html.match(/camp-3\.jpg/g) || [];
  ogImageRepairs += brokenOgMatches.length;
  html = html.replaceAll('camp-3.jpg', 'camp-3.webp');
  html = html.replace(/href="(\/zoeken\?[^"#]+)"/g, (match, href) => {
    searchLinksReplaced += 1;
    return `href="${cleanSearchHref(href)}"`;
  });
  if (html.includes('class="site-header"') && !html.includes('data-v110-global-claim')) {
    const menu = /<button\b(?=[^>]*\bclass="menu-btn")[^>]*>/;
    if (!menu.test(html)) throw new Error(`${rel(file)} heeft een header zonder menuknop`);
    const claim = '<a class="header-owner-link v78-global-claim" data-v110-global-claim href="/claim-uw-camping/" aria-label="Claim uw camping"><span>Claim uw camping</span></a>';
    html = html.replace(menu, (button) => `${claim}${button}`);
    headerClaimsAdded += 1;
  }
  if (html !== before) fs.writeFileSync(file, html);
}

const priorityProfiles = {
  'camping-de-vossenburcht': { image: 'camp-1.webp', width: 1200, height: 800, region: 'Overijssel' },
  'vakantiepark-ackersate': { image: 'camp-3.webp', width: 1200, height: 801, region: 'Gelderland' },
  'kampeerdorp-de-zandstuve': { image: 'theme-children.webp', width: 959, height: 540, region: 'Overijssel' },
  'recreatiepark-de-boshoek': { image: 'hero-glamping-v108.webp', width: 1400, height: 788, region: 'Gelderland' },
  'rcn-zeewolde': { image: 'hero-lake-v108.webp', width: 1400, height: 788, region: 'Flevoland' },
  'molecaten-park-waterdunen': { image: 'theme-water.webp', width: 959, height: 540, region: 'Zeeland' },
  'landal-rabbit-hill': { image: 'theme-nature.webp', width: 959, height: 540, region: 'Gelderland' },
  'ardoer-camping-t-noorder-sandt': { image: 'category-campings-v108.webp', width: 1279, height: 720, region: 'Noord-Holland' },
};

function upsertMeta(html, selector, tag) {
  if (selector.test(html)) return html.replace(selector, tag);
  return html.replace('</head>', `${tag}</head>`);
}

for (const [slug, data] of Object.entries(priorityProfiles)) {
  const file = `camping/${slug}/index.html`;
  let html = read(file);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  const description = (html.match(/<meta\b(?=[^>]*name="description")[^>]*content="([^"]+)/i) || [])[1];
  const canonical = (html.match(/<link\b(?=[^>]*rel="canonical")[^>]*href="([^"]+)/i) || [])[1];
  const h1 = (html.match(/<h1>([\s\S]*?)<\/h1>/i) || [])[1];
  if (!title || !description || !canonical || !h1) throw new Error(`${file} mist vereiste profielmetadata`);
  const imageUrl = `https://camping-kiezer.nl/assets/${data.image}`;
  html = html.replaceAll('Sfeerbeeld', 'Vakantiebeeld').replaceAll('sfeerbeeld', 'vakantiebeeld');
  html = upsertMeta(html, /<meta\b(?=[^>]*property="og:title")[^>]*>/i, `<meta property="og:title" content="${title}">`);
  html = upsertMeta(html, /<meta\b(?=[^>]*property="og:url")[^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  html = upsertMeta(html, /<meta\b(?=[^>]*property="og:image")[^>]*>/i, `<meta property="og:image" content="${imageUrl}">`);
  html = upsertMeta(html, /<meta\b(?=[^>]*name="twitter:title")[^>]*>/i, `<meta name="twitter:title" content="${title}">`);
  html = upsertMeta(html, /<meta\b(?=[^>]*name="twitter:description")[^>]*>/i, `<meta name="twitter:description" content="${description}">`);
  html = upsertMeta(html, /<meta\b(?=[^>]*name="twitter:image")[^>]*>/i, `<meta name="twitter:image" content="${imageUrl}">`);
  if (!html.includes(`\"image\":\"${imageUrl}\"`)) {
    html = html.replace(`\"url\":\"${canonical}\",\"description\"`, `\"url\":\"${canonical}\",\"image\":\"${imageUrl}\",\"description\"`);
  }
  if (!html.includes('data-v110-profile-visual')) {
    const heroStart = html.indexOf('<section class="page-hero">');
    const heroEnd = html.indexOf('</section>', heroStart);
    if (heroStart < 0 || heroEnd < 0) throw new Error(`${file} mist page hero`);
    const visual = `<section class="v110-profile-visual" data-v110-profile-visual="${slug}"><div class="container"><figure><img src="/assets/${data.image}" width="${data.width}" height="${data.height}" loading="eager" decoding="async" alt="Vakantiebeeld voor een campingvakantie bij ${h1}"><figcaption><strong>Vakantiebeeld voor ${h1}</strong><span>Bekijk de officiële aanbieder voor actuele foto’s en de precieze terreinindeling in ${data.region}.</span></figcaption></figure></div></section>`;
    html = `${html.slice(0, heroEnd + 10)}${visual}${html.slice(heroEnd + 10)}`;
  }
  write(file, html);
}

let css = read('assets/style.css');
if (!css.includes('/* V110 */')) {
  css += `\n/* V110 */\n.v110-profile-visual{background:#f4f8f5;padding:0 0 24px}.v110-profile-visual figure{background:#fff;border:1px solid #dbe7e0;border-radius:22px;box-shadow:0 18px 42px rgba(18,63,50,.12);display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);margin:0;overflow:hidden}.v110-profile-visual img{aspect-ratio:16/9;display:block;height:100%;max-height:410px;object-fit:cover;width:100%}.v110-profile-visual figcaption{align-self:center;color:#56695f;display:flex;flex-direction:column;font-size:.88rem;gap:9px;line-height:1.6;padding:30px}.v110-profile-visual figcaption strong{color:#173f35;font-size:1.15rem}.header-owner-link.v78-global-claim[data-v110-global-claim]{background:#f3b83f;border-color:#e0a31d;color:#173c31}.header-owner-link.v78-global-claim[data-v110-global-claim]:focus-visible{outline:3px solid #173f35;outline-offset:3px}@media(max-width:760px){.v110-profile-visual figure{grid-template-columns:1fr}.v110-profile-visual img{max-height:290px}.v110-profile-visual figcaption{padding:20px}}\n`;
  write('assets/style.css', css);
}

for (const sitemap of ['sitemap-campings.xml', 'sitemap.xml']) {
  if (!fs.existsSync(path.join(root, sitemap))) continue;
  let xml = read(sitemap);
  for (const slug of Object.keys(priorityProfiles)) {
    const url = `https://camping-kiezer.nl/camping/${slug}/`;
    const safe = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    xml = xml.replace(new RegExp(`(<loc>${safe}<\\/loc><lastmod>)[^<]+`), '$12026-08-27');
  }
  write(sitemap, xml);
}

let netlify = read('netlify.toml');
if (!netlify.includes('validate-seo-v110.mjs')) {
  netlify = netlify.replace('node scripts/validate-seo-v109.mjs', 'node scripts/validate-seo-v109.mjs && node scripts/validate-seo-v110.mjs');
  write('netlify.toml', netlify);
}

console.log(JSON.stringify({ html: htmlFiles.length, headerClaimsAdded, searchLinksReplaced, ogImageRepairs, priorityProfiles: Object.keys(priorityProfiles).length, status: 'upgraded' }, null, 2));
