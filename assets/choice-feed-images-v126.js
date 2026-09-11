(() => {
  const farmCampsImage = document.querySelector('[data-v107-feed-choice="farmcamps"] img');
  if (farmCampsImage && !farmCampsImage.dataset.feedImageProvider) {
    farmCampsImage.dataset.feedImageProvider = 'farmcamps';
    farmCampsImage.dataset.feedImageAlt = 'Actueel FarmCamps-aanbod';
  }
  const images = [...document.querySelectorAll('img[data-feed-image-provider]')];
  if (!images.length) return;

  const safeImage = value => {
    try {
      const url = new URL(String(value || ''), location.origin);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };

  const load = async image => {
    const provider = image.dataset.feedImageProvider || '';
    if (!provider) return;
    try {
      const response = await fetch(`/.netlify/functions/tradetracker-feed?provider=${encodeURIComponent(provider)}&limit=12`);
      const result = await response.json();
      if (!result.ok) return;
      const offer = (result.offers || []).find(item => safeImage(item.image));
      if (!offer) return;
      image.src = safeImage(offer.image);
      image.alt = `${image.dataset.feedImageAlt || result.provider}: ${offer.title || 'actueel aanbod'}`;
      image.dataset.feedImageLoaded = '1';
    } catch {
      image.dataset.feedImageLoaded = '0';
    }
  };

  images.forEach(load);
})();
