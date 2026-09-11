const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];
function favs(){return JSON.parse(localStorage.getItem('ck-favs')||'[]')}function toggleFav(id,btn){let f=favs();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];localStorage.setItem('ck-favs',JSON.stringify(f));if(btn)btn.textContent=f.includes(id)?'♥':'♡'}
function syncFavs(){let f=favs();$$('[data-fav]').forEach(b=>b.textContent=f.includes(b.dataset.fav)?'♥':'♡')}
function paramsFromForm(form){let fd=new FormData(form),q=new URLSearchParams();for(const[k,v]of fd)if(v)q.set(k,v);return q.toString()}
$$('.search-form').forEach(form=>form.addEventListener('submit',e=>{if(e.defaultPrevented)return;e.preventDefault();location.href=(form.dataset.target||'/zoeken')+'?'+paramsFromForm(form)}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(b){e.preventDefault();e.stopPropagation();toggleFav(b.dataset.fav,b)}});syncFavs();
let cookie=localStorage.getItem('ck-cookie');if(!cookie){$('.cookie')?.classList.add('show')}$$('[data-cookie]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem('ck-cookie',b.dataset.cookie);$('.cookie')?.classList.remove('show')}));
$('.menu-btn')?.addEventListener('click',e=>{const nav=$('.nav');nav?.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',nav?.classList.contains('open')?'true':'false')});

// v8: consent-aware outbound booking click tracking.
function ckTrackBookingLink(link){ /* v136: handled by the delegated consent-first measurement listener. */ }
document.addEventListener('click',e=>{const a=e.target.closest('[data-booking-outbound]');if(a)ckTrackBookingLink(a)});

// v12: prefill owner claim form from camping detail CTA.
(function(){
  const q=new URLSearchParams(location.search);
  const claim=q.get('claim');
  const listing=q.get('vermelding');
  const nameInput=document.querySelector('[data-claim-name]');
  const listingInput=document.querySelector('[data-claim-listing]');
  if(claim&&nameInput&&!nameInput.value) nameInput.value=claim;
  if(listing&&listingInput&&!listingInput.value){
    try{ listingInput.value=new URL(listing,location.origin).href; }catch(_e){ listingInput.value=listing; }
  }
})();


// v16: consent-aware generic conversion measurement. No PII is included.
window.ckConversionEvent=function(event,itemId,itemName,placement){
 if(localStorage.getItem('ck-cookie')!=='all')return;
 window.ckMeasure?.('legacy_conversion',{legacy_event:String(event||'').replace(/[^a-z_]/g,'').slice(0,60)});
};
document.addEventListener('click',e=>{const a=e.target.closest('[data-conversion-event]');if(a)window.ckConversionEvent(a.dataset.conversionEvent,a.dataset.itemId||'',a.dataset.itemName||'',a.dataset.placement||'');});
if(location.pathname==='/boeken/'||location.pathname==='/boeken')window.ckConversionEvent('booking_directory_view','','','booking-directory');

// v16: successful browser-validated form submit intent (no field values / PII).
document.addEventListener('submit',e=>{
  const f=e.target.closest('form'); if(!f)return;
  const events={'partner-interest':'partner_lead_submit','camping-claimen':'claim_submit','camping-aanmelden':'camping_submit','contact':'contact_submit'};
  const ev=events[f.getAttribute('name')]; if(ev)window.ckConversionEvent?.(ev,'','',f.getAttribute('name')||'form');
});

// V120: one photographic visual system across the complete site.
(function(){
  const path=location.pathname.toLowerCase();
  const themes={
    water:{match:/zwem|water|zwembad|douche/,hero:'/assets/theme-water.webp',photos:['/assets/theme-water.webp','/assets/hero-lake-v108.webp','/assets/need-pool.webp']},
    family:{match:/kind|animatie|speel|gezin/,hero:'/assets/theme-children.webp',photos:['/assets/theme-children.webp','/assets/need-playground.webp','/assets/need-animation.webp']},
    pets:{match:/huisdier|hond/,hero:'/assets/theme-dog.webp',photos:['/assets/theme-dog.webp','/assets/need-pets.webp','/assets/category-campings-v108.webp']},
    sanitary:{match:/sanitair|wellness/,hero:'/assets/theme-private-sanitary.webp',photos:['/assets/theme-private-sanitary.webp','/assets/need-private-sanitary.webp','/assets/need-wellness.webp']},
    nature:{match:/natuur|boerderij|fiets|camper|stroom|laadpaal/,hero:'/assets/theme-nature.webp',photos:['/assets/theme-nature.webp','/assets/need-naturecamp.webp','/assets/need-camper.webp']},
    quiet:{match:/adult|rust|glamping|chalet|safari|trekkershut|vakantiehuis/,hero:'/assets/theme-quiet.webp',photos:['/assets/theme-quiet.webp','/assets/need-adults-only.webp','/assets/hero-glamping-v108.webp']},
    default:{match:/.*/,hero:'/assets/hero-camping-family-v108.webp',photos:['/assets/category-campings-v108.webp','/assets/category-glamping-v108.webp','/assets/category-vakantieparken-v108.webp']}
  };
  const selected=Object.entries(themes).find(([key,item])=>key!=='default'&&item.match.test(path))||['default',themes.default];
  document.documentElement.dataset.v120Theme=selected[0];
  if(!path.startsWith('/aanbieders/')) document.documentElement.style.setProperty('--v120-hero-image',`url("${selected[1].hero}")`);
  const hero=document.querySelector('.page-hero,.category-hero,.v77-article-hero,.v77-knowledge-hero,.v80-b2b-hero,.v75-business-hero,.v119-hero,.v112-family-hero,.v81-parks-hero,.v79-chain-hero,.v79-booking-hero,.v74-search-hero');
  const exactHubs=['/campings/','/bungalowparken/','/camperplaatsen/','/glampings/','/vakantieparken/','/aanbieders/','/themas/','/boeken/','/vergelijken/','/onze-keuzes/'];
  const needsStrip=path.startsWith('/themas/')||exactHubs.includes(path);
  if(hero&&needsStrip&&!document.querySelector('[data-v120-photo-strip]')){
    const strip=document.createElement('section');
    strip.className='v120-photo-strip';
    strip.dataset.v120PhotoStrip='';
    strip.setAttribute('aria-label','Campinginspiratie');
    strip.innerHTML=`<div class="container v120-photo-strip-grid">${selected[1].photos.map((src,index)=>`<figure><img src="${src}" alt="${index===0?'Kampeerplek passend bij dit onderwerp':'Inspiratie voor een volgende campingvakantie'}" loading="lazy" decoding="async"></figure>`).join('')}</div>`;
    hero.insertAdjacentElement('afterend',strip);
  }
})();
