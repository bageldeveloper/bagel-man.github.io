(function () {
  "use strict";
  const { versions, defaultVersion } = window.minecraftVersions;
  const picker = document.getElementById("minecraft-version");
  const button = document.getElementById("play-version");
  const player = document.getElementById("gameWindow");
  const preview = document.getElementById("minecraft-placeholder");
  const stage = document.getElementById("minecraft-stage");
  const status = document.getElementById("minecraft-status");
  const fullscreen = document.getElementById("minecraft-fullscreen");
  const aliases = { "1.5": "1.5.2", "1.8": "1.8.8", "1.12": "1.12.2" };
  const requested = new URLSearchParams(location.search).get("version");
  const find = id => versions.find(version => version.id === (aliases[id] || id));
  const initial = find(requested) || find(defaultVersion) || versions[0];
  picker.replaceChildren(...versions.map(version => {
    const option = document.createElement("option");
    option.value = version.id;
    option.textContent = version.label;
    return option;
  }));
  picker.value = initial.id;
  let activeVersion;
  const updateButton = () => {
    const version = find(picker.value);
    button.querySelector("span").textContent = "Play game";
    button.setAttribute("aria-label", `Play ${version.label}`);
    document.getElementById("minecraft-server-promo").hidden = version.id !== "1.12.2";
    preview.hidden = activeVersion?.id === version.id;
    status.textContent = activeVersion?.id === version.id
      ? `${version.label} is open.`
      : `${version.label} selected. Press Play game ${activeVersion ? "to switch versions" : "to begin"}.`;
  };
  picker.addEventListener("change", updateButton);
  updateButton();

  button.addEventListener("click", () => {
    const version = find(picker.value);
    if (!version) return;
    const frame = document.createElement("iframe");
    frame.id = "minecraft-game";
    frame.title = `${version.label} Eaglercraft game`;
    frame.allow = "autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
    frame.allowFullscreen = true;
    frame.src = version.client;
    frame.addEventListener("load", () => {
      if (frame === document.getElementById("minecraft-game") && picker.value === version.id) {
        status.textContent = `${version.label} opened. Allow a moment for the game to start.`;
      }
    });
    frame.addEventListener("error", () => {
      status.textContent = "The game could not open. Check your connection and select Play to try again.";
    });
    stage.replaceChildren(frame);
    stage.hidden = false;
    preview.hidden = true;
    activeVersion = version;
    fullscreen.disabled = false;
    status.textContent = `Opening ${version.label}…`;
    const url = new URL(location.href);
    url.searchParams.set("version", version.id);
    history.replaceState(null, "", url);
  });
  fullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (player.requestFullscreen) await player.requestFullscreen();
      else status.textContent = "Fullscreen is not available in this browser.";
    } catch (_) {
      status.textContent = "Fullscreen was not available. You can keep playing in the game window.";
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fullscreen.setAttribute("aria-label", document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen");
  });
})();
