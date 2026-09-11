/* Consent-first measurement. No form values, search terms, phone numbers,
   email addresses, full outbound URLs or query strings are collected. */
(()=>{
 'use strict';
 let started=false,viewed=false,filterTimer;
 const allowed=()=>{try{return localStorage.getItem('ck-cookie')==='all';}catch{return false;}};
 const clean=s=>String(s||'').replace(/[^a-zA-Z0-9_./-]/g,'').slice(0,100);
 const profile=()=>location.pathname.match(/^\/(camping|aanbieders)\/([^/]+)/)?.[2]||'';
 function emit(event,values={}){
  if(!allowed()||!started)return;
  const data={page_path:location.pathname,profile_id:profile(),...values};
  window.gtag('event',event,data);
 }
 window.ckMeasure=emit;
 function start(){
  const id=window.CK_MEASUREMENT_CONFIG?.ga4Id;
  const hosts=window.CK_MEASUREMENT_CONFIG?.allowedHosts;
  if(!allowed()||!Array.isArray(hosts)||!hosts.includes(location.hostname)||!/^G-[A-Z0-9]+$/.test(id||''))return;
  window['ga-disable-'+id]=false;
  if(!started){
   window.dataLayer=window.dataLayer||[];
   window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:''});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);started=true;
  }
  if(!viewed){emit('page_view');if(profile())emit('profile_view');viewed=true;}
 }
 function consent(value){try{localStorage.setItem('ck-cookie',value);}catch{}if(value==='all')start();else{const id=window.CK_MEASUREMENT_CONFIG?.ga4Id;if(id)window['ga-disable-'+id]=true;}}
 // A consistent opt-in is present even on older profiles without the old banner.
 {
  const hasLegacyConsent=!!document.querySelector('[data-cookie]');
  const panel=document.createElement('section');panel.id='ck-consent-v136';panel.setAttribute('aria-label','Statistiekvoorkeuren');
  panel.style.cssText='position:fixed;bottom:1rem;left:1rem;right:1rem;max-width:38rem;padding:1rem;background:white;color:#142e29;box-shadow:0 2px 20px #0003;z-index:9999;border-radius:12px';
  panel.innerHTML='<p>Met jouw toestemming meten we paginaweergaven en het gebruik van zoeken, vergelijken en uitgaande links. We versturen geen ingevulde zoektermen of contactgegevens. <a href="/privacy">Privacy</a></p><button type="button" data-ck-consent="necessary">Alleen noodzakelijk</button> <button type="button" data-ck-consent="all">Statistieken toestaan</button>';
  let stored;try{stored=localStorage.getItem('ck-cookie');}catch{}panel.hidden=!!stored||hasLegacyConsent;document.body.append(panel);
  const footer=document.querySelector('footer');if(footer){const b=document.createElement('button');b.type='button';b.textContent='Statistiekvoorkeuren';b.addEventListener('click',()=>{panel.hidden=false;});footer.append(b);}
 }
 document.addEventListener('click',e=>{
  const choice=e.target.closest('[data-ck-consent],[data-cookie]');if(choice){consent(choice.dataset.ckConsent||choice.dataset.cookie);const p=document.getElementById('ck-consent-v136');if(p)p.hidden=true;return;}
  const compare=e.target.closest('[data-compare-id]');if(compare){emit('compare_click',{item_id:clean(compare.dataset.compareId)});return;}
  const a=e.target.closest('a[href]');if(!a)return;
  const u=new URL(a.href,location.href);
  if(u.protocol==='mailto:'||u.protocol==='tel:'){emit('contact_click',{contact_type:u.protocol==='mailto:'?'email':'phone'});return;}
  if(/^https?:$/.test(u.protocol)&&u.origin!==location.origin)emit('outbound_click',{destination_domain:u.hostname,link_domain:u.hostname,source_path:location.pathname,provider:clean(a.dataset.provider||u.hostname),link_type:a.rel.includes('sponsored')?'affiliate':'website'});
  else if(u.pathname.includes('claim-uw-camping'))emit('claim_click');
 });
 document.addEventListener('submit',e=>{if(e.target.matches('.search-form'))emit('search_submit');else emit('form_submit_attempt',{form_id:clean(e.target.name||e.target.id||'form')});});
 document.addEventListener('change',e=>{if(e.target.matches('select,input[type="checkbox"],input[type="radio"]')){clearTimeout(filterTimer);filterTimer=setTimeout(()=>emit('filter_change'),300);}});
 window.addEventListener('storage',e=>{if(e.key==='ck-cookie')consent(e.newValue);});
 window.ckMeasurementStatus=()=>({configured:/^G-[A-Z0-9]+$/.test(window.CK_MEASUREMENT_CONFIG?.ga4Id||''),consent:allowed(),started});
 start();
})();
