const gameGrid = document.getElementById("gameGrid");
const genreRowsContainer = document.getElementById("genreRows");
const searchInput = document.getElementById("searchInput");
const pageTitle = document.getElementById("pageTitle");
const randomBtn = document.getElementById("randomGame");

let activeGenre = "all";

// ---------------- ANIMATION ----------------

function animateCards() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card, i) => {
    card.classList.remove("enter");
    setTimeout(() => card.classList.add("enter"), i * 15);
  });
}

// ---------------- GENRE CONFIG ----------------

const GENRES = {
  all: null,
  favorite: ["favorite"],
  adventure: ["adventure"],
  puzzle: ["puzzle"],
  simulation: ["simulation"],
  shooter: ["shooter"],
  towerDefense: ["tower-defense"],
  racing: ["racing"],
  sports: ["sports"],
  action: ["action"],
  platformer: ["platformer"],
  strategy: ["strategy"]
};

// ---------------- HELPERS ----------------

function normalize(tag) {
  return String(tag || "").toLowerCase().trim().replace(/\s+/g, "-");
}

function getGamesByGenre(tags) {
  return Object.values(gamersgaming).filter(game => {
    if (!tags) return true;
    return game.tags.some(t => tags.includes(normalize(t)));
  });
}

// ---------------- CARD ----------------

function createCard(game) {
  const a = document.createElement("a");
  a.href = game.url;
  a.className = "card";
  a.classList.remove("enter");

  const img = game.image || "skele.gif";

  a.innerHTML = `
    <div class="card-bg" style="background-image:url('${img}')"></div>
    <div class="card-overlay">
      <h4 class="game-title">${game.name}</h4>
    </div>
  `;

  return a;
}

// ---------------- RENDER GRID ----------------

function renderGenre(genreKey) {
  activeGenre = genreKey;

  const tags = GENRES[genreKey];

  gameGrid.innerHTML = "";
  genreRowsContainer.innerHTML = "";

  const games = getGamesByGenre(tags);

  games.forEach(game => {
    gameGrid.appendChild(createCard(game));
  });

  gameGrid.style.display = "grid";
  genreRowsContainer.style.display = "none";

  pageTitle.textContent =
    genreKey === "all"
      ? "All Games"
      : document.querySelector(`[data-genre="${genreKey}"]`).textContent;

  animateCards();
}

// ---------------- SIDEBAR EVENTS ----------------

document.querySelectorAll(".game-categories button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".game-categories button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    const genre = btn.dataset.genre;

    if (genre === "all") {
      renderAll();
    } else {
      renderGenre(genre);
    }
  });
});

// ---------------- ALL ----------------

function renderAll() {
  activeGenre = "all";

  gameGrid.innerHTML = "";
  genreRowsContainer.innerHTML = "";

  Object.entries(GENRES).forEach(([key, tags]) => {
    if (!tags) return;

    const games = getGamesByGenre(tags);
    if (!games.length) return;

    const row = createCarouselRow(
      key.charAt(0).toUpperCase() + key.slice(1),
      games
    );

    genreRowsContainer.appendChild(row);
  });

  gameGrid.style.display = "none";
  genreRowsContainer.style.display = "block";

  pageTitle.textContent = "All Games";

  animateCards();
}

// ---------------- SEARCH ----------------
const searchIcon = document.getElementById("searchIcon");

function setIcon(state) {
  searchIcon.textContent = state === "clear" ? "✖" : "🔍";
}
const suggestionsBox = document.getElementById("searchSuggestions");

let searchFocused = false;

function getRecommendedGames() {
  return Object.values(gamersgaming)
    .filter(g =>
      g.tags.includes("favorite") ||
      g.tags.includes("popular")
    )
    .slice(0, 5);
}

function getRandomGame() {
  const games = Object.values(gamersgaming);
  return games[Math.floor(Math.random() * games.length)];
}

function renderDefaultSuggestions() {
  const recommended = getRecommendedGames();

  suggestionsBox.innerHTML = "";

  const label1 = document.createElement("div");
  label1.className = "search-section-label";
  label1.textContent = "Recommended";
  suggestionsBox.appendChild(label1);

  recommended.forEach(game => {
    const item = document.createElement("div");
    item.textContent = game.name;

    item.onclick = () => {
      window.location.href = game.url;
    };

    suggestionsBox.appendChild(item);
  });

  const divider = document.createElement("div");
  divider.className = "search-section-label";
  divider.textContent = " ";
  suggestionsBox.appendChild(divider);

  const random = getRandomGame();

  const randomItem = document.createElement("div");
  randomItem.textContent = "Random Game!";

  randomItem.onclick = () => {
    window.location.href = random.url;
  };

  suggestionsBox.appendChild(randomItem);

  suggestionsBox.style.display = "flex";
}

function renderSearchSuggestions(query) {
  const matches = Object.values(gamersgaming)
    .filter(g => g.name.toLowerCase().includes(query))
    .slice(0, 6);

  suggestionsBox.innerHTML = "";

  if (!matches.length) {
    suggestionsBox.style.display = "none";
    return;
  }

  matches.forEach(game => {
    const item = document.createElement("div");
    item.textContent = game.name;

    item.onclick = () => {
      window.location.href = game.url;
    };

    suggestionsBox.appendChild(item);
  });

  suggestionsBox.style.display = "flex";
}

searchInput.addEventListener("focus", () => {
  searchFocused = true;
  renderDefaultSuggestions();
});

searchInput.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();

  if (!q) {
    setIcon("search");
    renderDefaultSuggestions?.();
    return;
  }

  setIcon("clear");

  renderSearchSuggestions(q);

  gameGrid.innerHTML = "";
  genreRowsContainer.style.display = "none";
  gameGrid.style.display = "grid";

  Object.values(gamersgaming)
    .filter(g => g.name.toLowerCase().includes(q))
    .forEach(game => gameGrid.appendChild(createCard(game)));

  pageTitle.textContent = `Search: "${q}"`;

  animateCards();
});

searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    suggestionsBox.style.display = "none";
  }, 150);
});

searchIcon.addEventListener("click", () => {
  const hasText = searchInput.value.trim().length > 0;

  if (hasText) {
    searchInput.value = "";
    setIcon("search");

    suggestionsBox.style.display = "none";

    if (activeGenre === "all") {
      renderAll();
    } else {
      renderGenre(activeGenre);
    }

    pageTitle.textContent =
      activeGenre === "all"
        ? "All Games"
        : activeGenre;
  } else {
    searchInput.focus();
  }
});

// ---------------- CAROUSEL ----------------

function createCarouselRow(titleText, games) {
  const section = document.createElement("div");
  section.className = "genre-row";

  const title = document.createElement("h3");
  title.textContent = titleText;

  const wrapper = document.createElement("div");
  wrapper.className = "row-wrapper";

  const prev = document.createElement("button");
  prev.className = "row-arrow prev";
  prev.textContent = "◀";

  const next = document.createElement("button");
  next.className = "row-arrow next";
  next.textContent = "▶";

  const row = document.createElement("div");
  row.className = "row-games";

  const cardWidth = 232;
  const sidebarWidth = 200;

  function calcVisible() {
    const w = wrapper.offsetWidth || (window.innerWidth - sidebarWidth - 32);
    return Math.max(1, Math.floor(w / cardWidth));
  }

  let visible = calcVisible();
  let index = 0;

  const rendered = new Set();

  function renderRange() {
    const end = Math.min(index + visible + 4, games.length);

    for (let i = index; i < end; i++) {
      if (rendered.has(i)) continue;

      const card = createCard(games[i]);
      // start hidden
      card.style.opacity = "0";
      card.style.transform = "scale(0.85)";
      row.appendChild(card);

      // must use double-rAF so the browser has registered the initial style
      // before we transition — single rAF fires before paint
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        card.style.opacity = "1";
        card.style.transform = "scale(1)";
      }));

      rendered.add(i);
    }
  }

  function update() {
    visible = calcVisible();

    row.style.transform = `translateX(${-index * cardWidth}px)`;

    prev.style.visibility = index > 0 ? "visible" : "hidden";
    next.style.visibility =
      index < games.length - visible ? "visible" : "hidden";

    renderRange();
  }

  prev.onclick = () => {
    if (index <= 0) return;
    index--;
    update();
  };

  next.onclick = () => {
    if (index >= games.length - visible) return;
    index++;
    update();
  };

  update();

  const ro = new ResizeObserver(() => update());
  ro.observe(wrapper);

  wrapper.appendChild(prev);
  wrapper.appendChild(row);
  wrapper.appendChild(next);

  section.appendChild(title);
  section.appendChild(wrapper);

  return section;
}

// ---------------- ANNOUNCEMENTS AND SETTINGS STUFF ----------------
    // =============================================
    // ANNOUNCEMENTS
    // The newest one is first. Give each a unique id
    // so localStorage knows which ones have been seen.
    // =============================================
    
   // =============================================
    // ANNOUNCEMENTS
    // Add new ones to the TOP. Each needs a unique id.
    // =============================================
    const ANNOUNCEMENTS = [
      { id: 'ann-2026-02-13', date: 'February 13th, 2026', text: 'The website has been overhauled, looks better, easier to navigate, and less of a mess. Also added wheely games. -Tom' },
      { id: 'ann-2025-10-11', date: 'October 11th, 2025', text: "Long time no see. Daniel had a bunch of unreleased flash games (now available) and I've fixed Minecraft 1.8. -Carter" },
      { id: 'ann-2025-02-14', date: 'February 14th, 2025', text: 'Updated the site with more games. The Jimmy Bean game is now on here. -Tom' },
      { id: 'ann-2023-11-15b', date: 'November 15th, 2023', text: "Haven't really done much this past month. We are gonna start it back up hopefully. -Carter" },
      { id: 'ann-2023-11-15a', date: 'November 15th, 2023', text: 'NEW GAME RELEASE ON THANKSGIVING -Carter' },
      { id: 'ann-2023-11-13', date: 'November 13th, 2023', text: 'THE NEW WEBSITE IS BAGELCOMICS.ORG GUYS GO TO IT NOW -tom' },
      { id: 'ann-2023-11-09', date: 'November 9th, 2023', text: "Bruh we get blocked after like 20 minutes?! Anyways new site will be bagelcomics.org. Edit: SOMEONE SUBSCRIBED TO THE PATREON!!!!! -Dirty Dan" },
      { id: 'ann-2023-11-08', date: 'November 8th, 2023', text: 'Added some new chat names. Also NGW baby! Added Crush the Castle 1 and 2, Strike Force Heroes 1, 2, and 3. -Dirty Dan' },
      { id: 'ann-2023-11-06b', date: 'November 6th, 2023', text: 'Added a Sterling quote of the day in the projects page. Check it everyday for out of context Sterling quotes. -Dirty Dan' },
      { id: 'ann-2023-11-06a', date: 'November 6th, 2023', text: 'Added a Game of the Day section to keep things new and fresh every day. -Dirty Dan' },
      { id: 'ann-2023-11-01', date: 'November 1st, 2023', text: "Halloween is over. Added Zelda Link to the Past, Earthbound, Banjo Kazooie, Line Rider 2 and 3. Also added a shop on the Patreon. -Dirty Dan" },
      { id: 'ann-2023-10-31', date: 'October 31st, 2023', text: 'Sorry that the website was broken this morning, hopefully we fixed it. Happy Halloween! -Tom' },
      { id: 'ann-2023-10-28', date: 'October 28th, 2023', text: 'Chat is back! We now have a Patreon with benefits and a free tier. -The whole bagelcomics team' },
      { id: 'ann-2023-10-18', date: 'October 18th, 2023', text: 'NGW is back! Added the rest of the Hobo Games (3rd through 7th). -Dirty Dan' },
      { id: 'ann-2023-10-10', date: 'October 10th, 2023', text: 'bagelcomics.com is dead, we are EGGYOLKERS. Also removed chat cuz no one used it. -Tom' },
      { id: 'ann-2023-10-08', date: 'October 8th, 2023', text: "NGW is back! Added the Waitress and Escape Series games. -Dirty Dan" },
      { id: 'ann-2023-10-04', date: 'October 4th, 2023', text: 'You like the spooky theme? Also added Mega Man X2 and X3. Happy Halloween! -Dirty Dan' },
      { id: 'ann-2023-09-27', date: 'September 27th, 2023', text: 'Still a competition going on. Added every Red Ball game I could find. -Dirty Dan' },
      { id: 'ann-2023-09-25b', date: 'September 25th, 2023', text: 'Added Star Wars Episode 1 Racer. Also announcing a tournament — winner gets a mystery gift! -Dirty Dan' },
      { id: 'ann-2023-09-25a', date: 'September 25th, 2023', text: "Unfortunately Tom doesn't want to work on this anymore so it's just me and Daniel. -Carter" },
      { id: 'ann-2023-09-21', date: 'September 21st, 2023', text: 'WE ARE SO BACK BABY WOOOOOOOOOOOO -Tom' },
      { id: 'ann-2023-06-19', date: 'June 19th, 2023', text: 'Games section was a little unorganized. Made it fit the vibe better. -Dirty Dan' },
      { id: 'ann-2023-05-18', date: 'May 18th, 2023', text: 'Added Super Smash Bros, Super Punch Out!!, and Stop GMO. Moved old Nintendo games to the Nintendo Games Section. -Dirty Dan' },
      { id: 'ann-2023-05-15', date: 'May 15th, 2023', text: 'New emulator for N64, NES, SNES, NDS, and SEGA Genesis! Now you can fullscreen and customize controls. -Dirty Dan' },
      { id: 'ann-2023-05-13', date: 'May 13th, 2023', text: 'Added literally every Papa game ever made. -Dirty Dan' },
      { id: 'ann-2023-05-12', date: 'May 12th, 2023', text: 'Added ANOTHER ZELDA GAME, BATMAN, DUCKTALES, SUPER MARIO BROS 1/2/3, PUNCH OUT!, MEGA MAN 2, CONTRA, and more! -Dirty Dan' },
      { id: 'ann-2023-05-08b', date: "May 8th, 2023", text: "It's my Birthday :) -Dirty Dan" },
      { id: 'ann-2023-05-06', date: 'May 6th, 2023', text: "Papas games aren't broken anymore! Also fixed Awesome Tanks 2 and Learn to Fly 2. -Dirty Dan" },
      { id: 'ann-2023-04-27', date: 'April 27th, 2023', text: 'Added some good old checkers. Still recruiting! -Dirty Dan' },
      { id: 'ann-2023-04-25', date: 'April 25th, 2023', text: "New Games Tuesday? Added Mario Kart 64 and fixed multiple Papas games. -Tom" },
      { id: 'ann-2023-04-13', date: 'April 13th, 2023', text: 'Added raft wars :)' },
      { id: 'ann-2023-03-23', date: 'March 23rd, 2023', text: 'I set the repository to private but that broke everything so I\'m sorry that it was down yesterday.' },
      { id: 'ann-2023-03-21', date: 'March 21st, 2023', text: 'New game wednesday! Added Papas Pancakeria, Papas Hotdogeria, Papas Burgeria, Plants vs Zombies 1 & 2, and Line Rider. -Tom' },
      { id: 'ann-2023-03-15', date: 'March 15th, 2023', text: 'New games: Vex 6, Getaway Shootout, Drift Hunters, and Awesome Tanks 2. -Tom' },
      { id: 'ann-2023-03-01', date: 'March 1st, 2023', text: 'Starting NGW! New games: Canyon Defense, 1 on 1 Soccer, Chibi Knight, 8 Ball Pool, Portal 2D, and Siftheads. -Tom' },
      { id: 'ann-2023-01-16', date: 'January 16th, 2023', text: 'Got the 1.8 Minecraft client actually working. -Tom' },
      { id: 'ann-2022-12-09b', date: 'December 9th, 2022', text: 'Bagel Royal is working (not on Chromebooks sadly). Added Sword and Sandals 1 and 2. -Dirty Dan' },
      { id: 'ann-2022-12-07', date: 'December 7th, 2022', text: 'Added Jacksmith, which is a flash game someone asked for.' },
      { id: 'ann-2022-12-05', date: 'December 5th, 2022', text: "Added Quake 1/3, also added Zelda Ocarina of Time. -Dirty Dan" },
      { id: 'ann-2022-12-04', date: 'December 4th, 2022', text: 'New games: Duck Life 4 and all of the Riddle School games. Papas games coming soon. -Dirty Dan' },
      { id: 'ann-2022-12-03', date: 'December 3rd, 2022', text: 'Added Super Smash Flash, pretty fun.' },
      { id: 'ann-2022-11-20', date: 'November 20th, 2022', text: 'Added a whole truck load of new games including Learn to Fly 1, 2, and 3 and Art of War. -Dirty Dan' },
      { id: 'ann-2022-11-18', date: 'November 18th, 2022', text: 'Gave Carter editing access. Now working on it together. -Tom' },
      { id: 'ann-2022-11-06', date: 'November 6th, 2022', text: 'Added a Minecraft client, basically an exact port of 1.5. -Tom' },
      { id: 'ann-2022-11-01', date: 'November 1st, 2022', text: 'Made a new game for Thanksgiving lol. -Tom' },
      { id: 'ann-2022-10-31', date: 'October 31st, 2022', text: "WE HAVE CONTROL OF THE WEBSITE AGAIN! Slapped together an actual Bagel With a Gun 2 sneak peak. Also revamped the website! Happy Halloween! -Tom" },
      { id: 'ann-2022-09-26', date: 'September 26th, 2022', text: 'Added Super Mario 64! New game coming out pretty soon, stay tuned. -Tom' },
      { id: 'ann-2022-09-14', date: 'September 14th, 2022', text: 'Thank you for 10,000 visits! Also making a sequel to Bagel with a Gun. -Tom' },
      { id: 'ann-2022-09-08', date: 'September 8th, 2022', text: 'Made the announcements fancy. -Tom' },
    ];

    function isUnseen(ann) { return !localStorage.getItem(ann.id); }
function getLatestUnseen() {
  const latest = ANNOUNCEMENTS[0];
  return localStorage.getItem(latest.id) ? null : latest;
}
    // ---- render NEW tab ----
    function renderNewTab() {
      const ann = getLatestUnseen();
      const el = document.getElementById('ann-new-content');
      if (!ann) {
        el.innerHTML = '<div class="ann-caught-up">🎉 You\'re all caught up!</div>';
        return;
      }
      el.innerHTML = `
        <div class="ann-new-date">${ann.date}</div>
        <div class="ann-new-text">${ann.text}</div>
        <button class="ann-dismiss" onclick="dismissAnnouncement()">Dismiss</button>
      `;
    }

    // ---- render ALL tab ----
    function renderAllTab() {
      const list = document.getElementById('ann-all-list');
      list.innerHTML = '';
      ANNOUNCEMENTS.forEach(ann => {
        const div = document.createElement('div');
        div.className = 'ann-item' + (isUnseen(ann) ? ' unseen' : '');
        div.innerHTML = `<div class="ann-item-date">${ann.date}</div><div class="ann-item-text">${ann.text}</div>`;
        list.appendChild(div);
      });
    }

    function dismissAnnouncement() {
      const ann = getLatestUnseen();
      if (ann) localStorage.setItem(ann.id, '1');
      renderNewTab();
      renderAllTab();
      // update dot
      document.getElementById('announce-dot').classList.toggle('visible', !!getLatestUnseen());
    }

    function switchAnnTab(tab) {
      document.getElementById('pane-new').classList.toggle('active', tab === 'new');
      document.getElementById('pane-all').classList.toggle('active', tab === 'all');
      document.getElementById('tab-new').classList.toggle('active', tab === 'new');
      document.getElementById('tab-all').classList.toggle('active', tab === 'all');
      if (tab === 'all') renderAllTab();
    }

    function toggleAnnouncePanel() {
      const panel = document.getElementById('announce-panel');
      const isOpen = panel.classList.toggle('visible');
      if (isOpen) {
        document.getElementById('settings-panel').classList.remove('open');
        document.getElementById('chat-panel').classList.remove('open');
        // always start on new tab when opening
        switchAnnTab('new');
        renderNewTab();
      }
    }

    function initAnnouncements() {
      const hasUnseen = !!getLatestUnseen();
      document.getElementById('announce-dot').classList.toggle('visible', hasUnseen);
      renderNewTab();
      // auto-show if there's something new and it hasn't been auto-shown this session
      if (hasUnseen && !sessionStorage.getItem('annShown')) {
        sessionStorage.setItem('annShown', '1');
        setTimeout(() => {
          document.getElementById('announce-panel').classList.add('visible');
          switchAnnTab('new');
        }, 600);
      }
    }

    // close if clicking outside
    document.addEventListener('click', e => {
      const panel = document.getElementById('announce-panel');
      const btn = document.getElementById('announce-btn');
      if (panel.classList.contains('visible') && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('visible');
      }
    });

    // =============================================
    // SETTINGS
    // =============================================
    function toggleSettings() {
      document.getElementById('settings-panel').classList.toggle('open');
      document.getElementById('announce-panel').classList.remove('visible');
      document.getElementById('chat-panel').classList.remove('open');
    }
    document.addEventListener('click', e => {
      const panel = document.getElementById('settings-panel');
      const btn = document.querySelector('[onclick="toggleSettings()"]');
      if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
    function applyLightMode(on) {
      document.body.classList.toggle('light', on);
      localStorage.setItem('lightMode', on ? '1' : '0');
    }
    function applyAdBlock(on) {
      localStorage.setItem('adBlock', on ? '1' : '0');
      if (on) {
        document.querySelectorAll('script[src*="googlesyndication"], script[src*="adsbygoogle"]').forEach(s => s.remove());
        document.querySelectorAll('ins.adsbygoogle, [id*="ad-"], [class*="ad-slot"]').forEach(el => el.style.display = 'none');
        window.adsbygoogle = { loaded: true, push: () => {} };
      } else { location.reload(); }
    }
    (function restoreSettings() {
      if (localStorage.getItem('lightMode') === '1') {
        document.body.classList.add('light');
        document.getElementById('toggle-light').checked = true;
      }
      if (localStorage.getItem('adBlock') === '1') {
        document.getElementById('toggle-ads').checked = true;
        applyAdBlock(true);
      } else {
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4474724430572739';
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
      }
    })();

    initAnnouncements();


// ---------------- INIT ----------------

renderAll();