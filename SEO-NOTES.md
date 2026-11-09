# SEO follow-up

- Defer homepage SEO changes. The homepage is performing well; prioritize individual game pages first.
- Revisit the homepage title and search presentation separately after the game-page improvements have been reviewed and measured.
- Review crawlable suggested-game links and dedicated genre pages as separate follow-up work.

## Maintaining game-page copy

- Edit each game's `description` and `metaDescription` in `gamesinfo.js`. Both fields are required when generating game pages.
- Run `node update-seo.js` to regenerate the catalog, or `node update-seo.js --game CookieClicker` to update one game by its catalog key.
- Run `npm run test:seo` to check the generated headings, descriptions, metadata, and repeat-run stability.
