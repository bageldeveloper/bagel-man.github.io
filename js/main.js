function normalizeTag(tag) {
  return tag.toLowerCase().trim();
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- TIME-BASED SECTIONS ---
function getTimeBasedSeed(type, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const weekOfYear = Math.floor((day - 1) / 7) + 1;
  
  switch(type) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      return `${year}-${month}-week${weekOfYear}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'yearly':
      return `${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

function seededRandom(seed) {
  // Simple seeded random number generator
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getTimeBasedGames(type, count = 1) {
  const seed = getTimeBasedSeed(type);
  const games = Object.values(gamersgaming);
  const seedNumber = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use the seed to select consistent games
  const selectedGames = [];
  const availableGames = [...games];
  
  for (let i = 0; i < count && availableGames.length > 0; i++) {
    const randomIndex = Math.floor(seededRandom(seedNumber + i) * availableGames.length);
    selectedGames.push(availableGames.splice(randomIndex, 1)[0]);
  }
  
  return selectedGames;
}

function createTimeBasedCard(game) {
  const card = document.createElement('a');
  card.href = game.url;
  card.className = 'card game-card time-card';
  card.dataset.tags = game.tags.map(normalizeTag).join(',');
  card.dataset.name = game.name.toLowerCase();

  const imgSrc = game.image ? game.image : "skele.gif";

  card.innerHTML = `
    <div class="card-bg" style="background-image: url('${imgSrc}')"></div>
    <div class="card-overlay">
      <h4 class="game-title">${game.name}</h4>
    </div>
  `;

  return card;
}

// --- MANUAL SELECTION STATE ---
let monthlyFavorites = [];
let currentMonthlyIndex = 0;
let yearlyFavorites = [];
let currentYearlyIndex = 0;

function initializeManualSelections() {
  const allGames = Object.values(gamersgaming);
  monthlyFavorites = allGames.filter(game => game.tags.includes('favorite'));
  yearlyFavorites = allGames.filter(game => game.tags.includes('favorite'));
  
  if (monthlyFavorites.length > 0) {
    const stored = localStorage.getItem('monthlyGameIndex');
    currentMonthlyIndex = stored ? parseInt(stored) : 0;
    if (currentMonthlyIndex >= monthlyFavorites.length) currentMonthlyIndex = 0;
  }
  
  if (yearlyFavorites.length > 0) {
    const stored = localStorage.getItem('yearlyGameIndex');
    currentYearlyIndex = stored ? parseInt(stored) : 0;
    if (currentYearlyIndex >= yearlyFavorites.length) currentYearlyIndex = 0;
  }
}

function updateMonthlyIndex(delta) {
  if (monthlyFavorites.length === 0) return;
  currentMonthlyIndex = (currentMonthlyIndex + delta + monthlyFavorites.length) % monthlyFavorites.length;
  localStorage.setItem('monthlyGameIndex', currentMonthlyIndex);
  renderMonthlySection();
}

function updateYearlyIndex(delta) {
  if (yearlyFavorites.length === 0) return;
  currentYearlyIndex = (currentYearlyIndex + delta + yearlyFavorites.length) % yearlyFavorites.length;
  localStorage.setItem('yearlyGameIndex', currentYearlyIndex);
  renderYearlySection();
}

function renderMonthlySection() {
  const monthlySection = document.getElementById('monthlySection');
  const monthlyGames = monthlySection.querySelector('.time-games');
  monthlyGames.innerHTML = '';
  
  if (monthlyFavorites.length > 0) {
    const game = monthlyFavorites[currentMonthlyIndex];
    monthlyGames.appendChild(createTimeBasedCard(game));
  }
  
  const prevBtn = monthlySection.querySelector('.monthly-prev');
  const nextBtn = monthlySection.querySelector('.monthly-next');
  const counter = monthlySection.querySelector('.monthly-counter');
  
  if (prevBtn) prevBtn.style.visibility = monthlyFavorites.length > 1 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.visibility = monthlyFavorites.length > 1 ? 'visible' : 'hidden';
  if (counter) counter.textContent = `${currentMonthlyIndex + 1} / ${monthlyFavorites.length}`;
}

function renderYearlySection() {
  const yearlySection = document.getElementById('yearlySection');
  const yearlyGames = yearlySection.querySelector('.time-games');
  yearlyGames.innerHTML = '';
  
  if (yearlyFavorites.length > 0) {
    const game = yearlyFavorites[currentYearlyIndex];
    yearlyGames.appendChild(createTimeBasedCard(game));
  }
  
  const prevBtn = yearlySection.querySelector('.yearly-prev');
  const nextBtn = yearlySection.querySelector('.yearly-next');
  const counter = yearlySection.querySelector('.yearly-counter');
  
  if (prevBtn) prevBtn.style.visibility = yearlyFavorites.length > 1 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.visibility = yearlyFavorites.length > 1 ? 'visible' : 'hidden';
  if (counter) counter.textContent = `${currentYearlyIndex + 1} / ${yearlyFavorites.length}`;
}

function renderTimeBasedSections() {
  // Daily pick - 1 game
  const dailySection = document.getElementById('dailySection');
  const dailyGames = dailySection.querySelector('.time-games');
  dailyGames.innerHTML = '';
  const dailyPick = getTimeBasedGames('daily', 1);
  dailyPick.forEach(game => dailyGames.appendChild(createTimeBasedCard(game)));

  // Weekly pick - 1 game
  const weeklySection = document.getElementById('weeklySection');
  const weeklyGames = weeklySection.querySelector('.time-games');
  weeklyGames.innerHTML = '';
  const weeklyPick = getTimeBasedGames('weekly', 1);
  weeklyPick.forEach(game => weeklyGames.appendChild(createTimeBasedCard(game)));

  // Monthly and Yearly now use manual selection
  renderMonthlySection();
  renderYearlySection();
}

// --- CONTAINERS ---
const genreRowsContainer = document.getElementById("genreRows");
const gameGrid = document.getElementById("gameGrid");
const categoryList = document.getElementById('categoryList');
const randomBtn = document.getElementById('randomGame');
const searchInput = document.getElementById('searchInput');

let activeCategory = 'all';

// --- ROWS LOGIC (ALL GAMES) ---
const genreMap = {};

Object.values(gamersgaming).forEach(game => {
  game.tags.forEach(tag => {
    tag = normalizeTag(tag);
    if (!genreMap[tag]) genreMap[tag] = [];
    genreMap[tag].push(game);
  });
});

function createGenreRow(genre, games) {
  const shuffledGames = shuffleArray(games);
  
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

  shuffledGames.forEach(game => {
    const card = document.createElement("a");
    card.href = game.url;
    card.className = "card game-card";
    card.dataset.tags = game.tags.map(normalizeTag).join(",");
    card.dataset.name = game.name.toLowerCase();
  const imgSrc = game.image ? game.image : "skele.gif";

  card.innerHTML = `
    <div class="card-bg" style="background-image: url('${imgSrc}')"></div>
    <div class="card-overlay">
      <h4 class="game-title">${game.name}</h4>
    </div>
  `;

    rowGames.appendChild(card);
  });

  wrapper.appendChild(prevBtn);
  wrapper.appendChild(rowGames);
  wrapper.appendChild(nextBtn);
  row.appendChild(wrapper);

  // Horizontal scroll
  let index = 0;
  const visibleCount = 4;
  const cardWidth = 180 + 12;

  function updateArrows() {
    prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    nextBtn.style.visibility = index >= games.length - visibleCount ? 'hidden' : 'visible';
  }

  prevBtn.addEventListener('click', () => {
    index = Math.max(index - 1, 0);
    rowGames.style.transform = `translateX(-${index * cardWidth}px)`;
    updateArrows();
  });

  nextBtn.addEventListener('click', () => {
    index = Math.min(index + 1, games.length - visibleCount);
    rowGames.style.transform = `translateX(-${index * cardWidth}px)`;
    updateArrows();
  });

  updateArrows();
  return row;
}

// Render all rows initially
function renderAllRows() {
  genreRowsContainer.innerHTML = '';
  Object.entries(genreMap).forEach(([genre, games]) => {
    const row = createGenreRow(genre, games);
    genreRowsContainer.appendChild(row);
  });
}

renderAllRows();

// Initialize manual selections for monthly and yearly
initializeManualSelections();

// Render time-based sections
renderTimeBasedSections();

// Setup navigation buttons
const monthlySection = document.getElementById('monthlySection');
if (monthlySection) {
  const monthlyPrevBtn = monthlySection.querySelector('.monthly-prev');
  const monthlyNextBtn = monthlySection.querySelector('.monthly-next');
  if (monthlyPrevBtn) monthlyPrevBtn.addEventListener('click', () => updateMonthlyIndex(-1));
  if (monthlyNextBtn) monthlyNextBtn.addEventListener('click', () => updateMonthlyIndex(1));
}

const yearlySection = document.getElementById('yearlySection');
if (yearlySection) {
  const yearlyPrevBtn = yearlySection.querySelector('.yearly-prev');
  const yearlyNextBtn = yearlySection.querySelector('.yearly-next');
  if (yearlyPrevBtn) yearlyPrevBtn.addEventListener('click', () => updateYearlyIndex(-1));
  if (yearlyNextBtn) yearlyNextBtn.addEventListener('click', () => updateYearlyIndex(1));
}

// --- GRID LOGIC (SPECIFIC GENRES) ---
function renderGridGames(tag) {
  gameGrid.innerHTML = '';
  gameGrid.style.display = 'grid';
  genreRowsContainer.style.display = 'none';

  const filteredGames = Object.values(gamersgaming).filter(game => game.tags.map(normalizeTag).includes(tag));

  filteredGames.forEach(game => {
    const card = document.createElement('a');
    card.href = game.url;
    card.className = 'card game-card';
    card.dataset.tags = game.tags.map(normalizeTag).join(',');
    card.dataset.name = game.name.toLowerCase();

  const imgSrc = game.image ? game.image : "skele.gif";

  card.innerHTML = `
    <div class="card-bg" style="background-image: url('${imgSrc}')"></div>
    <div class="card-overlay">
      <h4 class="game-title">${game.name}</h4>
    </div>
  `;

    gameGrid.appendChild(card);
  });

  // Update main header
  document.querySelector('main h1').textContent = tag.replace('-', ' ');
}

// --- SIDEBAR BUTTONS ---
function createCategoryButton(tag) {
  const btn = document.createElement('button');
  btn.textContent = tag.replace('-', ' ');
  btn.dataset.category = tag;

  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-categories button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategory = tag;

    if (tag === 'all') {
      genreRowsContainer.style.display = '';
      gameGrid.style.display = 'none';
      document.querySelector('main h1').textContent = 'Games';
    } else {
      renderGridGames(tag);
    }
  });

  return btn;
}


const tags = ['favorite','adventure','puzzle','simulation','shooter','tower-defense','racing','sports','action','platformer','difficult','strategy','console']
// --- GET ALL UNIQUE TAGS FROM GAMES ---
const allTags = tags
// Object.values(gamersgaming).forEach(game => {
//   game.tags.forEach(tag => allTags.add(normalizeTag(tag)));
// });

// --- ADD "All" BUTTON ---
const allBtn = document.createElement('button');
allBtn.textContent = 'All';
allBtn.classList.add('active');
allBtn.addEventListener('click', () => {
  activeCategory = 'all';
  genreRowsContainer.style.display = '';
  gameGrid.style.display = 'none';
  document.querySelector('main h1').textContent = 'Games';

  // Highlight active button
  document.querySelectorAll('.game-categories button').forEach(b => b.classList.remove('active'));
  allBtn.classList.add('active');
});
categoryList.appendChild(allBtn);

allTags.forEach(tag => {
  const btn = document.createElement('button');
  btn.textContent = tag.replace('-', ' ');
  btn.dataset.category = tag;

  btn.addEventListener('click', () => {
    activeCategory = tag;

    // Highlight active button
    document.querySelectorAll('.game-categories button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Switch display
    genreRowsContainer.style.display = 'none';
    renderGridGames(tag);
  });

  categoryList.appendChild(btn);
});

// --- SEARCH ---
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    // If search is empty, go back to normal display
    if (activeCategory === 'all') {
      genreRowsContainer.style.display = '';
      gameGrid.style.display = 'none';
    } else {
      renderGridGames(activeCategory);
    }
    document.querySelector('main h1').textContent = activeCategory === 'all' ? 'Games' : activeCategory.replace('-', ' ');
    return;
  }

  // Show all matching games in a grid
  renderSearchResults(query);
});

function renderSearchResults(query) {
  // Hide rows
  genreRowsContainer.style.display = 'none';
  gameGrid.style.display = 'grid';
  gameGrid.classList.add('card-grid'); // ensure proper grid styling
  gameGrid.innerHTML = '';

  const filteredGames = Object.values(gamersgaming).filter(game =>
    game.name.toLowerCase().includes(query)
  );

  filteredGames.forEach(game => {
    const card = document.createElement('a');
    card.href = game.url;
    card.className = 'card game-card';
    card.dataset.tags = game.tags.map(normalizeTag).join(',');
    card.dataset.name = game.name.toLowerCase();

  const imgSrc = game.image ? game.image : "skele.gif";

  card.innerHTML = `
    <div class="card-bg" style="background-image: url('${imgSrc}')"></div>
    <div class="card-overlay">
      <h4 class="game-title">${game.name}</h4>
    </div>
  `;
    gameGrid.appendChild(card);
  });

  document.querySelector('main h1').textContent = `Search: "${query}"`;
}


// --- RANDOM GAME ---
randomBtn.addEventListener('click', () => {
  const games = Object.values(gamersgaming);
  const pick = games[Math.floor(Math.random() * games.length)];
  window.location.href = pick.url;
});
