(() => {
  const grid = document.querySelector(".commerce-grid");
  const cards = grid ? [...grid.querySelectorAll(".commerce-result")] : [];
  const insertionPoint = document.querySelector(".theme-actions");
  if (!grid || !cards.length || !insertionPoint) return;

  const facilities = [
    ["zwembad", "Zwembad", /zwembad|peuterbad|waterpark/i],
    ["waterglijbaan", "Waterglijbaan", /waterglijbaan/i],
    ["zwemwater", "Natuurwater of strand", /zwemwater|zwemvijver|zwemmeer|recreatiemeer|strand/i],
    ["prive-sanitair", "Privé sanitair", /priv[eé][\s-]*sanitair/i],
    ["sanitair", "Sanitair en douches", /(^|\s)sanitair|douche|toilet|wasserette/i],
    ["wifi", "Wifi", /\bwifi\b|wi-fi/i],
    ["stroom", "Stroom", /\bstroom\b|elektriciteit/i],
    ["water-aansluiting", "Water en afvoer", /wateraansluiting|water en afvoer|vuilwaterafvoer|afvoer op plaats/i],
    ["horeca", "Restaurant of horeca", /restaurant|horeca|caf[eé]|brasserie|snackbar|eetcaf[eé]/i],
    ["winkel", "Winkel of supermarkt", /supermarkt|winkel|brood|minimarkt/i],
    ["speeltuin", "Speeltuin", /speeltuin|speeltoestel/i],
    ["binnenspeeltuin", "Binnenspeeltuin", /binnenspeeltuin/i],
    ["animatie", "Animatie", /animatie|kinderclub|kidsclub/i],
    ["huisdieren", "Huisdieren welkom", /huisdier|hond/i],
    ["fietsverhuur", "Fietsverhuur", /fietsverhuur|fietsenverhuur/i],
    ["sport", "Sportvoorzieningen", /sportveld|tennis|padel|voetbal|multisport/i],
    ["wellness", "Wellness", /wellness|sauna|spa|jacuzzi/i],
    ["laadpaal", "Laadpaal", /laadpaal|laadpunt/i],
    ["camper", "Camperplaatsen", /camperplaats/i],
    ["seizoen", "Seizoenplaatsen", /seizoenplaats/i],
  ].map(([key, label, pattern]) => ({ key, label, pattern }));

  const searchable = cards.map(card => ({
    card,
    tags: [...card.querySelectorAll(".data-tag")].map(tag => tag.textContent.trim()).join(" | "),
  }));
  const available = facilities
    .map(facility => ({
      ...facility,
      count: searchable.filter(item => facility.pattern.test(item.tags)).length,
    }))
    .filter(facility => facility.count > 0);
  if (!available.length) return;

  const panel = document.createElement("section");
  panel.className = "theme-facility-filter";
  panel.setAttribute("aria-labelledby", "theme-facility-filter-title");
  panel.innerHTML = `
    <div class="theme-facility-filter__head">
      <div><span class="theme-facility-filter__eyebrow">Verfijn je keuze</span><h2 id="theme-facility-filter-title">Filter op faciliteiten</h2></div>
      <p class="theme-facility-filter__status" aria-live="polite"><strong>${cards.length}</strong> resultaten</p>
    </div>
    <fieldset><legend>Kies één of meer faciliteiten</legend><div class="theme-facility-filter__options"></div></fieldset>
    <div class="theme-facility-filter__actions"><button class="theme-facility-filter__clear" type="button" hidden>Wis filters</button><p class="theme-facility-filter__help">Bij meerdere keuzes tonen we campings die aan alle gekozen faciliteiten voldoen.</p></div>`;
  const options = panel.querySelector(".theme-facility-filter__options");
  for (const facility of available) {
    const label = document.createElement("label");
    label.className = "theme-facility-filter__option";
    label.innerHTML = `<input type="checkbox" value="${facility.key}"><span>${facility.label}</span><small>${facility.count}</small>`;
    options.append(label);
  }
  insertionPoint.insertAdjacentElement("afterend", panel);

  const status = panel.querySelector(".theme-facility-filter__status");
  const clear = panel.querySelector(".theme-facility-filter__clear");
  const checkboxes = [...panel.querySelectorAll('input[type="checkbox"]')];
  const empty = document.createElement("div");
  empty.className = "theme-filter-empty";
  empty.hidden = true;
  empty.textContent = "Geen campings voldoen aan deze combinatie. Wis één of meer filters en probeer opnieuw.";
  grid.append(empty);

  const params = new URLSearchParams(location.search);
  const initial = new Set((params.get("faciliteiten") || "").split(",").filter(Boolean));
  checkboxes.forEach(input => { input.checked = initial.has(input.value); });

  const applyFilters = () => {
    const selected = checkboxes.filter(input => input.checked).map(input => input.value);
    const selectedFacilities = selected.map(key => available.find(facility => facility.key === key)).filter(Boolean);
    let visible = 0;
    for (const item of searchable) {
      const matches = selectedFacilities.every(facility => facility.pattern.test(item.tags));
      item.card.hidden = !matches;
      if (matches) visible += 1;
    }
    status.innerHTML = `<strong>${visible}</strong> ${visible === 1 ? "resultaat" : "resultaten"}`;
    clear.hidden = selected.length === 0;
    empty.hidden = visible !== 0;
    const nextParams = new URLSearchParams(location.search);
    if (selected.length) nextParams.set("faciliteiten", selected.join(","));
    else nextParams.delete("faciliteiten");
    const query = nextParams.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  };

  panel.addEventListener("change", applyFilters);
  clear.addEventListener("click", () => {
    checkboxes.forEach(input => { input.checked = false; });
    applyFilters();
  });
  applyFilters();
})();
