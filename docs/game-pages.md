# Shared game-page layout

Catalog game entrypoints use `css/game-page.css` and `js/game-page.js`.
The `data-game-key` on the body identifies an entry in `gamesinfo.js`.
The cover and suggestions use catalog artwork; JavaScript reranks four unique
suggestions by shared genre count, randomizing ties. Static links remain usable
without JavaScript. Missing artwork falls back to the Bagel Comics wordmark.

Players initialize on page load inside `.game-player`, behind the cover.
The initial `inert` attribute prevents keyboard focus and pointer interaction.
Play removes it, dismisses the cover, and focuses the existing player. It does
not reload an iframe or invoke the engine again. Native game start buttons and
browser audio restrictions still apply. The player dispatches a bubbling
`game-play` DOM event after the cover is dismissed.

Player proportions and size caps are stored as the body custom properties
`--player-ratio` and `--player-max`. Fullscreen uses the existing game controls.
The mobile footer ad hides when it overlaps players, suggestions, touch
controls, or the page footer.

## Updating game pages

- `npm run games:update` migrates catalog entrypoints and is safe to repeat.
- `node scripts/update-game-pages.js --check` reports incomplete migrations.
- `npm run test:games`, `npm run test:site`, and `npm run test:ads` check the
  shared layout, links, metadata, script syntax, and advertising structure.

The migration preserves existing engine code and page navigation. Five former
standalone entrypoints use same-directory `-player.html` / `-player.htm` files.
Where an old entrypoint embedded an entire second site page, the runtime keeps
its engine markup and initialization scripts without nesting site navigation
or advertisements. Runtime files have `data-game-runtime`, are marked noindex,
and do not add their own site analytics or ads. The analytics/ad maintenance
scripts respect this marker.

Existing X8 attribution and license links remain in its footer. Other pages
use the common site footer; existing attribution inside players is preserved.
The homepage and non-game sections are outside this migration. The ignored
root offline build is excluded from validation; nested runtime directories
named `dist`, such as the N64 game builds, are still checked.
