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

// pick a few recommended games (you can tweak this)
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

// focus shows recommendations
searchInput.addEventListener("focus", () => {
  searchFocused = true;
  renderDefaultSuggestions();
});

// typing overrides with search results
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

// hide on blur (small delay so clicks work)
searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    suggestionsBox.style.display = "none";
  }, 150);
});

searchIcon.addEventListener("click", () => {
  const hasText = searchInput.value.trim().length > 0;

  if (hasText) {
    // CLEAR SEARCH
    searchInput.value = "";
    setIcon("search");

    suggestionsBox.style.display = "none";

    // reset view
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
    // optional: focus input if empty
    searchInput.focus();
  }
});
// ---------------- RANDOM ----------------


// ---------------- INIT ----------------
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
  const visible = 6;

  let index = 0;

  // IMPORTANT: lazy render state
  const rendered = new Set();

  function renderRange() {
    const start = index;
    const end = Math.min(index + visible + 2, games.length);

    for (let i = start; i < end; i++) {
      if (rendered.has(i)) continue;

      const card = createCard(games[i]);
      card.style.opacity = "0";
      card.style.transform = "scale(0.85)";
      row.appendChild(card);

      requestAnimationFrame(() => {
        card.style.transition = "all 0.25s ease";
        card.style.transform = "scale(1)";
      });

      rendered.add(i);
    }
  }

  function update() {
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

  // initial render (only first chunk)
  renderRange();
  update();

  wrapper.appendChild(prev);
  wrapper.appendChild(row);
  wrapper.appendChild(next);

  section.appendChild(title);
  section.appendChild(wrapper);

  return section;
}


renderAll();