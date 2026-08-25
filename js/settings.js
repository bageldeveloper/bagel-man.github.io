const SETTINGS_KEYS = {
  theme: "bagel_theme",
  blockAds: "bagel_block_ads"
};

function readBooleanSetting(value) {
  return value === "1" || value === "true";
}

function getSavedTheme() {
  const current = localStorage.getItem(SETTINGS_KEYS.theme);
  if (current === "light" || current === "dark") return current;
  return readBooleanSetting(localStorage.getItem("lightMode")) ? "light" : "dark";
}

function getSavedAdPreference() {
  const current = localStorage.getItem(SETTINGS_KEYS.blockAds);
  if (current !== null) return readBooleanSetting(current);
  return readBooleanSetting(localStorage.getItem("adBlock")) ||
    readBooleanSetting(localStorage.getItem("blockAds"));
}

function applyLightMode(enabled) {
  const isLight = Boolean(enabled);
  document.body.classList.toggle("light", isLight);
  localStorage.setItem(SETTINGS_KEYS.theme, isLight ? "light" : "dark");
  localStorage.setItem("lightMode", isLight ? "true" : "false");

  const toggle = document.getElementById("toggle-light");
  if (toggle) toggle.checked = isLight;
}

function ensureAdScript() {
  if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4474724430572739";
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

function applyAdBlock(enabled) {
  const shouldBlock = Boolean(enabled);
  localStorage.setItem(SETTINGS_KEYS.blockAds, shouldBlock ? "true" : "false");
  localStorage.setItem("adBlock", shouldBlock ? "1" : "0");
  localStorage.setItem("blockAds", shouldBlock ? "true" : "false");

  document.querySelectorAll(".ad-sidebar, ins.adsbygoogle, [id^='ad-'], [class*='ad-slot']")
    .forEach(element => {
      element.style.display = shouldBlock ? "none" : "";
    });

  if (shouldBlock) {
    document.querySelectorAll('script[src*="googlesyndication"], script[src*="adsbygoogle"]')
      .forEach(script => script.remove());
  } else {
    ensureAdScript();
  }

  const toggle = document.getElementById("toggle-ads");
  if (toggle) toggle.checked = shouldBlock;
}

function toggleSettings() {
  const panel = document.getElementById("settings-panel");
  if (!panel) return;

  const isOpen = panel.classList.toggle("open");
  panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  document.getElementById("announce-panel")?.classList.remove("visible");
  document.getElementById("chat-panel")?.classList.remove("open");

  if (isOpen) {
    panel.querySelector("input")?.focus();
  }
}

function restoreSiteSettings() {
  applyLightMode(getSavedTheme() === "light");
  applyAdBlock(getSavedAdPreference());

  const panel = document.getElementById("settings-panel");
  if (panel) panel.setAttribute("aria-hidden", "true");
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  const panel = document.getElementById("settings-panel");
  if (panel?.classList.contains("open")) {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.querySelector('[onclick="toggleSettings()"]')?.focus();
  }
});

document.addEventListener("click", event => {
  const panel = document.getElementById("settings-panel");
  const button = document.querySelector('[onclick="toggleSettings()"]');
  if (panel?.classList.contains("open") &&
      !panel.contains(event.target) &&
      button && !button.contains(event.target)) {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }
});

restoreSiteSettings();