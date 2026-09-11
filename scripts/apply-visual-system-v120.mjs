import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const stylesheet = '<link rel="stylesheet" href="/assets/visual-system-v120.css">';
const walk = directory => fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry => entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
let updated = 0;
let total = 0;
for (const file of walk(root).filter(file=>file.endsWith('.html'))) {
  let html = fs.readFileSync(file,'utf8');
  total += 1;
  if (!html.includes(stylesheet)) {
    html = html.replace('</head>',`${stylesheet}</head>`);
    fs.writeFileSync(file,html);
    updated += 1;
  }
}
console.log(JSON.stringify({version:'V120',html_files:total,updated},null,2));
