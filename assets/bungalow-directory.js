(() => {
  const root = document.querySelector('[data-bungalow-directory]');
  if (!root) return;
  const form = document.querySelector('[data-bungalow-search]');
  const count = document.querySelector('[data-bungalow-count]');
  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('nl-NL', {style:'currency', currency:'EUR'}).format(Number(value));
  async function load(q='') {
    root.innerHTML = '<div class="notice">Actueel aanbod laden…</div>';
    const response = await fetch('/.netlify/functions/bungalow-feed?q=' + encodeURIComponent(q) + '&limit=30');
    const data = await response.json();
    if (!data.ok) { root.innerHTML = '<div class="notice">Het live aanbod is tijdelijk niet bereikbaar. Probeer het later opnieuw.</div>'; return; }
    if (count) count.textContent = `${data.nl_total} actuele Nederlandse accommodaties in de Bungalow.Net-feed`;
    root.innerHTML = data.offers.map(offer => `<article class="partner-list-card">${offer.image ? `<img class="partner-list-image" src="${safe(offer.image)}" alt="Foto via Bungalow.Net: ${safe(offer.title)}" loading="lazy">` : ``}<span class="provider-badge">Bungalow.Net</span><h3>${safe(offer.title)}</h3><p>${safe([offer.city, offer.type].filter(Boolean).join(' · '))}</p>${offer.price != null ? `<strong>Vanaf ${money(offer.price)}</strong>` : ''}<a class="btn btn-brand btn-small" href="${safe(offer.link)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-provider="bungalow-net" data-target-type="affiliate-offer" data-placement="bungalow-directory">Bekijk prijs & beschikbaarheid →</a></article>`).join('') || '<div class="empty-state">Geen aanbod gevonden voor deze zoekterm.</div>';
  }
  form?.addEventListener('submit', event => { event.preventDefault(); load(new FormData(form).get('q') || ''); });
  load();
})();
