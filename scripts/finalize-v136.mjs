import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const f=path.join(root,'aanbieders/cheapcampers/index.html');let h=fs.readFileSync(f,'utf8');if(!h.includes('rel="canonical"'))h=h.replace('</head>','<link rel="canonical" href="https://camping-kiezer.nl/aanbieders/cheapcampers/"></head>');fs.writeFileSync(f,h);
// Audit every sitemap target without changing deliberate noindex decisions.
const errors=[];let urls=0;const resolve=encoded=>{const p=decodeURIComponent(encoded);return [path.join(root,p),path.join(root,p+'.html'),path.join(root,p,'index.html')].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());};
for(const filename of fs.readdirSync(root).filter(f=>/^sitemap.*\.xml$/.test(f))){const xml=fs.readFileSync(path.join(root,filename),'utf8');for(const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)){const u=new URL(m[1]);const file=resolve(u.pathname.slice(1));urls++;if(!file){errors.push({url:u.href,error:'missing target'});continue;}if(file.endsWith('.html')){const h=fs.readFileSync(file,'utf8');if(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(h))errors.push({url:u.href,error:'noindex in sitemap'});}}}
fs.writeFileSync(path.join(root,'QA-V136-sitemap.json'),JSON.stringify({urls,errors},null,2));console.log({urls,errors:errors.length,examples:errors.slice(0,10)});
