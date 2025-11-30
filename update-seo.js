const fs = require('fs');
const path = require('path');
const { gamersgaming } = require('./gamesinfo.js');

const workspaceRoot = 'c:/Users/carte/OneDrive/Documents/bagel-man.github.io';

function generateSEO(gameName, gameUrl, tags) {
    const title = `${gameName} – Play ${gameName} Unblocked Online`;
    const description = `Play ${gameName} unblocked online for free! Enjoy the game right in your browser. No downloads, no blocking, works at school and home.`;
    const keywords = `${gameName.toLowerCase()}, ${gameName.toLowerCase()} game, ${gameName.toLowerCase()} unblocked, play ${gameName.toLowerCase()} online, ${tags.join(', ')}, unblocked games, browser games, free online games`;
    const canonicalUrl = `https://bagelcomics.com/${gameUrl}`.replace(/ /g, '%20');

    return `
    <!-- SEO Meta Tags -->
    <meta charset="utf-8">
    <title>${title}</title>
    
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Bagel Comics">
    
    <!-- Open Graph (Facebook, Discord, Messenger) -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="The official unblocked version of ${gameName}! Play it right in your browser.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${gameName} – Unblocked Game">
    <meta name="twitter:description" content="Play ${gameName} unblocked. Free and browser-based.">
    
    <!-- Mobile + Display -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
    
    <!-- Indexing -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Extra Search Tags for Unblocked Game Sites -->
    <meta name="rating" content="general">
    <meta name="subject" content="${gameName} unblocked browser game">
    <meta name="classification" content="Online Game, Unblocked Game, Browser Game">
    
    <!-- Optional: Schema.org for Better Search Ranking -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "${gameName}",
      "url": "${canonicalUrl}",
      "description": "Play ${gameName} unblocked online — playable at school or home.",
      "genre": ${JSON.stringify(tags.concat("Unblocked"))},
      "author": {
        "@type": "Organization",
        "name": "Bagel Comics"
      }
    }
    </script>
`;
}

async function updateSeoForAllGames() {
    for (const gameKey in gamersgaming) {
        const game = gamersgaming[gameKey];
        const gameName = game.name;
        const gameUrl = game.url;
        const tags = game.tags || [];

        // Skip slope since it's the template
        if (gameUrl.includes('Slope-Game-main')) {
            console.log(`Skipping ${gameName} (template).`);
            continue;
        }

        const filePath = path.join(workspaceRoot, gameUrl);

        try {
            let content = await fs.promises.readFile(filePath, 'utf8');
            
            const headRegex = /<head>([\s\S]*?)<\/head>/i;
            const headMatch = content.match(headRegex);

            if (headMatch) {
                const oldHead = headMatch[0];
                const seoBlock = generateSEO(gameName, gameUrl, tags);

                // Check if the file already has the new SEO block
                if (oldHead.includes('<!-- SEO Meta Tags -->')) {
                    console.log(`SEO already updated for ${gameName}. Skipping.`);
                    continue;
                }

                const newHead = `<head>${seoBlock}${headMatch[1]}</head>`;
                content = content.replace(oldHead, newHead);

                await fs.promises.writeFile(filePath, content, 'utf8');
                console.log(`Successfully updated SEO for ${gameName}`);
            } else {
                console.warn(`Could not find <head> tag for ${gameName} at ${filePath}`);
            }
        } catch (error) {
            console.error(`Error processing ${gameName}: ${error.message}`);
        }
    }
}

updateSeoForAllGames();
