import fs from 'node:fs';

const homepagePath = new URL('../index.html', import.meta.url);
const choicesPath = new URL('../onze-keuzes/index.html', import.meta.url);

let homepage = fs.readFileSync(homepagePath, 'utf8');
const choices = fs.readFileSync(choicesPath, 'utf8');

const choicesGrid = choices.match(/<div class="affiliate-feature-grid">([\s\S]*?)<\/div><p class="affiliate-home-note">/);
if (!choicesGrid) throw new Error('Kon de 17 kaarten op /onze-keuzes/ niet uitlezen.');

const homepageChoices = `<section class="section affiliate-home-section v108-home-choices" id="onze-keuzes">
<div class="container">
<div class="section-head">
<div>
<div class="eyebrow">Gekozen door CampingKiezer</div>
<h2>Onze keuzes van dit moment</h2>
<p>Zeventien aanbieders met actueel doorzoekbaar aanbod voor campings, glamping, vakantieparken, bijzondere verblijven en kampeerreizen.</p>
</div>
<a class="btn btn-outline" href="/onze-keuzes/">Bekijk onze keuzes per vakantiewens →</a>
</div>
<div class="affiliate-feature-grid">${choicesGrid[1]}</div>
<p class="affiliate-home-note">Prijzen en beschikbaarheid kunnen wijzigen. Controleer altijd de actuele eindsom en voorwaarden bij de aanbieder.</p>
</div>
</section>`;

homepage = homepage.replace(
  /<section class="section affiliate-home-section" id="onze-keuzes">[\s\S]*?<\/section>(?=\s*<section class="v74-count-section")/,
  homepageChoices
);

const replacements = new Map([
  ['/assets/camp-3.webp" width="1200" height="801" alt="Kamperen in het groen"', '/assets/hero-arrival-v108.webp" width="1400" height="788" alt="Een gezin arriveert op een zonnige familiecamping"'],
  ['/assets/camp-6.webp" width="801" height="1200" alt="Vakantie aan het water"', '/assets/hero-lake-v108.webp" width="1400" height="788" alt="Kinderen spelen aan het water op een zonnige camping"'],
  ['/assets/camp-2.webp" width="800" height="1200" alt="Kamperen in de natuur"', '/assets/hero-glamping-v108.webp" width="1400" height="788" alt="Een zonnige glampingplek tussen volwassen bomen"'],
  ['/assets/camp-2.webp" width="800" height="1200" alt="Kamperen in Nederland"', '/assets/category-campings-v108.webp" width="1279" height="720" alt="Gezin kampeert op een zonnige groene camping"'],
  ['/assets/camp-6.webp" width="801" height="1200" alt="Comfortabel verblijf in de natuur"', '/assets/category-bungalowparken-v108.webp" width="1279" height="720" alt="Zonnig bungalowpark met vakantiehuizen in het groen"'],
  ['/assets/camp-5.webp" width="1200" height="800" alt="Campervakantie"', '/assets/category-camperplaatsen-v108.webp" width="1279" height="720" alt="Camper op een ruime zonnige camperplaats"'],
  ['/assets/camp-4.webp" width="800" height="1200" alt="Glamping in Nederland"', '/assets/category-glamping-v108.webp" width="1279" height="720" alt="Verzorgde safaritent op een zonnige glamping"'],
  ['/assets/camp-1.webp" width="1200" height="800" alt="Vakantiepark in Nederland"', '/assets/category-vakantieparken-v108.webp" width="1279" height="720" alt="Gezinsvakantie op een zonnig vakantiepark"']
]);

for (const [from, to] of replacements) {
  if (!homepage.includes(from)) throw new Error(`Verwachte beeldverwijzing ontbreekt: ${from}`);
  homepage = homepage.replace(from, to);
}

homepage = homepage
  .replace(/\s*<span class="image-note">Campingfoto<\/span>/gi, '')
  .replaceAll('/assets/theme-water.webp"', '/assets/theme-water.webp?v=108"')
  .replaceAll('/assets/theme-children.webp"', '/assets/theme-children.webp?v=108"')
  .replaceAll('/assets/theme-private-sanitary.webp"', '/assets/theme-private-sanitary.webp?v=108"')
  .replaceAll('/assets/theme-dog.webp"', '/assets/theme-dog.webp?v=108"')
  .replaceAll('/assets/theme-nature.webp"', '/assets/theme-nature.webp?v=108"')
  .replaceAll('/assets/theme-quiet.webp"', '/assets/theme-quiet.webp?v=108"')
  .replace(/\/assets\/(need-[a-z-]+\.webp)"/g, '/assets/$1?v=108"')
  .replace('/assets/style.css?v=107', '/assets/style.css?v=108');

fs.writeFileSync(homepagePath, homepage);
console.log('V108-homepage bijgewerkt met 17 keuzes en 27 nieuwe beeldverwijzingen.');
