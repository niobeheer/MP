(async () => {
  const root = document.querySelector('#results');
  if (!root) return;
  const data = await fetch('/data/campings-search-v74.json', {cache: 'force-cache'}).then(response => {
    if (!response.ok) throw new Error('zoekindex');
    return response.json();
  });
  const params = new URLSearchParams(location.search);
  const text = document.querySelector('#textfilter');
  let shown = 40;
  const defs = {
    popular: [['pool','Zwembad'],['shower','Douche'],['private_sanitary','Privé sanitair'],['wifi','Wifi'],['dogs_allowed','Hond welkom']],
    water: [['pool','Zwembad'],['indoor_pool','Binnenzwembad'],['outdoor_pool','Buitenzwembad'],['heated_pool','Verwarmd zwembad'],['toddler_pool','Peuter-/kinderbad'],['water_slides','Waterglijbaan / waterpark'],['spraypark','Spraypark / waterspeeltuin'],['natural_water','Zwemwater / strand'],['marina','Jachthaven']],
    comfort: [['sanitary','Sanitair'],['shower','Douche'],['private_sanitary','Privé sanitair'],['kids_sanitary','Baby-/familiesanitair'],['accessibility','Toegankelijk sanitair'],['dishwashing','Afwasplaatsen'],['electricity','Stroom'],['power_10a','10A stroom'],['power_16a','16A stroom'],['water_connection','Wateraansluiting'],['drainage','Afvoer / riool'],['wifi','Wifi'],['washing_machine','Wasmachine / wasserette'],['dryer','Droger'],['chemical_toilet','Chemisch toilet legen'],['camper_service','Camperservice']],
    family: [['playground','Speeltuin'],['indoor_play','Binnenspeeltuin'],['animation','Animatie / kinderclub'],['animals','Dierenweide / kinderboerderij'],['kids_sanitary','Baby-/familiesanitair']],
    food: [['restaurant','Restaurant / brasserie'],['snackbar','Snackbar / cafetaria'],['shop','Winkel / supermarkt'],['bread_service','Broodjesservice']],
    leisure: [['bike_rental','Fietsverhuur'],['water_sports','Boot / SUP / kano / zeilen'],['wellness','Sauna / wellness'],['fitness','Fitness'],['tennis','Tennis'],['table_tennis','Tafeltennis'],['minigolf','Midgetgolf / minigolf'],['sports_field','Sport-/voetbalveld'],['volleyball','Volleybal'],['bowling','Bowling'],['fishing','Vissen'],['climbing','Klimpark / klimbos'],['skate','Skatepark / pumptrack']],
    terrain: [['waterfront','Aan het water'],['autofree','Autovrij terrein'],['parking','Parkeren'],['ev_charging','EV-laadpunt'],['ebike_charging','E-bike laadpunt'],['campfire','Kampvuur / vuurplaats']],
    audience: [['dogs_allowed','Hond welkom'],['pet_free','Huisdiervrij'],['smoke_free','Rookvrij']],
    stay: [['pitch','Kampeerplaats'],['camper','Camperplaats'],['tent','Tent'],['caravan','Caravan'],['season','Seizoenplaats'],['year','Jaarplaats'],['comfort','Comfortplaats'],['private_pitch','Kampeerplaats privé sanitair'],['glamping','Glamping'],['safari','Safaritent'],['chalet','Chalet'],['mobile_home','Stacaravan'],['lodge','Lodge'],['trekkershut','Trekkershut'],['tiny_house','Tiny house'],['holiday_home','Vakantiehuis / bungalow']],
    commercial: [['direct_booking','Direct online boeken'],['price_known','Prijs bekend'],['direct_contact','Telefoon / contact bekend'],['partner_route','Boeken via aanbieder']],
    providers: [['allcamps','Allcamps'],['bungalow-net','Bungalow.Net']]
  };
  const audienceDefs = [['family','Kindercamping / gezinnen'],['adults_only','Adults only'],['quiet','Rustzoekers'],['nature','Natuur / bos'],['farm','Boerderijcamping'],['autofree','Autovrij']];
  const labels = {};
  Object.values(defs).flat().forEach(([key, label]) => labels[key] = label);
  audienceDefs.forEach(([key, label]) => labels[key] = label);
  const esc = value => String(value || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl').replace(/[^a-z0-9]+/g, ' ').trim();
  const isUnresolved = camping => camping.status === 'research-closed-identity-unresolved';
  const isApprovedPhoto = camping => ['approved-camping-photo','approved-partner-photo'].includes(camping.photo_display_status);
  const photoAlt = camping => camping.photo_display_status === 'approved-partner-photo' ? `Accommodatiefoto bij ${camping.name}` : camping.photo_display_status === 'approved-camping-photo' ? `Foto van ${camping.name}` : `Campingfoto bij ${camping.name}`;
  const photoBadge = camping => camping.photo_display_status === 'approved-partner-photo' ? 'partnerfoto' : camping.photo_display_status === 'approved-camping-photo' ? 'echte foto' : 'campingfoto';
  const stopWords = new Set(['de','het','een','en','van','in','op','aan','bij','te']);
  const queryTokens = value => norm(value).split(' ').filter(token => token && !stopWords.has(token));
  const wordMatch = (needle, word) => word === needle || word.startsWith(needle) || (needle.length >= 4 && word.includes(needle));
  const count = (field, key) => data.reduce((total, camping) => total + ((camping[field] || []).includes(key) ? 1 : 0), 0);
  const option = (field, key, label) => `<label class="check filter-count-row"><input name="${field}" type="checkbox" value="${key}"> <span>${label}</span><small data-count-field="${field}" data-count-key="${key}">${count(field, key)}</small></label>`;
  const mount = (selector, field, list) => { const node = document.querySelector(selector); if (node) node.innerHTML = list.map(([key, label]) => option(field, key, label)).join(''); };
  mount('#popularFilters','filter_facilities',defs.popular);
  document.querySelector('#popularFilters')?.insertAdjacentHTML('beforeend', option('filter_audience','adults_only','Adults only'));
  mount('#waterFilters','filter_facilities',defs.water); mount('#comfortFilters','filter_facilities',defs.comfort);
  mount('#familyFilters','filter_facilities',defs.family); mount('#foodFilters','filter_facilities',defs.food);
  mount('#leisureFilters','filter_facilities',defs.leisure); mount('#terrainFilters','filter_facilities',defs.terrain);
  mount('#audienceFilters','filter_facilities',defs.audience);
  document.querySelector('#audienceFilters')?.insertAdjacentHTML('beforeend', audienceDefs.map(([key, label]) => option('filter_audience', key, label)).join(''));
  mount('#stayFilters','filter_stays',defs.stay); mount('#commercialFilters','filter_commercial',defs.commercial); mount('#providerFilters','providers',defs.providers);

  const selected = name => [...new Set([...document.querySelectorAll(`[name=${name}]:checked`)].map(node => node.value))];
  const all = (camping, field, keys) => !keys.length || keys.every(key => (camping[field] || []).includes(key));
  const any = (camping, field, keys) => !keys.length || keys.some(key => (camping[field] || []).includes(key));
  const matchesKind = (camping, value) => norm(camping.kind).includes(norm(value)) || (camping.types || []).some(type => norm(type).includes(norm(value)));
  const searchableWords = camping => queryTokens([camping.name, camping.city, camping.province, camping.address, camping.kind, camping.website, camping.slug, ...(camping.tags || []), ...(camping.facilities || []), ...(camping.types || [])].join(' '));
  const queryMatches = (camping, query) => {
    const wanted = queryTokens(query);
    if (!wanted.length) return true;
    const available = searchableWords(camping);
    return wanted.every(token => available.some(word => wordMatch(token, word)));
  };

  function applyParams() {
    if (text) text.value = params.get('bestemming') || params.get('q') || '';
    const map = [['province','prov'],['kind','kind'],['filter_facilities','fac'],['filter_stays','stay'],['filter_audience','aud'],['filter_commercial','com'],['providers','provider']];
    map.forEach(([name, param]) => params.getAll(param).forEach(value => document.querySelectorAll(`input[name="${name}"][value="${CSS.escape(value)}"]`).forEach(node => node.checked = true)));
    const legacyType = params.get('type');
    if (legacyType) document.querySelectorAll('[name=kind]').forEach(node => { if (matchesKind({kind: node.value, types: [node.value]}, legacyType)) node.checked = true; });
    const mode = params.get('mode'); if (mode === 'any' && document.querySelector('#feature-match-mode')) document.querySelector('#feature-match-mode').value = 'any';
    const coverage = params.get('coverage'); if (['3','5','7'].includes(coverage) && document.querySelector('#minimum-coverage')) document.querySelector('#minimum-coverage').value = coverage;
    if (params.get('complete') === '1' && document.querySelector('#maximized-only')) document.querySelector('#maximized-only').checked = true;
    const sort = params.get('sort');
    if (sort && document.querySelector(`#sort option[value="${CSS.escape(sort)}"]`)) document.querySelector('#sort').value = sort;
  }

  function state() {
    return {q: (text?.value || '').trim(), category: params.get('category') || '', prov: selected('province'), kind: selected('kind'), fac: selected('filter_facilities'), stay: selected('filter_stays'), aud: selected('filter_audience'), com: selected('filter_commercial'), providers: selected('providers'), sort: document.querySelector('#sort')?.value || 'status', matchMode: document.querySelector('#feature-match-mode')?.value || 'all', coverage: 0, complete: false};
  }

  function matches(camping, current, ignore = null) {
    return queryMatches(camping, current.q)
      && (!current.category || (camping.location_types || []).includes(current.category))
      && (ignore === 'province' || !current.prov.length || current.prov.includes(camping.province))
      && (ignore === 'kind' || !current.kind.length || current.kind.some(kind => matchesKind(camping, kind)))
      && (ignore === 'filter_facilities' || (current.matchMode === 'any' ? any(camping, 'filter_facilities', current.fac) : all(camping, 'filter_facilities', current.fac)))
      && (ignore === 'filter_stays' || any(camping, 'filter_stays', current.stay))
      && (ignore === 'filter_audience' || all(camping, 'filter_audience', current.aud))
      && (ignore === 'filter_commercial' || all(camping, 'filter_commercial', current.com))
      && (ignore === 'providers' || any(camping, 'providers', current.providers))
      && (!current.complete || Number(camping.consumer_information_score || 0) === 7)
      && Number(camping.consumer_information_score || 0) >= current.coverage;
  }

  function relevance(camping, query) {
    const q = norm(query), name = norm(camping.name), shortName = name.replace(/^(camping|minicamping|caravanpark|vakantiepark|recreatiepark|bungalowpark|camperplaats|camperpark)\s+/, ''), city = norm(camping.city), province = norm(camping.province);
    if (!q) return 0;
    if (name === q || shortName === q) return 1200;
    if (name.startsWith(q) || shortName.startsWith(q)) return 1000;
    if (name.includes(q) || shortName.includes(q)) return 900;
    const wanted = queryTokens(query), nameWords = queryTokens(camping.name);
    const nameHits = wanted.filter(token => nameWords.some(word => wordMatch(token, word))).length;
    if (nameHits === wanted.length) return 760 + nameHits * 15;
    if (city === q) return 650;
    if (province === q) return 560;
    return 200 + nameHits * 30;
  }

  function syncUrl(current) {
    const url = new URL(location.href); url.search = '';
    if (current.q) url.searchParams.set('q', current.q);
    if (current.category) url.searchParams.set('category', current.category);
    current.prov.forEach(value => url.searchParams.append('prov', value)); current.kind.forEach(value => url.searchParams.append('kind', value));
    current.fac.forEach(value => url.searchParams.append('fac', value)); current.stay.forEach(value => url.searchParams.append('stay', value));
    current.aud.forEach(value => url.searchParams.append('aud', value)); current.com.forEach(value => url.searchParams.append('com', value));
    current.providers.forEach(value => url.searchParams.append('provider', value));
    if (current.sort !== 'status') url.searchParams.set('sort', current.sort);
    if (current.matchMode === 'any') url.searchParams.set('mode', 'any');
    if (current.coverage) url.searchParams.set('coverage', String(current.coverage));
    if (current.complete) url.searchParams.set('complete', '1');
    history.replaceState(null, '', url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : ''));
  }

  function chips(current) {
    const box = document.querySelector('#activeFilters'); if (!box) return;
    const values = [...current.prov.map(value => ['province',value,value]), ...current.kind.map(value => ['kind',value,value]), ...current.fac.map(value => ['filter_facilities',value,labels[value] || value]), ...current.stay.map(value => ['filter_stays',value,labels[value] || value]), ...current.aud.map(value => ['filter_audience',value,labels[value] || value]), ...current.com.map(value => ['filter_commercial',value,labels[value] || value]), ...current.providers.map(value => ['providers',value,labels[value] || value])];
    box.innerHTML = (current.q ? `<button class="active-filter" data-clear-text>Zoek: ${esc(current.q)} ×</button>` : '') + values.map(([name,value,label]) => `<button class="active-filter" data-name="${name}" data-value="${esc(value)}">${esc(label)} ×</button>`).join('');
    box.hidden = !box.innerHTML;
  }

  function dynamicCounts(current) {
    document.querySelectorAll('[data-count-field]').forEach(node => {
      const field = node.dataset.countField, key = node.dataset.countKey;
      const copy = {...current, prov:[...current.prov], kind:[...current.kind], fac:[...current.fac], stay:[...current.stay], aud:[...current.aud], com:[...current.com], providers:[...current.providers]};
      const prop = {province:'prov',kind:'kind',filter_facilities:'fac',filter_stays:'stay',filter_audience:'aud',filter_commercial:'com',providers:'providers'}[field];
      copy[prop] = [];
      node.textContent = data.reduce((total, camping) => total + (matches(camping, copy) && (camping[field] || []).includes(key) ? 1 : 0), 0);
    });
  }

  function featureChips(camping) {
    const preferred = ['accessibility','adults_only','pool','indoor_pool','outdoor_pool','private_sanitary','wifi','dogs_allowed','playground','restaurant','natural_water'];
    const values = new Set([...(camping.filter_facilities || []), ...(camping.filter_audience || [])]);
    return preferred.filter(key => values.has(key)).slice(0, 4).map(key => `<span class="chip feature-chip">${esc(labels[key] || key)}</span>`).join('');
  }

  function providerChips(camping) {
    return (camping.providers || []).map(key => `<a class="chip provider-chip" href="/aanbieders/${key === 'bungalow-net' ? 'bungalow-net' : 'allcamps'}/">Ook via ${esc(labels[key] || key)}</a>`).join('');
  }

  function queryReasons(camping, query) {
    const q = norm(query); if (!q) return [];
    const tokens = q.split(' ').filter(Boolean), reasons = [];
    const fields = [
      ['Campingnaam', camping.name], ['Plaats', camping.city], ['Provincie', camping.province], ['Adres', camping.address],
      ['Verblijfstype', (camping.types || []).join(' ')], ['Voorziening', (camping.facilities || []).join(' ')], ['Kenmerk', [camping.kind, ...(camping.tags || [])].join(' ')]
    ];
    fields.forEach(([label, value]) => {
      const hay = norm(value), hits = tokens.filter(token => hay.includes(token));
      if (hits.length) reasons.push(`${label}: ${hits.join(', ')}`);
    });
    return reasons;
  }

  function matchReasons(camping, current) {
    const reasons = queryReasons(camping, current.q);
    current.fac.filter(key => (camping.filter_facilities || []).includes(key)).forEach(key => reasons.push(`Voorziening: ${labels[key] || key}`));
    current.stay.filter(key => (camping.filter_stays || []).includes(key)).forEach(key => reasons.push(`Verblijfstype: ${labels[key] || key}`));
    current.aud.filter(key => (camping.filter_audience || []).includes(key)).forEach(key => reasons.push(`Doelgroep: ${labels[key] || key}`));
    current.com.filter(key => (camping.filter_commercial || []).includes(key)).forEach(key => reasons.push(`Boeken: ${labels[key] || key}`));
    current.providers.filter(key => (camping.providers || []).includes(key)).forEach(key => reasons.push(`Aanbieder: ${labels[key] || key}`));
    return [...new Set(reasons)];
  }

  function matchExplanation(camping, current) {
    const reasons = matchReasons(camping, current);
    if (!reasons.length) return '';
    return `<div class="match-explanation"><strong>Waarom dit resultaat past</strong><span>${reasons.slice(0, 6).map(esc).join(' · ')}</span></div>`;
  }

  function operationalBadge(camping) {
    if (camping.operational_status === 'temporarily-closed-2026-redevelopment') return '<div class="operational-alert operational-closed"><strong>Tijdelijk gesloten in 2026</strong><span>Geen actieve boekingsroute.</span></div>';
    if (camping.operational_status === 'touring-camping-ends-2026-09-13') return '<div class="operational-alert operational-limited"><strong>Laatste kampeerseizoen</strong><span>Toeristisch kamperen stopt na 13 september 2026.</span></div>';
    return '';
  }

  function bookingSignal(camping) {
    if (!camping.booking_url) return '';
    const route = camping.booking_route_type || ''; const label = route === 'price_information' ? 'Prijsinformatie' : (route.includes('request') || route === 'contact-only') ? 'Aanvraag mogelijk' : route === 'external' ? 'Boeken via aanbieder' : 'Online boeken';
    return `<b class="booking-signal">${label}</b>`;
  }

  function outboundCTA(camping) {
    if (camping.booking_url) {
      const requestOnly = (camping.booking_route_type || '').includes('request');
      const priceOnly = camping.booking_route_type === 'price_information';
      const label = priceOnly ? 'Tarieven bekijken →' : requestOnly ? 'Reservering aanvragen →' : 'Prijs & beschikbaarheid →';
      const provider = camping.booking_system || (requestOnly ? 'official-request' : 'official-booking');
      return `<a class="btn btn-brand btn-small" data-booking-outbound="1" data-camping-id="${esc(camping.id)}" data-camping-name="${esc(camping.name)}" data-camping-slug="${esc(camping.slug)}" data-placement="search-results" data-provider="${esc(provider)}" data-target-type="${requestOnly ? 'reservation-request' : 'booking'}" href="${esc(camping.booking_url)}" rel="noopener sponsored" target="_blank">${label}</a>`;
    }
    if (camping.website) return `<a class="btn btn-outline btn-small" data-booking-outbound="1" data-camping-id="${esc(camping.id)}" data-camping-name="${esc(camping.name)}" data-camping-slug="${esc(camping.slug)}" data-placement="search-results" data-provider="official-website" data-target-type="website" href="${esc(camping.website)}" rel="noopener" target="_blank">Officiële website →</a>`;
    return '';
  }

  function card(camping, current) {
    const location = [camping.city, camping.province].filter(Boolean).join(', ') || 'Nederland';
    const description = camping.address ? `Adres: ${esc(camping.address)}` : camping.website ? 'Campingwebsite beschikbaar; adres nog niet bekend.' : 'Bekijk welke informatie beschikbaar is.';
    return `<article class="result-card result-card-v74"><a class="result-image" href="/camping/${encodeURIComponent(camping.slug)}/"><img src="${esc(camping.image || '/assets/camp-3.jpg')}" alt="${esc(photoAlt(camping))}" loading="lazy"><span class="image-note">${photoBadge(camping)}</span></a><div class="result-content"><div class="camp-meta"><span>${esc(location)}</span><span>${bookingSignal(camping)}</span></div><h3><a href="/camping/${encodeURIComponent(camping.slug)}/">${esc(camping.name)}</a></h3><div class="chips"><span class="chip">${esc(camping.kind || 'Camping')}</span>${featureChips(camping)}</div>${operationalBadge(camping)}<p>${description}</p><div class="result-bottom"><span class="camp-types">${camping.types && camping.types.length ? esc(camping.types.slice(0, 3).join(' · ')) : 'Bekijk het profiel voor meer informatie'}</span><a class="link-arrow" href="/camping/${encodeURIComponent(camping.slug)}/">Bekijk locatie →</a></div><div class="search-card-actions"><button type="button" class="btn btn-compare btn-small" data-compare-compact="1" data-compare-id="${esc(camping.id)}" data-compare-slug="${esc(camping.slug)}" data-compare-name="${esc(camping.name)}" data-compare-city="${esc(camping.city)}" data-compare-province="${esc(camping.province)}">＋ Vergelijken</button>${outboundCTA(camping)}</div></div></article>`;
  }

  function render() {
    const current = state();
    const results = data.filter(camping => matches(camping, current));
    if (current.sort === 'name') results.sort((a,b) => a.name.localeCompare(b.name, 'nl'));
    else if (current.sort === 'province') results.sort((a,b) => (a.province || 'zzz').localeCompare(b.province || 'zzz', 'nl') || a.name.localeCompare(b.name, 'nl'));
    else if (current.sort === 'booking') results.sort((a,b) => Number(Boolean(b.booking_url)) - Number(Boolean(a.booking_url)) || a.name.localeCompare(b.name, 'nl'));
    else results.sort((a,b) => relevance(b, current.q) - relevance(a, current.q) || Number(Boolean(b.booking_url)) - Number(Boolean(a.booking_url)) || a.name.localeCompare(b.name, 'nl'));
    document.querySelector('#count').textContent = `${new Intl.NumberFormat('nl-NL').format(results.length)} ${results.length === 1 ? 'locatie' : 'locaties'} gevonden`;
    chips(current); syncUrl(current); dynamicCounts(current);
    root.innerHTML = results.slice(0, shown).map(camping => card(camping, current)).join('') || '<div class="empty-state"><strong>Geen campings gevonden.</strong><p>Wis één of meer filters of zoek op minder woorden.</p><button class="btn btn-outline" id="emptyReset">Wis filters</button></div>';
    window.CampingCompare?.sync();
    const more = document.querySelector('#loadmore');
    if (more) { more.style.display = shown < results.length ? 'inline-flex' : 'none'; more.onclick = () => { shown += 40; render(); }; }
    document.querySelector('#emptyReset')?.addEventListener('click', reset);
  }

  function reset() {
    document.querySelectorAll('.filters input[type=checkbox]').forEach(node => node.checked = false);
    if (text) text.value = '';
    if (document.querySelector('#minimum-coverage')) document.querySelector('#minimum-coverage').value = '0';
    if (document.querySelector('#feature-match-mode')) document.querySelector('#feature-match-mode').value = 'all';
    if (document.querySelector('#maximized-only')) document.querySelector('#maximized-only').checked = false;
    shown = 40; render();
  }

  function applyPreset(name) {
    const presets = {
      family: [['filter_facilities', 'playground'], ['filter_facilities', 'animation']],
      private: [['filter_facilities', 'private_sanitary']],
      dog: [['filter_facilities', 'dogs_allowed']],
      glamping: [['filter_stays', 'glamping']],
      booking: [['filter_commercial', 'direct_booking']],
      complete: [['complete_profile', '1']]
    };
    const values = presets[name];
    if (!values) return;
    document.querySelectorAll('.filters input[type=checkbox]').forEach(node => node.checked = false);
    values.forEach(([field, value]) => document.querySelectorAll(`input[name="${field}"][value="${CSS.escape(value)}"]`).forEach(node => node.checked = true));
    if (text) text.value = '';
    shown = 40;
    render();
  }

  function setFilterDrawer(open) {
    document.body.classList.toggle('filters-open', open);
    document.querySelector('#filter-open')?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  async function copySearchLink() {
    const button = document.querySelector('#search-copy');
    const link = location.href;
    try {
      await navigator.clipboard.writeText(link);
    } catch (_error) {
      const field = document.createElement('textarea');
      field.value = link;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    if (button) {
      const original = button.textContent;
      button.textContent = '✓ Zoeklink gekopieerd';
      setTimeout(() => { button.textContent = original; }, 1800);
    }
    window.ckConversionEvent?.('search_share', '', document.querySelector('#count')?.textContent || '', 'search');
  }

  applyParams();
  let syncing = false;
  document.addEventListener('change', event => {
    if (event.target.matches('.filters input[type=checkbox]') && !syncing) {
      syncing = true;
      document.querySelectorAll(`input[name="${event.target.name}"][value="${CSS.escape(event.target.value)}"]`).forEach(node => node.checked = event.target.checked);
      syncing = false;
    }
    if (event.target.closest('.filters') || event.target.id === 'sort' || event.target.id === 'feature-match-mode') { shown = 40; render(); }
  });
  let searchTimer;
  document.addEventListener('input', event => {
    if ((event.target.closest('.filters') && event.target.type !== 'checkbox') || event.target === text) {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { shown = 40; render(); }, 110);
    }
  });
  document.querySelector('#directory-search-form')?.addEventListener('submit', event => { event.preventDefault(); shown = 40; render(); });
    document.querySelector('#resetfilters')?.addEventListener('click', reset);
  document.querySelector('#filter-open')?.addEventListener('click', () => setFilterDrawer(true));
  document.querySelector('#filter-close')?.addEventListener('click', () => setFilterDrawer(false));
  document.querySelector('#filter-backdrop')?.addEventListener('click', () => setFilterDrawer(false));
  document.querySelector('#search-copy')?.addEventListener('click', copySearchLink);
  document.querySelector('#search-presets')?.addEventListener('click', event => {
    const button = event.target.closest('[data-search-preset]');
    if (button) applyPreset(button.dataset.searchPreset);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setFilterDrawer(false); });
  document.querySelector('#activeFilters')?.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-clear-text')) { if (text) text.value = ''; }
    else if (button.hasAttribute('data-clear-coverage')) document.querySelector('#minimum-coverage').value = '0';
    else if (button.hasAttribute('data-clear-complete')) document.querySelector('#maximized-only').checked = false;
    else if (button.dataset.name && button.dataset.value) document.querySelectorAll(`input[name="${button.dataset.name}"][value="${CSS.escape(button.dataset.value)}"]`).forEach(node => node.checked = false);
    shown = 40; render();
  });
  render();
})().catch(error => {
  console.error(error);
  const count = document.querySelector('#count');
  if (count) count.textContent = 'Zoeken kon niet laden';
});
