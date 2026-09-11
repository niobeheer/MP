import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);

function replaceRequired(value, pattern, replacement, label) {
  if (!pattern.test(value)) throw new Error(`Niet gevonden: ${label}`);
  pattern.lastIndex = 0;
  return value.replace(pattern, replacement);
}

function updateMeta(file, { title, description, robots, image }) {
  let html = read(file);
  if (title) html = replaceRequired(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`, `${file} title`);
  if (description) {
    html = replaceRequired(
      html,
      /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
      `<meta name="description" content="${description}">`,
      `${file} description`,
    );
  }
  if (robots) {
    html = replaceRequired(
      html,
      /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i,
      `<meta name="robots" content="${robots}">`,
      `${file} robots`,
    );
  }
  if (title) {
    if (/<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i.test(html)) {
      html = html.replace(/<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i, `<meta property="og:title" content="${title}">`);
    } else {
      html = html.replace('</head>', `<meta property="og:title" content="${title}"></head>`);
    }
  }
  if (description) {
    if (/<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i.test(html)) {
      html = html.replace(/<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i, `<meta property="og:description" content="${description}">`);
    } else {
      html = html.replace('</head>', `<meta property="og:description" content="${description}"></head>`);
    }
  }
  if (image) {
    const imageUrl = `https://camping-kiezer.nl/assets/${image}`;
    if (/<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/i.test(html)) {
      html = html.replace(/<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/i, `<meta property="og:image" content="${imageUrl}">`);
    } else {
      html = html.replace('</head>', `<meta property="og:image" content="${imageUrl}"></head>`);
    }
  }
  if (!/<meta\b(?=[^>]*\bproperty=["']og:type["'])[^>]*>/i.test(html)) html = html.replace('</head>', '<meta property="og:type" content="website"></head>');
  if (!/<meta\b(?=[^>]*\bname=["']twitter:card["'])[^>]*>/i.test(html)) html = html.replace('</head>', '<meta name="twitter:card" content="summary_large_image"></head>');
  write(file, html);
}

function injectBeforeMainEnd(file, marker, section) {
  let html = read(file);
  if (html.includes(marker)) return;
  html = replaceRequired(html, /<\/main>/i, `${section}</main>`, `${file} </main>`);
  write(file, html);
}

function xmlAddUrl(file, url) {
  let xml = read(file);
  if (xml.includes(`<loc>${url}</loc>`)) {
    xml = xml.replace(new RegExp(`(<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc><lastmod>)[^<]+`), '$12026-08-27');
  } else {
    xml = replaceRequired(xml, /<\/urlset>/, `<url><loc>${url}</loc><lastmod>2026-08-27</lastmod></url></urlset>`, `${file} urlset`);
  }
  write(file, xml);
}

function updateSitemapLastmod(file, urls) {
  let xml = read(file);
  for (const url of urls) {
    const safe = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(<loc>${safe}<\\/loc><lastmod>)[^<]+`);
    if (re.test(xml)) xml = xml.replace(re, '$12026-08-27');
  }
  write(file, xml);
}

const provinces = {
  drenthe: {
    name: 'Drenthe', image: 'theme-nature.webp', count: 155,
    description: 'Vergelijk campings in Drenthe op plaats, verblijfstype, voorzieningen en officiële boekingsroute. Bekijk gecontroleerde CampingKiezer-profielen.',
    lead: 'Drenthe past bij vakantiegangers die ruimte, bos en heide willen combineren met dorpen en uitstapjes. Kijk niet alleen naar de plaatsnaam: de afstand tot natuur, zwemwater en dagelijkse voorzieningen kan per camping sterk verschillen.',
    checks: ['Bepaal of je een rustige natuurplek of juist een familiecamping zoekt.', 'Controleer verblijfstype, stroom, sanitair en huisregels in het profiel.', 'Open de officiële aanbieder voor actuele beschikbaarheid en de volledige eindsom.'],
    links: [['Natuurcampings', '/themas/natuurcampings/'], ['Campings met camperplaatsen', '/themas/camperplaatsen/'], ['Campings met speeltuin', '/themas/speeltuin/']],
  },
  flevoland: {
    name: 'Flevoland', image: 'theme-water.webp', count: 19,
    description: 'Vergelijk campings in Flevoland bij water, natuur en jonge landschappen. Bekijk voorzieningen, verblijfstypes en boekingsroutes per locatie.',
    lead: 'Flevoland combineert open landschap, bossen en veel recreatie rond het water. Let bij het vergelijken op de precieze ligging: een camping bij een meer vraagt om andere keuzes dan een plek dichter bij stad, polder of natuurgebied.',
    checks: ['Controleer of water daadwerkelijk vanaf het terrein bereikbaar is.', 'Vergelijk windbeschutting, schaduw en het type ondergrond van de kampeerplek.', 'Bekijk of stroom en campervoorzieningen expliciet in de bron zijn bevestigd.'],
    links: [['Campings bij zwemwater', '/themas/zwemwater/'], ['Campings met stroom', '/regios/flevoland/stroom/'], ['Camperplaatsen', '/camperplaatsen/']],
  },
  friesland: {
    name: 'Friesland', image: 'hero-lake-v108.webp', count: 440,
    description: 'Vergelijk campings in Friesland bij meren, dorpen en de Waddenkust. Bekijk 440 profielen met bekende voorzieningen en aanbiederroute.',
    lead: 'In Friesland verschillen campings rond meren, in het binnenland en richting de Waddenkust duidelijk van karakter. Bepaal vooraf of varen en zwemwater belangrijker zijn dan rust, fietsafstand of een centrale uitvalsbasis.',
    checks: ['Controleer afstand tot steiger, strand of zwemwater op de officiële kaart.', 'Bekijk regels voor boten, huisdieren en laat aankomen vóór je boekt.', 'Vergelijk kampeerplaatsen, trekkershutten en campermogelijkheden afzonderlijk.'],
    links: [['Campings bij zwemwater', '/themas/zwemwater/'], ['Trekkershutten in Friesland', '/regios/friesland/trekkershutten/'], ['Campings met fietsverhuur', '/themas/fietsverhuur/']],
  },
  gelderland: {
    name: 'Gelderland', image: 'category-campings-v108.webp', count: 522,
    description: 'Vergelijk campings in Gelderland op de Veluwe, in de Achterhoek en het rivierengebied. Bekijk voorzieningen en gecontroleerde profielen.',
    lead: 'Gelderland biedt zeer verschillende vakantieomgevingen: van bos en heide op de Veluwe tot coulisselandschap in de Achterhoek en campings rond de rivieren. Gebruik daarom regio, verblijfstype en voorzieningen samen in je keuze.',
    checks: ['Kies eerst het landschap en de gewenste reisafstand binnen de provincie.', 'Controleer zwembad, animatie en horeca afzonderlijk; een algemene familielabel is niet genoeg.', 'Vergelijk de aanbiederroute en bijkomende kosten voor exact dezelfde reisperiode.'],
    links: [['Natuurcampings', '/themas/natuurcampings/'], ['Campings met zwembad', '/themas/zwembad/'], ['Glamping', '/themas/glamping/']],
  },
  groningen: {
    name: 'Groningen', image: 'theme-quiet.webp', count: 140,
    description: 'Vergelijk campings in Groningen op rust, landschap, voorzieningen en ligging. Bekijk gecontroleerde profielen en officiële boekingsroutes.',
    lead: 'Groningen is geschikt voor wie open landschap, rust en kleinschalige plaatsen zoekt, maar ook de stad of de Waddenkust wil kunnen bezoeken. Afstanden en het voorzieningenaanbod verdienen daardoor extra aandacht.',
    checks: ['Bekijk de afstand tot boodschappen en horeca, vooral bij kleinschalige plekken.', 'Controleer fietsverhuur, stroom en sanitair als die voor je reis noodzakelijk zijn.', 'Gebruik de officiële aanbieder voor actuele aankomstregels en beschikbaarheid.'],
    links: [['Boerderijcampings', '/themas/boerderijcampings/'], ['Campings met fietsverhuur', '/themas/fietsverhuur/'], ['Campings met stroom', '/themas/stroom/']],
  },
  limburg: {
    name: 'Limburg', image: 'category-glamping-v108.webp', count: 339,
    description: 'Vergelijk campings in Limburg op landschap, glamping, voorzieningen en boekingsmogelijkheden. Bekijk 339 gecontroleerde locatieprofielen.',
    lead: 'In Limburg lopen het Maasland, bosgebieden en het heuvelachtige zuiden in elkaar over. Voor wandelaars, fietsers en gezinnen maakt de exacte ligging veel verschil, net als het niveauverschil op of rond het terrein.',
    checks: ['Controleer of een glooiend terrein past bij tent, caravan of mobiliteit.', 'Vergelijk glamping en traditionele kampeerplaatsen als afzonderlijke verblijfstypes.', 'Bekijk toeristenbelasting, schoonmaakkosten en verplichte extra’s in de eindsom.'],
    links: [['Glamping in Limburg', '/regios/limburg/glamping/'], ['Campings met horeca', '/themas/horeca/'], ['Campings met zwembad', '/themas/zwembad/']],
  },
  'noord-brabant': {
    name: 'Noord-Brabant', image: 'theme-children.webp', count: 509,
    description: 'Vergelijk campings in Noord-Brabant voor gezinnen, natuur en weekendverblijven. Bekijk voorzieningen, ligging en boekingsroutes.',
    lead: 'Noord-Brabant combineert bosgebieden, dorpen en veel gezinsgerichte verblijven. Wie met kinderen reist, kan beter concrete kenmerken vergelijken dan alleen afgaan op het woord kindvriendelijk.',
    checks: ['Controleer speeltuin, zwembad en animatie elk als los kenmerk.', 'Let op leeftijdsgroepen, openingstijden en seizoensgebonden activiteiten.', 'Bekijk de afstand tot uitstapjes én de rust op het terrein zelf.'],
    links: [['Campings met speeltuin', '/themas/speeltuin/'], ['Campings met animatie', '/themas/animatie/'], ['Boerderijcampings', '/themas/boerderijcampings/']],
  },
  'noord-holland': {
    name: 'Noord-Holland', image: 'hero-arrival-v108.webp', count: 385,
    description: 'Vergelijk campings in Noord-Holland aan kust, duinen, meren en nabij steden. Bekijk gecontroleerde voorzieningen en boekingsroutes.',
    lead: 'Noord-Holland loopt van kust en duinen tot meren, polders en stedelijke regio’s. De gewenste vakantie bepaalt daarom of je vooral naar strandafstand, openbaar vervoer, fietsbereik of rust moet kijken.',
    checks: ['Controleer de echte afstand tot strand of zwemwater, niet alleen de regiobenaming.', 'Bekijk parkeerregels en bereikbaarheid bij campings nabij populaire kustplaatsen.', 'Vergelijk huisdierenregels en minimumverblijf vóór je een periode kiest.'],
    links: [['Campings bij zwemwater', '/themas/zwemwater/'], ['Campings met fietsverhuur', '/themas/fietsverhuur/'], ['Hondvriendelijke campings', '/themas/huisdieren/']],
  },
  overijssel: {
    name: 'Overijssel', image: 'need-playground.webp', count: 462,
    description: 'Vergelijk campings in Overijssel in Twente, Salland en het Vechtdal. Bekijk voorzieningen, verblijfstypes en officiële routes.',
    lead: 'Overijssel biedt bos, landgoederen, rivierlandschap en veel familiecampings. Bepaal of je een actieve gezinsvakantie, een rustige natuurplek of juist een verblijf met veel voorzieningen zoekt.',
    checks: ['Vergelijk animatie en speeltuinen op leeftijd en periode.', 'Controleer of de plek geschikt is voor tent, caravan, camper of accommodatie.', 'Open de officiële route voor actuele prijzen, beschikbaarheid en voorwaarden.'],
    links: [['Campings met animatie', '/themas/animatie/'], ['Campings met speeltuin', '/themas/speeltuin/'], ['Natuurcampings', '/themas/natuurcampings/']],
  },
  utrecht: {
    name: 'Utrecht', image: 'need-camper.webp', count: 78,
    description: 'Vergelijk campings in Utrecht op centrale ligging, natuur, fietsbereik en voorzieningen. Bekijk gecontroleerde CampingKiezer-profielen.',
    lead: 'Utrecht is compact en centraal, met campings rond polders, rivieren en de Utrechtse Heuvelrug. Daardoor zijn reistijd, fietsbereik en de balans tussen natuur en stedelijke uitstapjes belangrijke keuzecriteria.',
    checks: ['Controleer de route en bereikbaarheid met caravan of camper.', 'Bekijk fietsverhuur en openbaar vervoer als je de auto wilt laten staan.', 'Vergelijk rusttijden en bezoekersregels bij campings in drukkere regio’s.'],
    links: [['Camperplaatsen', '/camperplaatsen/'], ['Campings met fietsverhuur', '/themas/fietsverhuur/'], ['Natuurcampings', '/themas/natuurcampings/']],
  },
  zeeland: {
    name: 'Zeeland', image: 'need-pool.webp', count: 413,
    description: 'Vergelijk campings in Zeeland aan kust, water en dorpen. Bekijk voorzieningen, verblijfstypes en actuele aanbiederroute per locatie.',
    lead: 'In Zeeland zijn strandafstand, wind, waterrecreatie en de ligging op eiland of schiereiland vaak bepalend. Een camping “aan zee” kan in praktijk een heel andere route of omgeving hebben dan je verwacht.',
    checks: ['Controleer loop- of fietsroute naar strand en niet alleen de afstand in kilometers.', 'Bekijk beschutting, ondergrond en regels voor windschermen of voortenten.', 'Vergelijk zwemwater, zwembad en watersport als afzonderlijke voorzieningen.'],
    links: [['Campings bij zwemwater', '/themas/zwemwater/'], ['Campings met zwembad', '/themas/zwembad/'], ['Campings met stacaravans', '/themas/stacaravans/']],
  },
  'zuid-holland': {
    name: 'Zuid-Holland', image: 'need-ev.webp', count: 207,
    description: 'Vergelijk campings in Zuid-Holland bij kust, steden, polders en rivieren. Bekijk ligging, voorzieningen en boekingsroutes.',
    lead: 'Zuid-Holland combineert kustplaatsen, stedelijke gebieden, polders en rivieren. Bedenk vooraf of je vooral rust zoekt of juist snel bij strand, stad en attracties wilt zijn.',
    checks: ['Controleer bereikbaarheid en parkeerregels in drukke kust- en stadsregio’s.', 'Vergelijk fietsafstand en openbaar vervoer als onderdeel van de locatiekeuze.', 'Bekijk stroom, laadmogelijkheden en campervoorzieningen afzonderlijk.'],
    links: [['Campings bij zwemwater', '/themas/zwemwater/'], ['Campings met laadpaal', '/themas/laadpaal/'], ['Camperplaatsen', '/camperplaatsen/']],
  },
};

for (const [slug, data] of Object.entries(provinces)) {
  const file = `regios/${slug}/index.html`;
  const title = `Campings in ${data.name} vergelijken | CampingKiezer`;
  updateMeta(file, { title, description: data.description, image: data.image });
  const section = `<section class="section alt v109-seo-section" data-v109-region-guide="${slug}"><div class="container v109-seo-grid"><div><div class="eyebrow">Keuzehulp voor ${data.name}</div><h2>Zo vergelijk je campings in ${data.name}</h2><p>${data.lead}</p><div class="v109-check-grid">${data.checks.map((item, index) => `<article><span>0${index + 1}</span><p>${item}</p></article>`).join('')}</div><div class="v109-related-links">${data.links.map(([label, href]) => `<a href="${href}">${label} →</a>`).join('')}<a href="/kennisbank/provinciegids-campings-nederland/">Lees de provinciegids →</a></div></div><figure><img src="/assets/${data.image}" width="1400" height="788" loading="lazy" decoding="async" alt="Kampeervakantie in ${data.name}"><figcaption>${data.count} gecontroleerde locatieprofielen in ${data.name}</figcaption></figure></div></section>`;
  injectBeforeMainEnd(file, `data-v109-region-guide="${slug}"`, section);
}

const themes = {
  zwembad: {
    label: 'een zwembad', image: 'need-pool.webp', count: 117,
    description: 'Vergelijk 117 campings met zwembad. Bekijk type zwembad, ligging, verblijfstypes en officiële boekingsroutes op CampingKiezer.',
    lead: 'Een zwembadvermelding zegt nog niet of het bad binnen of buiten ligt, verwarmd is of tijdens jouw reisperiode open is. Controleer daarom het concrete aanbod bij de camping voordat je boekt.',
    checks: ['Bekijk binnen- en buitenzwembad apart.', 'Controleer openingstijden en seizoensperiode.', 'Let op leeftijdsregels en toezicht.'],
    links: [['Binnenzwembad', '/themas/binnenzwembad/'], ['Buitenzwembad', '/themas/buitenzwembad/'], ['Zwemwater', '/themas/zwemwater/']],
  },
  'prive-sanitair': {
    label: 'privé sanitair', image: 'need-private-sanitary.webp', count: 64,
    description: 'Vergelijk 64 campings met privé sanitair. Controleer ligging, inhoud, verblijfstype en actuele prijs bij de officiële aanbieder.',
    lead: 'Privé sanitair kan bij de kampeerplaats staan of onderdeel zijn van een accommodatie. Kijk daarom naar de exacte omschrijving, de inbegrepen voorzieningen en eventuele toeslag.',
    checks: ['Controleer of douche, toilet en wastafel allemaal inbegrepen zijn.', 'Bekijk afstand tot de plek en toegankelijkheid.', 'Neem de toeslag mee in de totale reissom.'],
    links: [['Sanitair', '/themas/sanitair/'], ['Douche', '/themas/douche/'], ['Glamping', '/themas/glamping/']],
  },
  speeltuin: {
    label: 'een speeltuin', image: 'need-playground.webp', count: 142,
    description: 'Vergelijk 142 campings met speeltuin. Bekijk ligging, andere gezinsvoorzieningen, verblijfstypes en aanbiederroute.',
    lead: 'De ene speeltuin is bedoeld voor peuters, de andere voor oudere kinderen. Bekijk foto’s en terreinplattegrond bij de aanbieder om te beoordelen of de speelplek past bij de leeftijd van je kinderen.',
    checks: ['Controleer leeftijd en type speeltoestellen.', 'Bekijk de afstand tot de kampeerplek.', 'Vergelijk buiten- en binnenspeelmogelijkheden.'],
    links: [['Binnenspeeltuin', '/themas/binnenspeeltuin/'], ['Animatie', '/themas/animatie/'], ['Zwembad', '/themas/zwembad/']],
  },
  animatie: {
    label: 'animatie', image: 'need-animation.webp', count: 83,
    description: 'Vergelijk 83 campings met animatie. Controleer leeftijdsgroep, periode, andere gezinsvoorzieningen en actuele beschikbaarheid.',
    lead: 'Animatie is vaak seizoensgebonden en kan per week of leeftijdsgroep verschillen. Een bevestigde vermelding is daarom een startpunt; het actuele programma staat bij de camping zelf.',
    checks: ['Controleer of animatie in jouw reisperiode wordt aangeboden.', 'Bekijk de bedoelde leeftijdsgroep.', 'Vergelijk zwembad en speelruimte los van het programma.'],
    links: [['Speeltuin', '/themas/speeltuin/'], ['Binnenspeeltuin', '/themas/binnenspeeltuin/'], ['Zwembad', '/themas/zwembad/']],
  },
  huisdieren: {
    label: 'honden', image: 'need-pets.webp', count: 74,
    description: 'Vergelijk 74 campings waar honden welkom zijn. Bekijk huisdierenregels, ligging, verblijfstypes en actuele voorwaarden.',
    lead: 'Honden welkom betekent niet automatisch dat ieder ras, aantal of verblijfstype is toegestaan. Controleer ook aanlijnregels, toeslagen en de voorwaarden voor stranden of natuurgebieden in de omgeving.',
    checks: ['Controleer maximumaantal en eventuele toeslag.', 'Bekijk aanlijn- en uitlaatregels.', 'Controleer of het gekozen verblijfstype huisdieren accepteert.'],
    links: [['Natuurcampings', '/themas/natuurcampings/'], ['Zwemwater', '/themas/zwemwater/'], ['Vakantiehuizen', '/themas/vakantiehuizen/']],
  },
  horeca: {
    label: 'horeca', image: 'need-horeca.webp', count: 89,
    description: 'Vergelijk 89 campings met restaurant of horeca. Bekijk type aanbod, openingstijden, verblijfstypes en officiële aanbiederroute.',
    lead: 'Horeca kan uiteenlopen van een snackbar of terras tot een volledig restaurant. Openingstijden zijn bovendien vaak afhankelijk van seizoen en bezetting.',
    checks: ['Controleer het soort horeca en het actuele menu.', 'Bekijk openingsdagen in jouw reisperiode.', 'Vergelijk supermarkt en broodservice als aparte voorzieningen.'],
    links: [['Supermarkt', '/themas/supermarkt/'], ['Camping-inpaklijst', '/kennisbank/camping-inpaklijst/'], ['Vakantieparken', '/vakantieparken/']],
  },
  glamping: {
    label: 'glamping', image: 'need-glamping.webp', count: 42,
    description: 'Vergelijk 42 campings met glamping. Bekijk safaritenten, voorzieningen, inbegrepen inventaris en officiële boekingsroutes.',
    lead: 'Glamping is een verzamelnaam. Controleer daarom of het gaat om een safaritent, lodge, yurt of ander ingericht verblijf en welke inventaris, bedlinnen en schoonmaak zijn inbegrepen.',
    checks: ['Vergelijk het exacte accommodatietype.', 'Controleer sanitair en keukenvoorzieningen.', 'Bereken verplichte schoonmaak- en linnenkosten mee.'],
    links: [['Safaritenten', '/themas/safaritenten/'], ['Privé sanitair', '/themas/prive-sanitair/'], ['Glamping in Nederland', '/glampings/']],
  },
  natuurcampings: {
    label: 'natuur', image: 'need-naturecamp.webp', count: 82,
    description: 'Vergelijk 82 natuurcampings op ligging, rust, verblijfstype en bekende voorzieningen. Bekijk gecontroleerde profielen en routes.',
    lead: 'Een natuurlijke ligging zegt niet hoeveel voorzieningen of hoeveel rust je daadwerkelijk krijgt. Kijk naar terreinindeling, plaatsgrootte, bereikbaarheid en de regels die de natuur beschermen.',
    checks: ['Controleer ondergrond, schaduw en bereikbaarheid.', 'Bekijk rusttijden en regels voor vuur of barbecue.', 'Controleer boodschappen en sanitair bij kleinschalige locaties.'],
    links: [['Boerderijcampings', '/themas/boerderijcampings/'], ['Honden welkom', '/themas/huisdieren/'], ['Campings met stroom', '/themas/stroom/']],
  },
  camperplaatsen: {
    label: 'camperplaatsen', image: 'need-camper.webp', count: 180,
    description: 'Vergelijk 180 campings met camperplaatsen. Bekijk stroom, water, sanitair, verblijfsregels en officiële aanbiederroute.',
    lead: 'Een camperplaats op een camping kan andere voorzieningen en verblijfsregels hebben dan een zelfstandig camperterrein. Controleer daarom ondergrond, voertuiglengte, stroom en loospunten afzonderlijk.',
    checks: ['Controleer maximale voertuiglengte en ondergrond.', 'Bekijk stroom, water en loospunten los van elkaar.', 'Lees aankomsttijden en verblijfsduur vóór vertrek.'],
    links: [['Camperplaatsen in Nederland', '/camperplaatsen/'], ['Stroom', '/themas/stroom/'], ['Sanitair', '/themas/sanitair/']],
  },
  stroom: {
    label: 'stroomaansluiting', image: 'need-ev.webp', count: 180,
    description: 'Vergelijk campings met stroomaansluiting. Controleer ampèrage, aansluiting, afstand en eventuele kosten bij de aanbieder.',
    lead: 'Een stroomaansluiting kan verschillen in ampèrage, stekkertype en afstand tot de plek. Stem het beschikbare vermogen af op koelkast, kookapparatuur en andere apparaten die je tegelijk gebruikt.',
    checks: ['Controleer ampèrage en CEE-aansluiting.', 'Bekijk kabellengte en plaatsing van het stroompunt.', 'Controleer of verbruik of aansluiting apart wordt berekend.'],
    links: [['Camperplaatsen', '/themas/camperplaatsen/'], ['Laadpaal', '/themas/laadpaal/'], ['Camping-inpaklijst', '/kennisbank/camping-inpaklijst/']],
  },
  wifi: {
    label: 'wifi', image: 'hero-glamping-v108.webp', count: 158,
    description: 'Vergelijk 158 campings met wifi. Controleer dekking, kosten, gebruiksvoorwaarden en verblijfstypes bij de officiële aanbieder.',
    lead: 'Wifi op een camping kan alleen rond de receptie beschikbaar zijn of juist het hele terrein dekken. Voor werken of streamen zijn bereik en snelheid belangrijker dan alleen een wifi-vermelding.',
    checks: ['Controleer waar op het terrein wifi beschikbaar is.', 'Bekijk of gebruik gratis of betaald is.', 'Vraag bij noodzakelijk internet naar actuele snelheid en stabiliteit.'],
    links: [['Stroom', '/themas/stroom/'], ['Vakantiehuizen', '/themas/vakantiehuizen/'], ['Glamping', '/themas/glamping/']],
  },
  'adults-only': {
    label: 'adults-only verblijf', image: 'need-adults-only.webp', count: 3,
    description: 'Vergelijk gecontroleerde adults-only campings. Bekijk minimumleeftijd, rustregels, voorzieningen en officiële aanbiederroute.',
    lead: 'Adults-only betekent dat een locatie een minimumleeftijd hanteert, maar die leeftijd en uitzonderingen kunnen verschillen. Controleer de actuele huisregels; adults-only is bovendien geen garantie op volledige stilte.',
    checks: ['Controleer minimumleeftijd en eventuele uitzonderingen.', 'Bekijk rusttijden, bezoekersregels en groepsvoorwaarden.', 'Controleer huisdieren, horeca en wellness afzonderlijk.'],
    links: [['Rustige camping voor stellen', '/kennisbank/rustige-camping-voor-stellen/'], ['Wellness', '/themas/wellness/'], ['Natuurcampings', '/themas/natuurcampings/']],
  },
};

for (const [slug, data] of Object.entries(themes)) {
  const file = `themas/${slug}/index.html`;
  const title = slug === 'adults-only' ? 'Adults-only campings vergelijken | CampingKiezer' : `Campings met ${data.label} vergelijken | CampingKiezer`;
  const robots = slug === 'adults-only' ? 'index,follow,max-image-preview:large' : undefined;
  updateMeta(file, { title, description: data.description, robots, image: data.image });
  const section = `<section class="section alt v109-seo-section" data-v109-theme-guide="${slug}"><div class="container v109-seo-grid"><div><div class="eyebrow">Praktische keuzehulp</div><h2>Waar let je op bij ${data.label}?</h2><p>${data.lead}</p><div class="v109-check-grid">${data.checks.map((item, index) => `<article><span>0${index + 1}</span><p>${item}</p></article>`).join('')}</div><div class="v109-related-links">${data.links.map(([label, href]) => `<a href="${href}">${label} →</a>`).join('')}<a href="/themas/">Bekijk alle campingthema’s →</a></div><p class="v109-data-note">CampingKiezer toont dit kenmerk alleen wanneer het in de beschikbare broninformatie is aangetroffen. Controleer actuele details altijd opnieuw bij de aanbieder.</p></div><figure><img src="/assets/${data.image}" width="1400" height="788" loading="lazy" decoding="async" alt="Campings met ${data.label} vergelijken"><figcaption>${data.count} profielen met dit bevestigde kenmerk</figcaption></figure></div></section>`;
  injectBeforeMainEnd(file, `data-v109-theme-guide="${slug}"`, section);
}

updateMeta('regios/nederland/index.html', {
  title: 'Campings in Nederland per provincie | CampingKiezer',
  description: 'Kies een Nederlandse provincie en vergelijk campings, camperplaatsen en vakantieparken op ligging, verblijfstype en voorzieningen.',
  robots: 'index,follow,max-image-preview:large',
  image: 'hero-camping-family-v108.webp',
});
injectBeforeMainEnd('regios/nederland/index.html', 'data-v109-national-guide', `<section class="section alt v109-seo-section" data-v109-national-guide><div class="container v109-seo-grid"><div><div class="eyebrow">Eerst de regio, daarna de camping</div><h2>Welke provincie past bij jouw vakantie?</h2><p>Gebruik de provinciepagina’s als startpunt en verfijn daarna op verblijfstype en bevestigde voorzieningen. Zo voorkom je dat je meteen in tientallen dunne filtercombinaties terechtkomt.</p><div class="v109-check-grid"><article><span>01</span><p>Kies landschap, reistijd en gewenste uitstapjes.</p></article><article><span>02</span><p>Vergelijk concrete voorzieningen die voor jouw reis noodzakelijk zijn.</p></article><article><span>03</span><p>Controleer prijs, beschikbaarheid en voorwaarden bij de officiële aanbieder.</p></article></div><div class="v109-related-links"><a href="/regios/">Alle provincies vergelijken →</a><a href="/themas/">Zoeken op voorziening →</a><a href="/kennisbank/provinciegids-campings-nederland/">Lees de provinciegids →</a></div></div><figure><img src="/assets/hero-camping-family-v108.webp" width="1400" height="788" loading="lazy" decoding="async" alt="Kampeervakantie in Nederland"><figcaption>Van kust en meren tot bos, heide en rivieren</figcaption></figure></div></section>`);

// Homepage: schone, indexeerbare landingspagina's in plaats van geblokkeerde filter-URL's.
let home = read('index.html');
const linkMap = new Map([
  ['/zoeken?fac=waterfront', '/themas/zwemwater/'], ['/zoeken?aud=family', '/kennisbank/kindvriendelijk-vakantiepark-kiezen/'],
  ['/zoeken?fac=private_sanitary', '/themas/prive-sanitair/'], ['/zoeken?aud=dogs', '/themas/huisdieren/'],
  ['/zoeken?kind=Natuur', '/themas/natuurcampings/'], ['/zoeken?aud=adults_only', '/themas/adults-only/'],
  ['/zoeken?fac=pool', '/themas/zwembad/'], ['/zoeken?q=EuroParcs', '/ketens/europarcs/'],
  ['/zoeken?q=Molecaten', '/ketens/molecaten/'], ['/zoeken?q=Capfun', '/ketens/capfun/'],
  ['/zoeken?q=Ardoer', '/ketens/ardoer/'], ['/zoeken?q=Roompot', '/ketens/roompot/'], ['/zoeken?q=RCN', '/ketens/rcn/'],
  ['/zoeken?prov=Groningen', '/regios/groningen/'], ['/zoeken?prov=Friesland', '/regios/friesland/'],
  ['/zoeken?prov=Drenthe', '/regios/drenthe/'], ['/zoeken?prov=Overijssel', '/regios/overijssel/'],
  ['/zoeken?prov=Flevoland', '/regios/flevoland/'], ['/zoeken?prov=Gelderland', '/regios/gelderland/'],
  ['/zoeken?prov=Utrecht', '/regios/utrecht/'], ['/zoeken?prov=Noord-Holland', '/regios/noord-holland/'],
  ['/zoeken?prov=Zuid-Holland', '/regios/zuid-holland/'], ['/zoeken?prov=Zeeland', '/regios/zeeland/'],
  ['/zoeken?prov=Noord-Brabant', '/regios/noord-brabant/'], ['/zoeken?prov=Limburg', '/regios/limburg/'],
]);
for (const [from, to] of linkMap) home = home.split(`href="${from}"`).join(`href="${to}"`);
home = home.replace('<link rel="preload" as="image" href="/assets/camp-3.webp" fetchpriority="high">', '<link rel="preload" as="image" href="/assets/hero-camping-family-v108.webp" fetchpriority="high">');
home = home.replace('<img src="/assets/hero-arrival-v108.webp" width="1400" height="788"', '<img src="/assets/hero-arrival-v108.webp" width="1400" height="788" fetchpriority="high" decoding="async"');
const priorityProfiles = `<section class="section alt v109-priority-profiles" data-v109-priority-profiles><div class="container"><div class="section-head"><div><div class="eyebrow">Sterke profielen om mee te beginnen</div><h2>Populaire campings en vakantieparken vergelijken</h2><p>Open een profiel voor gecontroleerde locatiegegevens, verblijfstypes, voorzieningen, bronstatus en de officiële aanbiederroute.</p></div><a class="btn btn-outline" href="/campings/">Bekijk alle campings →</a></div><div class="v84-related-grid"><a href="/camping/camping-de-vossenburcht/"><span>IJhorst · Overijssel</span><strong>Camping De Vossenburcht</strong><small>Kampeerplaatsen en verblijven</small></a><a href="/camping/vakantiepark-ackersate/"><span>Voorthuizen · Gelderland</span><strong>Vakantiepark Ackersate</strong><small>Camping en vakantiepark</small></a><a href="/camping/kampeerdorp-de-zandstuve/"><span>Rheeze · Overijssel</span><strong>Kampeerdorp de Zandstuve</strong><small>Familiecamping</small></a><a href="/camping/recreatiepark-de-boshoek/"><span>Voorthuizen · Gelderland</span><strong>Recreatiepark De Boshoek</strong><small>Camping en verblijven</small></a><a href="/camping/rcn-zeewolde/"><span>Zeewolde · Flevoland</span><strong>RCN Zeewolde</strong><small>Camping en vakantiepark</small></a><a href="/camping/molecaten-park-waterdunen/"><span>Breskens · Zeeland</span><strong>Molecaten Park Waterdunen</strong><small>Kamperen aan de Zeeuwse kust</small></a><a href="/camping/landal-rabbit-hill/"><span>Nieuw-Milligen · Gelderland</span><strong>Landal Rabbit Hill</strong><small>Camping op de Veluwe</small></a><a href="/camping/ardoer-camping-t-noorder-sandt/"><span>Julianadorp · Noord-Holland</span><strong>Ardoer camping ’t Noorder Sandt</strong><small>Camping bij de kust</small></a></div></div></section>`;
if (!home.includes('data-v109-priority-profiles')) home = home.replace('</main>', `${priorityProfiles}</main>`);
write('index.html', home);
updateMeta('index.html', {
  title: 'Campings en vakantieparken vergelijken | CampingKiezer',
  description: 'Vergelijk ruim 4.000 campings, vakantieparken, camperplaatsen en glampings op locatie, verblijfstype en bevestigde voorzieningen.',
  image: 'hero-camping-family-v108.webp',
});

const categoryMeta = {
  'campings/index.html': ['Campings in Nederland vergelijken | CampingKiezer', 'Vergelijk 3.673 campings in Nederland op plaats, verblijfstype, voorzieningen en officiële boekingsroute.'],
  'bungalowparken/index.html': ['Bungalowparken en resorts vergelijken | CampingKiezer', 'Vergelijk 123 bungalowparken, vakantiehuizen, lodges en resorts in Nederland op ligging, voorzieningen en aanbiederroute.'],
  'camperplaatsen/index.html': ['Camperplaatsen in Nederland vergelijken | CampingKiezer', 'Vergelijk 1.391 camperplaatsen en campings met camperplekken op locatie, voorzieningen en officiële boekingsroute.'],
  'glampings/index.html': ['Glamping in Nederland vergelijken | CampingKiezer', 'Vergelijk 210 glampings in Nederland op accommodatietype, voorzieningen, ligging en officiële aanbiederroute.'],
  'vakantieparken/index.html': ['Vakantieparken in Nederland vergelijken | CampingKiezer', 'Vergelijk 138 vakantieparken in Nederland op verblijfstype, voorzieningen, ligging en actuele aanbiederroute.'],
  'regios/index.html': ['Campings en vakantieparken per provincie | CampingKiezer', 'Vergelijk campings, camperplaatsen en vakantieparken per Nederlandse provincie op ligging, verblijfstype en voorzieningen.'],
  'themas/index.html': ['Campings per voorziening vergelijken | CampingKiezer', 'Vergelijk campings op bevestigde voorzieningen zoals zwembad, privé sanitair, wifi, animatie, huisdieren en glamping.'],
};
for (const [file, [title, description]] of Object.entries(categoryMeta)) updateMeta(file, { title, description });

// Adults-only wordt nu een volwaardige, inhoudelijk verrijkte themapagina.
let themeHub = read('themas/index.html');
if (!themeHub.includes('href="/themas/adults-only/"')) {
  themeHub = replaceRequired(themeHub, /(<div class="theme-hub-grid">)/, '$1<a class="theme-hub-card" href="/themas/adults-only/"><strong>Adults-only campings</strong><span>3 expliciet bevestigde profielen en uitgebreide keuzehulp</span></a>', 'adults-only themalink');
  write('themas/index.html', themeHub);
}

// De kennisbank geeft crawlbare routes naar de belangrijkste SEO-landingspagina's.
injectBeforeMainEnd('kennisbank/index.html', 'data-v109-seo-routes', `<section class="section v109-seo-routes" data-v109-seo-routes><div class="container"><div class="section-head"><div><div class="eyebrow">Direct gericht vergelijken</div><h2>Van gids naar passende campingselectie</h2><p>Gebruik een inhoudelijke gids om je eisen te bepalen en open daarna een provincie- of voorzieningenpagina.</p></div></div><div class="v109-route-grid"><a href="/regios/nederland/"><strong>Campings per provincie</strong><span>Kies eerst het landschap en de regio →</span></a><a href="/themas/zwembad/"><strong>Campings met zwembad</strong><span>Vergelijk binnen, buiten en zwemwater →</span></a><a href="/themas/prive-sanitair/"><strong>Campings met privé sanitair</strong><span>Controleer inhoud, ligging en toeslag →</span></a><a href="/themas/huisdieren/"><strong>Campings waar honden welkom zijn</strong><span>Bekijk regels en verblijfstypes →</span></a><a href="/themas/glamping/"><strong>Glamping vergelijken</strong><span>Safaritent, lodge of ander verblijf →</span></a><a href="/themas/adults-only/"><strong>Adults-only campings</strong><span>Minimumleeftijd en rustregels controleren →</span></a></div></div></section>`);

// CTR-verbetering op acht prominente, sterk intern gelinkte profielen.
const profileDescriptions = {
  'camping/camping-de-vossenburcht/index.html': 'Bekijk Camping De Vossenburcht in IJhorst: kampeer- en verblijfsmogelijkheden, gecontroleerde voorzieningen en de officiële boekingsroute.',
  'camping/vakantiepark-ackersate/index.html': 'Bekijk Vakantiepark Ackersate in Voorthuizen: verblijfstypes, gecontroleerde voorzieningen, bronstatus en de officiële boekingsroute.',
  'camping/kampeerdorp-de-zandstuve/index.html': 'Bekijk Kampeerdorp de Zandstuve in Rheeze: gezinsvoorzieningen, verblijfstypes, bronstatus en de officiële boekingsroute.',
  'camping/recreatiepark-de-boshoek/index.html': 'Bekijk Recreatiepark De Boshoek in Voorthuizen: verblijfstypes, bekende voorzieningen, bronstatus en de officiële boekingsroute.',
  'camping/rcn-zeewolde/index.html': 'Bekijk RCN Zeewolde: kampeer- en camperplaatsen, bekende voorzieningen, gecontroleerde brongegevens en de officiële boekingsroute.',
  'camping/molecaten-park-waterdunen/index.html': 'Bekijk Molecaten Park Waterdunen in Breskens: verblijfstypes, bekende voorzieningen, ligging en de officiële boekingsroute.',
  'camping/landal-rabbit-hill/index.html': 'Bekijk Landal Rabbit Hill in Nieuw-Milligen: kampeermogelijkheden, bekende voorzieningen, bronstatus en de officiële aanbiederroute.',
  'camping/ardoer-camping-t-noorder-sandt/index.html': 'Bekijk Ardoer camping ’t Noorder Sandt in Julianadorp: verblijfstypes, voorzieningen, bronstatus en de officiële boekingsroute.',
};
for (const [file, description] of Object.entries(profileDescriptions)) updateMeta(file, { description });

// Commerciële claimlinks verdwijnen uit de bovenbalk en header; zakelijke routes blijven in de footer en op relevante profielpagina's.
for (const file of fs.readdirSync(root, { recursive: true }).filter((item) => item.endsWith('.html'))) {
  let html = read(file);
  html = html.replace(/(<div class="topbar">\s*<span>[^<]*<\/span>)\s*<a href="\/claim-uw-camping\/">[^<]*<\/a>(\s*<\/div>)/g, '$1$2');
  html = html.replace(/<div class="v80-header-actions">[\s\S]*?<\/div>\s*(<button aria-label="Menu")/g, '$1');
  html = html.replace(/\/assets\/style\.css\?v=98/g, '/assets/style.css?v=109');
  write(file, html);
}

// Sitemaps: alleen de twee inhoudelijk volwaardige noindex-herstellen toevoegen.
xmlAddUrl('sitemap-regios.xml', 'https://camping-kiezer.nl/regios/nederland/');
xmlAddUrl('sitemap-themas.xml', 'https://camping-kiezer.nl/themas/adults-only/');
updateSitemapLastmod('sitemap-core.xml', [
  'https://camping-kiezer.nl/', 'https://camping-kiezer.nl/campings/', 'https://camping-kiezer.nl/bungalowparken/',
  'https://camping-kiezer.nl/camperplaatsen/', 'https://camping-kiezer.nl/glampings/', 'https://camping-kiezer.nl/vakantieparken/',
  'https://camping-kiezer.nl/regios/', 'https://camping-kiezer.nl/themas/',
]);
updateSitemapLastmod('sitemap-kennisbank.xml', ['https://camping-kiezer.nl/kennisbank/']);

let sitemapIndex = read('sitemap.xml');
for (const name of ['sitemap-core.xml', 'sitemap-regios.xml', 'sitemap-themas.xml', 'sitemap-kennisbank.xml']) {
  const safe = name.replace('.', '\\.');
  sitemapIndex = sitemapIndex.replace(new RegExp(`(<loc>https:\\/\\/camping-kiezer\\.nl\\/${safe}<\\/loc><lastmod>)[^<]+`), '$12026-08-27');
}
write('sitemap.xml', sitemapIndex);

let netlify = read('netlify.toml');
if (!netlify.includes('validate-seo-v109.mjs')) {
  netlify = netlify.replace('node scripts/validate-sunny-homepage-v108.mjs', 'node scripts/validate-sunny-homepage-v108.mjs && node scripts/validate-seo-v109.mjs');
  write('netlify.toml', netlify);
}

const css = `

/* V109 — gerichte indexatie, interne links en CTR */
.v109-seo-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:42px;align-items:center}.v109-seo-grid>div>p{color:var(--muted);font-size:1rem;line-height:1.75;max-width:780px}.v109-seo-grid figure{margin:0;position:relative;border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(18,63,50,.14)}.v109-seo-grid figure img{aspect-ratio:16/9;display:block;height:100%;object-fit:cover;width:100%}.v109-seo-grid figcaption{position:absolute;left:14px;right:14px;bottom:14px;background:rgba(255,255,255,.94);border-radius:12px;color:#173f35;font-size:.78rem;font-weight:850;padding:10px 12px}.v109-check-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:22px 0}.v109-check-grid article{background:#fff;border:1px solid #dce7e1;border-radius:14px;padding:15px}.v109-check-grid span{color:#287158;font-size:.72rem;font-weight:900}.v109-check-grid p{color:#52665c;font-size:.84rem;line-height:1.55;margin:8px 0 0}.v109-related-links{display:flex;flex-wrap:wrap;gap:8px}.v109-related-links a{background:#e8f4ee;border-radius:999px;color:#176846;font-size:.8rem;font-weight:850;padding:9px 12px}.v109-data-note{border-top:1px solid #d9e5de;font-size:.82rem!important;margin-top:20px;padding-top:16px}.v109-route-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.v109-route-grid a{background:#fff;border:1px solid #dce5df;border-radius:16px;display:flex;flex-direction:column;padding:19px}.v109-route-grid a:hover{border-color:#2f7d5f;transform:translateY(-2px)}.v109-route-grid strong{color:#173f35}.v109-route-grid span{color:#607168;font-size:.82rem;margin-top:7px}.v109-priority-profiles .v84-related-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.topbar span{margin:auto}.site-header .header-inner{justify-content:space-between}.site-header .menu-btn{margin-left:auto}
@media(max-width:1000px){.v109-seo-grid{grid-template-columns:1fr}.v109-priority-profiles .v84-related-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){.topbar span{display:inline;font-size:.75rem;margin:auto}.v109-check-grid,.v109-route-grid,.v109-priority-profiles .v84-related-grid{grid-template-columns:1fr}.v109-seo-grid{gap:25px}.v109-seo-grid figure{order:-1}}
`;
let stylesheet = read('assets/style.css');
stylesheet = stylesheet.replaceAll('/assets/camp-3.jpg', '/assets/camp-3.webp');
if (!stylesheet.includes('V109 — gerichte indexatie')) write('assets/style.css', stylesheet + css);
else write('assets/style.css', stylesheet);

const report = `CampingKiezer V109 — gerichte indexatie en CTR\n\nUitgevoerd\n- V108 met 27 zonnige beelden en de brede homepagehero behouden.\n- Homepage-links naar geblokkeerde filter-URL's vervangen door crawlbare regio-, keten- en themapagina's.\n- 12 provinciepagina's voorzien van unieke keuzehulp, eigen foto, interne links en sterkere metadata.\n- 12 belangrijke voorzieningenpagina's inhoudelijk verrijkt met eigen foto, controlepunten en gerelateerde links.\n- Landelijke provinciehub en adults-onlypagina na inhoudelijke verrijking van noindex naar index gezet.\n- Dunne regionale combinaties met 2-4 resultaten, functionele pagina's en oude 301-URL's bewust noindex gehouden.\n- Acht prominente campingprofielen vanaf de homepage intern versterkt en van specifiekere descriptions voorzien.\n- Homepage, categorieën, provincies en kernthema's voorzien van CTR-gerichtere titles en descriptions.\n- Sitemapstructuur per paginatype behouden; twee herstelde pagina's toegevoegd en lastmod gericht bijgewerkt.\n- Claim/zakelijk uit de bovenbalk en header verwijderd; zakelijke routes blijven in footer en relevante profielcontext.\n- Geen nieuwe combinatiepagina's aangemaakt.\n`;
write('RELEASE-CONTROLE-V109.txt', report);

console.log(JSON.stringify({ release: 'V109', provinces: Object.keys(provinces).length, themes: Object.keys(themes).length, profiles: Object.keys(profileDescriptions).length }, null, 2));
