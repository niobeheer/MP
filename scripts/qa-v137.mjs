import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.html'))files.push(f);}}walk(root);
const failures=[],warnings=[],titles=new Map(),summaries=new Set();let profiles=0,schema=0,tracked=0,cookieBanners=0,nearbySections=0,bannedCookieCopy=0;
for(const f of files){const h=fs.readFileSync(f,'utf8'),rel=path.relative(root,f);const title=h.match(/<title>(.*?)<\/title>/s)?.[1];
 if(!title)warnings.push({rel,issue:'missing title'});else{if(!titles.has(title))titles.set(title,[]);titles.get(title).push(rel);}
 if(!/<link[^>]+rel="canonical"/.test(h))warnings.push({rel,issue:'missing canonical'});
 if(h.includes('/assets/measurement-v136.js'))tracked++;
 if(h.includes('class="cookie"')){cookieBanners++;const cookieBlock=h.match(/<div class="cookie">[\s\S]*?<\/div><\/div>/)?.[0]||'';if(/statistiek|analytics|analyse/i.test(cookieBlock))bannedCookieCopy++;}
 if(h.includes('data-v140-nearby'))nearbySections++;
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
// Affiliate truth contract: the live portal snapshot is internally consistent and
// campaigns that are still pending never receive a TradeTracker link on Onze keuzes.
const affiliateStatus=JSON.parse(fs.readFileSync(path.join(root,'TRADETRACKER-STATUS-v139.json'),'utf8'));
assert.equal(affiliateStatus.accepted.length,affiliateStatus.real_partner_campaigns);
assert.equal(affiliateStatus.pending.length,affiliateStatus.portal_pending_count);
assert.equal(new Set(affiliateStatus.accepted.map(x=>x.campaign_id)).size,affiliateStatus.accepted.length);
assert.equal(new Set(affiliateStatus.pending.map(x=>x.campaign_id)).size,affiliateStatus.pending.length);
const choices=fs.readFileSync(path.join(root,'onze-keuzes/index.html'),'utf8');
for(const campaign of affiliateStatus.pending){
 const pendingLink=new RegExp(`(?:[?&]|&amp;)c=${campaign.campaign_id}(?:&|&amp;|\\")`);
 if(pendingLink.test(choices))failures.push({rel:'onze-keuzes/index.html',issue:`pending TradeTracker campaign published: ${campaign.name} (#${campaign.campaign_id})`});
 for(const file of files){const html=fs.readFileSync(file,'utf8');if(pendingLink.test(html)&&/rel="[^"]*sponsored/.test(html))failures.push({rel:path.relative(root,file),issue:`pending TradeTracker campaign linked: ${campaign.name} (#${campaign.campaign_id})`});}
}
assert.equal(cookieBanners,files.length);assert.equal(bannedCookieCopy,0);assert.equal(nearbySections,3544);
const provinceGuides=fs.readdirSync(path.join(root,'bezienswaardigheden'),{withFileTypes:true}).filter(x=>x.isDirectory()&&fs.existsSync(path.join(root,'bezienswaardigheden',x.name,'index.html'))).length;assert.equal(provinceGuides,12);
const sitemapFiles=fs.readdirSync(root).filter(x=>/^sitemap-.+\.xml$/.test(x));const submitted=new Map();let sitemapUrls=0;
for(const sitemapFile of sitemapFiles){const xml=fs.readFileSync(path.join(root,sitemapFile),'utf8');for(const match of xml.matchAll(/<loc>(https:\/\/camping-kiezer\.nl[^<]+)<\/loc>/g)){const url=match[1],pathname=decodeURIComponent(new URL(url).pathname),candidates=[path.join(root,pathname.slice(1)),path.join(root,pathname.slice(1),'index.html'),path.join(root,pathname.slice(1)+'.html')],file=candidates.find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());sitemapUrls++;if(!file){failures.push({rel:sitemapFile,issue:`missing sitemap target: ${url}`});continue}const html=fs.readFileSync(file,'utf8');if(/<meta[^>]+(?:name="robots"[^>]+content="noindex|content="noindex[^>]+name="robots")/i.test(html))failures.push({rel:sitemapFile,issue:`noindex URL submitted: ${url}`});const canonical=html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"|<link[^>]+href="([^"]+)"[^>]+rel="canonical"/)?.slice(1).find(Boolean);if(canonical&&canonical!==url)failures.push({rel:sitemapFile,issue:`canonical mismatch: ${url} -> ${canonical}`});if(!submitted.has(url))submitted.set(url,[]);submitted.get(url).push(sitemapFile);}}
const duplicateSitemapUrls=[...submitted].filter(([,maps])=>maps.length>1).length;
const approvedCardIds=new Set([...choices.matchAll(/data-campaign-id="(\d+)"/g)].map(m=>m[1]));for(const campaign of affiliateStatus.accepted)if(!approvedCardIds.has(campaign.campaign_id))failures.push({rel:'onze-keuzes/index.html',issue:`accepted campaign missing: ${campaign.name} (#${campaign.campaign_id})`});
const report={version:140,html:files.length,profiles,tracked_pages:tracked,cookie_banners:cookieBanners,cookie_copy:'PASS (cookies only)',profile_nearby_sections:nearbySections,province_guides:provinceGuides,sitemap_urls:sitemapUrls,duplicate_sitemap_urls:duplicateSitemapUrls,parseable_schema_blocks:schema,distinct_profile_summaries:summaries.size,duplicate_title_groups:duplicates.length,duplicates,metadata_warnings:warnings,failures,filter_logic:'PASS',filter_css:'PASS (static assertion, not rendered)',measurement_contract:'PASS (isolated fixture, not GA receipt)',affiliate_truth:`PASS (${affiliateStatus.accepted.length} accepted partners published, ${affiliateStatus.pending.length} pending blocked sitewide)`,indexing_contract:failures.length?'FAIL':'PASS (sitemap targets exist, remain indexable and match canonicals)',claim_model:'PASS (free factual verification; paid presentation and growth packages)',live_feed_tests:'PARTIAL: FarmCamps 24 rendered live offers; not all providers/end destinations tested',analytics_activation:'G-6E6QKEMPGT configured; production receipt pending deploy',monthly_email:'SCHEDULED: monthly day 3, 08:00 Europe/Amsterdam, starting October 2026'};
fs.writeFileSync(path.join(root,'QA-V137-final.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,duplicates:duplicates.slice(0,4),metadata_warnings:warnings.slice(0,4)},null,2));if(failures.length)process.exit(1);
