const fs = require('fs');
const path = require('path');
const { catalog, findClass, element } = require('./update-game-pages');
const root = path.resolve(__dirname, '..');
const games = catalog();
const failures = [];
for (const [key, game] of Object.entries(games)) {
  const html = fs.readFileSync(path.join(root, game.url), 'utf8');
  const fail = message => failures.push(game.url + ': ' + message);
  const cover = findClass(html, 'game-cover');
  const player = findClass(html, 'game-player');
  const suggestions = element(html, token => /\bdata-suggested-games\b/.test(token));
  if (!html.includes(`data-game-key="${key.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`)) fail('incorrect catalog key');
  if (!cover || !html.slice(cover.start, cover.end).includes('data-play-game')) fail('missing accessible Play cover');
  if (!player || !/\binert\b/.test(html.slice(player.start, player.openEnd))) fail('missing initially inert player');
  if (cover && !html.slice(cover.start, cover.end).includes(game.image || 'bagelicontab.png')) fail('incorrect cover artwork');
  if (!/\bdata-game-footer\b/.test(html)) fail('missing shared footer');
  for (const asset of ['css/game-page.css', 'js/game-page.js']) {
    if (html.split(asset).length !== 2) fail('expected one shared asset: ' + asset);
  }
  if (/scrollSuggestedGames|function getSuggestedGames|suggested-arrow/.test(html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''))) fail('legacy suggestion carousel remains');
  if (!suggestions) fail('missing suggested games');
  else {
    const links = [...html.slice(suggestions.openEnd, suggestions.closeStart).matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
    if (links.length !== 4 || new Set(links).size !== 4) fail('expected four unique suggestions');
    const targets = links.map(link => path.resolve(path.dirname(path.join(root, game.url)), decodeURIComponent(link)));
    if (targets.includes(path.join(root, game.url))) fail('suggests itself');
    const urls = new Set(Object.values(games).map(other => path.join(root, other.url)));
    if (targets.some(target => !urls.has(target))) fail('suggestion is not a catalog game');
  }
  const runtime = html.match(/<iframe\b[^>]*src="([^"]+-player\.html?)"/);
  if (runtime) {
    const file = path.resolve(path.dirname(path.join(root, game.url)), runtime[1]);
    if (!fs.existsSync(file)) fail('missing standalone player');
    else {
      const source = fs.readFileSync(file, 'utf8');
      if (!source.includes('data-game-runtime') || !source.includes('content="noindex"')) fail('runtime must be marked noindex');
      if (/googletagmanager\.com|adsbygoogle/.test(source)) fail('runtime duplicates analytics or ads');
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Verified covers, players, footers, and four valid suggestions on ${Object.keys(games).length} catalog pages.`);
