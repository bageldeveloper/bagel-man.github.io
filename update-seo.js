const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const origin = "https://bagelcomics.com";
const unblockedUrl = "https://tinyurl.com/bagelcomicsunblocked";
const contactEmail = "bagelcomics.com@gmail.com";
const startMarker = "<!-- GAME SEO:HEAD START -->";
const endMarker = "<!-- GAME SEO:HEAD END -->";

const summaries = {
  "games/html/freerun.html": "Free Running is a side-scrolling platform game built around running, jumping, and clearing obstacle-filled stages.",
  "games/html/endlesswar.html": "Endless War is a top-down action game with battlefield scenarios and tactical movement.",
  "games/html/drawsomething.html": "Draw Something is a drawing game presented in the Bagel Comics browser game collection.",
  "games/html/supersmashflash.html": "Super Smash Flash is a browser fighting game featuring platform-based battles.",
  "games/html/chaosfaction2.html": "Chaos Faction 2 is an arena fighting game with fast platform-based battles.",
  "games/html/crosswordpuzzle.html": "Crossword Puzzle is a word puzzle game for solving clues on a crossword grid.",
  "games/html/chooseyourweapon.html": "Choose Your Weapon is an action platform game in the Bagel Comics catalog.",
  "games/html/dragracer2.html": "Drag Racer 2 is a racing game centered on building and racing a drag car.",
  "games/html/battlegear3.html": "Battle Gear 3 is a strategy game based on deploying units during large battles.",
  "games/vex6/index.html": "Vex 6 is a stick-figure platform game built around obstacle courses and precise movement.",
  "games/html/lineriderundo.html": "Line Rider with Undo is a drawing and physics game with an undo option for revising tracks.",
  "games/html/hobo5.html": "Hobo 5: Space Brawls is an action game in the Hobo series with side-scrolling fights.",
  "eaglercraft-1.12.html": "Play the Eaglercraft 1.12 browser build on Bagel Comics through the existing embedded Minecraft 1.12 game page."
};

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
  return Object.values(context.catalog);
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
  if (summaries[game.url]) return summaries[game.url];
  const genre = reliableGenres(game)[0];
  if (genre) {
    return `Play ${game.name} in your browser on Bagel Comics. Open the existing embedded ${genreLabels[genre]} game and browse more titles in the catalog.`;
  }
  return `Play ${game.name} in your browser on Bagel Comics using the existing embedded game page, then browse more titles from the game catalog.`;
}

function titleFor(game) {
  if (game.url === "eaglercraft-1.12.html") {
    return "Eaglercraft 1.12 – Play Minecraft 1.12 Unblocked Online | Bagel Comics";
  }
  const title = `${game.name} – Play Unblocked Online | Bagel Comics`;
  return title.length <= 65 ? title : `${game.name} – Play Online | Bagel Comics`;
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
  const url = absoluteUrl(game.url);
  const image = game.image && fs.existsSync(path.join(root, game.image))
    ? absoluteUrl(game.image)
    : null;
  const genres = reliableGenres(game).map(tag => genreLabels[tag]);
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
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">",
    `  <meta name="description" content="${escapeHtml(description)}">`,
    "  <meta name=\"robots\" content=\"index,follow\">",
    `  <link rel="canonical" href="${escapeHtml(url)}">`,
    "  <meta property=\"og:type\" content=\"website\">",
    `  <meta property="og:title" content="${escapeHtml(title)}">`,
    `  <meta property="og:description" content="${escapeHtml(description)}">`,
    `  <meta property="og:url" content="${escapeHtml(url)}">`,
    image ? `  <meta property="og:image" content="${escapeHtml(image)}">` : "",
    `  <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    `  <meta name="twitter:title" content="${escapeHtml(title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(description)}">`,
    image ? `  <meta name="twitter:image" content="${escapeHtml(image)}">` : "",
    `  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
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

function updatePage(game) {
  const file = path.join(root, game.url);
  if (!fs.existsSync(file)) throw new Error(`Missing game page: ${game.url}`);
  const original = fs.readFileSync(file, "utf8");
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let html = original.replace(/<html\b([^>]*)>/i, (_match, attributes) => {
    const clean = attributes.replace(/\s+lang=["'][^"']*["']/i, "");
    return `<html${clean} lang="en">`;
  });
  html = html.replace(/<head\b([^>]*)>([\s\S]*?)<\/head>/i, (_match, attributes, head) => {
    const cleanedHead = removeOldSeo(head).replace(/^\s+/, "");
    return `<head${attributes}>${eol}  ${seoHead(game, eol)}${eol}${cleanedHead}</head>`;
  });
  writeWithRetry(file, html);
}

function main() {
  const catalog = loadCatalog();
  for (const game of catalog) updatePage(game);
  console.log(`Updated head-only SEO for ${catalog.length} game pages; body markup was preserved.`);
}

main();
