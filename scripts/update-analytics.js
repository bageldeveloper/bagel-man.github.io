const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const measurementId = "G-STZFN2TW1E";
const excludedPages = new Set(["google9b92a034e6bc4b62.html"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function analyticsTag(eol) {
  return [
    "  <!-- Google tag (gtag.js) -->",
    `  <script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>`,
    "  <script>",
    "    window.dataLayer = window.dataLayer || [];",
    "    function gtag(){dataLayer.push(arguments);}",
    "    gtag('js', new Date());",
    `    gtag('config', '${measurementId}');`,
    "  </script>"
  ].join(eol);
}

function analyticsConfig(eol) {
  return [
    "  <script>",
    "    window.dataLayer = window.dataLayer || [];",
    "    function gtag(){dataLayer.push(arguments);}",
    "    gtag('js', new Date());",
    `    gtag('config', '${measurementId}');`,
    "  </script>"
  ].join(eol);
}

let updated = 0;
for (const file of walk(root)) {
  if (!/\.html?$/i.test(file)) continue;
  const page = relative(file);
  if (excludedPages.has(page)) continue;

  const original = fs.readFileSync(file, "utf8");
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let html = original
    .replace(
      /(googletagmanager\.com\/gtag\/js\?id=)G-[A-Z0-9]+/gi,
      `$1${measurementId}`
    )
    .replace(
      /(gtag\(\s*["']config["']\s*,\s*["'])G-[A-Z0-9]+(["'])/gi,
      `$1${measurementId}$2`
    );

  if (!html.includes("googletagmanager.com/gtag/js")) {
    const tag = analyticsTag(eol);
    if (/<head\b[^>]*>/i.test(html)) {
      html = html.replace(/<head\b[^>]*>/i, match => `${match}${eol}${tag}`);
    } else {
      html = `<head>${eol}${tag}${eol}</head>${eol}${html}`;
    }
  } else if (!new RegExp(`gtag\\(\\s*["']config["']\\s*,\\s*["']${measurementId}["']`).test(html)) {
    html = html.replace(
      /(<script\b[^>]*googletagmanager\.com\/gtag\/js[^>]*><\/script>)/i,
      `$1${eol}${analyticsConfig(eol)}`
    );
  }

  if (html !== original) {
    fs.writeFileSync(file, html, "utf8");
    updated++;
  }
}

console.log(`Updated analytics on ${updated} pages using ${measurementId}.`);
