(function () {
  'use strict';

  const DATA_URL = '/data/campings-search-v74.json';
  const PREF_KEY = 'ck-compare-preferences-v73';
  const labels = {
    pool: 'Zwembad', private_sanitary: 'Privé sanitair', shower: 'Douche', dogs_allowed: 'Hond welkom',
    adults_only: 'Adults only', family: 'Kindercamping', animation: 'Animatie', playground: 'Speeltuin',
    restaurant: 'Restaurant / horeca', shop: 'Winkel / supermarkt', wifi: 'Wifi', natural_water: 'Water / strand',
    camper: 'Camperplaats', caravan: 'Caravan', tent: 'Tent', glamping: 'Glamping', safari: 'Safaritent',
    chalet: 'Chalet', mobile_home: 'Stacaravan', season: 'Seizoenplaats', ev_charging: 'Laadpaal',
    accessibility: 'Toegankelijkheid'
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const byId = id => document.getElementById(id);
  let records = [];

  function selectedPreferences() {
    return [...document.querySelectorAll('input[name="compare-preference"]:checked')].map(input => input.value);
  }

  function restorePreferences() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(PREF_KEY) || '[]'); } catch (_error) { saved = []; }
    document.querySelectorAll('input[name="compare-preference"]').forEach(input => { input.checked = saved.includes(input.value); });
  }

  function savePreferences() {
    localStorage.setItem(PREF_KEY, JSON.stringify(selectedPreferences()));
  }

  function featureState(camping, feature) {
    const values = [...(camping.filter_facilities || []), ...(camping.filter_audience || []), ...(camping.filter_stays || []), ...(camping.filter_commercial || [])];
    return values.includes(feature);
  }

  function syncFromUrl() {
    const ids = new URLSearchParams(location.search).get('ids');
    if (!ids || !window.CampingCompare) return;
    const selected = ids.split(',').map(id => records.find(record => record.id === id)).filter(Boolean).slice(0, 3).map(record => ({
      id: record.id, slug: record.slug, name: record.name, city: record.city, province: record.province
    }));
    if (selected.length) window.CampingCompare.write(selected);
  }

  function getSelectedRecords() {
    const selected = window.CampingCompare ? window.CampingCompare.read() : [];
    return selected.map(item => records.find(record => record.id === item.id || record.slug === item.slug)).filter(Boolean).slice(0, 3);
  }

  function syncUrl(selected) {
    const url = new URL(location.href);
    if (selected.length) url.searchParams.set('ids', selected.map(item => item.id).join(','));
    else url.searchParams.delete('ids');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function cell(value, className = '') {
    return `<td${className ? ` class="${className}"` : ''}>${value}</td>`;
  }

  function knownList(items) {
    return items && items.length ? esc([...new Set(items)].slice(0, 12).join(' · ')) : '<span class="compare-unknown">Niet bevestigd</span>';
  }

  function row(label, selected, renderer, key) {
    const cells = selected.map(renderer);
    return `<tr data-compare-row="${esc(key || label)}"><th scope="row">${esc(label)}</th>${cells.join('')}</tr>`;
  }

  function render() {
    const selected = getSelectedRecords();
    const table = byId('compare-table');
    const empty = byId('compare-empty');
    const count = byId('compare-count');
    if (!table || !empty || !count) return;
    syncUrl(selected);
    count.textContent = selected.length ? `${selected.length} van 3 campings geselecteerd` : 'Nog geen campings geselecteerd';
    empty.hidden = selected.length > 0;
    table.hidden = selected.length === 0;
    byId('compare-clear').disabled = selected.length === 0;
    byId('compare-copy').disabled = selected.length === 0;
    if (!selected.length) { table.innerHTML = ''; renderPreferenceSummary([]); return; }

    const preferences = selectedPreferences();
    const headers = selected.map(camping => `<th scope="col"><div class="compare-camping-head"><button type="button" class="compare-remove" data-remove-id="${esc(camping.id)}" aria-label="Verwijder ${esc(camping.name)}">×</button><h2>${esc(camping.name)}</h2><p>${esc([camping.city, camping.province].filter(Boolean).join(' · '))}</p><a href="/camping/${encodeURIComponent(camping.slug)}/">Bekijk profiel →</a></div></th>`).join('');
    const rows = [
      row('Plaats', selected, camping => cell(esc([camping.city, camping.province].filter(Boolean).join(' · ')) || '<span class="compare-unknown">Niet bevestigd</span>'), 'location'),
      row('Type verblijf', selected, camping => cell(knownList(camping.types)), 'types'),
      row('Bekende voorzieningen', selected, camping => cell(knownList(camping.facilities)), 'facilities'),
      row('Adres', selected, camping => cell(camping.address ? esc(camping.address) : '<span class="compare-unknown">Niet bevestigd</span>'), 'address'),
      row('Broncontrole', selected, camping => cell(`<strong>${esc(camping.source_name || 'Bron beschikbaar')}</strong><small class="evidence-meta">Gecontroleerd: ${esc(camping.checked_at || 'datum onbekend')}</small>`), 'source'),
      row('Website', selected, camping => cell(camping.website ? `<a href="${esc(camping.website)}" target="_blank" rel="nofollow noopener">Officiële website →</a>` : '<span class="compare-unknown">Niet bevestigd</span>'), 'website'),
      row('Boekingsroute', selected, camping => cell(camping.booking_url ? `<a class="btn btn-brand btn-small" href="${esc(camping.booking_url)}" target="_blank" rel="nofollow noopener">Beschikbaarheid →</a>` : '<span class="compare-unknown">Geen directe route bevestigd</span>'), 'booking')
    ];
    for (const preference of preferences) {
      rows.push(row(labels[preference] || preference, selected, camping => featureState(camping, preference) ? cell('✓ Bevestigd', 'compare-yes') : cell('Niet bevestigd', 'compare-unknown'), `preference-${preference}`));
    }
    table.innerHTML = `<table class="comparison-table"><thead><tr><th scope="col">Vergelijkpunt</th>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
    applyDifferenceFilter();
    renderPreferenceSummary(selected);
  }

  function applyDifferenceFilter() {
    const onlyDifferences = byId('compare-differences')?.checked;
    document.querySelectorAll('[data-compare-row]').forEach(rowNode => {
      if (!onlyDifferences) { rowNode.hidden = false; return; }
      const values = [...rowNode.querySelectorAll('td')].map(cellNode => cellNode.textContent.trim().replace(/\s+/g, ' '));
      rowNode.hidden = values.length > 1 && values.every(value => value === values[0]);
    });
  }

  function renderPreferenceSummary(selected) {
    const summary = byId('compare-preference-summary');
    if (!summary) return;
    const preferences = selectedPreferences();
    summary.hidden = !preferences.length || !selected.length;
    if (summary.hidden) { summary.innerHTML = ''; return; }
    const scores = selected.map(camping => ({camping, score: preferences.filter(preference => featureState(camping, preference)).length})).sort((a, b) => b.score - a.score);
    summary.innerHTML = `<strong>Bevestigde wensen</strong><p>${scores.map(item => `${esc(item.camping.name)}: ${item.score} van ${preferences.length}`).join(' · ')}</p><small>Een ontbrekende bevestiging is niet hetzelfde als “niet aanwezig”.</small>`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      byId('compare-copy').textContent = 'Link gekopieerd ✓';
      setTimeout(() => { byId('compare-copy').textContent = 'Kopieer vergelijklink'; }, 1800);
    } catch (_error) {
      window.CampingCompare?.showMessage('Kopiëren lukte niet. Kopieer de URL uit de adresbalk.');
    }
  }

  async function init() {
    if (!window.CampingCompare) return;
    try {
      const response = await fetch(DATA_URL, {cache: 'force-cache'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      records = await response.json();
      restorePreferences();
      syncFromUrl();
      render();
    } catch (_error) {
      byId('compare-count').textContent = 'Vergelijking kon niet worden geladen';
      byId('compare-table').innerHTML = '<div class="empty-state"><strong>De gegevens zijn tijdelijk niet beschikbaar.</strong><p>Probeer de pagina opnieuw te laden.</p></div>';
    }
  }

  document.addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-id]');
    if (remove) { window.CampingCompare?.remove(remove.dataset.removeId); render(); return; }
    if (event.target.closest('#compare-clear')) { window.CampingCompare?.clear(); render(); return; }
    if (event.target.closest('#compare-copy')) copyLink();
  });
  document.addEventListener('change', event => {
    if (event.target.matches('input[name="compare-preference"]')) { savePreferences(); render(); }
    if (event.target.matches('#compare-differences')) applyDifferenceFilter();
  });
  window.addEventListener('ck-compare-change', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
