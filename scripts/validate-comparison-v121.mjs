import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(new URL('..',import.meta.url).pathname);
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const records=JSON.parse(read('data/campings-search-v74.json'));
const failures=[];
let buttons=0;
let stores=0;
for(const record of records){
  const relative=`camping/${record.slug}/index.html`;
  if(!fs.existsSync(path.join(root,relative))){failures.push(`${relative}: ontbreekt`);continue;}
  const html=read(relative);
  if(html.includes(`data-compare-id="${record.id}"`)) buttons+=1; else failures.push(`${relative}: vergelijkknop ontbreekt`);
  if(html.includes('/assets/compare-store.js')) stores+=1; else failures.push(`${relative}: vergelijkopslag ontbreekt`);
}
const store=read('assets/compare-store.js');
const compare=read('assets/compare-v73.js');
const search=read('assets/search-v74.js');
const page=read('vergelijken/index.html');
for(const token of ['const MAX = 3','maximaal drie campings','ck-compare-change']) if(!store.includes(token)) failures.push(`compare-store mist ${token}`);
for(const token of ['compare-differences','compare-copy','compare-preference','syncFromUrl','syncUrl(selected)','slice(0, 3)']) if(!compare.includes(token)) failures.push(`compare-v73 mist ${token}`);
for(const token of ['data-compare-id','data-compare-compact','CampingCompare?.sync']) if(!search.includes(token)) failures.push(`zoekresultaten missen ${token}`);
for(const token of ['/assets/compare-store.js','/assets/compare-v73.js','id="compare-differences"','id="compare-copy"']) if(!page.includes(token)) failures.push(`vergelijkpagina mist ${token}`);
const health=JSON.parse(read('health.json'));
if(health.version<121||health.compare_profile_buttons!==records.length) failures.push('health.json meldt V121 niet');
console.log(JSON.stringify({version:'V121',records:records.length,profile_buttons:buttons,profile_stores:stores,max_selection:3,differences_filter:true,shareable_url:true,preference_scoring:true,failures:failures.length,details:failures.slice(0,50)},null,2));
if(failures.length) process.exit(1);
