document.querySelectorAll('[data-genre]').forEach(button => {
  button.addEventListener('click', () => {
    const destination = new URL('index.html', location.href);
    if (button.dataset.genre !== 'all') destination.searchParams.set('genre', button.dataset.genre);
    location.href = destination.href;
  });
});

const aboutSettings = document.getElementById('settings-panel');
const aboutSettingsButton = document.getElementById('settings-toggle');
document.getElementById('toggle-light').addEventListener('change', event => applyLightMode(event.target.checked));
document.getElementById('settings-close').addEventListener('click', () => {
  toggleSettings();
  aboutSettingsButton.focus();
});
function syncAboutSettings() {
  const open = aboutSettings.classList.contains('open');
  aboutSettingsButton.setAttribute('aria-expanded', String(open));
  aboutSettings.inert = !open;
  if (open && document.activeElement === aboutSettingsButton) aboutSettings.querySelector('input')?.focus();
}
new MutationObserver(syncAboutSettings).observe(aboutSettings, { attributes: true, attributeFilter: ['class'] });
syncAboutSettings();

const aboutChat = document.getElementById('chat-panel');
const aboutChatButton = document.getElementById('chat-toggle-btn');
function syncAboutChat() {
  const open = aboutChat.classList.contains('open');
  aboutChatButton.setAttribute('aria-expanded', String(open));
  aboutChat.setAttribute('aria-hidden', String(!open));
  aboutChat.inert = !open;
  if (open && document.activeElement === aboutChatButton) document.getElementById('panel-input').focus();
}
new MutationObserver(syncAboutChat).observe(aboutChat, { attributes: true, attributeFilter: ['class'] });
syncAboutChat();
function openLinkedChat() {
  if (location.hash === '#chat' && !aboutChat.classList.contains('open')) toggleChat();
}
window.addEventListener('hashchange', openLinkedChat);
openLinkedChat();
