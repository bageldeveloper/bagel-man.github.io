const SETTINGS_KEYS = {
  theme: "bagel_theme"
};

function readBooleanSetting(value) {
  return value === "1" || value === "true";
}

function getSavedTheme() {
  const current = localStorage.getItem(SETTINGS_KEYS.theme);
  if (current === "light" || current === "dark") return current;
  return readBooleanSetting(localStorage.getItem("lightMode")) ? "light" : "dark";
}

function applyLightMode(enabled) {
  const isLight = Boolean(enabled);
  document.body.classList.toggle("light", isLight);
  localStorage.setItem(SETTINGS_KEYS.theme, isLight ? "light" : "dark");
  localStorage.setItem("lightMode", isLight ? "true" : "false");

  const toggle = document.getElementById("toggle-light");
  if (toggle) toggle.checked = isLight;
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