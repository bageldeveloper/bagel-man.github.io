const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const failures = [];
const gamePages = walk(root).filter(file => {
  if (!file.endsWith(".html")) return false;
  return fs.readFileSync(file, "utf8").includes('<div class="game-window"');
});

for (const file of gamePages) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  const count = pattern => (html.match(pattern) || []).length;
  const checks = {
    banner: count(/game-ad--banner/g),
    rectangle: count(/game-ad--rectangle(?!-(?:left|right))/g),
    leftRectangle: count(/game-ad--rectangle-left/g),
    rightRectangle: count(/game-ad--rectangle-right/g),
    mobileFooter: count(/game-ad--mobile-footer/g),
    legacySidebar: count(/<div class="ad-sidebar">/g),
    blockAdsUi: count(/id="toggle-ads"/g),
    blockAdsCode: count(/applyAdBlock|bagel_block_ads|localStorage\.getItem\(['"](?:adBlock|blockAds)/g),
    adLayoutScript: count(/js\/ad-layout\.js/g),
    adsenseUnits: count(/<ins class="adsbygoogle"/g),
    adsenseLoaders: count(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g)
  };
  if (checks.banner !== 1 || checks.rectangle !== 6 || checks.leftRectangle !== 3 ||
      checks.rightRectangle !== 3 || checks.mobileFooter !== 1 ||
      checks.legacySidebar !== 0 || checks.blockAdsUi !== 0 || checks.blockAdsCode !== 0 ||
      checks.adLayoutScript !== 1 || checks.adsenseUnits !== 8 || checks.adsenseLoaders !== 1) {
    failures.push(`${relative}: ${JSON.stringify(checks)}`);
  }
}

const globalBlockAds = walk(root)
  .filter(file => /\.(html|js)$/.test(file))
  .filter(file => !file.includes(`${path.sep}scripts${path.sep}`))
  .filter(file => /Block ads|applyAdBlock|bagel_block_ads/.test(fs.readFileSync(file, "utf8")))
  .map(file => path.relative(root, file));

if (globalBlockAds.length) failures.push(`Remaining block-ads feature references: ${globalBlockAds.join(", ")}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Verified ${gamePages.length} game pages: three-slot responsive left/right rails, one lower banner, and one mobile footer each; no block-ads feature remains.`);
