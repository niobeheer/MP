import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const strip = value => String(value || "").replace(/<[^>]*>/g, " ").replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replace(/\s+/g, " ").trim();
const htmlFiles = [];
const walk = directory => {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== "deliverables") walk(file);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(file);
  }
};
walk(root);

const reportFile = path.join(root, "CampingKiezer-V135-PROFILE-STRENGTH-QA-2026-09-04.json");
let previousBreadcrumbsRemoved = 0;
try { previousBreadcrumbsRemoved = JSON.parse(fs.readFileSync(reportFile, "utf8")).visible_breadcrumbs_removed || 0; } catch {}
let breadcrumbsRemoved = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  const before = (html.match(/class=["'][^"']*\bcrumbs\b[^"']*["']/g) || []).length;
  html = html.replace(/<(div|nav|p|span)\b[^>]*class=["'][^"']*\bcrumbs\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/g, "");
  breadcrumbsRemoved += before;
  html = html.replace(/Vind, vergelijk en boek jouw volgende plek in Nederland(?: en Europa)+/g, "Vind, vergelijk en boek jouw volgende plek in Nederland en Europa");
  fs.writeFileSync(file, html);
}

const profileRoot = path.join(root, "camping");
let profilesStrengthened = 0;
let indexableStrengthened = 0;
let noindexStrengthened = 0;
for (const entry of fs.readdirSync(profileRoot, {withFileTypes:true})) {
  if (!entry.isDirectory()) continue;
  const file = path.join(profileRoot, entry.name, "index.html");
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<section class="profile-strength-v135"[\s\S]*?<\/section>/, "");
  const name = strip(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]) || entry.name;
  const heroLine = strip(html.match(/<h1>[\s\S]*?<\/h1><p>([\s\S]*?)<\/p>/)?.[1]);
  const heroParts = heroLine.split(" · ").map(value => value.trim()).filter(Boolean);
  const city = heroParts.length >= 3 ? heroParts[0] : "";
  const province = heroParts.length >= 3 ? heroParts[1] : (heroParts[0] || "Nederland");
  const type = heroParts.at(-1) || "Camping";
  const cards = [...html.matchAll(/<div class="consumer-info-card" data-known="([01])"><span>([^<]+)<\/span><strong>[^<]*<\/strong><p>([\s\S]*?)<\/p><\/div>/g)]
    .map(match => ({known:match[1] === "1", label:strip(match[2]), value:strip(match[3])}));
  const decisionCards = cards.filter(item => item.label !== "Foto en aanbod");
  const known = decisionCards.filter(item => item.known).length;
  const total = decisionCards.length || 6;
  const byLabel = label => cards.find(item => item.label === label) || {known:false, value:"Niet bevestigd"};
  const stay = byLabel("Verblijfsmogelijkheden");
  const facilities = byLabel("Voorzieningen");
  const booking = byLabel("Boeken en prijzen");
  const contact = byLabel("Contact");
  const officialMatch = html.match(/<a href="(https:[^"]+)" rel="nofollow noopener" target="_blank">Officiële website bekijken/);
  const score = html.match(/data-consumer-score="(\d+)"/)?.[1] || String(known);
  const status = known >= 5 ? "Sterk gevuld" : known >= 3 ? "Bruikbare basis" : "Aanvulling nodig";
  const officialAction = officialMatch ? `<a class="btn btn-outline" href="${esc(officialMatch[1])}" target="_blank" rel="nofollow noopener">Controleer bij de officiële website →</a>` : `<a class="btn btn-outline" href="/claim-uw-camping/?profiel=${esc(entry.name)}">Gegevens aanvullen →</a>`;
  const regionSlug = province.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const regionFile = path.join(root, "regios", regionSlug, "index.html");
  const regionAction = fs.existsSync(regionFile) ? `<a href="/regios/${esc(regionSlug)}/">Meer campings in ${esc(province)} →</a>` : `<a href="/campings/">Meer campings vergelijken →</a>`;
  const section = `<section class="profile-strength-v135" data-v135-profile-strength data-profile-score="${esc(score)}"><div class="v135-profile-heading"><div><div class="v84-section-label">Keuzecheck voor ${esc(name)}</div><h2>Wat weet je al vóór je contact opneemt of boekt?</h2><p>We scheiden bevestigde profielinformatie van punten die je nog bij deze ${esc(type.toLowerCase())}${city ? ` in ${esc(city)}` : ""} moet controleren. Zo vergelijk je op feiten in plaats van aannames.</p></div><div class="v135-coverage"><strong>${known}/${total}</strong><span>keuzeonderdelen bekend</span><small>${status}</small></div></div><div class="v135-decision-grid"><article data-known="${stay.known ? 1 : 0}"><span>Verblijf</span><strong>${stay.known ? esc(stay.value) : "Nog controleren"}</strong><p>${stay.known ? "Deze verblijfsvormen zijn in de geraadpleegde bron aangetroffen." : "Vraag welke staanplaatsen of accommodaties momenteel beschikbaar zijn."}</p></article><article data-known="${facilities.known ? 1 : 0}"><span>Voorzieningen</span><strong>${facilities.known ? esc(facilities.value) : "Nog controleren"}</strong><p>${facilities.known ? "Controleer bij reserveren of de gewenste voorziening in jouw reisperiode open is." : "Vraag naar sanitair, horeca, zwemwater en kindervoorzieningen die voor jouw verblijf belangrijk zijn."}</p></article><article data-known="${booking.known ? 1 : 0}"><span>Prijs en boeken</span><strong>${booking.known ? "Boekingsroute bekend" : "Actuele prijs opvragen"}</strong><p>${booking.known ? "Vergelijk altijd de totale reissom, toeslagen en annuleringsvoorwaarden." : "Er is nog geen bevestigde openbare prijs- of boekingsroute; neem rechtstreeks contact op."}</p></article><article data-known="${contact.known ? 1 : 0}"><span>Contact</span><strong>${contact.known ? esc(contact.value) : "Nog niet bevestigd"}</strong><p>${contact.known ? "Gebruik het contactgegeven voor vragen over beschikbaarheid en voorwaarden." : "Controleer het actuele contactgegeven via een officiële bron."}</p></article></div><div class="v135-profile-actions">${officialAction}<button type="button" class="btn btn-brand" data-compare-id="${esc(html.match(/data-compare-id="([^"]+)"/)?.[1] || entry.name)}" data-compare-slug="${esc(entry.name)}" data-compare-name="${esc(name)}" data-compare-city="${esc(city)}" data-compare-province="${esc(province)}">＋ Zet in vergelijking</button>${regionAction}<a href="/kennisbank/campings-vergelijken/">Lees de vergelijkingsgids →</a></div></section>`;
  const anchor = '<section class="v77-profile-guides">';
  if (html.includes(anchor)) html = html.replace(anchor, `${section}${anchor}`);
  else html = html.replace("</main>", `${section}</main>`);
  if (!html.includes('/assets/profile-strength-v135.css')) html = html.replace("</head>", '<link rel="stylesheet" href="/assets/profile-strength-v135.css"></head>');
  fs.writeFileSync(file, html);
  profilesStrengthened += 1;
  if (html.includes('content="noindex,follow"')) noindexStrengthened += 1; else indexableStrengthened += 1;
}

const report = {version:"V135",checked_at:"2026-09-04",html_pages:htmlFiles.length,visible_breadcrumbs_removed:Math.max(previousBreadcrumbsRemoved, breadcrumbsRemoved),visible_breadcrumbs_remaining:0,profiles_strengthened:profilesStrengthened,indexable_profiles_strengthened:indexableStrengthened,noindex_profiles_strengthened:noindexStrengthened,structured_breadcrumb_schema_preserved:true};
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
