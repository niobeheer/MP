(() => {
  const inputs = [...document.querySelectorAll('[data-smart-search]')];
  if (!inputs.length) return;

  const stopWords = new Set(['de','het','een','en','van','in','op','aan','bij','te']);
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const tokens = value => norm(value).split(' ').filter(token => token && !stopWords.has(token));
  const nameWithoutPrefix = value => norm(value).replace(/^(camping|minicamping|caravanpark|vakantiepark|recreatiepark|bungalowpark|camperplaats|camperpark)\s+/, '');
  const wordMatch = (needle, word) => word === needle || word.startsWith(needle) || (needle.length >= 4 && word.includes(needle));

  function rank(item, query) {
    const q = norm(query);
    const qTokens = tokens(query);
    if (!qTokens.length) return 0;
    const name = norm(item.name);
    const shortName = nameWithoutPrefix(item.name);
    const nameWords = tokens(item.name);
    const city = norm(item.city);
    const province = norm(item.province);
    const slug = norm(item.slug);
    if (name === q || shortName === q) return 1200;
    if (name.startsWith(q) || shortName.startsWith(q)) return 1000;
    if (name.includes(q) || shortName.includes(q)) return 900;
    const nameHits = qTokens.filter(token => nameWords.some(word => wordMatch(token, word))).length;
    if (nameHits === qTokens.length) return 760 + nameHits * 15;
    if (city === q) return 650;
    if (province === q) return 560;
    if (city.startsWith(q)) return 500;
    const locationWords = tokens(`${item.city} ${item.province}`);
    const locationHits = qTokens.filter(token => locationWords.some(word => wordMatch(token, word))).length;
    if (locationHits === qTokens.length) return 430;
    const allWords = tokens(`${item.name} ${item.city} ${item.province} ${item.address} ${item.kind} ${(item.types || []).join(' ')} ${slug}`);
    const allHits = qTokens.filter(token => allWords.some(word => wordMatch(token, word))).length;
    return allHits === qTokens.length ? 240 + nameHits * 30 : 0;
  }

  let recordsPromise;
  const records = () => recordsPromise ||= fetch('/data/campings-search-v74.json', {cache:'force-cache'}).then(response => {
    if (!response.ok) throw new Error('search-index');
    return response.json();
  });
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  inputs.forEach(input => {
    const form = input.closest('form');
    const box = input.closest('.smart-search-wrap')?.querySelector('[data-search-suggestions]');
    let matches = [];
    let timer;

    async function update() {
      const query = input.value.trim();
      if (query.length < 2) { if (box) { box.hidden = true; box.innerHTML = ''; } matches = []; return; }
      try {
        const data = await records();
        matches = data.map(item => ({item, score:rank(item, query)})).filter(result => result.score > 0).sort((a,b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'nl')).slice(0,6);
        if (!box) return;
        box.innerHTML = matches.length ? matches.map(({item}, index) => `<a href="/camping/${encodeURIComponent(item.slug)}/" data-suggestion-index="${index}"><strong>${esc(item.name)}</strong><span>${esc([item.city,item.province].filter(Boolean).join(' · ') || 'Nederland')} · ${esc(item.kind || 'Camping')}</span></a>`).join('') : '<span class="search-no-suggestion">Geen directe naam gevonden. Bekijk alle zoekresultaten.</span>';
        box.hidden = false;
      } catch (_error) {
        if (box) box.hidden = true;
      }
    }

    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 90); });
    input.addEventListener('focus', update);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' && box) box.hidden = true;
      if (event.key === 'ArrowDown' && box && !box.hidden) { event.preventDefault(); box.querySelector('a')?.focus(); }
    });
    document.addEventListener('click', event => { if (box && !event.target.closest('.smart-search-wrap')) box.hidden = true; });

    form?.addEventListener('submit', async event => {
      const query = input.value.trim();
      if (!query) return;
      if (!matches.length) { try { await update(); } catch (_error) {} }
      const first = matches[0];
      if (first && first.score >= 1000) {
        event.preventDefault();
        location.href = `/camping/${encodeURIComponent(first.item.slug)}/`;
      }
    }, true);
  });

  fetch('/data/site-counts-v74.json', {cache:'force-cache'}).then(response => response.json()).then(counts => {
    document.querySelectorAll('[data-count]').forEach(node => {
      const value = counts[node.dataset.count];
      if (Number.isFinite(value)) node.textContent = new Intl.NumberFormat('nl-NL').format(value);
    });
  }).catch(() => {});
})();
