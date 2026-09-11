import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(new URL('..',import.meta.url).pathname);
const records=JSON.parse(fs.readFileSync(path.join(root,'data/campings-search-v74.json'),'utf8'));
const bySlug=new Map(records.map(record=>[record.slug,record]));
const esc=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
let updated=0;
let skipped=0;
for(const [slug,record] of bySlug){
  const file=path.join(root,'camping',slug,'index.html');
  if(!fs.existsSync(file)){skipped+=1;continue;}
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('data-compare-id=')) continue;
  const heroStart=html.indexOf('<section class="page-hero"');
  const heroEnd=html.indexOf('</section>',heroStart);
  if(heroStart<0||heroEnd<0){skipped+=1;continue;}
  let hero=html.slice(heroStart,heroEnd+10);
  const button=`<button type="button" class="btn btn-outline" data-compare-id="${esc(record.id)}" data-compare-slug="${esc(record.slug)}" data-compare-name="${esc(record.name)}" data-compare-city="${esc(record.city)}" data-compare-province="${esc(record.province)}">＋ Vergelijk deze camping</button>`;
  const ctaStart=hero.indexOf('<div class="cta-row">');
  if(ctaStart>=0){
    const ctaEnd=hero.indexOf('</div>',ctaStart);
    hero=`${hero.slice(0,ctaEnd)}${button}${hero.slice(ctaEnd)}`;
  }else{
    const containerEnd=hero.lastIndexOf('</div></section>');
    if(containerEnd<0){skipped+=1;continue;}
    hero=`${hero.slice(0,containerEnd)}<div class="cta-row">${button}</div>${hero.slice(containerEnd)}`;
  }
  html=`${html.slice(0,heroStart)}${hero}${html.slice(heroEnd+10)}`;
  fs.writeFileSync(file,html);
  updated+=1;
}
console.log(JSON.stringify({version:'V121',records:records.length,updated,skipped},null,2));
