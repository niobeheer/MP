import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

const header = `<div class="topbar"><span>Vind, vergelijk en boek jouw volgende plek in Nederland en Europa</span></div><header class="site-header"><div class="container header-inner"><a class="brand" href="/"><span class="brand-mark"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 18h18L12 4 3 18Z"></path><path d="M12 4v15"></path></svg></span>CampingKiezer</a><nav class="nav" aria-label="Hoofdnavigatie"><a href="/campings/">Campings</a><a href="/bungalowparken/">Bungalowparken &amp; resorts</a><a href="/camperplaatsen/">Camperplaatsen</a><a href="/onze-keuzes/">Onze keuzes</a><a href="/ketens/">Ketens</a><a href="/kennisbank/">Tips</a></nav><a class="header-owner-link v78-global-claim" data-v110-global-claim href="/claim-uw-camping/" aria-label="Claim uw camping"><span>Claim uw camping</span></a><button aria-label="Menu" class="menu-btn" aria-expanded="false">☰</button></div></header>`;
const footer = `<footer class="footer"><div class="container"><div class="footer-grid v80-footer-grid"><div><a class="brand" href="/"><span class="brand-mark"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 18h18L12 4 3 18Z"></path><path d="M12 4v15"></path></svg></span>CampingKiezer</a><p>Vind en vergelijk campings, bungalowparken, camperplaatsen, glampings en vakantieparken.</p></div><div><h4>Verblijven</h4><a href="/campings/">Campings</a><a href="/bungalowparken/">Bungalowparken &amp; resorts</a><a href="/camperplaatsen/">Camperplaatsen</a><a href="/glampings/">Glamping</a><a href="/vakantieparken/">Vakantieparken</a></div><div><h4>Ontdekken</h4><a href="/onze-keuzes/">Onze keuzes</a><a href="/aanbieders/">Aanbieders</a><a href="/boeken/">Online beschikbaarheid</a><a href="/kennisbank/">Kennisbank &amp; tips</a><a href="/vergelijken/">Vergelijken</a></div><div><h4>Zakelijk (B2B)</h4><a href="/zakelijk/">Zakelijk overzicht</a><a href="/tarieven/">Tarieven</a><a href="/claim-uw-camping/">Claim uw bedrijf</a><a href="/voor-campings/">Voor campings</a><a href="/voor-ketens/">Voor ketens</a></div><div><h4>CampingKiezer</h4><a href="/over-ons">Over ons</a><a href="/contact">Contact</a><a href="/voorwaarden">Voorwaarden</a><a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/methodologie/">Methodologie</a><a href="/bronnenbeleid/">Bronnenbeleid</a><a href="/redactiebeleid/">Redactiebeleid</a></div></div><div class="footer-bottom"><span>© 2026 CampingKiezer.nl</span></div></div></footer>`;

const feedProviders = [
  {slug:"ackersate", name:"Vakantiepark Ackersate", title:"Accommodaties bij Vakantiepark Ackersate", description:"Bekijk actuele kampeerplaatsen en accommodaties bij Vakantiepark Ackersate.", placeholder:"Accommodatie of verblijfstype", client:"tradetracker"},
  {slug:"acsi-eurocampings", name:"ACSI Eurocampings", title:"Boekbare campings via ACSI Eurocampings", description:"Zoek in het actuele aanbod van ACSI Eurocampings.", placeholder:"Camping, plaats of land", client:"tradetracker"},
  {slug:"ardoer", name:"Ardoer", title:"Campings en vakantieparken via Ardoer", description:"Bekijk actuele Ardoer-campings en controleer prijzen en beschikbaarheid bij het park.", placeholder:"Camping, plaats of regio", client:"tradetracker"},
  {slug:"de-boshoek", name:"Recreatiepark De Boshoek", title:"Verblijven bij Recreatiepark De Boshoek", description:"Bekijk accommodaties en kampeermogelijkheden bij Recreatiepark De Boshoek.", placeholder:"Accommodatie of verblijfstype", client:"tradetracker"},
  {slug:"de-vossenburcht", name:"Vakantiepark De Vossenburcht", title:"Verblijven bij Vakantiepark De Vossenburcht", description:"Bekijk kampeerplaatsen en accommodaties bij Vakantiepark De Vossenburcht.", placeholder:"Kampeerplaats of accommodatie", client:"tradetracker"},
  {slug:"easyatent", name:"Easyatent", title:"Campingvakanties via Easyatent", description:"Bekijk ingerichte tenten en campingvakanties via Easyatent.", placeholder:"Camping, regio of land", client:"tradetracker"},
  {slug:"europarcs", name:"EuroParcs", title:"Vakantiehuizen en glamping via EuroParcs", description:"Zoek vakantiehuizen, glamping en andere verblijven bij EuroParcs.", placeholder:"Park, accommodatie of regio", client:"tradetracker"},
  {slug:"farmcamps", name:"FarmCamps", title:"Boerderijvakanties via FarmCamps", description:"Bekijk boerderijvakanties en luxe tenten via FarmCamps.", placeholder:"Boerderij, plaats of provincie", client:"tradetracker"},
  {slug:"gusto-camp", name:"Gusto Camp", title:"Campingvakanties via Gusto Camp", description:"Bekijk campingvakanties in Europa via Gusto Camp.", placeholder:"Camping, regio of land", client:"tradetracker"},
  {slug:"leistert", name:"De Leistert", title:"Verblijven bij De Leistert", description:"Bekijk kampeerplaatsen en accommodaties bij vakantiepark De Leistert.", placeholder:"Accommodatie of verblijfstype", client:"tradetracker"},
  {slug:"lux-camp", name:"LuxCamp", title:"Campingvakanties via LuxCamp", description:"Zoek stacaravans, glamping en campingvakanties in Europa via LuxCamp.", placeholder:"Camping, regio of land", client:"tradetracker"},
  {slug:"norgerberg", name:"De Norgerberg", title:"Verblijven bij De Norgerberg", description:"Bekijk accommodaties en kampeermogelijkheden bij De Norgerberg.", placeholder:"Accommodatie of verblijfstype", client:"tradetracker"},
  {slug:"rcn", name:"RCN Vakantieparken", title:"Vakantie bij RCN", description:"Zoek kampeerplaatsen en accommodaties bij RCN Vakantieparken.", placeholder:"Park, plaats of verblijfstype", client:"tradetracker"},
  {slug:"topparken", name:"TopParken", title:"Vakantiehuizen via TopParken", description:"Bekijk vakantiehuizen en vakantieparken van TopParken.", placeholder:"Park, accommodatie of regio", client:"tradetracker"},
  {slug:"zandstuve", name:"Kampeerdorp De Zandstuve", title:"Verblijven bij Kampeerdorp De Zandstuve", description:"Bekijk kampeerplaatsen en accommodaties bij kindercamping De Zandstuve.", placeholder:"Kampeerplaats of accommodatie", client:"tradetracker"},
  {slug:"vodatent", name:"Vodatent", title:"Safaritenten en glamping via Vodatent", description:"Zoek safaritenten en glampingaccommodaties via Vodatent.", placeholder:"Camping, safaritent of land", client:"daisycon"},
  {slug:"tendi", name:"Tendi", title:"Kleinschalige campings via Tendi", description:"Bekijk accommodaties op kleinschalige campings via Tendi.", placeholder:"Camping, plaats of land", client:"daisycon"},
];

const linkProviders = [
  {slug:"arden-parks-comblain", name:"Arden Parks Comblain", title:"Vakantie bij Arden Parks Comblain", description:"Bekijk verblijven en beschikbaarheid bij Arden Parks Comblain.", link:"https://partner.ardenparks-comblain.be/c?c=39168&m=12&a=514819&r=&u="},
  {slug:"arden-parks-durbuy", name:"Arden Parks Durbuy", title:"Vakantie bij Arden Parks Durbuy", description:"Bekijk verblijven en beschikbaarheid bij Arden Parks Durbuy.", link:"https://partner.ardenparks-durbuy.be/c?c=39165&m=12&a=514819&r=&u=%2F"},
  {slug:"de-twee-bruggen", name:"De Twee Bruggen", title:"Vakantie bij De Twee Bruggen", description:"Bekijk bungalows, kampeerplaatsen en beschikbaarheid bij De Twee Bruggen.", link:"https://www.detweebruggen.nl/bungalows/?tt=15154_12_514819_&r=%2F"},
  {slug:"eperwoud", name:"Eperwoud", title:"Vakantie bij Eperwoud", description:"Bekijk verblijven en beschikbaarheid bij Eperwoud.", link:"https://deals.eperwoud.nl/c?c=39552&m=12&a=514819&r=&u="},
  {slug:"molecaten", name:"Molecaten", title:"Vakantie bij Molecaten", description:"Bekijk campings, vakantieparken en beschikbaarheid bij Molecaten.", link:"https://www.molecaten.nl/tradetracker/?tt=2857_12_514819_&r=%2F"},
];

const featuredProviders = [
  {
    slug:"glamping4all", name:"Glamping4all", title:"Uitgelicht glampingaanbod van Glamping4all",
    description:"Glamping4all is door CampingKiezer geselecteerd voor een eigen aanbiederspagina. Bekijk aanbiedingen, Nederlandse glampings en kindvriendelijke glampings met animatie.",
    cards:[
      {title:"Actuele aanbiedingen", text:"Bekijk last-minutes en laagseizoenkorting bij Glamping4all.", image:"https://www.glamping4all.com/media/sfeer/_416x332_crop_center-center_90_none/Glamping4all_last_minutes.jpg", link:"https://jdt8.net/c/?si=8995&li=1412571&wi=424678&ws=&dl=nl%2Faanbiedingen"},
      {title:"Glamping in Nederland", text:"Ontdek luxe safaritenten en lodges op Nederlandse campings.", image:"https://www.glamping4all.com/media/Campings/Cypsela/_416x332_crop_center-center_90_none/Cypsela-Glamping4all-safaritent-5-personen.jpg", link:"https://jdt8.net/c/?si=8995&li=1412571&wi=424678&ws=&dl=nl%2Fcampings%2Fnederland"},
      {title:"Glampings met animatie", text:"Vind glampings die extra geschikt zijn voor gezinnen met kinderen.", image:"https://www.glamping4all.com/media/Campings/Cypsela/_1920x500_crop_center-center_90_none/6130/Cypsela-Glamping4all-animatie.webp", link:"https://jdt8.net/c/?si=8995&li=1412571&wi=424678&ws=&dl=nl%2Fglampings-met-animatie"},
    ]
  },
  {
    slug:"landgoed-ruwinkel", name:"Landgoed Ruwinkel", title:"Vakantiehuizen bij Landgoed Ruwinkel",
    description:"Landgoed Ruwinkel is door CampingKiezer geselecteerd als uitgelichte parkpartner. Bekijk vrijstaande vakantiehuizen in de Gelderse Vallei en huisdiervriendelijke mogelijkheden.",
    cards:[
      {title:"Vakantiehuizen", text:"Vrijstaande chalets, vakantiehuizen en landhuizen voor verschillende groepsgroottes.", image:"https://www.landgoedruwinkel.nl/assets/uploads/Sfeerbeelden/Aankomst-op-Ruwinkel/_900x600_crop_center-center_80_none/6511/DSC00289.1760702121.webp", link:"https://ds1.nl/c/?si=8921&li=1410027&wi=424678&ws=&dl=nl%2Fvakantiehuizen"},
      {title:"Vakantie met de hond", text:"Bekijk huisdiergeschikte accommodaties vlak bij het bos.", image:"https://www.landgoedruwinkel.nl/assets/uploads/Accommodaties/Vakantiehuis-6-persoons-Dogs/_900x600_crop_center-center_80_none/2968/vh6-dogs-1.1769512904.webp", link:"https://ds1.nl/c/?si=8921&li=1410027&wi=424678&ws=&dl=nl%2Fvakantie%2Fmet-hond"},
    ]
  },
  {
    slug:"beekse-bergen", name:"Beekse Bergen", title:"Overnachten bij Beekse Bergen",
    description:"Lake Resort en Safari Resort Beekse Bergen krijgen een eigen voorkeursselectie met vakantiehuisjes, glamping, camping en verblijven rond het Victoriameer.",
    cards:[
      {title:"Vakantiehuisjes", text:"Overnacht tussen de wilde dieren in een lodge, jungalow of boomhut.", image:"https://cdn.libemaweb.com/f/151320/2560x1708/93f8ade4ce/leeuwen-savanne-leeuwin-safari-resort-beekse-bergen.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6813&li=1316969&wi=424678&ws=&dl=overnachten%2Faccommodaties"},
      {title:"Glamping", text:"Volledig ingerichte safaritenten bij het Safari Resort of Lake Resort.", image:"https://cdn.libemaweb.com/f/151320/2560x1708/a9835a6991/dromedaris-savanne-safaritent-safari-resort-beekse-bergen.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6813&li=1316969&wi=424678&ws=&dl=overnachten%2Faccommodaties%2Fglamping"},
      {title:"Camping", text:"Kampeer met tent, caravan of camper in de bosrijke omgeving van Lake Resort.", image:"https://cdn.libemaweb.com/f/151320/2560x1708/32fe27a7bb/camping-vrouw-dochter-tent-camping-lake-resort-beekse-bergen.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6813&li=1316969&wi=424678&ws=&dl=overnachten%2Faccommodaties%2Fcamping"},
      {title:"Lake Resort", text:"Vakantiehuis, glampingtent of camping rond het Victoriameer.", image:"https://cdn.libemaweb.com/f/151320/2560x1708/fd1799cac4/zomer-gezin-kamperen-camper-lake-resort-beekse-bergen.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6813&li=1316969&wi=424678&ws=&dl=overnachten%2Fhotel-resorts%2Flake-resort"},
    ]
  },
  {
    slug:"dierenbos", name:"Vakantiepark Dierenbos", title:"Overnachten bij Vakantiepark Dierenbos",
    description:"Vakantiepark Dierenbos krijgt een eigen voorkeursselectie met vakantiehuisjes, glamping, camping en actuele aanbiedingen voor gezinnen.",
    cards:[
      {title:"Vakantiehuisjes", text:"Vakantiehuisjes voor 2 tot en met 12 personen, dicht bij de boerderijdieren.", image:"https://cdn.libemaweb.com/f/151320/2560x1720/50d360381f/kinderen-voetballen-bungalow-damhert-vakantiepark-dierenbos.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6815&li=1316973&wi=424678&ws=&dl=overnachten%2Fvakantiehuizen"},
      {title:"Glamping", text:"Comfortabele lodgetenten aan het water voor gezinnen die luxe en natuur willen combineren.", image:"https://cdn.libemaweb.com/f/151320/2560x1707/bc64f70093/zomerbeelden-vakantiepark-dierenbos-zwemvijver-jongen-spelen-zand-strand-lodgetent-pauw.JPG/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6815&li=1316973&wi=424678&ws=&dl=overnachten%2Fcamping%2Fglamping"},
      {title:"Camping", text:"Familiecamping met dierenactiviteiten, zwemplezier, animatie en speeltuinen.", image:"https://cdn.libemaweb.com/f/151320/2560x1707/dadcb21c09/kamperen-kinderen-voetballen-vakantiepark-dierenbos.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6815&li=1316973&wi=424678&ws=&dl=overnachten%2Fcamping"},
      {title:"Aanbiedingen", text:"Bekijk actuele vroegboek-, last-minute- en kampeeraanbiedingen.", image:"https://cdn.libemaweb.com/f/151320/2560x1707/7c19601204/moeder-kind-geitjes-voorlezen-voorjaar-zomer-vakantiepark-dierenbos.jpg/m/3840x0/filters%3Afill%28transparent%29%3Aquality%2885%29", link:"https://ds1.nl/c/?si=6815&li=1316973&wi=424678&ws=&dl=overnachten%2Fverblijfsinformatie%2Faanbiedingen"},
    ],
    tip:"Er zijn ook speciale vakantiehuisjes en lodgetenten voor kinderen. Volgens Dierenbos zijn daarbij onder meer een kinderstoel, kinderbadje, box, babybedje en bolderkar aanwezig en is het huisje of de tent omheind. Controleer deze uitrusting bij het gekozen verblijf."
  },
];

function head(provider) {
  const canonical = `https://camping-kiezer.nl/aanbieders/${provider.slug}/`;
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(provider.title)} | CampingKiezer</title><meta name="description" content="${esc(provider.description)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/style.css?v=110"><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"CollectionPage",name:provider.title,url:canonical,description:provider.description})}</script><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://camping-kiezer.nl/"},{"@type":"ListItem",position:2,name:"Aanbieders",item:"https://camping-kiezer.nl/aanbieders/"},{"@type":"ListItem",position:3,name:provider.name,item:canonical}]})}</script></head><body>`;
}

function feedPage(provider) {
  const data = provider.client === "daisycon" ? "data-daisycon" : "data-tradetracker";
  return `${head(provider)}${header}<main><section class="page-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / <a href="/aanbieders/">Aanbieders</a> / ${esc(provider.name)}</div><div class="eyebrow">Geselecteerde aanbieder</div><h1>${esc(provider.title)}</h1><p>${esc(provider.description)}</p></div></section><section class="section"><div class="container"><form class="provider-search" ${data}-search><label for="${esc(provider.slug)}-q"><strong>Zoek binnen ${esc(provider.name)}</strong></label><div><input id="${esc(provider.slug)}-q" name="q" placeholder="${esc(provider.placeholder)}"><select name="country" ${data}-country aria-label="Kies een land"><option value="">Alle landen</option></select><button class="btn btn-brand" type="submit">Zoeken</button></div></form><p ${data}-count>Aanbod laden…</p><div class="partner-list-grid" ${data}-directory data-provider="${esc(provider.slug)}" data-provider-name="${esc(provider.name)}"></div></div></section></main>${footer}<script src="/assets/app.js" defer></script><script src="/assets/${provider.client === "daisycon" ? "daisycon-directory.js" : "tradetracker-directory.js"}" defer></script></body></html>`;
}

function linkPage(provider) {
  return `${head(provider)}${header}<main><section class="page-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / <a href="/aanbieders/">Aanbieders</a> / ${esc(provider.name)}</div><div class="eyebrow">Geselecteerde aanbieder</div><h1>${esc(provider.title)}</h1><p>${esc(provider.description)}</p><p><a class="btn btn-brand" href="${esc(provider.link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(provider.slug)}" data-placement="provider-page">Bekijk bij ${esc(provider.name)} →</a></p></div></section><section class="section"><div class="container prose"><h2>Bekijk het actuele aanbod</h2><p>Open ${esc(provider.name)} om verblijven, beschikbare data en prijzen te bekijken.</p><a class="btn btn-brand" href="${esc(provider.link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(provider.slug)}" data-placement="provider-page">Naar ${esc(provider.name)} →</a></div></section></main>${footer}<script src="/assets/app.js" defer></script></body></html>`;
}

function featuredPage(provider) {
  const cards = provider.cards.map(card => `<article class="affiliate-feature-card"><a class="affiliate-feature-image" href="${esc(card.link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(provider.slug)}" data-placement="featured-provider">${card.image ? `<img src="${esc(card.image)}" alt="${esc(card.title)} via ${esc(provider.name)}" loading="lazy" decoding="async">` : ""}<span>${esc(provider.name)}</span></a><div><small>Speciaal geselecteerd</small><h2>${esc(card.title)}</h2><p>${esc(card.text)}</p><strong>Bekijk actuele prijzen en beschikbaarheid</strong><a class="btn btn-brand" href="${esc(card.link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(provider.slug)}" data-placement="featured-provider">Bekijk bij ${esc(provider.name)} →</a></div></article>`).join("");
  return `${head(provider)}${header}<main><section class="page-hero choices-hero"><div class="container"><div class="crumbs"><a href="/">Home</a> / <a href="/aanbieders/">Aanbieders</a> / ${esc(provider.name)}</div><div class="eyebrow">Uitgelichte voorkeursaanbieder</div><h1>${esc(provider.title)}</h1><p>${esc(provider.description)}</p></div></section><section class="section affiliate-home-section"><div class="container"><div class="section-head"><div><div class="eyebrow">Voorkeursselectie van CampingKiezer</div><h2>Kies het verblijf dat bij je past</h2><p>Open een categorie om actuele prijzen, beschikbaarheid en voorwaarden rechtstreeks bij ${esc(provider.name)} te bekijken.</p></div></div><div class="affiliate-feature-grid">${cards}</div>${provider.tip ? `<div class="notice" style="margin-top:24px"><strong>Tip voor gezinnen.</strong> ${esc(provider.tip)}</div>` : ""}</div></section></main>${footer}<script src="/assets/app.js" defer></script></body></html>`;
}

for (const provider of feedProviders) {
  const directory = path.join(root, "aanbieders", provider.slug);
  fs.mkdirSync(directory, {recursive:true});
  fs.writeFileSync(path.join(directory, "index.html"), feedPage(provider));
}
for (const provider of linkProviders) {
  const directory = path.join(root, "aanbieders", provider.slug);
  fs.mkdirSync(directory, {recursive:true});
  fs.writeFileSync(path.join(directory, "index.html"), linkPage(provider));
}
for (const provider of featuredProviders) {
  const directory = path.join(root, "aanbieders", provider.slug);
  fs.mkdirSync(directory, {recursive:true});
  fs.writeFileSync(path.join(directory, "index.html"), featuredPage(provider));
}

console.log(JSON.stringify({feed_pages:feedProviders.length, link_pages:linkProviders.length, featured_pages:featuredProviders.length, total:feedProviders.length + linkProviders.length + featuredProviders.length}));
