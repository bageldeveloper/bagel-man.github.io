const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === ".git") return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function fail(message) {
  failures.push(message);
}

const catalogSource = fs.readFileSync(path.join(root, "gamesinfo.js"), "utf8");
const context = {};
vm.runInNewContext(catalogSource + ";globalThis.catalog = gamersgaming;", context);
const catalog = context.catalog;

const declaredKeys = [...catalogSource.matchAll(/^\s*"([^"]+)"\s*:\s*\{/gm)].map(match => match[1]);
const duplicateKeys = declaredKeys.filter((key, index) => declaredKeys.indexOf(key) !== index);
if (duplicateKeys.length) fail("Duplicate catalog keys: " + [...new Set(duplicateKeys)].join(", "));

for (const [key, game] of Object.entries(catalog)) {
  if (!game.name || !game.url || !Array.isArray(game.tags) || !game.tags.length) {
    fail("Incomplete catalog entry: " + key);
    continue;
  }
  for (const target of [game.url, game.image].filter(Boolean)) {
    if (!fs.existsSync(path.join(root, target))) fail("Missing catalog target: " + target);
  }
}

const htmlFiles = walk(root).filter(file => file.endsWith(".html"));
const referencePattern = /<(?:script|img|link|a|iframe|embed|object|source|audio|video)\b[^>]*?\b(?:src|href|data)\s*=\s*["']([^"']+)["']/gis;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(referencePattern)) {
    const reference = match[1].trim();
    if (!reference || /^(?:https?:|data:|javascript:|mailto:|tel:|#|\/\/|blob:|about:)/i.test(reference)) continue;
    const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
    const target = clean.startsWith("/")
      ? path.join(root, clean.slice(1))
      : path.resolve(path.dirname(file), clean);
    if (target.startsWith(root) && !fs.existsSync(target)) {
      fail(relative(file) + " references missing " + reference);
    }
  }

  const logoArea = html.match(/<div\s+class="logo-area">[\s\S]{0,400}?<\/div>/i)?.[0];
  if (logoArea && !/bagelicontab\.png/i.test(logoArea)) {
    fail(relative(file) + " uses the wrong body header image");
  }
}

for (const file of ["js/main.js", "js/settings.js", "chatscript.js", "announcements.js", "gamesinfo.js"]) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (result.status !== 0) fail(file + " fails syntax validation: " + result.stderr.trim());
}

if (!/function\s+refreshProfilePreview\s*\(/.test(fs.readFileSync(path.join(root, "chatscript.js"), "utf8"))) {
  fail("refreshProfilePreview is missing");
}

if (failures.length) {
  console.error("Site validation failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Site validation passed: " + Object.keys(catalog).length + " games, " + htmlFiles.length + " HTML files.");