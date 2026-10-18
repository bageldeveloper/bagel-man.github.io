(function () {
  const root = new URL('../', document.currentScript.src);
  const page = document.body;
  const catalog = typeof gamersgaming === 'undefined' ? {} : gamersgaming;
  const current = catalog[page.dataset.gameKey];
  const player = document.querySelector('.game-player');
  const cover = document.querySelector('.game-cover');
  const button = cover?.querySelector('[data-play-game]');
  const gameWindow = document.querySelector('.game-window');
  if (!current || !player || !button) return;

  function artwork(image) {
    image.addEventListener('error', () => {
      if (image.dataset.fallback) return;
      image.dataset.fallback = 'true';
      image.src = new URL('bagelicontab.png', root).href;
      image.classList.add('game-artwork-fallback');
    });
    if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event('error'));
  }
  document.querySelectorAll('.game-cover img, .suggested-game-card img').forEach(artwork);

  function focusPlayer(container, depth = 0) {
    const surfaces = [...container.querySelectorAll('canvas, embed, object, ruffle-player, ruffle-embed, ruffle-object')];
    const target = surfaces.find(surface => surface.getClientRects().length && getComputedStyle(surface).display !== 'none') ||
      container.querySelector('iframe') || container.body;
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.tabIndex = 0;
    target.focus();
    if (target.tagName === 'IFRAME') {
      target.contentWindow?.focus();
      try {
        if (target.contentDocument && depth < 4) focusPlayer(target.contentDocument, depth + 1);
      } catch { /* Cross-origin players manage their own internal focus. */ }
    }
  }

  // Engines preload normally. Only interaction is gated by the cover.
  button.addEventListener('click', () => {
    cover.hidden = true;
    player.inert = false;
    page.classList.add('playing');
    focusPlayer(player);
    // Chromium may apply an ancestor iframe's inert change on the next frame.
    window.requestAnimationFrame(() => focusPlayer(player));
    player.dispatchEvent(new CustomEvent('game-play', { bubbles: true }));
  }, { once: true });
  // An engine's initial focus must not take keyboard navigation off the cover.
  player.inert = true;

  const genreTags = new Set(['action', 'adventure', 'Board', 'console', 'platformer',
    'puzzle', 'racing', 'shooter', 'simulation', 'sports', 'strategy', 'tower-defense', 'towerDefense']);
  const tags = new Set((current.tags || []).filter(tag => genreTags.has(tag)));
  const seen = new Set([current.url]);
  const related = Object.values(catalog).filter(game => {
    if (seen.has(game.url)) return false;
    seen.add(game.url);
    return true;
  }).map(game => ({ game, score: (game.tags || []).filter(tag => tags.has(tag)).length, tie: Math.random() }))
    .sort((a, b) => b.score - a.score || a.tie - b.tie).slice(0, 4);
  const suggestions = document.querySelector('[data-suggested-games]');
  if (suggestions) {
    suggestions.replaceChildren(...related.map(({ game }) => {
      const link = document.createElement('a');
      link.className = 'suggested-game-card';
      link.href = new URL(game.url, root).href;
      const image = document.createElement('img');
      image.alt = '';
      image.loading = 'lazy';
      image.src = new URL(game.image || 'bagelicontab.png', root).href;
      artwork(image);
      const name = document.createElement('span');
      name.textContent = game.name;
      link.append(image, name);
      return link;
    }));
  }
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === gameWindow && !cover.hidden) button.focus();
  });
})();
