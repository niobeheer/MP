import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const strip=s=>String(s||'').replace(/<[^>]+>/g,' ').replaceAll('&amp;','&').replace(/\s+/g,' ').trim();
const known=s=>!!s&&!/onbekend|niet bevestigd|nog controleren|niet gevonden|nog niet|ontbreekt/i.test(s);
const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.html'))files.push(f);}}walk(root);
const stats={version:136,profiles:0,compact_profiles_repaired:0,structured_atmosphere_images_removed:0,html_pages:files.length};
for(const file of files){
 let h=fs.readFileSync(file,'utf8');
 if(h.includes('data-v135-profile-strength')){
  const cards=[...h.matchAll(/<div class="consumer-info-card"([^>]*)>([\s\S]*?)<\/div>/g)].map(m=>({attrs:m[1],label:strip(m[2].match(/<span>(.*?)<\/span>/s)?.[1]),strong:strip(m[2].match(/<strong>(.*?)<\/strong>/s)?.[1]),text:strip(m[2].match(/<p>(.*?)<\/p>/s)?.[1])}));
  const compact=cards.some(c=>c.label==='Verblijf');
  const get=label=>cards.find(c=>c.label===label);
  const field=c=>c?{value:c.attrs.includes('data-known')?c.text:c.strong,yes:c.attrs.includes('data-known')?c.attrs.includes('data-known="1"'):known(c.strong)}:{value:'',yes:false};
  const stay=field(get(compact?'Verblijf':'Verblijfsmogelijkheden'));
  const facilities=compact?{value:get('Verblijf')?.text||'',yes:known(get('Verblijf')?.text)}:field(get('Voorzieningen'));
  const contact=field(get('Contact'));const booking=field(get('Boeken en prijzen'));
  const name=strip(h.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]);
  const location=field(get('Locatie'));const count=[stay,facilities,contact,booking].filter(x=>x.yes).length;
  const old=h.match(/<section class="profile-strength-v135"[\s\S]*?<\/section>/)?.[0];
  const actions=old?.match(/<div class="v135-profile-actions">([\s\S]*?)<\/div>/)?.[1]||'';
  const values=[['Verblijf',stay,'Vraag welke verblijfsvormen beschikbaar zijn voor jouw reisdata.'],['Voorzieningen',facilities,'Vraag welke voorzieningen tijdens jouw verblijf geopend zijn.'],['Boekingsinformatie',booking,'Controleer beschikbaarheid en de volledige reissom bij de aanbieder.'],['Contact',contact,'Gebruik de vermelde contactroute voor vragen over je verblijf.']];
  const summary=[location.yes?`${name} staat vermeld in ${location.value}.`:`Op dit profiel vergelijk je de beschikbare gegevens van ${name}.`,stay.yes?`Het geregistreerde aanbod bestaat uit ${stay.value.toLowerCase()}.`:'De verblijfsvormen zijn nog niet bevestigd.',facilities.yes?`Als voorzieningen zijn ${facilities.value} vermeld.`:'Er is nog geen bevestigde voorzieningenlijst.'].join(' ');
  const section=`<section class="profile-strength-v135" data-v136-profile-strength data-profile-score="${count}"><div class="v135-profile-heading"><div><div class="v84-section-label">Keuzecheck voor ${esc(name)}</div><h2>Wat kun je op basis van dit profiel vergelijken?</h2><p>${esc(summary)}</p></div><div class="v135-coverage"><strong>${count}/4</strong><span>onderdelen met profielinformatie</span><small>Geen kwaliteitsbeoordeling</small></div></div><div class="v135-decision-grid">${values.map(([label,f,help])=>`<article data-known="${f.yes?1:0}"><span>${label}</span><strong>${f.yes?esc(f.value):'Nog niet bevestigd'}</strong><p>${help}</p></article>`).join('')}</div><p>Deze samenvatting gebruikt de brongegevens hierboven; de oorspronkelijke controledatum blijft gelden. Een ontbrekend gegeven betekent niet dat een voorziening afwezig is. Een websitevermelding is geen bevestiging van actuele prijzen of beschikbaarheid.</p><div class="v135-profile-actions">${actions}</div></section>`;
  if(!old)throw Error(file);h=h.replace(old,section);stats.profiles++;if(compact)stats.compact_profiles_repaired++;
  // Stock imagery may illustrate the page, never identify the actual campground in schema.
  if(h.includes('atmosphere-only'))h=h.replace(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g,(all,attrs,json)=>{try{const obj=JSON.parse(json);function visit(o){if(!o||typeof o!=='object')return;if(['Campground','LodgingBusiness','LocalBusiness'].includes(o['@type'])&&o.image){delete o.image;stats.structured_atmosphere_images_removed++;}for(const v of Object.values(o))if(typeof v==='object')visit(v);}visit(obj);return `<script type="application/ld+json"${attrs}>${JSON.stringify(obj)}</script>`;}catch{return all;}});
 }
 if(h.includes('</body>')&&!h.includes('/assets/measurement-v136.js'))h=h.replace('</body>','<script src="/assets/measurement-config-v136.js" defer></script><script src="/assets/measurement-v136.js" defer></script></body>');
 h=h.replaceAll('6 amp&amp;egrave;re','6 ampère').replaceAll('6 amp&egrave;re','6 ampère');
 fs.writeFileSync(file,h);
}
fs.appendFileSync(path.join(root,'assets/europe-v134.css'),'\n/* v136: author display must not override filtering. */\n.europe-offer-card[hidden]{display:none!important}\n');
let app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
app=app.replace("path.startsWith('/themas/')||path.startsWith('/aanbieders/')||exactHubs.includes(path)","path.startsWith('/themas/')||exactHubs.includes(path)");
// Prevent a provider-specific hero from receiving an unrelated stock background.
app=app.replace("document.documentElement.style.setProperty('--v120-hero-image'", "if(!path.startsWith('/aanbieders/')) document.documentElement.style.setProperty('--v120-hero-image'");
fs.writeFileSync(path.join(root,'assets/app.js'),app);
let llms=fs.readFileSync(path.join(root,'llms.txt'),'utf8').replace('Data snapshot: 2026-08-25','Navigation updated: 2026-09-05 (not a new verification date for individual profiles)').replace('Visible location profiles: 4111',`Visible location profiles: ${stats.profiles}`).replace('## Core directories','## Europe\n- https://camping-kiezer.nl/europa/\n\n## Core directories');fs.writeFileSync(path.join(root,'llms.txt'),llms);
fs.writeFileSync(path.join(root,'QA-V136-round1.json'),JSON.stringify(stats,null,2));console.log(stats);
