import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets/style.css'), 'utf8');
const health = JSON.parse(fs.readFileSync(path.join(root, 'health.json'), 'utf8'));
const forbiddenWord = 'sfeer' + 'beeld';
const errors = [];

const expectedProviders = [
  'farmcamps', 'europarcs', 'de-vossenburcht', 'gusto-camp', 'allcamps',
  'bungalow-net', 'ackersate', 'zandstuve', 'ardoer', 'suncamp',
  'acsi-reizen', 'vipio', 'campings-com', 'vodatent', 'tendi',
  'acsi-eurocampings', 'de-boshoek'
];

const homeProviders = [...homepage.matchAll(/data-v108-feed-choice="([^"]+)"/g)].map(match => match[1]);
if (homeProviders.length !== 17) errors.push(`Homepage heeft ${homeProviders.length} keuze-kaarten in plaats van 17.`);
for (const provider of expectedProviders) {
  if (!homeProviders.includes(provider)) errors.push(`Homepage mist feedaanbieder ${provider}.`);
}

const assets = [
  'hero-camping-family-v108.webp', 'hero-arrival-v108.webp', 'hero-lake-v108.webp', 'hero-glamping-v108.webp',
  'category-campings-v108.webp', 'category-bungalowparken-v108.webp', 'category-camperplaatsen-v108.webp',
  'category-glamping-v108.webp', 'category-vakantieparken-v108.webp',
  'theme-water.webp', 'theme-children.webp', 'theme-private-sanitary.webp', 'theme-dog.webp', 'theme-nature.webp', 'theme-quiet.webp',
  'need-pool.webp', 'need-private-sanitary.webp', 'need-adults-only.webp', 'need-animation.webp', 'need-pets.webp', 'need-horeca.webp',
  'need-camper.webp', 'need-glamping.webp', 'need-naturecamp.webp', 'need-ev.webp', 'need-playground.webp', 'need-wellness.webp'
];

for (const asset of assets) {
  const assetPath = path.join(root, 'assets', asset);
  if (!fs.existsSync(assetPath)) {
    errors.push(`Beeld ontbreekt: ${asset}`);
    continue;
  }
  if (fs.statSync(assetPath).size < 50_000) errors.push(`Beeld is onverwacht klein: ${asset}`);
}

for (const asset of assets.filter(name => name !== 'hero-camping-family-v108.webp')) {
  if (!homepage.includes(`/assets/${asset}`)) errors.push(`Homepage verwijst niet naar ${asset}.`);
}
if (!styles.includes("url('/assets/hero-camping-family-v108.webp')")) errors.push('Hero-achtergrond ontbreekt in de stylesheet.');
if (!homepage.includes('data-v108-feed-choice="vipio"><a class="affiliate-feature-image" href="/aanbieders/vipio/"><img src="/assets/hero-glamping-v108.webp"')) {
  errors.push('Vipio gebruikt niet de betrouwbare lokale glampingfoto.');
}
if (homepage.includes('class="image-note"')) errors.push('Oud fotolabel staat nog op de homepage.');
if (health.version < 108 || health.homepage_choice_providers !== 17 || health.new_photorealistic_images !== 27) {
  errors.push('health.json bevat niet de verwachte V108-controlewaarden.');
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(?:html|json)$/i.test(entry.name)) {
      const contentWithoutUrls = fs.readFileSync(fullPath, 'utf8').replace(/https?:\/\/[^\s"'<>]+/gi, '');
      if (contentWithoutUrls.toLowerCase().includes(forbiddenWord)) {
        errors.push(`Oud fotowoord staat nog in ${path.relative(root, fullPath)}.`);
      }
    }
  }
}
walk(root);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('V108 OK: 17 homepagekeuzes, 27 zonnige beelden, hero-achtergrond en opgeschoonde fotolabels.');
