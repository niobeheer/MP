import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const htmlFiles=[];
const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))htmlFiles.push(p)}};
walk(root);
const clean=s=>s.replaceAll('&amp;','&').trim();
const existingTarget=urlPath=>{
  const p=decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const base=path.join(root,p);
  return [base,base+'.html',path.join(base,'index.html')].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile());
};
const failures=[]; let checked=0;
for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const ids=new Set([...html.matchAll(/\s(?:id|name)=["']([^"']+)["']/gi)].map(m=>m[1]));
  for(const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']*)["'][^>]*>/gi)){
    const href=clean(m[1]); checked++;
    if(href.includes('${'))continue;
    if(!href){failures.push({file:path.relative(root,file),href,reason:'lege href'});continue}
    if(/^(https?:|mailto:|tel:|javascript:)/i.test(href)||href.startsWith('/.netlify/'))continue;
    if(href.startsWith('#')){
      const id=decodeURIComponent(href.slice(1));
      if(!id||!ids.has(id))failures.push({file:path.relative(root,file),href,reason:'anker bestaat niet op deze pagina'});
      continue;
    }
    if(href.startsWith('?'))continue;
    let u;
    try{u=new URL(href,'https://camping-kiezer.nl/'+path.relative(root,path.dirname(file)).replaceAll(path.sep,'/')+'/')}catch{failures.push({file:path.relative(root,file),href,reason:'ongeldige URL'});continue}
    if(u.origin!=='https://camping-kiezer.nl')continue;
    const target=existingTarget(u.pathname);
    if(!target){failures.push({file:path.relative(root,file),href,reason:'interne pagina bestaat niet'});continue}
    if(u.hash){
      const targetHtml=fs.readFileSync(target,'utf8');
      const id=decodeURIComponent(u.hash.slice(1));
      const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if(!new RegExp(`\\s(?:id|name)=["']${escaped}["']`,'i').test(targetHtml))failures.push({file:path.relative(root,file),href,reason:'anker bestaat niet op doelpagina'});
    }
  }
}
console.log(JSON.stringify({html_files:htmlFiles.length,links_checked:checked,failures:failures.length,details:failures},null,2));
if(failures.length)process.exit(1);
