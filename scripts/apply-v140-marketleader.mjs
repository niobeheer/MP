import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const releaseDate='2026-09-12';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slugify=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const write=(rel,value)=>{const file=path.join(root,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value)};
const walkHtml=dir=>{const out=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name==='.git'||entry.name==='node_modules')continue;const file=path.join(dir,entry.name);if(entry.isDirectory())out.push(...walkHtml(file));else if(entry.name.endsWith('.html'))out.push(file)}return out};

const provinceData={
 'Drenthe':{slug:'drenthe',intro:'Drenthe combineert hunebedden, bos, heide en gezinsuitjes. Gebruik afstanden als eerste selectie en controleer daarna route, openingstijden en toegankelijkheid.',places:[
  {name:'WILDLANDS Adventure Zoo Emmen',type:'Dierentuin en gezinsuitje',lat:52.781,lon:6.899,text:'Een groot daguitje in Emmen met dierenwerelden en attracties.'},
  {name:'Hunebedcentrum Borger',type:'Archeologie en geschiedenis',lat:52.93,lon:6.80,text:'Startpunt voor de prehistorie en hunebedden van Drenthe.'},
  {name:'Nationaal Park Dwingelderveld',type:'Natuur en wandelen',lat:52.82,lon:6.40,text:'Heide, bos en wandel- en fietsroutes in een uitgestrekt natuurgebied.'},
  {name:'Drents Museum',type:'Museum',lat:53.00,lon:6.56,text:'Museum in Assen met archeologie, kunst en wisselende tentoonstellingen.'},
  {name:'Fochteloërveen',type:'Natuur en vogels',lat:53.00,lon:6.40,text:'Hoogveengebied voor rust, wandelen en vogelobservatie.'}]},
 'Flevoland':{slug:'flevoland',intro:'Flevoland biedt nieuwe natuur, water, poldergeschiedenis en grote gezinsattracties. Controleer bij je planning altijd seizoen en actuele toegang.',places:[
  {name:'Batavialand',type:'Maritieme geschiedenis',lat:52.52,lon:5.44,text:'Museumlocatie in Lelystad over scheepvaart en het ontstaan van Flevoland.'},
  {name:'Oostvaardersplassen',type:'Natuur en vogels',lat:52.45,lon:5.33,text:'Uitgestrekt natuurgebied met observatiepunten en wandelmogelijkheden.'},
  {name:'Walibi Holland',type:'Attractiepark',lat:52.44,lon:5.77,text:'Attractiepark bij Biddinghuizen voor een volledige dag uit.'},
  {name:'Werelderfgoed Schokland',type:'Erfgoed en landschap',lat:52.64,lon:5.77,text:'Voormalig eiland en markante plek in de geschiedenis van de Zuiderzee.'},
  {name:'Waterloopbos',type:'Natuur en techniek',lat:52.70,lon:5.95,text:'Bosgebied met voormalige waterloopkundige proefmodellen.'}]},
 'Friesland':{slug:'friesland',intro:'Friesland draait om meren, historische steden, Waddenkust en eigenzinnige musea. Combineer een campingkeuze met het soort uitstapje dat bij je reisgezelschap past.',places:[
  {name:'Nationaal Park De Alde Feanen',type:'Water en natuur',lat:53.13,lon:5.95,text:'Laagveenlandschap voor varen, wandelen, fietsen en vogels kijken.'},
  {name:'Fries Museum',type:'Museum en cultuur',lat:53.20,lon:5.79,text:'Museum in Leeuwarden over Friese geschiedenis, kunst en cultuur.'},
  {name:'Waterpoort van Sneek',type:'Stad en erfgoed',lat:53.03,lon:5.66,text:'Bekend stadsicoon en logisch vertrekpunt voor een bezoek aan Sneek.'},
  {name:'Eise Eisinga Planetarium',type:'Wetenschap en erfgoed',lat:53.19,lon:5.54,text:'Historisch planetarium in Franeker en geschikt voor een cultureel uitstapje.'},
  {name:'Lauwersmeergebied',type:'Natuur en donkerte',lat:53.37,lon:6.18,text:'Water- en natuurgebied aan de noordrand van Friesland en Groningen.'}]},
 'Gelderland':{slug:'gelderland',intro:'Gelderland heeft Veluwse natuur, kastelen, Hanzesteden en sterke gezinsattracties. Door de omvang van de provincie kan reistijd belangrijker zijn dan de provinciegrens.',places:[
  {name:'Nationaal Park De Hoge Veluwe',type:'Natuur en fietsen',lat:52.08,lon:5.83,text:'Bos, heide en zandlandschap met wandel- en fietsmogelijkheden.'},
  {name:'Kröller-Müller Museum',type:'Kunst en beeldentuin',lat:52.10,lon:5.82,text:'Kunstmuseum en beeldentuin midden in De Hoge Veluwe.'},
  {name:'Burgers’ Zoo',type:'Dierentuin en gezinsuitje',lat:52.01,lon:5.90,text:'Dierentuin in Arnhem met verschillende nagebouwde leefgebieden.'},
  {name:'Apenheul',type:'Dieren en gezin',lat:52.22,lon:5.92,text:'Dierenpark in Apeldoorn dat gespecialiseerd is in apen.'},
  {name:'Nederlands Openluchtmuseum',type:'Geschiedenis en gezin',lat:52.01,lon:5.91,text:'Openluchtmuseum in Arnhem over het dagelijks leven in Nederland.'},
  {name:'Valkhof en binnenstad Nijmegen',type:'Stad en geschiedenis',lat:51.85,lon:5.87,text:'Historische omgeving aan de Waal met park, musea en stadswandeling.'}]},
 'Groningen':{slug:'groningen',intro:'Groningen combineert een levendige stad met wierden, vestingen, Waddenkust en stille natuur. Controleer vooraf of een locatie seizoensgebonden is.',places:[
  {name:'Martinitoren en Grote Markt',type:'Stad en uitzicht',lat:53.219,lon:6.568,text:'Centraal vertrekpunt voor een bezoek aan de stad Groningen.'},
  {name:'Groninger Museum',type:'Kunst en cultuur',lat:53.212,lon:6.566,text:'Museum tegenover het hoofdstation met kunst en wisselende presentaties.'},
  {name:'Vesting Bourtange',type:'Geschiedenis en vesting',lat:53.006,lon:7.193,text:'Stervormige vesting in Oost-Groningen met historisch dorpsbeeld.'},
  {name:'Nationaal Park Lauwersmeer',type:'Natuur en vogels',lat:53.36,lon:6.18,text:'Waterrijk natuurgebied met routes en vogelobservatie.'},
  {name:'Pieterburen en Waddenkust',type:'Kust en landschap',lat:53.40,lon:6.45,text:'Uitvalsbasis om het noordelijke kustlandschap te verkennen.'},
  {name:'Fraeylemaborg',type:'Landgoed en historie',lat:53.16,lon:6.78,text:'Historische borg met park in Slochteren.'}]},
 'Limburg':{slug:'limburg',intro:'Limburg biedt heuvels, rivierlandschap, grotten, historische plaatsen en attracties voor gezinnen. Noord- en Zuid-Limburg liggen ver uiteen; kijk daarom naar afstand.',places:[
  {name:'Attractiepark Toverland',type:'Attractiepark',lat:51.396,lon:5.986,text:'Groot attractiepark bij Sevenum voor gezinnen en avontuurlijke bezoekers.'},
  {name:'GaiaZOO',type:'Dierentuin',lat:50.878,lon:6.047,text:'Dierentuin in Kerkrade met verschillende leefgebieden.'},
  {name:'Valkenburg en mergelgrotten',type:'Stad en ondergrondse historie',lat:50.865,lon:5.832,text:'Historische plaats in het heuvelland met grotten en wandelroutes.'},
  {name:'Nationaal Park De Maasduinen',type:'Natuur en wandelen',lat:51.60,lon:6.10,text:'Rivierduinen, vennen en bos in Noord-Limburg.'},
  {name:'Het witte stadje Thorn',type:'Stad en erfgoed',lat:51.16,lon:5.84,text:'Historisch centrum met karakteristieke witte gevels.'},
  {name:'Drielandenpunt Vaals',type:'Landschap en uitzicht',lat:50.75,lon:6.02,text:'Uitstapje in het Zuid-Limburgse heuvelland bij de landsgrenzen.'}]},
 'Noord-Brabant':{slug:'noord-brabant',intro:'Noord-Brabant combineert natuurgebieden, bourgondische steden en bekende dagattracties. Kies uitstapjes op basis van afstand én het seizoen.',places:[
  {name:'De Efteling',type:'Attractiepark',lat:51.65,lon:5.05,text:'Groot attractiepark in Kaatsheuvel met sprookjes en attracties.'},
  {name:'Safaripark Beekse Bergen',type:'Dieren en gezin',lat:51.52,lon:5.12,text:'Safaripark bij Hilvarenbeek voor een uitgebreid dagbezoek.'},
  {name:'Nationaal Park De Biesbosch',type:'Water en natuur',lat:51.72,lon:4.80,text:'Zoetwatergetijdengebied voor varen, wandelen en natuurbeleving.'},
  {name:'Van Gogh Village Nuenen',type:'Kunst en erfgoed',lat:51.47,lon:5.55,text:'Locaties en verhalen rond Vincent van Gogh in Nuenen.'},
  {name:'Loonse en Drunense Duinen',type:'Natuur en wandelen',lat:51.66,lon:5.14,text:'Uitgestrekt stuifzand- en bosgebied voor wandelen en fietsen.'},
  {name:'Historische binnenstad ’s-Hertogenbosch',type:'Stad en cultuur',lat:51.69,lon:5.30,text:'Monumenten, musea en vaarroutes in de Brabantse hoofdstad.'}]},
 'Noord-Holland':{slug:'noord-holland',intro:'Noord-Holland biedt kust, duinen, eilanden, historische steden en industrieel erfgoed. Houd rekening met ponten, eilandverbindingen en seizoensdrukte.',places:[
  {name:'Zaanse Schans',type:'Erfgoed en molens',lat:52.47,lon:4.82,text:'Historisch industrie- en molenlandschap aan de Zaan.'},
  {name:'Zuiderzeemuseum',type:'Museum en geschiedenis',lat:52.70,lon:5.29,text:'Binnen- en buitenmuseum in Enkhuizen over het leven rond de Zuiderzee.'},
  {name:'Ecomare op Texel',type:'Natuur en gezin',lat:53.08,lon:4.75,text:'Natuurmuseum en opvangcentrum op Texel.'},
  {name:'Muiderslot',type:'Kasteel en geschiedenis',lat:52.33,lon:5.07,text:'Middeleeuws kasteel in Muiden met museumfunctie.'},
  {name:'Schoorlse Duinen',type:'Kustnatuur en wandelen',lat:52.70,lon:4.69,text:'Hoog duingebied met wandel- en fietsroutes.'},
  {name:'Teylers Museum en Haarlem',type:'Museum en stad',lat:52.38,lon:4.64,text:'Historisch museum en monumentale binnenstad.'}]},
 'Overijssel':{slug:'overijssel',intro:'Overijssel heeft waterrijke natuur, Hanzesteden, Sallandse heuvels en Twentse cultuur. De dichtstbijzijnde optie is niet altijd de snelste route.',places:[
  {name:'Giethoorn',type:'Waterdorp en varen',lat:52.74,lon:6.08,text:'Bekend waterdorp met grachten, bruggen en vaarroutes.'},
  {name:'Nationaal Park Weerribben-Wieden',type:'Water en natuur',lat:52.78,lon:5.95,text:'Laagveenmoeras met vaar-, fiets- en wandelmogelijkheden.'},
  {name:'Nationaal Park Sallandse Heuvelrug',type:'Natuur en wandelen',lat:52.35,lon:6.42,text:'Bos en heide op de stuwwal tussen Holten en Hellendoorn.'},
  {name:'Avonturenpark Hellendoorn',type:'Attractiepark',lat:52.39,lon:6.45,text:'Attractiepark voor gezinnen bij Hellendoorn.'},
  {name:'Hanzestad Deventer',type:'Stad en historie',lat:52.25,lon:6.16,text:'Historische binnenstad aan de IJssel met musea en evenementen.'},
  {name:'Rijksmuseum Twenthe',type:'Kunst en cultuur',lat:52.22,lon:6.90,text:'Kunstmuseum in Enschede met een brede collectie.'}]},
 'Utrecht':{slug:'utrecht',intro:'De provincie Utrecht combineert stad, kastelen, landgoederen en bosrijke heuvelrug. Veel bestemmingen zijn compact maar kunnen op drukke dagen extra reistijd vragen.',places:[
  {name:'Domtoren en binnenstad Utrecht',type:'Stad en erfgoed',lat:52.09,lon:5.12,text:'Historisch hart van Utrecht met grachten, musea en monumenten.'},
  {name:'Spoorwegmuseum',type:'Museum en gezin',lat:52.09,lon:5.13,text:'Museum in Utrecht over treinen en spoorweggeschiedenis.'},
  {name:'Kasteel de Haar',type:'Kasteel en park',lat:52.12,lon:4.99,text:'Monumentaal kasteel bij Haarzuilens met tuinen en park.'},
  {name:'Nationaal Park Utrechtse Heuvelrug',type:'Natuur en wandelen',lat:52.04,lon:5.34,text:'Bosrijk gebied met landgoederen, fiets- en wandelroutes.'},
  {name:'DierenPark Amersfoort',type:'Dierentuin en gezin',lat:52.16,lon:5.39,text:'Dierenpark in een bosrijke omgeving bij Amersfoort.'}]},
 'Zeeland':{slug:'zeeland',intro:'Zeeland draait om kust, deltawerken, historische plaatsen en watersport. Afstanden lijken klein, maar bruggen en dammen bepalen vaak de echte reistijd.',places:[
  {name:'Deltapark Neeltje Jans',type:'Waterbouw en gezin',lat:51.63,lon:3.70,text:'Bezoekerslocatie over de Deltawerken op de Oosterscheldekering.'},
  {name:'Historisch Veere',type:'Stad en haven',lat:51.55,lon:3.67,text:'Monumentale havenplaats aan het Veerse Meer.'},
  {name:'Middelburg',type:'Stad en cultuur',lat:51.50,lon:3.61,text:'Historische provinciehoofdstad met monumenten en musea.'},
  {name:'Nationaal Park Oosterschelde',type:'Water en natuur',lat:51.60,lon:3.85,text:'Getijdengebied voor natuurbeleving, varen en duiken.'},
  {name:'Het Zwin',type:'Kustnatuur en vogels',lat:51.36,lon:3.37,text:'Grensoverschrijdend getijdengebied aan de Zeeuws-Vlaamse kust.'},
  {name:'Stranden van Walcheren',type:'Kust en wandelen',lat:51.57,lon:3.50,text:'Brede kustzone met badplaatsen, duinen en wandelmogelijkheden.'}]},
 'Zuid-Holland':{slug:'zuid-holland',intro:'Zuid-Holland combineert kust, molens, grote steden en waterrijke natuur. Verkeer en seizoen kunnen de reistijd sterk beïnvloeden.',places:[
  {name:'Werelderfgoed Kinderdijk',type:'Molens en landschap',lat:51.88,lon:4.63,text:'Historisch molenlandschap in de Alblasserwaard.'},
  {name:'Duinrell',type:'Attractie- en waterpark',lat:52.15,lon:4.38,text:'Attractiepark in Wassenaar met attracties en waterpark.'},
  {name:'Madurodam',type:'Gezinsuitje',lat:52.10,lon:4.30,text:'Miniatuurpark in Den Haag met Nederlandse gebouwen en verhalen.'},
  {name:'Markthal en centrum Rotterdam',type:'Stad en architectuur',lat:51.92,lon:4.49,text:'Uitvalsbasis voor moderne architectuur, musea en havenstad.'},
  {name:'Biesboschcentrum Dordrecht',type:'Water en natuur',lat:51.79,lon:4.77,text:'Startpunt voor natuur- en vaaractiviteiten in de Hollandse Biesbosch.'},
  {name:'Keukenhof en bollenstreek',type:'Bloemen en seizoen',lat:52.27,lon:4.55,text:'Seizoensbestemming rond voorjaarsbloei; controleer openingsperiode vooraf.'}]}
};

const haversine=(a,b,c,d)=>{const r=6371,rad=x=>x*Math.PI/180,dp=rad(c-a),dl=rad(d-b);const q=Math.sin(dp/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dl/2)**2;return 2*r*Math.asin(Math.sqrt(q))};
const roundDistance=km=>km<10?Math.max(1,Math.round(km)):Math.round(km/5)*5;
const cookieBlock='<div class="cookie"><strong>Cookies</strong><p>CampingKiezer gebruikt cookies. Kies welke cookies je toestaat.</p><div class="cookie-actions"><button class="btn btn-brand" data-cookie="all">Alle cookies</button><button class="btn btn-outline" data-cookie="necessary">Noodzakelijke cookies</button></div></div>';
const cookieRe=/<div class="cookie"><strong>[\s\S]*?<div class="cookie-actions">[\s\S]*?<\/div><\/div>/g;

function profileData(html){
 const block=html.match(/<script[^>]+data-v84-schema="profile"[^>]*>([\s\S]*?)<\/script>/)?.[1];if(!block)return null;
 try{const json=JSON.parse(block);const graph=json['@graph']||[];return graph.find(x=>x['@type']==='Campground')||null}catch{return null}
}

function nearbySection(camp){
 const region=camp?.address?.addressRegion,data=provinceData[region];if(!data)return '';
 const name=camp.name||'deze camping',city=camp.address?.addressLocality||region,lat=Number(camp.geo?.latitude),lon=Number(camp.geo?.longitude);
 const ranked=data.places.map(p=>({...p,distance:Number.isFinite(lat)&&Number.isFinite(lon)?haversine(lat,lon,p.lat,p.lon):null})).sort((a,b)=>(a.distance??9999)-(b.distance??9999)).slice(0,4);
 const cards=ranked.map(p=>`<article class="v140-nearby-card"><span>${esc(p.type)}</span><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p>${p.distance===null?'':`<strong>Hemelsbreed circa ${roundDistance(p.distance)} km</strong>`}</article>`).join('');
 return `<section class="v140-nearby" data-v140-nearby><div class="v84-section-label">Omgeving van ${esc(city)}</div><h2>Bezienswaardigheden en uitstapjes rond ${esc(name)}</h2><p>Voor een vakantiedag buiten de camping zijn dit enkele bekende bestemmingen in ${esc(region)}, gerangschikt op hemelsbrede afstand vanaf de kaartlocatie van ${esc(name)}. De werkelijke route, reistijd, toegang en openingstijden kunnen afwijken.</p><div class="v140-nearby-grid">${cards}</div><div class="v140-nearby-actions"><a class="btn btn-outline" href="/bezienswaardigheden/${data.slug}/">Meer zien in ${esc(region)} →</a><a href="/regios/${data.slug}/">Campings in ${esc(region)} vergelijken →</a></div></section>`;
}

function provincePage(region,data,header,footer){
 const url=`https://camping-kiezer.nl/bezienswaardigheden/${data.slug}/`,cards=data.places.map((p,i)=>`<article class="v140-attraction-card"><span>${String(i+1).padStart(2,'0')} · ${esc(p.type)}</span><h2>${esc(p.name)}</h2><p>${esc(p.text)}</p></article>`).join('');
 const schema={"@context":"https://schema.org","@type":"CollectionPage",name:`Bezienswaardigheden in ${region}`,url,description:data.intro,mainEntity:{"@type":"ItemList",itemListElement:data.places.map((p,i)=>({"@type":"ListItem",position:i+1,name:p.name}))}};
 return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bezienswaardigheden in ${esc(region)} bij je camping | CampingKiezer</title><meta name="description" content="Ontdek natuur, cultuur en gezinsuitjes in ${esc(region)} en vergelijk campings vanuit een praktische uitvalsbasis."><link rel="canonical" href="${url}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/style.css?v=110"><link rel="stylesheet" href="/assets/visual-system-v120.css"><link rel="stylesheet" href="/assets/nearby-v140.css"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body>${header}<main><section class="page-hero"><div class="container"><div class="eyebrow">Omgeving kiezen</div><h1>Bezienswaardigheden in ${esc(region)}</h1><p>${esc(data.intro)}</p><div class="cta-row"><a class="btn btn-brand" href="/regios/${data.slug}/">Vergelijk campings in ${esc(region)}</a><a class="btn btn-outline" href="/vergelijken/">Zet campings naast elkaar</a></div></div></section><section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Natuur, cultuur en gezin</div><h2>Ideeën voor een dag buiten de camping</h2><p>Gebruik deze selectie als startpunt. Controleer vóór vertrek de officiële bezoekersinformatie, bereikbaarheid en actuele openingstijden.</p></div></div><div class="v140-attraction-grid">${cards}</div></div></section><section class="section alt"><div class="container prose"><h2>Zo kies je een camping als uitvalsbasis</h2><p>Kijk niet alleen naar de provincie. Vergelijk de hemelsbrede afstand op het campingprofiel met de echte autoroute, fietsroute of verbinding met het openbaar vervoer. Een korte afstand over water of natuurgebied kan over de weg langer duren.</p><h2>Plan met kinderen en bij slecht weer</h2><p>Zet minstens één buitenactiviteit en één binnenoptie op je lijst. Controleer leeftijdsadvies, toegankelijkheid, reservering en seizoensopening rechtstreeks bij de bestemming. CampingKiezer toont geen live openingstijden of toegangsprijzen.</p><h2>Combineer omgeving en campingvoorzieningen</h2><p>Een camping met veel voorzieningen kan prettig zijn voor rustdagen. Wie dagelijks op pad wil, kan juist meer hebben aan een centrale ligging. Gebruik daarom zowel het campingprofiel als de omgevinginformatie voordat je boekt.</p></div></section></main>${footer}${cookieBlock}<script src="/assets/app.js" defer></script><script src="/assets/measurement-config-v136.js" defer></script><script src="/assets/measurement-v136.js" defer></script></body></html>`;
}

const nearbyCss=`.v140-nearby{margin-top:28px;padding:28px;border:1px solid #dce8e2;border-radius:24px;background:#f7fbf8}.v140-nearby>p{max-width:850px}.v140-nearby-grid,.v140-attraction-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}.v140-nearby-card,.v140-attraction-card{padding:20px;border:1px solid #dce8e2;border-radius:18px;background:#fff}.v140-nearby-card span,.v140-attraction-card span{display:block;color:#527064;font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.v140-nearby-card h3,.v140-attraction-card h2{margin:8px 0}.v140-nearby-card strong{display:block;margin-top:14px;color:#0e6b4e}.v140-nearby-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:22px}.v140-attraction-grid{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:760px){.v140-nearby,.v140-nearby-card,.v140-attraction-card{padding:18px}.v140-nearby-grid,.v140-attraction-grid{grid-template-columns:1fr}}`;
write('assets/nearby-v140.css',nearbyCss);

let profileSections=0,profileDistances=0;
for(const dirent of fs.readdirSync(path.join(root,'camping'),{withFileTypes:true})){
 if(!dirent.isDirectory())continue;const rel=`camping/${dirent.name}/index.html`,file=path.join(root,rel);if(!fs.existsSync(file))continue;let html=read(rel),camp=profileData(html),section=nearbySection(camp);if(!section)continue;
 html=html.replace(/<section class="v140-nearby" data-v140-nearby>[\s\S]*?<\/section>/,'');
 if(!html.includes('/assets/nearby-v140.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/nearby-v140.css"></head>');
 const marker='<section class="v84-related-locations">';
 html=html.includes(marker)?html.replace(marker,section+marker):html.replace('</main>',section+'</main>');
 write(rel,html);profileSections++;if(section.includes('Hemelsbreed circa'))profileDistances++;
}

const source=read('regios/nederland/index.html');
const header=source.match(/<div class="topbar">[\s\S]*?<\/header>/)?.[0]||'';
const footer=source.match(/<footer class="footer">[\s\S]*?<\/footer>/)?.[0]||'';
for(const [region,data] of Object.entries(provinceData)){
 write(`bezienswaardigheden/${data.slug}/index.html`,provincePage(region,data,header,footer));
 const rel=`regios/${data.slug}/index.html`;if(!fs.existsSync(path.join(root,rel)))continue;let html=read(rel);
 html=html.replace(/<section class="section v140-province-attractions"[\s\S]*?<\/section>/,'');
 const cards=data.places.slice(0,4).map(p=>`<article><span>${esc(p.type)}</span><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p></article>`).join('');
 const section=`<section class="section v140-province-attractions" data-v140-province-attractions><div class="container"><div class="section-head"><div><div class="eyebrow">Meer dan alleen overnachten</div><h2>Bezienswaardigheden in ${esc(region)}</h2><p>${esc(data.intro)}</p></div><a class="btn btn-outline" href="/bezienswaardigheden/${data.slug}/">Bekijk alle omgevingstips →</a></div><div class="v140-attraction-grid">${cards}</div></div></section>`;
 if(!html.includes('/assets/nearby-v140.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/nearby-v140.css"></head>');
 html=html.replace('</main>',section+'</main>');write(rel,html);
}

const providerKinds={
 'BoekUwBuitenhuis.nl':['Vakantiehuizen en parken','Vergelijk vakantiehuizen en parken en controleer per accommodatie de ligging, inventaris en totale reissom.'],
 'Club del Sole':['Campings en resorts','Bekijk het actuele camping- en resortaanbod en controleer welk verblijfstype op de gekozen locatie wordt aangeboden.'],
 'Estivo Travel':['Campingvakanties in Europa','Vergelijk campingvakanties en ingerichte accommodaties op bestemming, reisperiode en bezetting.'],
 'friends2camp':['Kampeer- en campingvakanties','Bekijk het actuele aanbod en controleer bij welke camping, accommodatie en aanbieder je reserveert.'],
 'Glampings.com':['Glamping en bijzondere accommodaties','Vergelijk glampingverblijven op sanitair, slaapindeling, ligging en volledige prijs.'],
 'HU Openair':['Campings en openluchtvakanties','Bekijk campings en accommodaties en controleer de exacte locatie en voorwaarden vóór reserveren.'],
 'Parador Vakantieparken':['Vakantieparken','Vergelijk parken en accommodaties op ligging, capaciteit, voorzieningen en totale reissom.'],
 'Roompot':['Vakantieparken en campings','Bekijk parken, campings en accommodaties en vergelijk altijd dezelfde reisdata en groepsgrootte.'],
 'SingleCamps':['Groeps- en singlereizen','Controleer reisprogramma, doelgroep, vertrekvoorwaarden en wat in de prijs is inbegrepen.'],
 'Tendi':['Kleinschalige campingvakanties','Bekijk campingverblijven en controleer de exacte accommodatie, inventaris en ligging.'],
 'TinyParks':['Kleinschalige vakantieparken','Vergelijk locaties en verblijven op rust, omgeving, faciliteiten en volledige kosten.'],
 'Vacanze col Cuore':['Campings en resorts','Bekijk campings en resorts en controleer de gekozen accommodatie en boekingsvoorwaarden.'],
 'Villatent':['Safaritenten en glamping','Vergelijk safaritenten op sanitair, bedindeling, inventaris en ligging op de camping.'],
 'VistaCamp':['Campingvakanties','Bekijk het actuele campingaanbod en controleer bestemming, accommodatie en totaalprijs.']
};
const indexableProviderNames=new Set(Object.keys(providerKinds));
const live=JSON.parse(read('TRADETRACKER-STATUS-v139.json')),old=JSON.parse(read('TRADETRACKER-GOEDKEURINGEN-v129.json')),oldIds=new Set(old.campaigns.map(x=>String(x.campaign_id)));
const newProviders=live.accepted.filter(x=>!oldIds.has(String(x.campaign_id)));
const providerSlugs={"BoekUwBuitenhuis.nl":"boekuwbuitenhuis","Club del Sole":"club-del-sole","Estivo Travel":"estivo-travel","Glampings.com":"glampings-com","HU Openair":"hu-openair","Mölke":"molke","Noorder Sandt":"noorder-sandt","De Pampel":"de-pampel","Petite Suisse":"petite-suisse","Recreatiepark Den Blanken":"recreatiepark-den-blanken","Signy-l'Abbaye":"signy-l-abbaye","Vacanze col Cuore":"vacanze-col-cuore","Vakantiepark Schouwen":"vakantiepark-schouwen"};
const tracking=p=>`https://tc.tradetracker.net/?c=${p.campaign_id}&m=12&a=${live.site_id}&r=&u=${encodeURIComponent(p.destination)}`;
function providerPage(p,slug){
 const kind=providerKinds[p.name]||['Camping- en vakantieaanbod',`Bekijk het actuele aanbod van ${p.name} en controleer de exacte locatie, verblijfsvorm en voorwaarden.`],index=indexableProviderNames.has(p.name)?'index,follow,max-image-preview:large':'noindex,follow',canonical=`https://camping-kiezer.nl/aanbieders/${slug}/`,link=tracking(p);
 return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.name)} bekijken | CampingKiezer</title><meta name="description" content="Bekijk ${esc(kind[0].toLowerCase())} via ${esc(p.name)} en controleer actuele prijzen, beschikbaarheid en voorwaarden bij de aanbieder."><link rel="canonical" href="${canonical}"><meta name="robots" content="${index}"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/style.css?v=110"><link rel="stylesheet" href="/assets/visual-system-v120.css"></head><body>${header}<main><section class="page-hero"><div class="container"><div class="eyebrow">Goedgekeurde boekingspartner</div><h1>${esc(p.name)}</h1><p>${esc(kind[1])}</p><div class="cta-row"><a class="btn btn-brand" href="${esc(link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(slug)}" data-affiliate-network="tradetracker" data-affiliate-campaign="${p.campaign_id}" data-placement="provider-hero">Bekijk actueel aanbod →</a><a class="btn btn-outline" href="/onze-keuzes/">Terug naar onze keuzes</a></div></div></section><section class="section"><div class="container prose"><h2>Wat kun je bij ${esc(p.name)} controleren?</h2><p>${esc(kind[1])} Vul altijd je eigen reisdata, bezetting en voorkeuren in. Een vanafprijs of beschikbaarheidsmelding kan veranderen zodra je andere data of extra opties kiest.</p><h2>Vergelijk dezelfde uitgangspunten</h2><p>Vergelijk alleen aanbiedingen voor dezelfde periode, groepsgrootte en verblijfsvorm. Kijk naar verplichte kosten, schoonmaak, bedlinnen, huisdieren, toeristenbelasting, borg en annuleringsvoorwaarden voor zover die bij jouw aanbod gelden.</p><h2>Controleer de laatste boekingsstap</h2><p>Na de klik verlaat je CampingKiezer. Controleer op de website van ${esc(p.name)} opnieuw de naam van de camping of het park, het accommodatietype, de totale reissom en de voorwaarden. De bevestiging en betaling lopen via de aanbieder.</p><div class="notice"><strong>Affiliate-uitleg.</strong> ${esc(p.name)} is goedgekeurd voor CampingKiezer binnen TradeTracker. CampingKiezer kan een commissie ontvangen na een geldige boeking. Dit verandert de onafhankelijke volgorde van campingprofielen niet.</div><p><a class="btn btn-brand" href="${esc(link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(slug)}" data-affiliate-network="tradetracker" data-affiliate-campaign="${p.campaign_id}" data-placement="provider-footer">Naar ${esc(p.name)} →</a></p></div></section></main>${footer}${cookieBlock}<script src="/assets/app.js" defer></script><script src="/assets/measurement-config-v136.js" defer></script><script src="/assets/measurement-v136.js" defer></script></body></html>`;
}
let providerPages=0,providerPreserved=0;
for(const p of newProviders){const slug=providerSlugs[p.name]||slugify(p.name),rel=`aanbieders/${slug}/index.html`;if(fs.existsSync(path.join(root,rel))){providerPreserved++;continue}write(rel,providerPage(p,slug));providerPages++}

let choices=read('onze-keuzes/index.html');
const acceptedCards=live.accepted.map(p=>`<article class="approved-partner-card" data-campaign-id="${p.campaign_id}"><h3>${esc(p.name)}</h3><p>Goedgekeurde TradeTracker-partner voor CampingKiezer.</p><a class="btn" href="${esc(tracking(p))}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${esc(slugify(p.name))}" data-affiliate-network="tradetracker" data-affiliate-campaign="${p.campaign_id}" data-placement="approved-partners">Bekijk actueel aanbod →</a></article>`).join('');
const approvedSection=`<section class="section approved-partners-final" id="goedgekeurde-partners"><div class="container"><div class="section-head"><div><span class="eyebrow">Live gecontroleerd op 11 september 2026</span><h2>Alle ${live.accepted.length} goedgekeurde TradeTracker-partners</h2><p>Alleen campagnes die voor CampingKiezer (site-ID ${live.site_id}) zijn geaccepteerd staan hier. Campagnes onder beoordeling worden automatisch geweerd.</p></div></div><div class="approved-partner-grid">${acceptedCards}</div><p class="affiliate-note">Een klik kan CampingKiezer een commissie opleveren. Controleer de actuele prijs, beschikbaarheid en voorwaarden altijd bij de aanbieder.</p></div></section>`;
choices=choices.replace(/<section class="section approved-partners-final"[\s\S]*?<\/section>/,approvedSection);write('onze-keuzes/index.html',choices);

let providersIndex=read('aanbieders/index.html');
providersIndex=providersIndex.replace(/<article class="provider-summary" data-v140-approved-provider>[\s\S]*?<\/article>/g,'');
const newProviderCards=newProviders.map(p=>{const slug=providerSlugs[p.name]||slugify(p.name);return `<article class="provider-summary" data-v140-approved-provider><span class="status-pill verified">Goedgekeurd voor CampingKiezer</span><h2>${esc(p.name)}</h2><p>${esc((providerKinds[p.name]||['Camping- en vakantieaanbod',`Bekijk het actuele aanbod van ${p.name}.`])[1])}</p><a class="btn btn-brand" href="/aanbieders/${slug}/">Bekijk ${esc(p.name)} →</a></article>`}).filter(card=>!providersIndex.includes(card.match(/href="([^"]+)/)[1])).join('');
providersIndex=providersIndex.replace(/(<div class="container provider-summary-grid">)([\s\S]*?)(<\/div>\s*<\/section>)/,(_,open,body,close)=>open+body+newProviderCards+close);
const providerCount=new Set([...providersIndex.matchAll(/href="\/aanbieders\/([^"/]+)\//g)].map(m=>m[1])).size;
providersIndex=providersIndex.replace(/<meta name="description" content="Bekijk actuele boekingsmogelijkheden via \d+ aanbieders/,`<meta name="description" content="Bekijk actuele boekingsmogelijkheden via ${providerCount} aanbieders`).replace(/Vergelijk actuele mogelijkheden via \d+ aanbieders/,`Vergelijk actuele mogelijkheden via ${providerCount} aanbieders`);
write('aanbieders/index.html',providersIndex);

let claim=read('claim-uw-camping/index.html');
claim=claim.replace(/<section class="section v140-claim-policy"[\s\S]*?<\/section>/,'');
const claimPolicy='<section class="section v140-claim-policy" data-v140-claim-policy><div class="container prose"><div class="eyebrow">Gratis feiten, betaalde groei</div><h2>Waarom het claimen van een basisprofiel gratis blijft</h2><p>Correcte campinggegevens maken CampingKiezer beter voor bezoekers én beter vindbaar. Daarom blijven identiteitscontrole, feitelijke correcties en de officiële bron gratis. Een camping hoeft nooit te betalen om juiste basisinformatie te laten staan.</p><h2>Waarvoor kan een camping wel betalen?</h2><p>Plus en Pro zijn bedoeld voor extra commerciële presentatie: eigen beeldmateriaal, uitgebreidere teksten, campagnes, snellere verwerking en rapportage. Betaling koopt geen hogere onafhankelijke rangschikking en verandert geen feiten in het profiel.</p><p><strong>Ons verdienmodel:</strong> affiliatecommissie bij geldige boekingen, betaalde presentatiepakketten en gecontroleerde advertenties. Daarmee houden we de basisdatabase open en betrouwbaar.</p></div></section>';
claim=claim.replace('<section class="section v79-claim-plans">',claimPolicy+'<section class="section v79-claim-plans">');write('claim-uw-camping/index.html',claim);

for(const file of walkHtml(root)){
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(cookieRe,cookieBlock);
 if(html.includes('/assets/measurement-v136.js')&&!html.includes('/assets/app.js'))html=html.replace(/(<script[^>]+src="\/assets\/measurement-config-v136\.js"[^>]*><\/script>)/,'<script src="/assets/app.js" defer></script>$1');
 if(!html.includes('class="cookie"')&&html.includes('/assets/app.js'))html=html.replace(/(<script[^>]+src="\/assets\/app\.js"[^>]*>\s*<\/script>)/,cookieBlock+'$1');
 fs.writeFileSync(file,html);
}

const attractionUrls=Object.values(provinceData).map(d=>`<url><loc>https://camping-kiezer.nl/bezienswaardigheden/${d.slug}/</loc><lastmod>${releaseDate}</lastmod></url>`).join('');
write('sitemap-bezienswaardigheden.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${attractionUrls}</urlset>`);
let coreSitemap=read('sitemap-core.xml');
for(const p of newProviders.filter(x=>indexableProviderNames.has(x.name))){const slug=providerSlugs[p.name]||slugify(p.name),url=`https://camping-kiezer.nl/aanbieders/${slug}/`;coreSitemap=coreSitemap.replace(new RegExp(`<url><loc>${url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}<\\/loc>[\\s\\S]*?<\\/url>`),'')}
const priorityProviderUrls=newProviders.filter(x=>indexableProviderNames.has(x.name)).map(p=>{const slug=providerSlugs[p.name]||slugify(p.name);return `<url><loc>https://camping-kiezer.nl/aanbieders/${slug}/</loc><lastmod>${releaseDate}</lastmod></url>`}).join('');
coreSitemap=coreSitemap.replace('</urlset>',priorityProviderUrls+'</urlset>').replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,`<lastmod>${releaseDate}</lastmod>`);write('sitemap-core.xml',coreSitemap);
let sitemap=read('sitemap.xml');
sitemap=sitemap.replace(/<sitemap><loc>https:\/\/camping-kiezer\.nl\/sitemap-bezienswaardigheden\.xml<\/loc>[\s\S]*?<\/sitemap>/,'');
sitemap=sitemap.replace('</sitemapindex>',`<sitemap><loc>https://camping-kiezer.nl/sitemap-bezienswaardigheden.xml</loc><lastmod>${releaseDate}</lastmod></sitemap></sitemapindex>`).replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,`<lastmod>${releaseDate}</lastmod>`);write('sitemap.xml',sitemap);
for(const name of ['sitemap-campings.xml','sitemap-bungalowparken.xml','sitemap-camperplaatsen.xml','sitemap-glampings.xml','sitemap-vakantieparken.xml','sitemap-regios.xml']){let xml=read(name).replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,`<lastmod>${releaseDate}</lastmod>`);write(name,xml)}
let campingSitemap=read('sitemap-campings.xml').replace(/<url><loc>https:\/\/camping-kiezer\.nl\/camping\/vakantiepark-dierenbos\/<\/loc>[\s\S]*?<\/url>/,'').replace(/\s+<\/urlset>/,'</urlset>').trim()+'\n';write('sitemap-campings.xml',campingSitemap);

const generatedProviderPages=newProviders.filter(p=>{const slug=providerSlugs[p.name]||slugify(p.name),file=path.join(root,'aanbieders',slug,'index.html');return fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes(`data-affiliate-campaign="${p.campaign_id}"`)}).length;
const report={version:140,release_date:releaseDate,cookie_banner:'Cookies only; no statistics or analytics wording',profile_nearby_sections:profileSections,profile_sections_with_distance:profileDistances,province_guides:Object.keys(provinceData).length,new_approved_campaigns:newProviders.length,new_provider_pages:generatedProviderPages,preserved_existing_provider_pages:newProviders.length-generatedProviderPages,live_accepted_partners:live.accepted.length,live_pending_campaigns:live.pending.length,claim_model:'Free verified facts; paid presentation, campaigns and reporting',seo_policy:'Noindex retained for weak/unknown pages; only canonical indexable pages are submitted'};
write('RELEASE-v140-MARKTLEIDER.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
