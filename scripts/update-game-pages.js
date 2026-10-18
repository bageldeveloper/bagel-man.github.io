/* Catalog-only, idempotent migration. Never scans vendor or offline exports. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { slotMarkup, removeBalancedBlock } = require('./update-game-ads');
const root = path.resolve(__dirname, '..');
const version = '20261018';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function catalog() {
  const context = {};
  vm.runInNewContext(read('gamesinfo.js') + ';this.catalog = gamersgaming;', context);
  return context.catalog;
}

// Treat script/style bodies and comments as atomic tokens, so embedded HTML
// strings and commented-out Unity footer markup cannot unbalance an element.
function element(html, predicate) {
  const pattern = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<\/?[a-z][^>]*>/gi;
  let match, start, tag, depth = 0, openEnd;
  while ((match = pattern.exec(html))) {
    const token = match[0];
    if (token.startsWith('<!--') || /^<(script|style)\b/i.test(token)) continue;
    const name = token.match(/^<\/?([\w-]+)/)?.[1].toLowerCase();
    const close = token.startsWith('</');
    if (start === undefined) {
      if (close || !predicate(token, name)) continue;
      start = match.index; openEnd = pattern.lastIndex; tag = name; depth = 1;
    } else if (name === tag) {
      depth += close ? -1 : 1;
      if (!depth) return { start, openEnd, closeStart: match.index, end: pattern.lastIndex };
    }
  }
  return null;
}
const hasClass = (token, name) => (token.match(/\bclass=["']([^"']*)["']/i)?.[1] || '').split(/\s+/).includes(name);
const findClass = (html, name) => element(html, token => hasClass(token, name));
const replaceElement = (html, found, value) => html.slice(0, found.start) + value + html.slice(found.end);
const assetPrefix = url => path.posix.relative(path.posix.dirname(url), '.') || '.';

function suggestions(game, games, prefix) {
  const tags = new Set(game.tags.filter(tag => !['original', 'favorite', 'difficult'].includes(tag)));
  const seen = new Set([game.url]);
  const related = Object.values(games).filter(other => {
    if (seen.has(other.url)) return false;
    seen.add(other.url); return true;
  }).sort((a, b) => b.tags.filter(t => tags.has(t)).length - a.tags.filter(t => tags.has(t)).length).slice(0, 4);
  return `<section class="suggested-games-section" aria-labelledby="game-suggestions-title">
    <div class="game-suggestions-heading"><h2 class="suggested-games-title" id="game-suggestions-title">Suggested</h2><a href="${prefix}/index.html">Browse all games <span aria-hidden="true">↗</span></a></div>
    <div class="suggested-games-container" data-suggested-games>${related.map(other => `<a class="suggested-game-card" href="${escape(prefix + '/' + other.url)}"><img src="${escape(prefix + '/' + (other.image || 'bagelicontab.png'))}" alt="" loading="lazy"><span>${escape(other.name)}</span></a>`).join('\n')}</div>
  </section>`;
}

function footerLinks(prefix) {
  return `<nav class="game-footer-links" aria-label="Footer links"><a href="${prefix}/index.html">Home</a><a href="${prefix}/about.html">About</a><a href="https://www.instagram.com/bagelcomicsofficial/" target="_blank" rel="noopener noreferrer">Instagram</a></nav>`;
}

function updateFooterLinks(html, prefix) {
  const links = findClass(html, 'game-footer-links');
  return links ? replaceElement(html, links, footerLinks(prefix)) : html;
}
function footer(prefix) {
  return `<footer class="game-site-footer" data-game-footer>
    <div class="game-footer-top"><a class="game-footer-brand" href="${prefix}/index.html" aria-label="Bagel Comics home"><img src="${prefix}/bagelicontab.png" alt="Bagel Comics" loading="lazy"></a>${footerLinks(prefix)}</div>
    <div class="game-footer-bottom"><p>More games. More Bagel Comics.</p><a href="#top">Back to top ↑</a></div>
  </footer>`;
}
function cover(game, prefix) {
  return `<div class="game-cover" aria-label="Start ${escape(game.name)}">
    <img src="${escape(prefix + '/' + (game.image || 'bagelicontab.png'))}" alt="${escape(game.name)} cover" fetchpriority="high">
    <div class="game-cover-content"><span class="game-cover-name">${escape(game.name)}</span><button type="button" data-play-game><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"></path></svg>Play game</button><p class="game-cover-note">Loading in the background · Click Play to open the game</p></div>
  </div>`;
}

function playerSize(html, game) {
  if (game.url === 'games/megaman-x8/index.html') return [398, 224, 960];
  if (game.url === 'games/2048/index.html') return [500, 650, 600];
  if (['games/minecrap/index.html', 'eaglercraft-1.12.html', 'games/vex6/index.html', 'Quake3-master/Quake3.htm'].includes(game.url)) return [16, 9, 1000];
  const rules = html.match(/\.game-window\s*\{([^}]+)\}/)?.[1] || '';
  const width = Number(rules.match(/\bwidth:\s*(\d+)px/)?.[1]);
  const height = Number(rules.match(/\bheight:\s*(\d+)px/)?.[1]);
  if (width && height) return [width, height, width];
  const ratio = rules.match(/aspect-ratio:\s*([\d.]+)\s*\/\s*([\d.]+)/);
  return ratio ? [Number(ratio[1]), Number(ratio[2]), 1000] : [4, 3, 1000];
}

function removeOldPresentation(html) {
  // Only remove the shared shell rules, never engine selectors or game code.
  return html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
    const cleaned = css.replace(/([^{}]+)\{([^{}]*)\}/g, (rule, selector) => {
      const selectors = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      return /\.suggested-|@keyframes\s+rowarrow/.test(selectors) || /^\.(?:game-window-container|main-content|game-area|game-controls|game-window-title|fullscreen-btn)(?::hover)?$/.test(selectors) || selectors === '.game-window' ? '' : rule;
    });
    return `<style${attrs}>${cleaned}</style>`;
  });
}

function ensureAds(html, prefix) {
  let cursor = 0, row;
  while ((row = findClass(html.slice(cursor), 'settings-row'))) {
    if (html.slice(cursor + row.start, cursor + row.end).includes('id="toggle-ads"')) {
      html = html.slice(0, cursor + row.start).replace(/<hr class="settings-divider">\s*$/, '') + html.slice(cursor + row.end);
      break;
    }
    cursor += row.end;
  }
  if (html.includes('game-ad--banner')) return html;
  let sidebar;
  while ((sidebar = findClass(html, 'ad-sidebar'))) html = replaceElement(html, sidebar, '');
  html = html.replace(/\s*<hr class="settings-divider">\s*<div class="settings-row">\s*<label for="toggle-ads">[\s\S]*?<\/div>/i, '');
  html = removeBalancedBlock(html, 'function applyAdBlock');
  html = removeBalancedBlock(html, "localStorage.getItem('blockAds')");
  const rails = ['left', 'right'].flatMap(side => [1, 2, 3].map(index => slotMarkup('rectangle game-ad--rectangle-' + side + (index > 1 ? ' game-ad--rail-secondary' : ''), `Advertisement ${side} of game`).replace(' data-ad-label=', ` data-ad-rail-position="${index}" data-ad-label=`))).join('\n');
  const area = findClass(html, 'game-area');
  html = html.slice(0, area.closeStart) + rails + html.slice(area.closeStart);
  const controls = findClass(html, 'game-controls');
  html = html.slice(0, controls.end) + slotMarkup('banner', 'Advertisement below game') + html.slice(controls.end);
  const main = element(html, (_token, name) => name === 'main');
  html = html.slice(0, main.closeStart) + slotMarkup('mobile-footer', 'Mobile footer advertisement') + html.slice(main.closeStart);
  if (!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) html = html.replace('</head>', '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4474724430572739" crossorigin="anonymous"></script></head>');
  html = html.replace(/css\/main\.css(?:\?v=[^"']*)?/g, 'css/main.css?v=20260921-5');
  html = html.replace('</body>', `<script src="${prefix}/js/settings.js?v=${version}"></script><script src="${prefix}/js/ad-layout.js?v=20260921-5"></script></body>`);
  return html;
}

function versionAssets(html) {
  return html.replace(/(gamesinfo\.js)(?:\?v=[^"']*)?/g, `$1?v=${version}`)
    .replace(/(js\/ad-layout\.js)(?:\?v=[^"']*)?/g, `$1?v=${version}`)
    .replace('family=Nunito:wght@600&display=swap', 'family=Nunito:wght@600;800;900&display=swap');
}

function cleanShellWhitespace(html) {
  const clean = source => source.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi).map((part, index) => {
    if (index % 2 && !part.includes('function toggleFullscreen')) return part;
    return part.replace(/^[ \t]+(?=\r?$)/gm, '');
  }).join('');
  const player = findClass(html, 'game-player');
  const runtime = html.slice(player.start, player.end);
  return clean(html.slice(0, player.start)) + (/\bx8-page\b/.test(html) ? clean(runtime) : runtime) + clean(html.slice(player.end));
}

function reusableTemplate(html) {
  if (!/\bdata-game-key=/.test(html)) return html;
  html = replaceElement(html, findClass(html, 'game-cover'), '');
  for (const name of ['game-player', 'game-content-column']) {
    const node = findClass(html, name);
    html = replaceElement(html, node, html.slice(node.openEnd, node.closeStart));
  }
  html = replaceElement(html, findClass(html, 'game-site-footer'), '');
  html = html.replace(/<body\b[^>]*>/, '<body>')
    .replace(/<link\b[^>]*href="[^"]*css\/game-page\.css[^>]*>/g, '')
    .replace(/<script\b[^>]*src="[^"]*js\/game-page\.js[^>]*><\/script>/g, '');
  return html;
}

function standaloneRuntime(html, game) {
  // Some legacy entrypoints only embed another complete site page. Extract
  // that page's engine so the new shell does not nest navigation and ads.
  const frame = html.match(/<iframe\b[^>]*src="([^"?#]+\.html?)"/i);
  if (frame) {
    const nested = path.posix.join(path.posix.dirname(game.url), frame[1]);
    if (fs.existsSync(path.join(root, nested))) {
      const source = read(nested);
      const window = findClass(source, 'game-window');
      if (window) {
        const head = element(source, (_token, name) => name === 'head');
        const controls = findClass(source, 'game-controls');
        const tail = source.slice(window.end, controls?.start || window.end);
        const engineScripts = tail.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
        html = '<!doctype html><html lang="en"><head>' + source.slice(head.openEnd, head.closeStart) +
          '<style>html,body{width:100%;height:100%;margin:0!important;padding:0!important;overflow:hidden;background:#000}.game-window{position:relative!important;width:100vw!important;height:100dvh!important;max-width:none!important;min-height:0!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}</style></head><body><div class="game-window" id="gameWindow">' +
          source.slice(window.openEnd, window.closeStart) + '</div>' + engineScripts.join('\n') + '</body></html>';
      }
    }
  }
  html = html.replace(/<!-- GAME SEO:HEAD START -->[\s\S]*?<!-- GAME SEO:HEAD END -->/i, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*name="robots"[^>]*>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script => /googletagmanager\.com|adsbygoogle|gtag\(['"]config/.test(script) ? '' : script)
    .replace(/<html\b/i, '<html data-game-runtime')
    .replace(/<head\b([^>]*)>/i, `<head$1><title>${escape(game.name)} player</title><meta name="robots" content="noindex">`);
  return html;
}

function migrate() {
  const games = catalog();
  const template = reusableTemplate(read('games/html/awesometanks2.html'));
  let count = 0;
  for (const [key, game] of Object.entries(games)) {
    let html = read(game.url);
    if (/\bdata-game-key=/.test(html)) {
      const prefix = assetPrefix(game.url);
      const updated = cleanShellWhitespace(versionAssets(ensureAds(updateFooterLinks(html, prefix), prefix)));
      if (updated !== html) {
        if (process.argv.includes('--check')) throw new Error('Missing shared ad layout: ' + game.url);
        fs.writeFileSync(path.join(root, game.url), updated);
        count++;
      }
      continue;
    }
    if (process.argv.includes('--check')) throw new Error('Unmigrated game page: ' + game.url);
    const prefix = assetPrefix(game.url);
    const size = playerSize(html, game);
    if (!findClass(html, 'game-window')) {
      const runtime = game.url.replace(/(\.html?)$/, '-player$1');
      if (fs.existsSync(path.join(root, runtime))) throw new Error('Refusing to overwrite existing runtime: ' + runtime);
      const player = standaloneRuntime(html, game);
      fs.writeFileSync(path.join(root, runtime), player);
      const seo = html.match(/<!-- GAME SEO:HEAD START -->[\s\S]*?<!-- GAME SEO:HEAD END -->/)?.[0];
      html = template.replaceAll('../../', prefix + '/').replace(/<!-- GAME SEO:HEAD START -->[\s\S]*?<!-- GAME SEO:HEAD END -->/, seo);
      html = html.replace(/<script\b[^>]*src="\.\.\/ruffle\.js"[^>]*><\/script>/, '');
      const window = findClass(html, 'game-window');
      html = html.slice(0, window.openEnd) + `<iframe src="${path.posix.basename(runtime)}" title="${escape(game.name)} game" allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write" allowfullscreen></iframe>` + html.slice(window.closeStart);
      html = html.replace(/(<span class="game-window-title">)[\s\S]*?(<\/span>)/, '$1' + escape(game.name) + '$2');
    }
    // All legacy catalog shells have the carousel implementation at the end
    // of an otherwise shared navigation/settings script.
    html = html.replace(/\s*\/\/ ={5,}\s*\/\/ SUGGESTED GAMES[\s\S]*?(?=<\/script>)/, '\n');
    const section = findClass(html, 'suggested-games-section');
    if (!section) throw new Error('Missing suggestion section: ' + game.url);
    html = replaceElement(html, section, suggestions(game, games, prefix));
    if (game.url === 'games/megaman-x8/index.html') {
      const intro = element(html, token => /\bid="intro"/.test(token));
      html = replaceElement(html, intro, '');
      html = html.replace('id="stage" hidden', 'id="stage"').replace('<iframe id="game"', '<iframe src="game.html" id="game"');
    }
    html = removeOldPresentation(html);
    const window = findClass(html, 'game-window');
    if (!window) throw new Error('Missing game player: ' + game.url);
    html = html.slice(0, window.openEnd) + cover(game, prefix) + '<div class="game-player" inert>' + html.slice(window.openEnd, window.closeStart) + '</div>' + html.slice(window.closeStart);
    html = html.replace(/<body\b([^>]*)>/i, (_, attrs) => {
      let next = attrs.replace(/\s+class="([^"]*)"/, (_m, classes) => ` class="${classes} game-page"`);
      if (!/\bclass=/.test(next)) next += ' class="game-page"';
      if (!/\bid=/.test(next)) next += ' id="top"';
      return `<body${next} data-game-key="${escape(key)}" style="--player-ratio: ${size[0] / size[1]}; --player-max: ${size[2]}px">`;
    });
    if (game.url === 'games/megaman-x8/index.html') {
      html = html.replace('class="x8-content-column"', 'class="x8-content-column game-content-column"')
        .replace('class="site-footer"', 'class="site-footer game-site-footer" data-game-footer')
        .replace('<div class="x8-footer-bottom">', footerLinks(prefix) + '<div class="x8-footer-bottom">');
    } else {
      const main = element(html, (_token, name) => name === 'main');
      html = html.slice(0, main.start) + '<div class="game-content-column">' + html.slice(main.start, main.end) + footer(prefix) + '</div>' + html.slice(main.end);
    }
    // Add shared presentation last, after inline and engine styles.
    html = html.replace('</head>', `<link rel="stylesheet" href="${prefix}/css/game-page.css?v=${version}">\n<script src="${prefix}/js/game-page.js?v=${version}" defer></script>\n</head>`);
    if (!/<script[^>]*src="[^\"]*gamesinfo\.js/.test(html)) html = html.replace('</head>', `<script src="${prefix}/gamesinfo.js?v=${version}"></script>\n</head>`);
    html = cleanShellWhitespace(versionAssets(ensureAds(html, prefix)));
    fs.writeFileSync(path.join(root, game.url), html);
    count++;
  }
  console.log(`Updated ${count} catalog game pages. All ${Object.keys(games).length} pages use the shared shell.`);
}

if (require.main === module) migrate();
module.exports = { element, findClass, catalog, migrate, standaloneRuntime };
