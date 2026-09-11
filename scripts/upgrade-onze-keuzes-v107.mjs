import fs from "node:fs";

const pagePath = new URL("../onze-keuzes/index.html", import.meta.url);
const source = fs.readFileSync(pagePath, "utf8");

const choices = [
  {
    provider: "FarmCamps",
    key: "farmcamps",
    id: "gezinnen",
    label: "Gezinnen",
    title: "Boerderijvakanties met kinderen",
    text: "Luxe tenten en boerderijvakanties met dieren, speelruimte en activiteiten voor gezinnen.",
    image: "https://newyse-res.cloudinary.com/image/upload/t_newyse_original/v1748858115/12-1216509.jpg",
    route: "/aanbieders/farmcamps/",
  },
  {
    provider: "EuroParcs",
    key: "europarcs",
    id: "glamping",
    label: "Glamping en parken",
    title: "Vakantieparken en glamping in Nederland",
    text: "Bekijk vakantiehuizen, glampingtenten en andere verblijven op EuroParcs-vakantieparken.",
    image: "https://cdn.bookingexperts.com/uploads/image/image/588251/cover_20220420-EuroParcs_-_Zuiderzee-11.jpg",
    route: "/aanbieders/europarcs/",
  },
  {
    provider: "Vakantiepark De Vossenburcht",
    key: "de-vossenburcht",
    label: "Kamperen in Nederland",
    title: "Kamperen en verblijven in IJhorst",
    text: "Kampeerplaatsen en accommodaties op een kindvriendelijk vakantiepark in Overijssel.",
    image: "https://www.devossenburcht.nl/assets/uploads/_1200x630_crop_center-center_82_none/HTH-Vossenburcht-Lowres-2599_2025-03-28-111149_fgad.jpg",
    route: "/aanbieders/de-vossenburcht/",
  },
  {
    provider: "Gusto Camp",
    key: "gusto-camp",
    id: "buitenland",
    label: "Zuid-Europa",
    title: "Campingvakanties in Zuid-Europa",
    text: "Actuele campingmogelijkheden in onder andere Italië, Frankrijk en Kroatië.",
    image: "https://www.vakantie24.nl/cache/image/1150x2048_1edcd20775a468c5_1764941102.jpg",
    route: "/aanbieders/gusto-camp/",
  },
  {
    provider: "Allcamps",
    key: "allcamps",
    id: "campings",
    label: "Campings",
    title: "Campings in Nederland en Europa",
    text: "Doorzoek een breed aanbod van campings, van familiecampings tot vakanties aan zee.",
    image: "https://r.vstcdn.net/rimg/w_1200-h_720/sites/7087e3c105f66.original.jpg",
    route: "/aanbieders/allcamps/",
  },
  {
    provider: "Bungalow.Net",
    key: "bungalow-net",
    id: "vakantieparken",
    label: "Vakantieparken",
    title: "Vakantiehuizen en vakantieparken",
    text: "Zoek vakantiehuizen, bungalows en parkverblijven in Nederland.",
    image: "https://cdn.bookingexperts.com/uploads/image/image/741194/9V4A4081.jpg",
    route: "/aanbieders/bungalow-net/",
  },
  {
    provider: "Vakantiepark Ackersate",
    key: "ackersate",
    label: "Veluwe",
    title: "Vakantiepark op de Veluwe",
    text: "Kampeerplaatsen en accommodaties op een kindvriendelijk vakantiepark in Voorthuizen.",
    image: "https://cdn-cms.bookingexperts.com/media/1334/73/cover_ACK_210602-29_73442ee3-bbcd-4ec5-8eba-d630578e5198.jpg",
    route: "/aanbieders/ackersate/",
  },
  {
    provider: "Kampeerdorp De Zandstuve",
    key: "zandstuve",
    label: "Kindercamping",
    title: "Vijfsterren kindercamping in Overijssel",
    text: "Bekijk kampeerplaatsen en accommodaties met veel voorzieningen voor gezinnen.",
    image: "https://cdn.bookingexperts.com/uploads/image/image/651365/cover_Gezin_speeltuin_plezier___2_.jpg",
    route: "/aanbieders/zandstuve/",
  },
  {
    provider: "Ardoer",
    key: "ardoer",
    label: "Nederland",
    title: "Nederlandse familiecampings",
    text: "Ontdek aangesloten campings en vakantieparken verspreid over Nederland.",
    image: "https://www.ardoer.com/assets/campings/ginsterveld/Zwemmen%20en%20Wellness/9-waterpret-283-29.jpg",
    route: "/aanbieders/ardoer/",
  },
  {
    provider: "Suncamp",
    key: "suncamp",
    label: "Familiecampings",
    title: "Familiecampings in Nederland en Europa",
    text: "Vergelijk campings met zwembaden, animatie en voorzieningen voor het hele gezin.",
    image: "https://cdn.acsi.eu/6/9/9/4/699466b7ac646.jpg",
    route: "/aanbieders/suncamp/",
  },
  {
    provider: "ACSI Reizen",
    key: "acsi-reizen",
    id: "rondreizen",
    label: "Rondreizen",
    title: "Kampeerrondreizen en winterzonreizen",
    text: "Bekijk begeleide rondreizen, themareizen en overwinteringsreizen voor kampeerliefhebbers.",
    image: "https://www.acsireizen.nl/cache/image/640x960_3af2a4c5380c5dc9_1782118023.png",
    route: "/aanbieders/acsi-reizen/",
  },
  {
    provider: "Vipio",
    key: "vipio",
    label: "Bijzonder overnachten",
    title: "Bijzondere glampingverblijven",
    text: "Ontdek glampingtenten, yurts, tiny houses en andere bijzondere overnachtingen.",
    image: "/assets/hero-glamping-v108.webp",
    route: "/aanbieders/vipio/",
  },
  {
    provider: "Campings.com",
    key: "campings-com",
    label: "Campings en parken",
    title: "Campings en vakantieparken",
    text: "Doorzoek campingvakanties en parkverblijven in Nederland en de rest van Europa.",
    image: "https://www.campings.com/img/_/partner-large/89556/d36c9aef-cfba-4e48-824b-070334b9ed11.jpg/partner-1.jpg",
    route: "/aanbieders/campings-com/",
  },
  {
    provider: "Vodatent",
    key: "vodatent",
    label: "Safaritenten",
    title: "Safaritenten en kleinschalige glamping",
    text: "Bekijk ingerichte safaritenten op campings in Nederland en andere Europese landen.",
    image: "https://www.vodatent.nl/media/Campings/camping-de-meibeek/_1200xAUTO_fit_center-center_90_none/Camping-de-Meibeek-Zwembad.jpg",
    route: "/aanbieders/vodatent/",
  },
  {
    provider: "Tendi",
    key: "tendi",
    label: "Kleinschalig buitenland",
    title: "Kleinschalige campings in Zuid-Europa",
    text: "Ontdek sfeervolle campings en glampingverblijven in onder andere Italië en Frankrijk.",
    image: "https://www.vodatent.nl/media/Campings/camping-village-rosselba-le-palme/_1200xAUTO_fit_center-center_90_none/Rosselba-zwembad-2023.jpg",
    route: "/aanbieders/tendi/",
  },
  {
    provider: "ACSI Eurocampings",
    key: "acsi-eurocampings",
    label: "Europa",
    title: "Boekbare campings in heel Europa",
    text: "Vergelijk campings op locatie, voorzieningen en actuele boekingsmogelijkheden.",
    image: "https://cdn2.acsi.eu/6/9/3/5/6935164154e15.jpg",
    route: "/aanbieders/acsi-eurocampings/",
  },
  {
    provider: "Recreatiepark De Boshoek",
    key: "de-boshoek",
    label: "Veluwe",
    title: "Vakantiepark en safariverblijven op de Veluwe",
    text: "Bekijk vakantiehuizen, groepsverblijven, safaritenten en kampeermogelijkheden in Voorthuizen.",
    image: "https://cdn.bookingexperts.com/uploads/image/image/658152/cover_Safari_Villa_front10.jpg",
    route: "/aanbieders/de-boshoek/",
  },
];

const esc = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const cards = choices.map(choice => `<article class="affiliate-feature-card"${choice.id ? ` id="${esc(choice.id)}"` : ""} data-v107-feed-choice="${esc(choice.key)}"><a class="affiliate-feature-image" href="${esc(choice.route)}"><img src="${esc(choice.image)}" alt="${esc(choice.title)} via ${esc(choice.provider)}" loading="lazy" decoding="async"><span>${esc(choice.label)}</span></a><div><small>${esc(choice.provider)}</small><h3>${esc(choice.title)}</h3><p>${esc(choice.text)}</p><strong>Bekijk actuele prijzen en beschikbaarheid</strong><a class="btn btn-brand" href="${esc(choice.route)}" data-provider="${esc(choice.key)}" data-placement="onze-keuzes-v107">Bekijk actueel aanbod →</a></div></article>`).join("");

const itemList = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Onze keuzes van dit moment",
  url: "https://camping-kiezer.nl/onze-keuzes/",
  description: "Zeventien aanbieders met actueel doorzoekbaar camping-, glamping-, reis- en vakantieparkaanbod.",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: choices.length,
    itemListElement: choices.map((choice, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: choice.provider,
      url: `https://camping-kiezer.nl${choice.route}`,
    })),
  },
};

const main = `<main><section class="page-hero choices-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / Onze keuzes</div><div class="eyebrow">Gekozen door CampingKiezer</div><h1>Onze keuzes van dit moment</h1><p>Zeventien aanbieders met actueel doorzoekbaar aanbod voor campings, glamping, vakantieparken, bijzondere verblijven en kampeerreizen.</p></div></section><section class="section choices-categories"><div class="container"><div class="section-head"><div><div class="eyebrow">Kies wat bij je past</div><h2>Ontdek onze keuzes per vakantiewens</h2><p>Open een keuze en vergelijk het actuele aanbod rechtstreeks op de aanbiederspagina.</p></div></div><div class="choice-category-grid"><a href="#gezinnen"><span>Gezinnen</span><strong>Vakanties met ruimte om te spelen</strong></a><a href="#glamping"><span>Glamping</span><strong>Comfortabel kamperen</strong></a><a href="#campings"><span>Campings</span><strong>Actueel aanbod in Nederland en Europa</strong></a><a href="#vakantieparken"><span>Vakantieparken</span><strong>Veel voorzieningen bij elkaar</strong></a><a href="#buitenland"><span>Buitenland</span><strong>Campings en rondreizen over de grens</strong></a></div></div></section><section class="section affiliate-home-section choices-overview"><div class="container"><div class="section-head"><div><div class="eyebrow">Actuele selectie</div><h2>Zeventien keuzes om nu te bekijken</h2><p>Alle onderstaande aanbieders hebben actueel doorzoekbaar aanbod. Open een kaart om prijzen, beschikbaarheid en verblijfsvoorwaarden te bekijken.</p></div></div><div class="affiliate-feature-grid">${cards}</div><p class="affiliate-home-note">Prijzen en beschikbaarheid kunnen wijzigen. Controleer altijd de actuele eindsom en voorwaarden bij de aanbieder.</p></div></section></main>`;

const beforeMain = source.slice(0, source.indexOf("<main>"))
  .replace('content="Bekijk de actuele keuzes van CampingKiezer voor gezinnen, glamping, camperplaatsen, vakantieparken en vakanties in het buitenland."', 'content="Bekijk 17 actuele keuzes van CampingKiezer voor campings, glamping, vakantieparken, bijzondere verblijven en kampeerreizen."')
  .replace('/assets/style.css?v=102', '/assets/style.css?v=107')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(itemList)}</script>`);
const afterMain = source.slice(source.indexOf("</main>") + "</main>".length);

fs.writeFileSync(pagePath, `${beforeMain}${main}${afterMain}`);
console.log(JSON.stringify({version: "V107", choices: choices.length, providers: choices.map(choice => choice.key)}, null, 2));
