(function (root) {
  "use strict";
  const config = {
    defaultVersion: "1.12.2",
    versions: [
      { id: "1.5.2", label: "Minecraft 1.5.2", client: "clients/1.5.2.html", offlineBundle: true },
      { id: "1.8.8", label: "Minecraft 1.8.8", client: "../minecrap/game.html" },
      { id: "1.12.2", label: "Minecraft 1.12.2", client: "clients/1.12.2.html", offlineBundle: true },
      { id: "26.2", label: "Minecraft 26.2", client: "clients/26.2.html" },
      { id: "26.3", label: "Minecraft 26.3", client: "clients/26.3.html" }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = config;
  else root.minecraftVersions = config;
})(typeof window !== "undefined" ? window : globalThis);
