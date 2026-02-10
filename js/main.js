function normalizeTag(tag) {
  return tag.toLowerCase().trim();
}

const sidebarTags = [
  'action',
  'puzzle',
  'strategy',
  'platformer',
  'shooter',
  'adventure',
  'racing',
  'sports',
  'tower-defense',
  'simulation',
  'console',
  'favorite',
  'new',
  'difficult'
];

const genreRowsContainer = document.getElementById("genreRows");

// Get all genres from your games
const genreMap = {}; // { genreName: [game1, game2, ...] }

Object.values(gamersgaming).forEach(game => {
  game.tags.forEach(tag => {
    tag = normalizeTag(tag);
    if (!genreMap[tag]) genreMap[tag] = [];
    genreMap[tag].push(game);
  });
});

// Render each genre row
function createGenreRow(genre, games) {
  const row = document.createElement("div");
  row.className = "genre-row";

  const title = document.createElement("h3");
  title.textContent = genre.replace("-", " ");
  row.appendChild(title);

  const wrapper = document.createElement("div");
  wrapper.className = "row-wrapper";

  const prevBtn = document.createElement("button");
  prevBtn.className = "row-arrow prev";
  prevBtn.textContent = "◀";

  const nextBtn = document.createElement("button");
  nextBtn.className = "row-arrow next";
  nextBtn.textContent = "▶";

  const rowGames = document.createElement("div");
  rowGames.className = "row-games";

  games.forEach(game => {
    const card = document.createElement("a");
    card.href = game.url;
    card.className = "card";
    card.dataset.tags = game.tags.map(normalizeTag).join(",");
    card.innerHTML = `<h4>${game.name}</h4>`;
    rowGames.appendChild(card);
  });

  wrapper.appendChild(prevBtn);
  wrapper.appendChild(rowGames);
  wrapper.appendChild(nextBtn);
  row.appendChild(wrapper);

  let index = 0;
  const visibleCount = 4; // number of cards visible per row
  const cardWidth = 180 + 12; // card width + gap (adjust gap to match CSS)

  prevBtn.onclick = () => {
    index = Math.max(index - 1, 0);
    rowGames.style.transform = `translateX(-${index * cardWidth}px)`;
  };

  nextBtn.onclick = () => {
    index = Math.min(index + 1, games.length - visibleCount);
    rowGames.style.transform = `translateX(-${index * cardWidth}px)`;
  };

  return row;
}

// Render all rows
Object.entries(genreMap).forEach(([genre, games]) => {
  const row = createGenreRow(genre, games);
  genreRowsContainer.appendChild(row);
});



const categoryList = document.getElementById('categoryList');
const gameGrid = document.getElementById('gameGrid');
const randomBtn = document.getElementById('randomGame');
const searchInput = document.getElementById('searchInput');

let activeCategory = 'all';

/* SIDEBAR */

function createCategoryButton(tag) {
  const btn = document.createElement('button');
  btn.textContent = tag.replace('-', ' ');
  btn.dataset.category = tag;

  btn.onclick = () => {
    document.querySelectorAll('.game-categories button')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = tag;
    filterGames();
  };

  return btn;
}

const allBtn = document.createElement('button');
allBtn.textContent = 'All';
allBtn.classList.add('active');
allBtn.onclick = () => {
  activeCategory = 'all';
  filterGames();
};
categoryList.appendChild(allBtn);

const allTags = new Set();
Object.values(gamersgaming).forEach(game => {
  game.tags.forEach(tag => allTags.add(normalizeTag(tag)));
});

sidebarTags.forEach(tag => {
  if (allTags.has(tag)) {
    categoryList.appendChild(createCategoryButton(tag));
  }
});

/* GAMES */

function renderGames() {
  gameGrid.innerHTML = '';

  Object.values(gamersgaming).forEach(game => {
    const card = document.createElement('a');
    card.href = game.url;
    card.className = 'card game-card';
    card.dataset.tags = game.tags.map(normalizeTag).join(',');
    card.dataset.name = game.name.toLowerCase();

    card.innerHTML = `
      <h3>${game.name}</h3>
      <p>${game.tags.slice(0, 3).join(', ')}</p>
    `;

    gameGrid.appendChild(card);
  });
}

function filterGames() {
  const query = searchInput.value.toLowerCase();

  document.querySelectorAll('.game-card').forEach(card => {
    const tags = card.dataset.tags.split(',');
    const matchesCategory =
      activeCategory === 'all' || tags.includes(activeCategory);
    const matchesSearch =
      card.dataset.name.includes(query);

    card.style.display = matchesCategory && matchesSearch ? '' : 'none';
  });
}

/* SEARCH */

searchInput.addEventListener('input', filterGames);

/* RANDOM */

randomBtn.onclick = () => {
  const games = Object.values(gamersgaming);
  const pick = games[Math.floor(Math.random() * games.length)];
  window.location.href = pick.url;
};

renderGames();
