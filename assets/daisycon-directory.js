(() => {
  const root = document.querySelector('[data-daisycon-directory]');
  if (!root) return;
  const provider = root.dataset.provider || '';
  const providerName = root.dataset.providerName || provider;
  const form = document.querySelector('[data-daisycon-search]');
  const count = document.querySelector('[data-daisycon-count]');
  const country = document.querySelector('[data-daisycon-country]');
  const safe = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const money = value => new Intl.NumberFormat('nl-NL', {style:'currency', currency:'EUR', maximumFractionDigits:2}).format(Number(value));
  const excerpt = value => { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > 175 ? text.slice(0, 172).trimEnd() + '…' : text; };

  function card(offer) {
    const location = [offer.city, offer.region, offer.country].filter(Boolean).join(' · ');
    const facts = [offer.type, offer.duration_days ? `${offer.duration_days} dagen` : '', offer.max_people ? `max. ${offer.max_people} personen` : '', offer.stars ? `${offer.stars} sterren` : ''].filter(Boolean).join(' · ');
    return `<article class="partner-list-card">${offer.image ? `<img class="partner-list-image" src="${safe(offer.image)}" alt="Foto via ${safe(providerName)}: ${safe(offer.title)}" loading="lazy" decoding="async">` : ''}<span class="provider-badge">${safe(providerName)}</span><h3>${safe(offer.title)}</h3>${location ? `<p>${safe(location)}</p>` : ''}${facts ? `<small>${safe(facts)}</small>` : ''}${offer.description ? `<p>${safe(excerpt(offer.description))}</p>` : ''}${offer.price != null ? `<strong>Vanaf ${money(offer.price)} voor het geselecteerde aanbod</strong>` : '<strong>Bekijk actuele prijzen</strong>'}<a class="btn btn-brand btn-small" href="${safe(offer.link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="${safe(provider)}" data-target-type="affiliate-offer" data-placement="daisycon-directory">Bekijk bij ${safe(providerName)} →</a></article>`;
  }

  function setCountries(countries) {
    if (!country || country.dataset.loaded === '1') return;
    if (!countries.length) { country.hidden = true; country.dataset.loaded = '1'; return; }
    country.insertAdjacentHTML('beforeend', countries.map(value => `<option value="${safe(value)}">${safe(value)}</option>`).join(''));
    country.dataset.loaded = '1';
  }

  async function load() {
    const data = new FormData(form);
    const params = new URLSearchParams({provider, q: String(data.get('q') || ''), country: String(data.get('country') || ''), limit: '36'});
    root.innerHTML = '<div class="notice">Actueel aanbod laden…</div>';
    try {
      const response = await fetch('/.netlify/functions/daisycon-provider-feed?' + params);
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'feed');
      setCountries(result.countries || []);
      if (count) count.textContent = `${result.filtered_total} actuele resultaten bij ${result.provider}`;
      root.innerHTML = result.offers.map(card).join('') || '<div class="empty-state">Geen aanbod gevonden voor deze zoekopdracht.</div>';
    } catch {
      if (count) count.textContent = '';
      root.innerHTML = '<div class="notice">Het actuele aanbod is tijdelijk niet bereikbaar. Probeer het later opnieuw.</div>';
    }
  }

  form?.addEventListener('submit', event => { event.preventDefault(); load(); });
  country?.addEventListener('change', load);
  load();
})();
