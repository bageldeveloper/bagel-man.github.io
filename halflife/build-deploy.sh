pnpm build &&
touch 'dist/.nojekyll' &&
cp ./hl-engine-js/lib/xash.html.mem ./dist &&
cp ./hl-engine-js/lib/client.js ./dist &&
cp ./hl-engine-js/lib/menu.js ./dist &&
cp ./hl-engine-js/lib/xash.js ./dist &&
cp ./hl-engine-js/lib/server.js ./dist &&
pnpm run deploy
