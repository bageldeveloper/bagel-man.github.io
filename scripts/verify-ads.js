const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const assetVersionPattern = "(?:20260921-5|20260924-[1-3])";

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
  const legacyGameAdSdkIndex = html.indexOf("imasdk.googleapis.com/js/sdkloader/ima3.js");
  const adsenseLoaderIndex = html.indexOf("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
  const adLayoutIndex = html.indexOf("js/ad-layout.js");
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
    versionedAdLayoutScript: count(new RegExp(`js/ad-layout\\.js\\?v=${assetVersionPattern}`, "g")),
    versionedMainCss: count(new RegExp(`css/main\\.css\\?v=${assetVersionPattern}`, "g")),
    adsenseUnits: count(/<ins class="adsbygoogle"/g),
    blockAdsenseUnits: count(/<ins class="adsbygoogle" style="display:block"/g),
    adsenseLoaders: count(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g)
  };
  const safeLegacySdkOrder = legacyGameAdSdkIndex === -1 ||
    (adsenseLoaderIndex > legacyGameAdSdkIndex && adsenseLoaderIndex < adLayoutIndex);
  if (checks.banner !== 1 || checks.rectangle !== 6 || checks.leftRectangle !== 3 ||
      checks.rightRectangle !== 3 || checks.mobileFooter !== 1 ||
      checks.legacySidebar !== 0 || checks.blockAdsUi !== 0 || checks.blockAdsCode !== 0 ||
      checks.adLayoutScript !== 1 || checks.versionedAdLayoutScript !== 1 ||
      checks.versionedMainCss !== 1 || checks.adsenseUnits !== 8 ||
      checks.blockAdsenseUnits !== 8 || checks.adsenseLoaders !== 1 || !safeLegacySdkOrder) {
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
