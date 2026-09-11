(() => {
  const root = document.querySelector('[data-partner-offers]');
  if (!root) return;
  const id = root.dataset.campingId || '';
  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('nl-NL', {style:'currency', currency:'EUR'}).format(Number(value));
  fetch('/data/provider-matches-v73.json', {cache:'force-cache'}).then(r => r.ok ? r.json() : Promise.reject(new Error('provider-index'))).then(data => {
    const profile = data.profiles?.[id];
    if (!profile?.offers?.length) { root.hidden = true; return; }
    root.innerHTML = `<div class="live-offers-head"><div><span class="commerce-kicker">Boekingsmogelijkheden</span><h2>Meer boekingsmogelijkheden</h2><p>Bekijk prijzen en beschikbaarheid bij aangesloten aanbieders.</p></div><a class="provider-badge" href="/aanbieders/">Over aanbieders</a></div><div class="provider-offer-grid">${profile.offers.map(offer => {
      const price = offer.price != null && Number.isFinite(Number(offer.price)) ? `<b>Vanaf ${money(offer.price)}</b>` : '';
      const tracked = offer.tracking_status === 'active';
      const media = offer.image ? `<div class="provider-offer-image"><img src="${safe(offer.image)}" alt="Foto via ${safe(offer.provider)}: ${safe(offer.title || profile.name)}" loading="lazy"></div>` : `<div class="provider-logo-text">${safe(offer.provider)}</div>`;
      return `<a class="provider-offer provider-offer-text" href="${safe(offer.url)}" target="_blank" rel="sponsored nofollow noopener" data-booking-outbound="1" data-camping-id="${safe(id)}" data-camping-name="${safe(profile.name)}" data-camping-slug="${safe(profile.slug)}" data-provider="${safe(offer.provider_id)}" data-target-type="${tracked ? 'affiliate-offer' : 'partner-offer'}" data-placement="profile-partner-offer">${media}<div class="provider-offer-copy"><strong>${safe(offer.title || profile.name)}</strong><span>${safe(offer.provider)}</span>${price}<small>Controleer prijs en voorwaarden bij de aanbieder.</small><em>Bekijk bij ${safe(offer.provider)} →</em></div></a>`;
    }).join('')}</div><p class="commerce-note">Prijzen en beschikbaarheid kunnen wijzigen. De aanbieder toont de actuele voorwaarden. Gemarkeerde links zijn commerciële partnerlinks; CampingKiezer kan bij een boeking een vergoeding ontvangen.</p>`;
    const approved = profile.offers.find(offer => /^https?:\/\//.test(offer.image || ''));
    if (approved) {
      const primary = document.querySelector('[data-photo-primary]');
      const gallery = primary?.closest('[data-photo-status]');
      const disclaimer = document.querySelector('[data-photo-disclaimer]');
      if (primary) { primary.src = approved.image; primary.alt = `Foto via ${approved.provider}: ${profile.name}`; }
      if (gallery) gallery.dataset.photoStatus = 'approved-partner-photo';
      if (disclaimer) disclaimer.innerHTML = `<strong>Foto via ${safe(approved.provider)}</strong> · Deze foto hoort bij het getoonde aanbod.`;
    }
    root.hidden = false;
  }).catch(() => { root.hidden = true; });
})();
