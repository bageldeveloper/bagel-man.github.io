const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const origin = "https://bagelcomics.com";
const unblockedUrl = "https://tinyurl.com/bagelcomicsunblocked";
const contactEmail = "bagelcomics.com@gmail.com";
const startMarker = "<!-- GAME SEO:HEAD START -->";
const endMarker = "<!-- GAME SEO:HEAD END -->";

const genreLabels = {
  action: "action",
  adventure: "adventure",
  Board: "board",
  console: "console",
  original: "original",
  platformer: "platform",
  puzzle: "puzzle",
  racing: "racing",
  shooter: "shooter",
  simulation: "simulation",
  sports: "sports",
  strategy: "strategy",
  "tower-defense": "tower defense"
};

function loadCatalog() {
  const source = fs.readFileSync(path.join(root, "gamesinfo.js"), "utf8");
  const context = {};
  vm.runInNewContext(source + ";globalThis.catalog = gamersgaming;", context);
  return context.catalog;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function absoluteUrl(relativeUrl) {
  return origin + "/" + relativeUrl.split("/").map(encodeURIComponent).join("/");
}

function reliableGenres(game) {
  if (!Array.isArray(game.tags) || game.tags.length > 6) return [];
  return game.tags.filter(tag => genreLabels[tag]);
}

function descriptionFor(game) {
  if (!game.description || !game.metaDescription) throw new Error(`Missing editorial copy: ${game.url}`);
  return game.description;
}

function titleFor(game) {
  return `Play ${game.name} | Bagel Comics`;
}

function removeOldSeo(head) {
  return head
    .replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\s*`, "gi"), "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, "")
    .replace(/<meta\b[^>]*(?:name=["'](?:description|keywords|author|robots|rating|subject|classification|viewport|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
}

function seoHead(game, eol) {
  const title = titleFor(game);
  const description = descriptionFor(game);
  const metaDescription = game.metaDescription || description;
  const url = absoluteUrl(game.url);
  const image = game.image && fs.existsSync(path.join(root, game.image))
    ? absoluteUrl(game.image)
    : null;
  const genres = reliableGenres(game).map(tag => genreLabels[tag]);
  const stylesheet = path.posix.relative(path.posix.dirname(game.url), "css/game-seo.css");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description,
    url,
    sameAs: unblockedUrl,
    publisher: {
      "@type": "Organization",
      name: "Bagel Comics",
      url: origin,
      email: contactEmail,
      sameAs: unblockedUrl
    }
  };
  if (image) structuredData.image = image;
  if (genres.length) structuredData.genre = genres;

  return [
    startMarker,
    `  <title>${escapeHtml(title)}</title>`,
    `  <link rel="stylesheet" href="${escapeHtml(stylesheet)}?v=20261109">`,
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">",
    `  <meta name="description" content="${escapeHtml(metaDescription)}">`,
    "  <meta name=\"robots\" content=\"index,follow\">",
    `  <link rel="canonical" href="${escapeHtml(url)}">`,
    "  <meta property=\"og:type\" content=\"website\">",
    `  <meta property="og:title" content="${escapeHtml(title)}">`,
    `  <meta property="og:description" content="${escapeHtml(metaDescription)}">`,
    `  <meta property="og:url" content="${escapeHtml(url)}">`,
    image ? `  <meta property="og:image" content="${escapeHtml(image)}">` : "",
    `  <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    `  <meta name="twitter:title" content="${escapeHtml(title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(metaDescription)}">`,
    image ? `  <meta name="twitter:image" content="${escapeHtml(image)}">` : "",
    `  <script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>`,
    endMarker
  ].filter(Boolean).join(eol);
}

function writeWithRetry(file, content) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      fs.writeFileSync(file, content, "utf8");
      return;
    } catch (error) {
      if (attempt === 8 || !["EBUSY", "EPERM", "UNKNOWN"].includes(error.code)) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 75);
    }
  }
}

function updateGameBody(html, game, eol) {
  if (!game.description || !game.metaDescription) throw new Error(`Missing editorial copy: ${game.url}`);
  const start = "<!-- GAME SEO:DESCRIPTION START -->";
  const end = "<!-- GAME SEO:DESCRIPTION END -->";
  const heading = `<h1 class="game-window-title">Play ${escapeHtml(game.name)}</h1>`;
  const hasControls = html.includes('<div class="game-controls">');
  const standalone = !hasControls;
  const mode = game.url === "games/2048/index.html" ? "2048"
    : game.url === "games/vex6/index.html" ? "canvas" : "frame";
  html = html.replace(/<body\b([^>]*)>/i, (_match, attributes) => {
    const existing = attributes.match(/\sclass=["']([^"']*)["']/i);
    const classes = new Set((existing ? existing[1] : "").split(/\s+/).filter(Boolean));
    classes.add("game-seo-page");
    if (standalone) classes.add(`game-seo-${mode}-page`);
    if (game.url === "games/cookie/index.html") classes.add("game-seo-cookie-page");
    const rest = attributes.replace(/\sclass=["'][^"']*["']/i, "");
    return `<body${rest} class="${[...classes].join(" ")}">`;
  });

  // Keep one primary heading; preserve secondary headings belonging to game UIs.
  if (game.url === "games/2048/index.html") {
    html = html.replace(/<h1 class="title">([\s\S]*?)<\/h1>/, '<div class="title">$1</div>');
  }
  if (["orbitron.html", "N64Wasm-master/dist/index.html"].includes(game.url)) {
    html = html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (match, attributes, content) =>
      attributes.includes('class="game-window-title"') ? match : `<h2${attributes}>${content}</h2>`);
  }
  if (hasControls) {
    const headingPattern = /<(span|h1) class="game-window-title">[\s\S]*?<\/\1>/;
    if (!headingPattern.test(html)) throw new Error(`Cannot find game heading: ${game.url}`);
    html = html.replace(headingPattern, () => heading);
  }
  const paragraph = [
    start,
    ...(standalone ? ['        <section class="game-seo-info" aria-label="About this game">', `        ${heading}`] : []),
    `        <p class="game-description">${escapeHtml(game.description)}</p>`,
    ...(standalone ? ['        </section>'] : []),
    `        ${end}`
  ].join(eol);
  const existing = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (existing.test(html)) return html.replace(existing, () => paragraph);
  if (hasControls) {
    // Match the complete controls element, including Mega Man X8's nested divs.
    const controlsStart = html.indexOf('<div class="game-controls">');
    const tags = /<\/?div\b[^>]*>/gi;
    tags.lastIndex = controlsStart;
    let depth = 0;
    let match;
    while ((match = tags.exec(html))) {
      depth += match[0].startsWith("</") ? -1 : 1;
      if (depth === 0) return html.slice(0, tags.lastIndex) + eol + "        " + paragraph + html.slice(tags.lastIndex);
    }
    throw new Error(`Unclosed game controls: ${game.url}`);
  }
  const anchor = game.url === "games/2048/index.html" ? '  <script src="js/bind_polyfill.js">'
    : game.url === "games/vex6/index.html" ? '    <script type="text/javascript">' : '  <noscript>';
  const position = html.indexOf(anchor, html.indexOf("<body"));
  if (position < 0) throw new Error(`Cannot locate standalone game introduction: ${game.url}`);
  return html.slice(0, position) + "        " + paragraph + eol + html.slice(position);
}

function renderPage(game, original) {
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let html = original.replace(/<html\b([^>]*)>/i, (_match, attributes) => {
    const clean = attributes.replace(/\s+lang=["'][^"']*["']/i, "");
    return `<html${clean} lang="en">`;
  });
  html = html.replace(/<head\b([^>]*)>([\s\S]*?)<\/head>/i, (_match, attributes, head) => {
    const cleanedHead = removeOldSeo(head).replace(/^\s+/, "");
    return `<head${attributes}>${eol}  ${seoHead(game, eol)}${eol}${cleanedHead}</head>`;
  });
  html = updateGameBody(html, game, eol);
  if (game.image) {
    const poster = escapeHtml(path.posix.relative(path.posix.dirname(game.url), game.image));
    html = html.replace(/<img\b[^>]*\bdata-game-poster\b[^>]*>/gi, tag =>
      tag.replace(/\ssrc=["'][^"']*["']/i, () => ` src="${poster}"`));
  }
  return html;
}

function main() {
  const catalog = loadCatalog();
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--game" || !args[1])) {
    throw new Error("Usage: node update-seo.js [--game <catalog-key>]");
  }
  const key = args[1];
  if (key && !Object.hasOwn(catalog, key)) throw new Error(`Unknown game: ${key}`);
  const games = key ? [catalog[key]] : Object.values(catalog);
  // Prepare every page before writing so missing copy or markup cannot partially update the catalog.
  const pages = games.map(game => {
    const file = path.join(root, game.url);
    const original = fs.readFileSync(file, "utf8");
    return { file, original, html: renderPage(game, original) };
  });
  for (const { file, original, html } of pages) {
    if (html !== original) writeWithRetry(file, html);
  }
  console.log(`Updated headings, visible descriptions and metadata for ${games.length} game page(s).`);
}

if (require.main === module) main();

module.exports = { loadCatalog, renderPage };
