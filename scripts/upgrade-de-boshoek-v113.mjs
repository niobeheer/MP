import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function update(relativePath, replacements) {
  const file = path.join(root, relativePath);
  let html = fs.readFileSync(file, 'utf8');

  for (const { from, to, expected = 1 } of replacements) {
    const count = html.split(from).length - 1;
    if (count === 0 && html.includes(to)) {
      continue;
    }
    if (count !== expected) {
      throw new Error(`${relativePath}: expected ${expected} occurrence(s), found ${count}: ${from.slice(0, 100)}`);
    }
    html = html.split(from).join(to);
  }

  fs.writeFileSync(file, html);
  console.log(`Updated ${relativePath}`);
}

const officialImage = 'https://cdn.bookingexperts.com/uploads/image/image/658152/cover_Safari_Villa_front10.jpg';

update('aanbieders/de-boshoek/index.html', [
  {
    from: '<meta name="description" content="Bekijk 68 actuele accommodaties en kampeermogelijkheden bij Recreatiepark De Boshoek.">',
    to: '<meta name="description" content="Ontdek 68 actuele verblijven bij het 5-sterren Recreatiepark De Boshoek op de Veluwe: kamperen, glamping, hotelkamers, chalets en groepsaccommodaties voor 2 tot 30 personen.">'
  },
  {
    from: '"description":"Bekijk 68 actuele accommodaties en kampeermogelijkheden bij Recreatiepark De Boshoek."',
    to: '"description":"Bekijk het actuele aanbod van het 5-sterren Recreatiepark De Boshoek op de Veluwe, met verblijven voor 2 tot 30 personen."'
  },
  {
    from: '<p>Bekijk 68 actuele accommodaties en kampeermogelijkheden bij Recreatiepark De Boshoek.</p>',
    to: '<p>Een 5-sterren recreatiepark op de Veluwe met kampeerplaatsen, glamping, hotelkamers, tiny houses, chalets en groepsaccommodaties voor 2 tot 30 personen.</p>'
  },
  {
    from: '</section><section class="section"><div class="container"><form class="provider-search" data-tradetracker-search>',
    to: `</section><section class="v110-profile-visual" data-v113-profile-visual="de-boshoek"><div class="container"><figure><img src="${officialImage}" width="1400" height="788" loading="eager" decoding="async" alt="Safariverblijf bij Recreatiepark De Boshoek op de Veluwe"><figcaption><strong>Recreatiepark De Boshoek op de Veluwe</strong><span>Officieel parkbeeld uit het actuele aanbod van De Boshoek.</span></figcaption></figure></div></section><section class="section"><div class="container"><section class="consumer-information" data-consumer-score="7"><h2>Voor ieder gezelschap een verblijf</h2><p>De Boshoek combineert kamperen, glamping, hotelverblijf en vakantiehuizen op één park in Voorthuizen.</p><div class="consumer-info-grid"><div class="consumer-info-card"><span>Verblijfstypen</span><strong>Kampeerplaatsen, safaritenten, trekkershutten, hotelkamers, tiny houses, chalets en groepsaccommodaties</strong><p>Van een kampeerplek tot een compleet vakantiehuis.</p></div><div class="consumer-info-card"><span>Gezelschappen</span><strong>Geschikt voor 2 tot 30 personen</strong><p>Voor stellen, gezinnen, families en grotere groepen.</p></div><div class="consumer-info-card"><span>Faciliteiten</span><strong>Zwembad, animatieteam, bowlingbaan, escape room en racelounge</strong><p>Met aanvullende speel-, horeca- en parkvoorzieningen.</p></div></div></section><form class="provider-search" data-tradetracker-search>`
  }
]);

update('camping/recreatiepark-de-boshoek/index.html', [
  {
    from: '<title>Recreatiepark De Boshoek in Voorthuizen | CampingKiezer</title>',
    to: '<title>Recreatiepark De Boshoek op de Veluwe | CampingKiezer</title>'
  },
  {
    from: 'Bekijk Recreatiepark De Boshoek in Voorthuizen: verblijfstypes, bekende voorzieningen, bronstatus en de officiële boekingsroute.',
    to: 'Bekijk het 5-sterren Recreatiepark De Boshoek op de Veluwe: kamperen, glamping, hotelkamers, chalets en groepsaccommodaties voor 2 tot 30 personen.',
    expected: 3
  },
  {
    from: '/assets/hero-glamping-v108.webp',
    to: officialImage,
    expected: 4
  },
  {
    from: `https://camping-kiezer.nl${officialImage}`,
    to: officialImage,
    expected: 3
  },
  {
    from: 'Gecontroleerde profielinformatie over Recreatiepark De Boshoek op CampingKiezer.',
    to: 'Actuele profielinformatie over het 5-sterren Recreatiepark De Boshoek op de Veluwe.'
  },
  {
    from: '"email":"info@deboshoek.nl"}',
    to: '"email":"info@deboshoek.nl","starRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"}}'
  },
  {
    from: 'Recreatiepark De Boshoek in Voorthuizen | CampingKiezer',
    to: 'Recreatiepark De Boshoek op de Veluwe | CampingKiezer',
    expected: 2
  },
  {
    from: '<p>Voorthuizen · Gelderland · Camping / kampeerbedrijf</p>',
    to: '<p>Voorthuizen · Gelderland · 5-sterren recreatiepark op de Veluwe</p>'
  },
  {
    from: '<a class="btn btn-outline" href="https://www.eurocampings.nl/nederland/gelderland/voorthuizen/recreatiepark-de-boshoek-118628/" rel="noopener" target="_blank">Geraadpleegde bron →</a>',
    to: '<a class="btn btn-outline" href="https://www.deboshoek.nl/" rel="noopener" target="_blank">Officiële website →</a>'
  },
  {
    from: '<img src="https://cdn.bookingexperts.com/uploads/image/image/658152/cover_Safari_Villa_front10.jpg" width="1400" height="788" loading="eager" decoding="async" alt="Vakantiebeeld voor een campingvakantie bij Recreatiepark De Boshoek"><figcaption><strong>Vakantiebeeld voor Recreatiepark De Boshoek</strong><span>Bekijk de officiële aanbieder voor actuele foto’s en de precieze terreinindeling in Gelderland.</span></figcaption>',
    to: `<img src="${officialImage}" width="1400" height="788" loading="eager" decoding="async" alt="Safariverblijf bij het 5-sterren Recreatiepark De Boshoek op de Veluwe"><figcaption><strong>Officieel beeld van Recreatiepark De Boshoek</strong><span>Een van de verblijven uit het actuele aanbod van het park in Voorthuizen.</span></figcaption>`
  },
  {
    from: '<p>Bekijk de beschikbare locatie-, verblijf- en contactgegevens. Onbekende informatie laten we bewust leeg.</p>',
    to: '<p>De Boshoek biedt kamperen, glamping, hotelverblijf en vakantiehuizen op één 5-sterren park, voor gezelschappen van 2 tot 30 personen.</p>'
  },
  {
    from: 'Kampeerplaats, Privé-sanitairplaats, Camperplaats, Tent, Caravan, Safaritent, Chalet, Trekkershut, Vakantiehuis',
    to: 'Kampeerplaats, Privé-sanitairplaats, Camperplaats, Safaritent, Trekkershut, Hotelkamer, Tiny house, Chalet, Vakantiehuis, Groepsaccommodatie'
  },
  {
    from: 'Binnenzwembad, Buitenzwembad, Speeltuin, Animatieteam, Restaurant, Privé sanitair, Sanitairgebouw, Vaatwasser, Wifi, Hond welkom, Wateraansluiting, 8A stroom, Fietsverhuur, Midgetgolf, Zwembad, Kinderactiviteiten, Broodservice, Winkel',
    to: 'Binnenzwembad, Buitenzwembad, Speeltuin, Animatieteam, Restaurant, Privé sanitair, Sanitairgebouw, Vaatwasser, Wifi, Hond welkom, Wateraansluiting, 8A stroom, Fietsverhuur, Midgetgolf, Bowlingbaan, Escape room, Racelounge, Kinderactiviteiten, Broodservice, Winkel'
  },
  {
    from: '<strong>Bron:</strong> <a href="https://www.eurocampings.nl/nederland/gelderland/voorthuizen/recreatiepark-de-boshoek-118628/" rel="noopener" target="_blank">ACSI Eurocampings — jaarlijks geïnspecteerde actuele campingregistratie</a>',
    to: '<strong>Bron:</strong> <a href="https://www.deboshoek.nl/" rel="noopener" target="_blank">Recreatiepark De Boshoek — officiële website en rechtstreeks aangeleverde parkgegevens</a>'
  },
  {
    from: '2026-08-25',
    to: '2026-08-28'
  },
  {
    from: '25-08-2026',
    to: '28-08-2026'
  },
  {
    from: '<strong>Officiële website of vakregister gecontroleerd</strong>',
    to: '<strong>Officiële website en rechtstreeks aangeleverde parkgegevens gecontroleerd</strong>'
  },
  {
    from: '<a href="https://www.deboshoek.nl/kamperen" rel="nofollow noopener" target="_blank">Officiële website bekijken →</a>',
    to: '<a href="https://www.deboshoek.nl/" rel="nofollow noopener" target="_blank">Officiële website bekijken →</a>'
  },
  {
    from: '<a class="btn btn-brand" href="https://www.deboshoek.nl/camping-in-het-bos" target="_blank" rel="nofollow noopener" data-revenue-event="booking-outbound" data-placement="profile" data-camping="Recreatiepark De Boshoek">Beschikbaarheid bekijken →</a>',
    to: '<a class="btn btn-brand" href="/aanbieders/de-boshoek/" data-provider="de-boshoek" data-placement="profile-de-boshoek-v113">Bekijk 68 actuele verblijven →</a>'
  }
]);

for (const relativePath of ['index.html', 'onze-keuzes/index.html']) {
  update(relativePath, [
    {
      from: 'alt="Vakantiepark en safariverblijven op de Veluwe via Recreatiepark De Boshoek"',
      to: 'alt="5-sterren Recreatiepark De Boshoek op de Veluwe"'
    },
    {
      from: '<h3>Vakantiepark en safariverblijven op de Veluwe</h3><p>Bekijk vakantiehuizen, groepsverblijven, safaritenten en kampeermogelijkheden in Voorthuizen.</p>',
      to: '<h3>5-sterren recreatiepark op de Veluwe</h3><p>Kamperen, glamping, hotelkamers, chalets en groepsverblijven voor 2 tot 30 personen.</p>'
    }
  ]);
}

update('aanbieders/index.html', [
  {
    from: '<p>Bekijk 68 accommodaties en kampeermogelijkheden op de Veluwe.</p>',
    to: '<p>Bekijk 68 verblijven bij dit 5-sterren recreatiepark op de Veluwe, voor 2 tot 30 personen.</p>'
  }
]);

for (const relativePath of ['sitemap-core.xml', 'sitemap-vakantieparken.xml']) {
  const file = path.join(root, relativePath);
  let xml = fs.readFileSync(file, 'utf8');
  xml = xml.replace(
    /(<loc>https:\/\/camping-kiezer\.nl\/(?:aanbieders\/de-boshoek|camping\/recreatiepark-de-boshoek)\/<\/loc><lastmod>)\d{4}-\d{2}-\d{2}(<\/lastmod>)/,
    '$12026-08-28$2'
  );
  fs.writeFileSync(file, xml);
  console.log(`Updated ${relativePath}`);
}

console.log('De Boshoek v113 upgrade complete.');
