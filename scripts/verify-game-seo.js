const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const { loadCatalog, renderPage } = require("../update-seo.js");

const root = path.resolve(__dirname, "..");
const catalog = loadCatalog();
const descriptions = new Set();
const metaDescriptions = new Set();
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

for (const [key, game] of Object.entries(catalog)) {
  assert.ok(game.description && game.metaDescription, `${key}: missing editorial copy`);
  assert.ok(!descriptions.has(game.description), `${key}: duplicate description`);
  assert.ok(!metaDescriptions.has(game.metaDescription), `${key}: duplicate meta description`);
  descriptions.add(game.description);
  metaDescriptions.add(game.metaDescription);
  const html = fs.readFileSync(path.join(root, game.url), "utf8");
  assert.equal(renderPage(game, html), html, `${key}: generated page is stale or regeneration is unstable`);
  for (const [pattern, label] of [[/<h1\b/gi, "H1"], [/<title\b/gi, "title"],
    [/<meta name="description"/g, "meta description"], [/class="game-description"/g, "paragraph"]]) {
    assert.equal([...html.matchAll(pattern)].length, 1, `${key}: expected exactly one ${label}`);
  }
  assert.ok(html.includes(`<h1 class="game-window-title">Play ${escapeHtml(game.name)}</h1>`), `${key}: heading`);
  assert.ok(html.includes(`<title>Play ${escapeHtml(game.name)} | Bagel Comics</title>`), `${key}: title`);
  assert.ok(html.includes(`<p class="game-description">${escapeHtml(game.description)}</p>`), `${key}: visible copy`);
  for (const tag of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    assert.ok(html.includes(`<meta ${tag} content="${escapeHtml(game.metaDescription)}">`), `${key}: ${tag}`);
  }
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.description, game.description, `${key}: structured description`);
  const stylesheet = html.match(/<link rel="stylesheet" href="([^"]*game-seo\.css)[^"]*">/)[1];
  assert.ok(fs.existsSync(path.resolve(root, path.dirname(game.url), stylesheet)), `${key}: stylesheet path`);
}

// Exercise nested controls, first-time generation, changed copy, and unsafe markup.
const fixture = '<!DOCTYPE html><html><head></head><body class="custom"><div class="game-controls"><div><span class="game-window-title">Test</span></div><button>Fullscreen</button></div><div id="ad"></div><script>window.gameReady = true;</script></body></html>';
const game = { name: 'Test & "Game"', url: "games/test.html", tags: ["puzzle"],
  description: 'A <script>alert("test")</script> & a $& token.', metaDescription: 'A "quoted" description & more.' };
const first = renderPage(game, fixture);
assert.ok(first.includes('</button></div>\n        <!-- GAME SEO:DESCRIPTION START -->'), "Description must follow the complete controls element");
assert.ok(first.includes('class="custom game-seo-page"'), "Existing body classes must survive");
assert.ok(first.includes('<script>window.gameReady = true;</script>'), "Gameplay scripts must survive");
assert.ok(!first.includes('<script>alert("test")</script>'), "Catalog text must not become executable markup");
assert.ok(first.includes("\\u003cscript>"), "Structured data must escape script delimiters");
assert.equal(renderPage(game, first), first, "Newly generated markup must be stable");
const revised = renderPage({ ...game, description: "A revised description." }, first);
assert.ok(revised.includes('<p class="game-description">A revised description.</p>'), "Catalog edits must update the paragraph");
assert.equal([...revised.matchAll(/GAME SEO:DESCRIPTION START/g)].length, 1, "Copy updates must not duplicate paragraphs");
assert.throws(() => renderPage({ ...game, description: "" }, fixture), /Missing editorial copy/);
assert.throws(() => renderPage(game, fixture.replace('class="game-window-title"', 'class="missing-title"')), /Cannot find game heading/);

console.log(`Game SEO checks passed for ${Object.keys(catalog).length} games, including regeneration, copy updates, placement, and HTML escaping.`);
