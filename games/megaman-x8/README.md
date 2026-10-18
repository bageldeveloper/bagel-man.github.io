# Mega Man X8 16-bit browser port

Imported from the prepared `MegaManX8DemakeWebVersion/web` export. The catalog
entry is in `gamesinfo.js`; the site page is `games/megaman-x8/index.html`.
Shared branding, navigation assets, and styles resolve inside this repository.
The keyboard instructions panel is removed; optional touch buttons appear after
launching on devices with a coarse pointer. Theme preferences use the site's
existing storage keys.

The cover now uses the shared catalog game-page shell. The game starts
downloading behind the cover immediately; Play reveals it without restarting.

## Hosting

Serve this directory unchanged over HTTPS, along with the rest of the site.
No build step, special response headers, or external game server is required.
Locally, use the repository's development server and open
`http://localhost:5500/games/megaman-x8/`.

`game.pck` is stored as four binary `game.pck.part*` files so each file stays
below 100 MiB. `pack.json` records their order, lengths, and SHA-256 hashes.
`loader.js` downloads and verifies each part, reconstructs the original pack
in memory, and preloads it through the included Godot engine API. Keep all
parts together. There is no Git LFS dependency for these files. The initial
download is about 312 MiB including the engine.

When replacing the export, split the new pack in binary at 80 MiB boundaries,
regenerate the manifest sizes and hashes, and update the engine size in
`loader.js` if its `.wasm` file changes. Never check in an unsplit pack.

## Credits and source

Keep `LICENSE-original.md`, `README-original.md`, `credits-original.txt`, and
`alysson_signature.png` with the game. The page uses the shared site ad layout
with responsive side rails, a lower banner, and a mobile footer. The catalog
cover and social preview use `thumbnails/megamanx8.jpg`.

`source-code.zip` contains the supplied Godot scripts, scenes, text resources,
project configuration, browser pack patching tools, and this browser wrapper's
source. The two source trees retain their supplied folder names; `original/`
is the project used by `tools/patch-web-pck.mjs`. Large art/audio assets and
generated engine caches are omitted from the source archive; original assets
and project history are available from the upstream repository linked in the
page footer. The complete browser wrapper and exported game are also present
directly in this directory. No Godot game logic was changed during site integration.
