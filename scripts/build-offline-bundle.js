/* Builds a self-contained Bagel Comics edition without modifying the source site. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const bundle = path.join(dist, "bagelcomics-offline");
const zip = path.join(dist, "bagelcomics-offline.zip");
const roster = JSON.parse(fs.readFileSync(path.join(root, "offline-roster.json"), "utf8"));
const MAX_ZIP_BYTES = 500 * 1024 * 1024;
const MAX_UNZIPPED_BYTES = 500 * 1024 * 1024;
// Keep a safety margin because generated chunks, thumbnails, and launcher
// files are added after the selection pass.
const PLANNING_LIMIT = 500 * 1024 * 1024;
// Leave room for a full 100-game roster once each Flash title's SWF is included.
// These four large, high-interest web games are intentional exceptions.
const OPTIONAL_MAX_BYTES = 10 * 1024 * 1024;
const REQUESTED_LARGE_MAX_BYTES = 210 * 1024 * 1024;
const PREFERRED_LARGE_GAMES = new Set(["BagelWithaGun", "phobia", "BloonsTowerDefense5", "PlantsvsZombies", "Minecraft 1.12", "Minecraft 1.5.2", "SuperMario64", "SuperSmashBros"]);
const CHUNK_LIMIT = 700 * 1024;

function loadCatalog() {
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, "gamesinfo.js"), "utf8") + ";globalThis.catalog = gamersgaming;", context);
  return context.catalog;
}
const catalog = loadCatalog();
const selected = new Set();
const copied = new Set();
const treeCache = new Map();
const candidateCache = new Map();
let plannedBytes = 0;

function rel(file) { return path.relative(root, file).replaceAll("\\", "/"); }
function source(file) { return path.join(root, file); }
function target(file) { return path.join(bundle, file); }
function exists(file) { return fs.existsSync(source(file)); }
function filesUnder(file) {
  file = file.replaceAll("\\", "/");
  if (treeCache.has(file)) return treeCache.get(file);
  const full = source(file);
  if (!fs.existsSync(full)) return [];
  if (!fs.statSync(full).isDirectory()) {
    const result = [file];
    treeCache.set(file, result);
    return result;
  }
  const result = fs.readdirSync(full, { withFileTypes: true }).flatMap(entry =>
    filesUnder(path.posix.join(file.replaceAll("\\", "/"), entry.name)));
  treeCache.set(file, result);
  return result;
}
function candidateFiles(key) {
  if (candidateCache.has(key)) return candidateCache.get(key);
  const game = catalog[key];
  if (!game) throw new Error(`Unknown catalog key: ${key}`);
  const list = [game.url, game.image];
  const page = exists(game.url) ? fs.readFileSync(source(game.url), "utf8") : "";
  const add = item => {
    if (item && exists(item) && fs.statSync(source(item)).isFile()) list.push(item);
  };
  const addTree = item => { if (item && exists(item)) list.push(item); };
  const localReference = value => value.startsWith("/")
    ? value.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(game.url), value));
  if (game.url.startsWith("games/emu/")) {
    addTree("games/emu/data");
    const rom = page.match(/EJS_gameUrl\s*=\s*['\"]([^'\"]+)/)?.[1];
    add(rom && path.posix.join("games/emu", rom));
  } else if (game.url.startsWith("games/html/")) {
    for (const match of page.matchAll(/(?:src|data)\s*=\s*['\"]([^'\"]+)/gi)) {
      const value = match[1].split(/[?#]/)[0];
      if (!/^(?:https?:|data:|javascript:|#)/i.test(value)) add(localReference(value));
    }
  }
  const roots = [
    ["Minecraft 1.5.2", "eaglercraft-main/eaglercraft-main/stable-download/web"],
    ["Minecraft 1.8.8", "games/minecrap"], ["SuperMario64", "games/sm64"],
    ["MarioKart64", "N64Wasm-masterMK64/dist"], ["TheLegendofZeldaOcarinaofTime", "N64Wasm-master/dist"],
    ["Doom1/2", "doom/public"], ["Quake", "Quake1-master"], ["BagelWithaGun", "bwag"],
    ["jimmy", "JimmyBeanGame"], ["phobia", "Phobia 0.2.1"], ["drats", "TSADrats"],
    ["Blobby", "blobby"], ["Slope", "games/Slope-Game-main"], ["Retrobowl", "games/retrobowl"],
    ["MotoX3m", "games/motox3m"], ["MotoX3m2", "games/motox3m2"], ["GetawayShootout", "games/getaway-shootout"],
    ["CookieClicker", "games/cookie"], ["Vex3", "vex3"]
  ];
  for (const [name, folder] of roots) if (name === key) addTree(folder);
  for (const match of page.matchAll(/(?:src|href|data)\s*=\s*['\"]([^'\"]+)/gi)) {
    const value = match[1].split(/[?#]/)[0];
    if (!/^(?:https?:|data:|javascript:|#)/i.test(value)) add(localReference(value));
  }
  // Doom's 13 MiB promotional preview is not referenced by its runtime; omit it
  // so the actual game data can coexist with the requested Phobia build.
  const result = [...new Set(list.flatMap(filesUnder))].filter(file =>
    !(key === "Doom1/2" && file === "doom/public/preview.gif") &&
    // The roster has NES, SNES, and N64 titles but no arcade title. The MAME
    // and arcade cores are otherwise unused shared payloads.
    !(game.url.startsWith("games/emu/") && /^games\/emu\/data\/(?:mame|arcade)/i.test(file)));
  candidateCache.set(key, result);
  return result;
}
function missingCost(key) {
  return candidateFiles(key).filter(file => !copied.has(file)).reduce((sum, file) => sum + fs.statSync(source(file)).size, 0);
}
function include(key) {
  for (const file of candidateFiles(key)) copied.add(file);
  selected.add(key);
}

// Shared visual/site assets. Thumbnails are added only for selected games.
for (const item of ["css", "js", "images", "games/ruffle.js", "games/core.ruffle.ade83621b88d8fcd9574.js", "games/core.ruffle.11ddacfb2c8cba714468.js", "games/a673594f8b9d245eb457.wasm", "games/6392d556d910057b1996.wasm", "bagelicontab.png", "bagelcomicsicon.png", "favicon.png", "index.css", "index.js", "announcements.js", "chatscript.js", "about.html", "projects.html", "help.html"]) {
  for (const file of filesUnder(item)) copied.add(file);
}
plannedBytes = [...copied].reduce((sum, file) => sum + fs.statSync(source(file)).size, 0);

for (const key of roster.required) {
  if (!catalog[key]) throw new Error(`Required game is not in catalog: ${key}`);
  include(key);
}
plannedBytes = [...copied].reduce((sum, file) => sum + fs.statSync(source(file)).size, 0);

const excluded = new Set(roster.excluded || []);
const standardCandidates = [...roster.priority, ...Object.entries(catalog).filter(([, game]) => game.tags.includes("favorite")).map(([key]) => key), ...Object.keys(catalog)];
const reservedCandidates = [...PREFERRED_LARGE_GAMES, ...(roster.requestedLarge || [])];
// Preserve the existing flagship games and insert requested WebGL games in the
// stated order. Then favor small remaining dependency trees so the bundle can
// still contain exactly 100 playable games.
const candidates = [
  ...reservedCandidates,
  ...standardCandidates.filter(key => !reservedCandidates.includes(key)).sort((a, b) => missingCost(a) - missingCost(b))
];
const skipped = [];
for (const key of candidates) {
  if (excluded.has(key)) continue;
  if (selected.has(key)) continue;
  const cost = missingCost(key);
  const requestedLargeAllowed = (roster.requestedLarge || []).includes(key) && cost <= REQUESTED_LARGE_MAX_BYTES;
  if (cost > OPTIONAL_MAX_BYTES && !PREFERRED_LARGE_GAMES.has(key) && !requestedLargeAllowed) { skipped.push({ key, reason: "oversized", bytes: cost }); continue; }
  if (plannedBytes + cost > PLANNING_LIMIT) { skipped.push({ key, reason: "size", bytes: cost }); continue; }
  include(key);
  plannedBytes += cost;
  if (selected.size === 100) break;
}
if (selected.size !== 100) {
  throw new Error(`Could only select ${selected.size} games within the planning limit; mandatory/shared assets use ${(plannedBytes / 1024 / 1024).toFixed(2)} MiB.`);
}
for (const key of selected) copied.add(catalog[key].image);

function copy(file) {
  const from = source(file), to = target(file);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}
fs.rmSync(bundle, { recursive: true, force: true });
fs.mkdirSync(bundle, { recursive: true });
for (const file of copied) if (fs.existsSync(source(file)) && fs.statSync(source(file)).isFile()) copy(file);

const offlineCatalog = Object.fromEntries([...selected].map(key => [key, catalog[key]]));
fs.writeFileSync(target("gamesinfo.js"), `const gamersgaming = ${JSON.stringify(offlineCatalog, null, 2)};\nif (typeof module !== 'undefined') module.exports = { gamersgaming };\n`);
fs.mkdirSync(target("offline-assets"), { recursive: true });
fs.writeFileSync(target("offline-assets/offline-font.css"), `@font-face { font-family: "BebasNeueRegular"; src: url("/css/BebasNeue-webfont.woff") format("woff"); font-display: swap; }\nbody, body button, body input, body textarea, body select { font-family: "Nunito", "BebasNeueRegular", system-ui, sans-serif !important; }\n`);

function sanitizeHtml(html) {
  html = html.replace(/<script[^>]+(?:googletagmanager|googlesyndication|code\.jquery)[^>]*><\/script>\s*/gi, "");
  html = html.replace(/<link[^>]+(?:fonts\.googleapis|preconnect)[^>]*>\s*/gi, "");
  html = html.replace(/<a[^>]+instagram[^>]*>[\s\S]*?<\/a>/gi, "");
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<link\b[^>]*\bhref=["']https?:[^>]*>\s*/gi, "");
  html = html.replace(/<meta\b[^>]*https?:[^>]*>\s*/gi, "");
  html = html.replace(/<a\b[^>]*\bhref=["']https?:[^>]*>([\s\S]*?)<\/a>/gi, "$1");
  html = html.replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<script[^>]+src=["'][^"']*auto-ads[^"']*["'][^>]*><\/script>\s*/gi, "");
  return html;
}
function chunkLargeScripts(file) {
  const absolute = target(file);
  let html = sanitizeHtml(fs.readFileSync(absolute, "utf8"));
  const relativeFromPage = asset => path.posix.relative(path.posix.dirname(file), asset) || "./";
  html = html.replace(/<\/head>/i, match => `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap">\n<link rel="stylesheet" href="${relativeFromPage("offline-assets/offline-font.css")}">\n${match}`);
  if (file === "eaglercraft-1.12-game.html") {
    html = html.replace(/<head(\s[^>]*)?>/i, match => `${match}\n<link rel="stylesheet" href="${relativeFromPage("css/main.css")}">`);
  }
  let sequence = 0;
  html = html.replace(/<script(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/script>/gi, (whole, attrs, body) => {
    if (Buffer.byteLength(body) <= CHUNK_LIMIT) return whole;
    const id = `${file.replace(/[^a-z0-9]/gi, "_")}_${sequence++}`;
    const chunkDir = `offline-assets/chunks/${id}`;
    const parts = [];
    for (let offset = 0; offset < body.length; offset += CHUNK_LIMIT) {
      const part = body.slice(offset, offset + CHUNK_LIMIT);
      const name = `${chunkDir}/part-${String(parts.length + 1).padStart(3, "0")}.js`;
      fs.mkdirSync(path.dirname(target(name)), { recursive: true });
      fs.writeFileSync(target(name), `window.__bagelOfflineChunks = window.__bagelOfflineChunks || {}; (window.__bagelOfflineChunks[${JSON.stringify(id)}] ||= []).push(${JSON.stringify(part)});\n`);
      parts.push(name);
    }
    const loader = `${chunkDir}/loader.js`;
    // This is an external JavaScript file, so real closing script tags are safe
    // and let document.write load every chunk in order.
    const tags = parts.map(name => `<script src=\"${relativeFromPage(name)}\"></script>`).join("");
    const final = `<script>(function(){var c=window.__bagelOfflineChunks[${JSON.stringify(id)}].join('');var s=document.createElement('script');s.text=c;document.currentScript.replaceWith(s);delete window.__bagelOfflineChunks[${JSON.stringify(id)}];})()</script>`;
    fs.writeFileSync(target(loader), `document.write(${JSON.stringify(tags + final)});\n`);
    return `<script${attrs} src="${relativeFromPage(loader)}"></script>`;
  });
  // Static hosts commonly mount the bundle below a course/project path. Convert
  // root-local asset URLs into paths relative to each page instead of assuming
  // the site root is the bundle root. Protocol-relative URLs are left alone.
  html = html.replace(/((?:src|href|data)\s*=\s*["'])\/(?!\/)([^"']*)(["'])/gi,
    (_whole, prefix, asset, suffix) => `${prefix}${relativeFromPage(asset)}${suffix}`);
  fs.writeFileSync(absolute, html);
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
for (const file of walk(bundle).filter(file => /\.html?$/i.test(file))) {
  chunkLargeScripts(path.relative(bundle, file).replaceAll("\\", "/"));
}
for (const file of ["announcements.js", "js/chat.js", "libs/Detector.js"]) {
  const absolute = target(file);
  if (!fs.existsSync(absolute)) continue;
  let content = fs.readFileSync(absolute, "utf8");
  content = content.replace(/<script[^>]+(?:code\.jquery|googletagmanager|googlesyndication)[^>]*><\/script>\s*/gi, "");
  if (file === "announcements.js") content = content.replace(/(?:https?|wss?):\/\/[^\s'\"<>]+/gi, "").replaceAll("oldindex.html", "index.html");
  if (file === "libs/Detector.js") content = content.replace(/https?:\/\/[^\s'\"<>]+/gi, "");
  fs.writeFileSync(absolute, content);
}
const chatScript = target("chatscript.js");
if (fs.existsSync(chatScript)) {
  let content = fs.readFileSync(chatScript, "utf8");
  content = content.replace("function reconnectChat() {", `function reconnectChat() {
  if (typeof ScaleDrone === "undefined") {
    const status = document.getElementById("online-count");
    const members = document.getElementById("panel-member-count");
    if (status) status.textContent = "offline";
    if (members) members.textContent = "Live chat needs an internet connection.";
    return;
  }`);
  fs.writeFileSync(chatScript, content);
}

const launcher = `@echo off\r\npowershell -ExecutionPolicy Bypass -File "%~dp0start-offline.ps1"\r\n`;
const server = `$root = [IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 8765)
$listener.Start()
Start-Process 'http://127.0.0.1:8765/'
Write-Host 'Bagel Comics offline edition is running. Close this window to stop it.'
$types=@{'.html'='text/html; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.css'='text/css; charset=utf-8';'.wasm'='application/wasm';'.json'='application/json';'.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.gif'='image/gif';'.webp'='image/webp';'.avif'='image/avif';'.svg'='image/svg+xml';'.ogg'='audio/ogg';'.swf'='application/x-shockwave-flash'}
try { while ($true) {
  $client=$listener.AcceptTcpClient(); $stream=$client.GetStream(); $reader=[IO.StreamReader]::new($stream,[Text.Encoding]::ASCII,$false,8192,$true)
  $line=$reader.ReadLine(); while (($header=$reader.ReadLine()) -ne $null -and $header -ne '') {}
  $relative='index.html'; if ($line) { $relative=[uri]::UnescapeDataString(($line -split ' ')[1].Split('?')[0].TrimStart('/')); if (!$relative) {$relative='index.html'} }
  $file=[IO.Path]::GetFullPath((Join-Path $root $relative)); $ok=$file.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $file -PathType Leaf)
  if ($ok) { $body=[IO.File]::ReadAllBytes($file); $type=$types[[IO.Path]::GetExtension($file).ToLowerInvariant()]; if (!$type) {$type='application/octet-stream'}; $status='200 OK' } else { $body=[Text.Encoding]::UTF8.GetBytes('Not found'); $type='text/plain; charset=utf-8'; $status='404 Not Found' }
  $head=[Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status\`r\`nContent-Type: $type\`r\`nContent-Length: $($body.Length)\`r\`nConnection: close\`r\`n\`r\`n"); $stream.Write($head,0,$head.Length); $stream.Write($body,0,$body.Length); $stream.Close(); $client.Close()
} } finally { $listener.Stop() }
`;
fs.writeFileSync(target("Start Bagel Comics.cmd"), launcher, "utf8");
fs.writeFileSync(target("start-offline.ps1"), server, "utf8");

const report = {
  generatedAt: new Date().toISOString(), maxZipBytes: MAX_ZIP_BYTES, maxUnzippedBytes: MAX_UNZIPPED_BYTES, planningBytes: plannedBytes,
  selected: [...selected].map(key => ({ key, name: catalog[key].name, url: catalog[key].url })),
  skipped: skipped.map(item => ({ ...item, name: catalog[item.key]?.name }))
};
const unzippedBytes = walk(bundle).reduce((sum, file) => sum + fs.statSync(file).size, 0);
report.unzippedBytes = unzippedBytes;
report.unzippedRemainingBytes = MAX_UNZIPPED_BYTES - unzippedBytes;
fs.writeFileSync(target("OFFLINE-BUNDLE-REPORT.json"), JSON.stringify(report, null, 2));
if (unzippedBytes >= MAX_UNZIPPED_BYTES) throw new Error(`Unzipped bundle is ${(unzippedBytes / 1024 / 1024).toFixed(2)} MiB, which is not below 500 MiB.`);
fs.rmSync(zip, { force: true });
const psQuote = value => `'${value.replaceAll("'", "''")}'`;
execFileSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path ${psQuote(path.join(bundle, "*"))} -DestinationPath ${psQuote(zip)} -CompressionLevel Optimal`], { stdio: "inherit" });
const zipSize = fs.statSync(zip).size;
report.zipBytes = zipSize;
report.remainingBytes = MAX_ZIP_BYTES - zipSize;
fs.writeFileSync(target("OFFLINE-BUNDLE-REPORT.json"), JSON.stringify(report, null, 2));
if (zipSize >= MAX_ZIP_BYTES) throw new Error(`ZIP is ${(zipSize / 1024 / 1024).toFixed(2)} MiB, which is not below 500 MiB.`);
console.log(`Built ${selected.size} games: ${(zipSize / 1024 / 1024).toFixed(2)} MiB ZIP, ${((MAX_ZIP_BYTES - zipSize) / 1024 / 1024).toFixed(2)} MiB remaining.`);
