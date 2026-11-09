const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { gamersgaming: catalog } = require("../gamesinfo.js");
const config = require("../games/minecraft/versions.js");
const sources = require("../games/minecraft/client-sources.json");
const { renderPage } = require("../update-seo.js");
const root = path.resolve(__dirname, "..");
const launcher = "games/minecraft/index.html";
const expected = ["1.5.2", "1.8.8", "1.12.2", "26.2", "26.3"];
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

assert.deepEqual(config.versions.map(version => version.id), expected);
assert.equal(config.defaultVersion, "1.12.2");
assert.equal(catalog.Minecraft.url, launcher);
assert.equal(Object.values(catalog).filter(game => /^Minecraft(?:\s|$)/.test(game.name)).length, 1, "Only one Minecraft catalog entry should remain");
for (const version of config.versions) {
  const file = path.resolve(root, path.dirname(launcher), version.client);
  const record = sources.builds.find(build => build.version === version.id);
  assert.ok(record, `${version.id}: missing build provenance`);
  assert.equal(file, path.join(root, record.file));
  const bytes = fs.readFileSync(file);
  assert.ok(bytes.length < 100 * 1024 * 1024, `${version.id}: exceeds the GitHub file limit`);
  assert.equal(sha(bytes), record.localSha256, `${version.id}: build differs from the verified import`);
  assert.ok(bytes.subarray(0, 16000).includes(Buffer.from('content="noindex, nofollow"')), `${version.id}: runtime should not be indexed`);
  if (version.id === "1.5.2") assert.ok(bytes.includes(Buffer.from('worldsFolder: "MAIN"')), "Keep the original 1.5 world folder");
  else if (version.id !== "1.12.2") assert.ok(bytes.includes(Buffer.from(`worldsDB: "bagel-minecraft-${version.id.replaceAll(".", "-")}"`)), `${version.id}: isolate world storage from 1.12`);
}
const original = sources.builds.find(build => build.version === "1.12.2");
assert.equal(original.preserved, true);
const originalPage = fs.readFileSync(path.join(root, original.derivedFrom), "utf8");
assert.equal(sha(originalPage), "5712bdde79879ef68b7e59d2267837359e90ed32d23436ab0cb1f98701f48513", "Keep the original 1.12 reference page byte-for-byte");
assert.equal(sha(originalPage), original.originalSha256);
const onlyGame = fs.readFileSync(path.join(root, original.file), "utf8");
const gameScripts = html => [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1]).filter(script => script.includes("LoaderBootstrap") || script.includes("window.eaglercraftXOpts ="));
assert.deepEqual(gameScripts(onlyGame), gameScripts(originalPage), "The 1.12 engine and launch settings must remain unchanged");
assert.deepEqual(gameScripts(onlyGame).map(sha), original.runtimeScriptSha256);
const clientBody = onlyGame.slice(onlyGame.indexOf("<body>"));
assert.ok(clientBody.includes('id="game_frame"'));
assert.ok(!/<(?:header|nav|iframe)\b|class="(?:topbar|sidebar|game-window)"/.test(clientBody), "The 1.12 client must contain only the game, not another website shell");
const template = fs.readFileSync(path.join(root, launcher), "utf8");
for (const marker of ['class="topbar"', 'class="sidebar"', 'id="searchInput"', 'id="chat-panel"', 'id="settings-panel"', 'id="suggestedGamesContainer"', 'id="gameWindow"']) {
  assert.ok(template.includes(marker), `Minecraft must use the standard game template: ${marker}`);
}
assert.equal([...template.matchAll(/class="topbar"/g)].length, 1, "Only one website header should be rendered");
assert.equal(catalog.Minecraft.image, "thumbnails/minecraft15.jpg", "Use the original 1.5.2 thumbnail");
const gameWindowStart = template.indexOf('<div class="game-window" id="gameWindow">');
const playStart = template.indexOf('id="play-version"');
const controlsStart = template.indexOf('<div class="game-controls">');
const selectStart = template.indexOf('<select id="minecraft-version"');
assert.ok(gameWindowStart < playStart && playStart < controlsStart, "Place Play inside the preview, above the under-game controls");
assert.ok(selectStart > controlsStart, "The version selector belongs in the title slot under the game");
assert.ok(template.includes('class="minecraft-poster" data-game-poster src="../../thumbnails/minecraft15.jpg"'));
const controlsMarkup = template.slice(controlsStart, template.indexOf("<!-- GAME SEO:DESCRIPTION START -->"));
assert.ok(!controlsMarkup.includes("<h1"), "The dropdown replaces the visible title under the game");
const revisedGame = { ...catalog.Minecraft, name: "Minecraft test", description: "Updated Minecraft introduction.",
  metaDescription: "Updated Minecraft search description.", image: "thumbnails/minecraft1.5.png" };
const revisedPage = renderPage(revisedGame, template);
assert.ok(revisedPage.includes('<h1 class="game-window-title">Play Minecraft test</h1>'), "Keep the overlay heading managed by the standard updater");
assert.ok(revisedPage.includes('data-game-poster src="../../thumbnails/minecraft1.5.png"'), "Keep the poster managed by the catalog image field");
assert.ok(revisedPage.includes('<p class="game-description">Updated Minecraft introduction.</p>'));
assert.ok(revisedPage.includes(controlsMarkup), "Template updates must preserve the dropdown and fullscreen controls");
assert.equal(renderPage(revisedGame, revisedPage), revisedPage, "Custom controls must survive repeat template updates");

const aliases = [
  ["games/minecrap/index.html", "1.8.8"],
  ["eaglercraft-1.12.html", "1.12.2"],
  ["eaglercraft-main/eaglercraft-main/stable-download/web/index.html", "1.5.2"]
];
for (const [file, expectedVersion] of aliases) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).find(code => code.includes("const destination"));
  for (const query of ["", "?version=26.2"]) {
    let destination;
    vm.runInNewContext(script, { URL, URLSearchParams, location: {
      href: `https://bagelcomics.com/${file}${query}#game`, search: query, hash: "#game", replace: url => { destination = new URL(url); }
    } });
    assert.equal(destination.origin, "https://bagelcomics.com");
    assert.equal(destination.pathname, "/" + launcher);
    assert.equal(destination.searchParams.get("version"), query ? "26.2" : expectedVersion);
    assert.equal(destination.hash, "#game");
  }
  assert.ok(html.includes('rel="canonical" href="https://bagelcomics.com/' + launcher + '"'));
}
const roster = require("../offline-roster.json");
for (const key of [...roster.required, ...roster.excluded, ...roster.priority, ...roster.requestedLarge]) {
  assert.ok(catalog[key], `Offline roster refers to a removed game: ${key}`);
}
assert.deepEqual(config.versions.filter(version => version.offlineBundle).map(version => version.id), ["1.5.2", "1.12.2"]);
assert.ok(fs.readFileSync(path.join(root, "bagelcomics-com-sitemap.xml"), "utf8").includes("https://bagelcomics.com/" + launcher));
console.log("Minecraft checks passed: standard site template, game-only 1.12 with unchanged engine/settings, five verified clients, redirects, sitemap, and offline roster.");
