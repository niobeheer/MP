import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const expansion = JSON.parse(read("commercial/affiliate-expansion-v114.json"));
const approved = JSON.parse(read("commercial/approved-campaigns-v107.json"));
const ourChoices = read("onze-keuzes/index.html");
const home = read("index.html");
const functionCode = read("netlify/functions/affiliate-candidate-link.mjs");
const failures = [];

if (expansion.version !== "V114") failures.push("Uitbreidingsmanifest heeft niet versie V114");
if (expansion.networks.length !== 7) failures.push(`Verwacht 7 beoordeelde netwerken, gevonden ${expansion.networks.length}`);
if (expansion.programs.length !== 8) failures.push(`Verwacht 8 programmakandidaten, gevonden ${expansion.programs.length}`);
if (!expansion.policy.publish_only_after_approval) failures.push("Publicatiepoort na goedkeuring staat niet aan");

const approvedIds = new Set([
  ...approved.daisycon.map(item => item.program_id),
  ...approved.tradetracker.map(item => item.campaign_id),
]);
const keys = new Set();
for (const program of expansion.programs) {
  if (keys.has(program.key)) failures.push(`${program.key}: dubbele programmasleutel`);
  keys.add(program.key);
  if (!expansion.networks.some(network => network.key === program.network)) failures.push(`${program.key}: onbekend netwerk ${program.network}`);
  if (!/^https:\/\//.test(program.official_url)) failures.push(`${program.key}: officiële URL is niet HTTPS`);
  if (!program.allowed_destination_hosts.length) failures.push(`${program.key}: geen bestemmingshost toegestaan`);
  if (program.program_id && approvedIds.has(program.program_id)) failures.push(`${program.key}: kandidaat-ID staat al in goedgekeurde campagnes`);
  if (!functionCode.includes(`${program.key}:`) && !functionCode.includes(`"${program.key}":`)) failures.push(`${program.key}: ontbreekt in beveiligde kandidaat-linkfunctie`);
  for (const page of [home, ourChoices]) {
    if (page.includes(`/aanbieders/${program.key}/`) || page.includes(`data-provider="${program.key}"`)) failures.push(`${program.key}: onbevestigde kandidaat staat al op een publieke keuze-oppervlakte`);
  }
}

if (!functionCode.includes("AFFILIATE_APPROVED_PROVIDERS")) failures.push("Runtime-goedkeuringspoort ontbreekt");
if (!functionCode.includes("Partnerkoppeling nog niet actief")) failures.push("Veilige status voor onbevestigde partners ontbreekt");
if (!functionCode.includes("AFFILIATE_TEMPLATE_")) failures.push("Trackingtemplate-configuratie ontbreekt");

console.log(JSON.stringify({
  version: expansion.version,
  networks_reviewed: expansion.networks.length,
  program_candidates: expansion.programs.length,
  pending_approval: expansion.programs.filter(item => item.status === "pending_approval").map(item => item.name),
  ready_to_apply: expansion.programs.filter(item => item.status.startsWith("ready_to_apply")).map(item => item.name),
  public_candidate_links: 0,
  failures: failures.length,
  details: failures,
}, null, 2));

if (failures.length) process.exit(1);
