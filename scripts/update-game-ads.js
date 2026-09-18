const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publisher = "ca-pub-4474724430572739";
const existingSlot = "4055551074";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function removeBalancedBlock(source, marker, startToken = "{") {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return source;
  const start = source.lastIndexOf("\n", markerIndex) + 1;
  const braceStart = source.indexOf(startToken, markerIndex);
  if (braceStart === -1) throw new Error(`Could not find block start for ${marker}`);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) {
      let end = index + 1;
      while (source[end] === ";" || source[end] === "\r" || source[end] === "\n") end += 1;
      return source.slice(0, start) + source.slice(end);
    }
  }
  throw new Error(`Unbalanced block for ${marker}`);
}

function slotMarkup(kind, label) {
  return [
    `<div class="game-ad game-ad--${kind}" data-ad-label="AD SLOT" aria-label="${label}">`,
    `  <ins class="adsbygoogle"`,
    `       data-ad-client="${publisher}"`,
    `       data-ad-slot="${existingSlot}"></ins>`,
    `</div>`
  ].join("\n");
}

function updatePage(file) {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes('<div class="game-window"')) return false;
  if (original.includes('class="game-ad game-ad--banner"')) return false;

  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let html = original;

  html = html.replace(
    /\s*<hr class="settings-divider">\s*<div class="settings-row">\s*<label for="toggle-ads">[\s\S]*?<\/div>/i,
    ""
  );
  html = removeBalancedBlock(html, "function applyAdBlock");
  html = removeBalancedBlock(html, "localStorage.getItem('blockAds')");
  html = removeBalancedBlock(html, 'localStorage.getItem("blockAds")');

  html = html.replace(/\s*<div class="ad-sidebar">[\s\S]*?<\/div>/gi, "");
  html = html.replace(
    /(<div class="game-window-container">\s*)(<div class="game-area">)/i,
    `$1$2`
  );
  html = html.replace(
    /(<div class="game-window"[\s\S]*?<\/div>)(\s*<\/div>\s*<div class="game-controls">)/i,
    `$1${eol}${slotMarkup("rectangle game-ad--rectangle-left", "Advertisement left of game").replace(">", ' data-ad-rail-position="1">')}${eol}${slotMarkup("rectangle game-ad--rectangle-left game-ad--rail-secondary", "Second advertisement left of game").replace(">", ' data-ad-rail-position="2">')}${eol}${slotMarkup("rectangle game-ad--rectangle-left game-ad--rail-secondary", "Third advertisement left of game").replace(">", ' data-ad-rail-position="3">')}${eol}${slotMarkup("rectangle game-ad--rectangle-right", "Advertisement right of game").replace(">", ' data-ad-rail-position="1">')}${eol}${slotMarkup("rectangle game-ad--rectangle-right game-ad--rail-secondary", "Second advertisement right of game").replace(">", ' data-ad-rail-position="2">')}${eol}${slotMarkup("rectangle game-ad--rectangle-right game-ad--rail-secondary", "Third advertisement right of game").replace(">", ' data-ad-rail-position="3">')}$2`
  );
  html = html.replace(
    /(<div class="game-controls">[\s\S]*?<\/div>)/i,
    `$1${eol}${slotMarkup("banner", "Advertisement below game")}`
  );
  html = html.replace(
    /(<\/main>)/i,
    `${slotMarkup("mobile-footer", "Mobile footer advertisement")}${eol}$1`
  );

  const settingsScripts = Array.from(html.matchAll(/<script src="([^\"]*?)js\/settings\.js[^\"]*"><\/script>/gi));
  const settingsScript = settingsScripts.at(-1);
  if (!settingsScript) throw new Error(`Missing settings script: ${path.relative(root, file)}`);
  const adScript = `<script src="${settingsScript[1]}js/ad-layout.js?v=20260917"></script>`;
  html = html.replace(settingsScript[0], `${settingsScript[0]}${eol}  ${adScript}`);

  fs.writeFileSync(file, html.replaceAll("\n", eol).replaceAll("\r\r\n", "\r\n"), "utf8");
  return true;
}

const pages = walk(root).filter(file => file.endsWith(".html"));
const updated = pages.filter(updatePage);
console.log(`Updated ${updated.length} game pages with responsive side rails, a lower banner, and a mobile footer.`);
