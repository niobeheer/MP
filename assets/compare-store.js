(function () {
  const KEY = 'ck-compare-v24';
  const MAX = 3;
  const esc = value => String(value || '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter(item => item && item.id).slice(0, MAX) : [];
    } catch (_error) {
      return [];
    }
  }

  function write(items, eventName) {
    const next = items.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    sync();
    window.dispatchEvent(new CustomEvent('ck-compare-change', {detail: {items: next, eventName: eventName || ''}}));
    if (eventName && window.ckConversionEvent) window.ckConversionEvent(eventName, '', '', 'comparison');
    return next;
  }

  function fromButton(button) {
    return {
      id: button.dataset.compareId,
      slug: button.dataset.compareSlug || '',
      name: button.dataset.compareName || '',
      city: button.dataset.compareCity || '',
      province: button.dataset.compareProvince || ''
    };
  }

  function has(id) {
    return read().some(item => item.id === id);
  }

  function add(item) {
    const items = read();
    if (items.some(current => current.id === item.id)) return items;
    if (items.length >= MAX) {
      showMessage('Je kunt maximaal drie campings tegelijk vergelijken.');
      return items;
    }
    showMessage(`${item.name || 'Camping'} is toegevoegd aan je vergelijking.`);
    return write([...items, item], 'compare_add');
  }

  function remove(id) {
    return write(read().filter(item => item.id !== id), 'compare_remove');
  }

  function toggle(item) {
    return has(item.id) ? remove(item.id) : add(item);
  }

  function clear() {
    return write([], 'compare_clear');
  }

  function showMessage(message) {
    let toast = document.querySelector('#compare-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'compare-toast';
      toast.className = 'compare-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function tray() {
    let node = document.querySelector('#compare-tray');
    if (!node) {
      node = document.createElement('aside');
      node.id = 'compare-tray';
      node.className = 'compare-tray';
      node.setAttribute('aria-live', 'polite');
      document.body.appendChild(node);
    }
    return node;
  }

  function sync() {
    const items = read();
    document.querySelectorAll('[data-compare-id]').forEach(button => {
      const selected = items.some(item => item.id === button.dataset.compareId);
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if (button.matches('button')) button.textContent = selected ? '✓ In vergelijking' : (button.dataset.compareCompact === '1' ? '＋ Vergelijken' : '＋ Vergelijk deze camping');
    });
    const node = tray();
    node.hidden = !items.length || location.pathname.startsWith('/vergelijken');
    node.innerHTML = items.length ? `<div><strong>${items.length} van ${MAX} geselecteerd</strong><span>${items.map(item => esc(item.name)).join(' · ')}</span></div><a class="btn btn-brand btn-small" href="/vergelijken/">Vergelijk nu →</a>` : '';
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-compare-id]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    toggle(fromButton(button));
  });
  window.addEventListener('storage', sync);
  window.CampingCompare = {KEY, MAX, read, write, add, remove, toggle, clear, has, sync, showMessage};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
