import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.html'))files.push(f);}}walk(root);
const failures=[],warnings=[],titles=new Map(),summaries=new Set();let profiles=0,schema=0,tracked=0;
for(const f of files){const h=fs.readFileSync(f,'utf8'),rel=path.relative(root,f);const title=h.match(/<title>(.*?)<\/title>/s)?.[1];
 if(!title)warnings.push({rel,issue:'missing title'});else{if(!titles.has(title))titles.set(title,[]);titles.get(title).push(rel);}
 if(!/<link[^>]+rel="canonical"/.test(h))warnings.push({rel,issue:'missing canonical'});
 if(h.includes('/assets/measurement-v136.js'))tracked++;
 for(const m of h.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1]);schema++;}catch{failures.push({rel,issue:'invalid schema'});}}
 const block=h.match(/<section class="profile-strength-v135"[\s\S]*?<\/section>/)?.[0];if(block){profiles++;const n=(block.match(/data-known="1"/g)||[]).length;const score=block.match(/<strong>(\d+)\/4<\/strong>/)?.[1];if(Number(score)!==n||score===undefined)failures.push({rel,issue:'inconsistent score'});summaries.add(block.match(/<h2>.*?<\/h2><p>(.*?)<\/p>/s)?.[1]);if(block.includes('data-v135-profile-strength'))failures.push({rel,issue:'legacy block'});}
}
const duplicates=[...titles].filter(([t,v])=>v.length>1).map(([title,pages])=>({title,pages}));
// Execute filter with deterministic DOM fixture, separate from CSS assertion.
const query={value:'clair'},provider={value:''},cards=[{dataset:{search:'saint clair',provider:'a'}},{dataset:{search:'other',provider:'b'}}],count={};let update;
const form={querySelector:s=>s.includes('query')?query:provider,addEventListener:(e,fn)=>{if(e==='input')update=fn;}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/europe-v134.js'),'utf8'),{document:{querySelectorAll:s=>s==='[data-europe-filter]'?[form]:cards,querySelector:()=>count}});update();assert.equal(cards[0].hidden,false);assert.equal(cards[1].hidden,true);assert.equal(count.textContent,'1 camping zichtbaar');
assert.match(fs.readFileSync(path.join(root,'assets/europe-v134.css'),'utf8'),/\.europe-offer-card\[hidden\]\{display:none!important\}/);
query.value='';provider.value='b';update();assert.equal(cards[0].hidden,true);assert.equal(cards[1].hidden,false);
// Measurement contract: reject without consent, no guessed property, consent revocation.
function measurement(consent,id,hostname="camping-kiezer.nl"){
 let current=consent;const handlers={},scripts=[],calls=[];
 const win={CK_MEASUREMENT_CONFIG:{ga4Id:id,allowedHosts:["camping-kiezer.nl","www.camping-kiezer.nl"]},gtag:(...args)=>calls.push(args),addEventListener(){}};
 const element=()=>({style:{},setAttribute(){},append(){},addEventListener(){}});
 const doc={referrer:'',body:{append(){}},getElementById:()=>null,querySelector:()=>element(),addEventListener:(e,fn)=>handlers[e]=fn,createElement:element,head:{append:x=>scripts.push(x)}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/measurement-v136.js'),'utf8'),{window:win,document:doc,location:{hostname,pathname:'/camping/test/',origin:'https://camping-kiezer.nl',href:'https://camping-kiezer.nl/camping/test/?q=private'},localStorage:{getItem:()=>current,setItem:(k,v)=>current=v},URL,setTimeout,clearTimeout});return {win,calls,scripts,handlers};
}
assert.equal(measurement('all','G-TEST123','autobedrijfkiezer.nl').scripts.length,0);
assert.equal(measurement('necessary','G-TEST123').scripts.length,0);assert.equal(measurement('all','').scripts.length,0);
const m=measurement('all','G-TEST123');assert.equal(m.scripts.length,1);assert.equal(m.calls.filter(x=>x[0]==='event'&&x[1]==='profile_view').length,1);assert.ok(!JSON.stringify(m.calls).includes('private'));m.win.ckMeasure('portfolio_outbound_click',{destination_domain:'example.com'});assert.equal(m.calls.at(-1)[1],'portfolio_outbound_click');
m.handlers.click({target:{closest:s=>s==='[data-ck-consent],[data-cookie]'?{dataset:{ckConsent:'necessary'}}:null}});
const before=m.calls.length;m.win.ckMeasure('portfolio_outbound_click');assert.equal(m.calls.length,before);
assert.equal(profiles,4112);assert.equal(tracked,files.length);
const report={version:137,html:files.length,profiles,tracked_pages:tracked,parseable_schema_blocks:schema,distinct_profile_summaries:summaries.size,duplicate_title_groups:duplicates.length,duplicates,metadata_warnings:warnings,failures,filter_logic:'PASS',filter_css:'PASS (static assertion, not rendered)',measurement_contract:'PASS (isolated fixture, not GA receipt)',live_feed_tests:'PARTIAL: FarmCamps 24 rendered live offers; not all providers/end destinations tested',visual_browser_test:'Live FarmCamps desktop inspected; release137 rendered test pending',analytics_activation:'G-6E6QKEMPGT configured; production receipt pending upload',monthly_email:'SCHEDULED: monthly day 3, 08:00 Europe/Amsterdam, starting October 2026'};
fs.writeFileSync(path.join(root,'QA-V137-final.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,duplicates:duplicates.slice(0,4),metadata_warnings:warnings.slice(0,4)},null,2));if(failures.length)process.exit(1);
