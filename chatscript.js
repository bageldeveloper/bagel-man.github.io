// =====================
// CHAT PANEL LOGIC
// =====================

const CLIENT_ID = '5Qcspn6KZFL4fZ97';
const coolDown = 1500;

let lastClick = Date.now() - coolDown;
let members = [];
let chatDrone;
let chatRoom;
let chatGeneration = 0;
const profileMap = {};
let missedMessages = 0;

const PRESENCE_ID_KEY = "bagel_chat_presence_id";

// =====================
// DEV ACCOUNTS
// =====================

const DEV_PASSWORD = "bagel2025";

const DEV_ACCOUNTS = {
  carter: { colors: ["#f857a6", "#ff5858"], label: "Carter" },
  daniel: { colors: ["#fd6bff", "#2bcbee"], label: "Daniel" },
  tom:    { colors: ["#f7971e", "#ffd200"], label: "Tom" }
};

let devName     = localStorage.getItem("bagel_dev_name") || null;
let customName  = localStorage.getItem("bagel_custom_name") || null;
let customColor = localStorage.getItem("bagel_custom_color") || null;

let isDev = false;

// =====================
// NAME + COLOR
// =====================

function getMyName() {
  if (devName && DEV_ACCOUNTS[devName]) {
    return DEV_ACCOUNTS[devName].label;
  }

  if (customName) return customName;

  const sessionName = sessionStorage.getItem("bagel_session_name");
  if (sessionName) return sessionName;

  const adjs = ["cool","angry","giant","lazy","tiny","salty","spicy","mystic","crazy"];
  const nouns = ["bagel","cat","gamer","robot","ninja","burger","ghost","wizard"];

  const generated =
    adjs[Math.floor(Math.random() * adjs.length)] +
    "_" +
    nouns[Math.floor(Math.random() * nouns.length)];

  sessionStorage.setItem("bagel_session_name", generated);
  return generated;
}

function getPresenceId() {
  let presenceId = sessionStorage.getItem(PRESENCE_ID_KEY);

  if (!presenceId) {
    presenceId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(PRESENCE_ID_KEY, presenceId);
  }

  return presenceId;
}

function getMyColor() {
  if (devName && DEV_ACCOUNTS[devName]) {
    return DEV_ACCOUNTS[devName].colors[0];
  }

  if (customColor) return customColor;

  let c = sessionStorage.getItem("bagel_session_color");

  if (!c) {
    c = '#' + Math.floor(Math.random() * 0xFFFFFF)
      .toString(16)
      .padStart(6, '0');

    sessionStorage.setItem("bagel_session_color", c);
  }

  return c;
}

// =====================
// DEV GRADIENT NAME
// =====================

function makeGradientNameEl(label, colors) {
  const w = label.length * 8 + 20;
  const id = 'g' + Math.random().toString(36).slice(2);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", 20);

  svg.innerHTML = `
    <defs>
      <linearGradient id="${id}">
        <stop offset="0%" stop-color="${colors[0]}"/>
        <stop offset="100%" stop-color="${colors[1]}"/>
      </linearGradient>
    </defs>
    <text x="50%" y="15" text-anchor="middle"
      font-size="14"
      font-family="Nunito"
      font-weight="900"
      fill="url(#${id})">
      ${label}
    </text>
  `;

  return svg;
}

// =====================
// NAME STYLING
// =====================

function styleNameEl(el, member) {
  const data = profileMap[member.id] || member.clientData || {};

  const name = data.name;
  const color = data.color;

  const devKey = Object.keys(DEV_ACCOUNTS)
    .find(k => DEV_ACCOUNTS[k].label === name);

  // =====================
  // DEV ACCOUNT
  // =====================
  if (devKey) {
    el.innerHTML = "";

const wrapper = document.createElement("span");
wrapper.style.display = "inline-flex";
wrapper.style.alignItems = "center";
wrapper.style.gap = "0px"; // tighter than before

    const nameEl = makeGradientNameEl(
      DEV_ACCOUNTS[devKey].label,
      DEV_ACCOUNTS[devKey].colors
    );

    const badge = document.createElement("span");
badge.textContent = "DEV";
badge.style.fontSize = "8px";          // slightly smaller
badge.style.padding = "1px 3px";       // tighter
badge.style.borderRadius = "4px";
badge.style.background = "var(--accent)";
badge.style.color = "#000";
badge.style.fontWeight = "900";
badge.style.boxShadow = "0 0 6px rgba(247,193,111,0.45)";
badge.style.marginLeft = "0px";        // smaller gap

    wrapper.appendChild(nameEl);
    wrapper.appendChild(badge);

    el.innerHTML = "";
    el.appendChild(wrapper);

    el.style.textShadow = "0 0 10px rgba(247,193,111,0.85)";
    el.style.fontWeight = "900";
    return;
  }

  // =====================
  // NORMAL USER (NO GLOW)
  // =====================
  el.textContent = name || "unknown";
  el.style.color = color || "#fff";
  el.style.textShadow = "none";
}

// =====================
// SCALEDRONE SETUP
// =====================

function memberPresenceId(member) {
  return member?.clientData?.presenceId || member.id;
}

function addOrReplaceMember(member) {
  const presenceId = memberPresenceId(member);

  members = members.filter(existing =>
    existing.id !== member.id && memberPresenceId(existing) !== presenceId
  );
  members.push(member);
}

function disconnectChat() {
  chatGeneration++;
  chatRoom = null;
  members = [];

  if (chatDrone) {
    const drone = chatDrone;
    chatDrone = null;

    try {
      drone.close();
    } catch {}
  }
}

function reconnectChat() {
  disconnectChat();

  isDev = !!(devName && DEV_ACCOUNTS[devName]);

  const generation = chatGeneration;
  const drone = new ScaleDrone(CLIENT_ID, {
    data: {
      name: getMyName(),
      color: getMyColor(),
      dev: isDev,
      presenceId: getPresenceId()
    }
  });
  chatDrone = drone;

  drone.on('open', error => {
    if (error || drone !== chatDrone || generation !== chatGeneration) return;

    const room = drone.subscribe('observable-room');
    chatRoom = room;

    room.on('members', m => {
      if (room !== chatRoom) return;

      members = [];

      m.forEach(mem => {
        addOrReplaceMember(mem);
        profileMap[mem.id] = mem.clientData;
      });

      updatePanelMembers();
    });

    room.on('member_join', m => {
      if (room !== chatRoom) return;

      addOrReplaceMember(m);
      profileMap[m.id] = m.clientData;
      updatePanelMembers();
    });

    room.on('member_leave', ({ id }) => {
      if (room !== chatRoom) return;

      members = members.filter(m => m.id !== id);
      delete profileMap[id];
      updatePanelMembers();
    });

    room.on('data', (data, member) => {
      if (room !== chatRoom) return;

      try {
        const msg = JSON.parse(data);

        if (msg.type === "profileUpdate") {
          profileMap[member.id] = msg;
          updatePanelMembers();
          return;
        }
      } catch {}

      if (member) {
        addPanelMessage(data, member);
        // Increment missed messages when chat panel is closed
        const chatPanel = document.getElementById('chat-panel');
        if (!chatPanel.classList.contains('open')) {
          missedMessages++;
          updateMissedCount();
        }
      }
    });
  });
}

reconnectChat();

// A homepage kept in the browser's back/forward cache can otherwise leave its
// old ScaleDrone presence alive while the restored page opens another one.
window.addEventListener('pagehide', disconnectChat);
window.addEventListener('pageshow', event => {
  if (event.persisted && !chatDrone) reconnectChat();
});

// Unity/WebGL and some emulators listen for keyboard events on window and
// document. Keep those game-level handlers from cancelling keystrokes while a
// site text field (chat, profile, or search) has focus.
function protectSiteTextInput(event) {
  const target = event.target;

  if (target?.matches?.('input, textarea, [contenteditable="true"]')) {
    event.stopImmediatePropagation();
  }
}

['keydown', 'keypress', 'keyup'].forEach(eventName => {
  window.addEventListener(eventName, protectSiteTextInput, true);
});

// Reset missed messages on page load (user is checking the site)
missedMessages = 0;
updateMissedCount();

// =====================
// UI
// =====================

function updatePanelMembers() {
  const list = document.getElementById('panel-members-list');
  const memberCount = document.getElementById('panel-member-count');

  memberCount.textContent = members.length + ' online';

  list.innerHTML = "";

  members.forEach(m => {
    const el = document.createElement("span");
    el.className = "member";
    el.textContent = m.clientData?.name || "unknown";

    styleNameEl(el, m);

    list.appendChild(el);
  });
}

function updateMissedCount() {
  const countEl = document.getElementById('online-count');
  countEl.textContent = missedMessages > 0 ? missedMessages : '';
}

function addPanelMessage(text, member) {
  const box = document.getElementById('panel-messages');

  const msg = document.createElement("div");
  msg.className = "message";

  const nameEl = document.createElement("span");
  nameEl.className = "member";
  nameEl.textContent = member.clientData?.name || "unknown";

  styleNameEl(nameEl, member);

  msg.appendChild(nameEl);
  msg.appendChild(document.createTextNode(": " + text));

  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

// =====================
// CHAT SEND + COMMANDS
// =====================

document.getElementById('panel-form').addEventListener('submit', e => {
  e.preventDefault();

  const input = document.getElementById('panel-input');
  const value = input.value.trim();

  if (!value) return;

  const now = Date.now();
  if (now - lastClick < coolDown) return;
  lastClick = now;

  input.value = "";
  if (value === "/devlogout") {
  devLogout();
  return;
}

  // =====================
  // DEV COMMAND (SECURE)
  // =====================
  if (value.startsWith("/dev ")) {
    const parts = value.split(" ");
    const target = parts[1];
    const password = parts[2];

    if (password !== DEV_PASSWORD) {
      addPanelMessage("System", {
        clientData: { name: "Invalid dev password" }
      });
      return;
    }

    if (DEV_ACCOUNTS[target]) {
      devName = target;
      localStorage.setItem("bagel_dev_name", target);

      reconnectChat();

      addPanelMessage("System", {
        clientData: { name: "Switched to DEV: " + target }
      });
    } else {
      addPanelMessage("System", {
        clientData: { name: "Invalid dev account" }
      });
    }

    return;
  }

  chatDrone.publish({
    room: 'observable-room',
    message: value
  });
});

// =====================
// PROFILE
// =====================

function saveProfile() {
  const nameInput = document.getElementById('profile-name-input');
  const colorInput = document.getElementById('profile-color-input');

  customName = nameInput.value.trim();
  customColor = colorInput.value;

  localStorage.setItem("bagel_custom_name", customName);
  localStorage.setItem("bagel_custom_color", customColor);

  chatDrone.publish({
    room: "observable-room",
    message: JSON.stringify({
      type: "profileUpdate",
      name: customName,
      color: customColor
    })
  });

  reconnectChat();
}

// =====================
// UI TOGGLES
// =====================

function toggleChat() {
  const panel = document.getElementById('chat-panel');
  panel.classList.toggle('open');
  
  // Reset missed messages when opening chat
  if (panel.classList.contains('open')) {
    missedMessages = 0;
    updateMissedCount();
  }
}

function toggleProfile() {
  document.getElementById('profile-content').classList.toggle('collapsed');
}
function devLogout() {
  devName = null;
  localStorage.removeItem("bagel_dev_name");

  isDev = false;

  reconnectChat();

  addPanelMessage("System", {
    clientData: { name: "Dev mode disabled" }
  });
}
