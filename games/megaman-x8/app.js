const play = document.getElementById('play');
const intro = document.getElementById('intro');
const stage = document.getElementById('stage');
const game = document.getElementById('game');
const status = document.getElementById('status');
const gameWindow = document.getElementById('gameWindow');
const fullscreen = document.getElementById('fullscreen');

play.addEventListener('click', () => {
  document.body.classList.add('playing');
  intro.hidden = true;
  stage.hidden = false;
  status.textContent = 'Loading the game… The first download is about 300 MB.';
  game.src = 'game.html';
});
game.addEventListener('load', () => {
  if (!game.getAttribute('src')) return;
  status.textContent = 'Loading the game… The first download is about 300 MB.';
  game.contentWindow?.focus();
});
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (gameWindow.requestFullscreen) await gameWindow.requestFullscreen();
    else {
      status.textContent = 'Use your browser’s fullscreen option to enlarge the game.';
      return;
    }
    if (game.getAttribute('src')) game.contentWindow?.focus();
  } catch {
    status.textContent = 'Fullscreen is unavailable here. Try your browser’s fullscreen option.';
  }
});
document.addEventListener('fullscreenchange', () => {
  const expanded = Boolean(document.fullscreenElement);
  fullscreen.setAttribute('aria-pressed', String(expanded));
  fullscreen.setAttribute('aria-label', expanded ? 'Exit fullscreen' : 'Enter fullscreen');
});

document.querySelectorAll('[data-genre]').forEach(button => {
  button.addEventListener('click', () => {
    const destination = new URL('../../index.html', window.location.href);
    if (button.dataset.genre !== 'all') destination.searchParams.set('genre', button.dataset.genre);
    window.location.href = destination.href;
  });
});

const settingsButton = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const lightToggle = document.getElementById('toggle-light');
function setSettingsOpen(open, returnFocus = false) {
  settingsPanel.classList.toggle('open', open);
  settingsPanel.setAttribute('aria-hidden', String(!open));
  settingsPanel.inert = !open;
  settingsButton.setAttribute('aria-expanded', String(open));
  if (open) lightToggle.focus();
  else if (returnFocus) settingsButton.focus();
}
function applyTheme(light, save = true) {
  document.body.classList.toggle('light', light);
  lightToggle.checked = light;
  document.querySelector('meta[name="theme-color"]').content = light ? '#f0ece3' : '#0f1117';
  if (save) {
    try {
      localStorage.setItem('bagel_theme', light ? 'light' : 'dark');
      localStorage.setItem('lightMode', String(light));
    } catch { /* The theme still works when browser storage is unavailable. */ }
  }
}
try {
  const theme = localStorage.getItem('bagel_theme');
  applyTheme(theme ? theme === 'light' : ['true', '1'].includes(localStorage.getItem('lightMode')), false);
} catch { applyTheme(false, false); }
settingsButton.addEventListener('click', () => setSettingsOpen(!settingsPanel.classList.contains('open')));
document.getElementById('settings-close').addEventListener('click', () => setSettingsOpen(false, true));
lightToggle.addEventListener('change', () => applyTheme(lightToggle.checked));
document.addEventListener('click', event => {
  if (!settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) setSettingsOpen(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && settingsPanel.classList.contains('open')) setSettingsOpen(false, true);
});

const keyInfo = {
  ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40],
  ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39],
  KeyA: ['a', 65], KeyD: ['d', 68], KeyS: ['s', 83],
  KeyQ: ['q', 81], KeyE: ['e', 69], Enter: ['Enter', 13],
};
const activePointers = new Map();
function sendKey(code, type) {
  const win = game.contentWindow;
  if (!win || !game.getAttribute('src')) return;
  const canvas = win.document.getElementById('canvas');
  if (!canvas) return;
  const [key, keyCode] = keyInfo[code];
  const event = new win.KeyboardEvent(type, { key, code, keyCode, which: keyCode, bubbles: true, cancelable: true });
  canvas.dispatchEvent(event);
}
document.querySelectorAll('[data-key]').forEach(button => {
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, button);
    button.classList.add('pressed');
    sendKey(button.dataset.key, 'keydown');
  });
  const release = event => {
    if (activePointers.get(event.pointerId) !== button) return;
    activePointers.delete(event.pointerId);
    button.classList.remove('pressed');
    sendKey(button.dataset.key, 'keyup');
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});
window.addEventListener('blur', () => {
  activePointers.forEach(button => { sendKey(button.dataset.key, 'keyup'); button.classList.remove('pressed'); });
  activePointers.clear();
});

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== game.contentWindow || event.data?.type !== 'x8-status') return;
  status.textContent = event.data.message;
});
