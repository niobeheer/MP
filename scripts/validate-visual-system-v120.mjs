import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = relative => fs.readFileSync(path.join(root,relative),'utf8');
const walk = directory => fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry => entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const failures=[];
const htmlFiles=walk(root).filter(file=>file.endsWith('.html'));
for(const file of htmlFiles) if(!fs.readFileSync(file,'utf8').includes('/assets/visual-system-v120.css')) failures.push(`${path.relative(root,file)}: V120-stijl ontbreekt`);
const css=read('assets/visual-system-v120.css');
const app=read('assets/app.js');
for(const token of ['/* V120','.v120-photo-strip','--v120-hero-image','.page-hero,.category-hero','background:#fff']) if(!css.includes(token)) failures.push(`CSS mist ${token}`);
for(const token of ['V120: one photographic visual system','dataset.v120Theme','v120PhotoStrip','needsStrip','theme-water.webp']) if(!app.includes(token)) failures.push(`app.js mist ${token}`);
for(const asset of ['hero-camping-family-v108.webp','theme-water.webp','theme-children.webp','theme-dog.webp','theme-private-sanitary.webp','theme-nature.webp','theme-quiet.webp']) if(!fs.existsSync(path.join(root,'assets',asset))) failures.push(`Beeld ontbreekt: ${asset}`);
const health=JSON.parse(read('health.json'));
if(health.version<120||health.unified_photographic_page_design!==true||health.thematic_visual_sets!==7) failures.push('health.json meldt V120 niet');
console.log(JSON.stringify({version:'V120',html_files:htmlFiles.length,unified_page_hero:true,thematic_visual_sets:7,responsive_photo_strip:true,failures:failures.length,details:failures.slice(0,50)},null,2));
if(failures.length) process.exit(1);
