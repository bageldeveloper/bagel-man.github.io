# Minecraft launcher

The game catalog lists one Minecraft page at `games/minecraft/index.html`. It reuses the standard website template from the original 1.12 page: header, search, genre sidebar, chat, settings, ad placements, fullscreen control, and suggested games. The version menu is defined in `versions.js`; only the selected client loads after the player presses Play. Without an explicit version in the URL, the page always defaults to 1.12.2. The title and visible and search descriptions come from `gamesinfo.js` through `update-seo.js`.

The launch screen follows Mega Man X8's image-and-Play overlay pattern. The original 1.5.2 thumbnail fills the player until Play is selected, and the version dropdown replaces the title in the controls below the player. Selecting another version brings the overlay back; the current client is replaced only when Play is pressed. Selecting the running version again dismisses the overlay without restarting it.

Keep the standard `.game-window`, `.game-controls`, and `.game-window-title` selectors. The H1 remains in the launch overlay and is still updated by `update-seo.js`. The poster's `data-game-poster` marker makes its image follow the catalog's `image` field, alongside the social preview. The updater preserves the custom dropdown, Play button, and fullscreen control; `test:minecraft` checks this behavior with changed catalog content and repeated generation.

## Builds

Builds were obtained from the downloads published by [Eaglercraft](https://eaglercraft.com/downloads) on November 9, 2026. The current publisher uses 26.2 and 26.3 names for its modern ports, rather than 1.26. There are no invented entries for unavailable intermediate releases.

- 1.5.2: the publisher's `sp2.01` download, an archived client dated January 18, 2025. This is the current published 1.5.2 download, not an actively developed 2026 release. Its world folder remains `MAIN` to match the old page.
- 1.8.8: the published JavaScript client dated October 17, 2026. It replaces the old RC-03 client at `games/minecrap/game.html`.
- 1.12.2: the existing `eaglercraft-1.12-game.html` reference page is preserved byte-for-byte. Its two game scripts are copied without modification into `clients/1.12.2.html`, which contains only the game container and runtime metadata. This preserves the engine, settings, server list, and storage location without placing a second website header and sidebar inside the player.
- 26.2 and 26.3: the self-contained clients published through the current launcher on October 19, 2026.

`client-sources.json` records download URLs, original download-content hashes, and the hashes of the local files. Imported clients receive runtime-only indexing metadata and the site's analytics tag. Newer clients use separate world database names so they cannot overwrite the preserved 1.12 world's database. The 1.5 download's unrelated Google Drive document title is replaced with its game title.

The three former game URLs redirect to the new page with the corresponding version selected. The original 1.5 directory and other assets remain available. The sitemap contains the consolidated page.

The offline bundle retains 1.5.2 and 1.12.2 in its version selector, matching its previous focus while keeping the large modern clients out of the size-limited bundle.

## Checks

Run `npm run test:minecraft` and `npm run test:seo`. Check version selection, launching, fullscreen, and the visible description at desktop and mobile sizes after replacing any build. Client files must stay below GitHub's 100 MiB per-file limit.
