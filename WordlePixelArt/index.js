// Load the word list
let WORD_LIST = [];

const wordInput = document.getElementById('wordInput');
const startBtn = document.getElementById('startBtn');
const gridContainer = document.getElementById('gridContainer');
const solutionArea = document.getElementById('solutionArea');
const darkModeToggle = document.getElementById('darkModeToggle');

// Define state variables before any function uses them
let currentWord = '';
let grid = Array.from({ length: 5 }, () => Array(5).fill(0));
let solutionWords = null;

// Track last animated cell
let lastAnimatedCell = null;
// Track last animated word row
let lastAnimatedWordRow = null;
// Track which row should get the domino animation
let lastAnimatedDominoRow = null;

// Flag to animate all rows with domino effect
let animateAllRows = false;

// Dark mode logic
function setDarkMode(on) {
  if (on) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', '1');
    if (darkModeToggle) darkModeToggle.checked = true;
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', '0');
    if (darkModeToggle) darkModeToggle.checked = false;
  }
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('change', (e) => {
    setDarkMode(e.target.checked);
  });
}

// On load, set dark mode from localStorage
window.addEventListener('DOMContentLoaded', () => {
  const dark = localStorage.getItem('darkMode') === '1';
  setDarkMode(dark);
  renderGrid();
  checkSolution();
});

fetch('wordle-answers.txt')
  .then(res => res.text())
  .then(text => {
    WORD_LIST = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === 5);
    checkSolution();
  });

function getAllCombinations(letters, length) {
  if (length === 0) return [''];
  const combos = [];
  for (let i = 0; i < letters.length; i++) {
    for (const tail of getAllCombinations(letters, length - 1)) {
      combos.push(letters[i] + tail);
    }
  }
  return combos;
}

// Helper: Simulate Wordle feedback for a guess and answer
function getWordleFeedback(guess, answer) {
  // 0 = gray, 1 = yellow, 2 = green
  const feedback = Array(5).fill(0);
  const answerArr = answer.split('');
  const guessArr = guess.split('');
  const used = Array(5).fill(false);

  // First pass: green
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      feedback[i] = 2;
      used[i] = true;
    }
  }
  // Second pass: yellow
  for (let i = 0; i < 5; i++) {
    if (feedback[i] === 0) {
      for (let j = 0; j < 5; j++) {
        if (!used[j] && guessArr[i] === answerArr[j]) {
          feedback[i] = 1;
          used[j] = true;
          break;
        }
      }
    }
  }
  return feedback;
}

function checkSolution() {
  console.log('checkSolution called. currentWord:', currentWord, 'grid:', JSON.stringify(grid));
  if (!currentWord || WORD_LIST.length === 0) {
    solutionWords = null;
    renderGrid();
    solutionArea.textContent = '';
    return;
  }
  const solution = [];
  let shouldAnimate = false;
  let anyNoSolution = false;
  const inputLetters = new Set(currentWord.split(''));
  for (let row = 0; row < 5; row++) {
    let found = null;
    const targetPattern = grid[row];
    // Check if all gray
    if (targetPattern.every(v => v === 0)) {
      // Find a word with no shared letters
      for (const candidate of WORD_LIST) {
        let sharesLetter = false;
        for (let i = 0; i < 5; i++) {
          if (inputLetters.has(candidate[i])) {
            sharesLetter = true;
            break;
          }
        }
        if (!sharesLetter) {
          found = candidate;
          break;
        }
      }
    } else {
      // Use Wordle feedback logic
      for (const candidate of WORD_LIST) {
        const feedback = getWordleFeedback(candidate, currentWord);
        if (feedback.every((v, i) => v === targetPattern[i])) {
          found = candidate;
          break;
        }
      }
    }
    if (!found) {
      found = 'NO SOLUTION';
      anyNoSolution = true;
    }
    solution.push(found);
  }
  // If solutionWords was null or empty, this is a new word, so animate all rows
  if (!solutionWords || solutionWords.length === 0) {
    animateAllRows = true;
    lastAnimatedDominoRow = null;
  }
  solutionWords = solution;
  renderGrid();
  solutionArea.textContent = anyNoSolution ? 'No solution for at least one row.' : '';
}

function renderGrid() {
  gridContainer.innerHTML = '';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      let state = grid[row][col];
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      // Add red border if this row has no solution
      if (solutionWords && solutionWords[row] === 'NO SOLUTION') {
        cell.style.border = '2px solid #ff5252';
      }
      // Animate the whole cell if a new word is entered
      if (animateAllRows && solutionWords && solutionWords[row] && solutionWords[row] !== 'NO SOLUTION') {
        cell.classList.add('cell-animate');
        cell.style.animationDelay = ((row + col) * 60) + 'ms';
      }
      // Show user's chosen grid colors, not NOSOL letters
      let letter = '';
      if (solutionWords && solutionWords[row] && solutionWords[row] !== 'NO SOLUTION') {
        const word = solutionWords[row];
        letter = word[col] || '';
        if (state === 2) {
          cell.style.background = '#4caf50'; // green
          cell.style.color = '#fff';
        } else if (state === 1) {
          cell.style.background = '#ffd600'; // yellow
          cell.style.color = '#222';
        } else {
          cell.style.background = '#bdbdbd'; // gray
          cell.style.color = '#222';
        }
      } else {
        // No solution: show user's chosen grid colors, no letter
        if (state === 2) {
          cell.style.background = '#4caf50'; // green
          cell.style.color = '#fff';
        } else if (state === 1) {
          cell.style.background = '#ffd600'; // yellow
          cell.style.color = '#222';
        } else {
          cell.style.background = '#bdbdbd'; // gray
          cell.style.color = '#222';
        }
      }
      // Create a span for the letter
      const letterSpan = document.createElement('span');
      letterSpan.textContent = letter;
      letterSpan.style.display = 'inline-block';
      letterSpan.style.textAlign = 'center';
      letterSpan.style.transition = 'color 0.2s';
      letterSpan.style.width = 'auto';
      letterSpan.style.height = 'auto';
      // Animate the domino effect for the target row (on the span) when a cell is updated
      if (lastAnimatedDominoRow === row && solutionWords && solutionWords[row] && solutionWords[row] !== 'NO SOLUTION') {
        letterSpan.classList.add('letter-animate');
        letterSpan.style.animationDelay = (col * 60) + 'ms';
      }
      letterSpan.addEventListener('animationend', (e) => {
        if (e.animationName === 'letter-grow') {
          letterSpan.classList.remove('letter-animate');
          letterSpan.style.animationDelay = '';
        }
      });
      cell.appendChild(letterSpan);
      cell.style.fontWeight = 'bold';
      cell.style.fontSize = '1.3em';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.padding = '0';
      // Restore cell clickability
      cell.addEventListener('click', () => {
        grid[row][col] = (grid[row][col] + 1) % 3; // cycle 0 -> 1 -> 2 -> 0
        lastAnimatedCell = null;
        lastAnimatedDominoRow = row;
        checkSolution();
      });
      cell.addEventListener('animationend', (e) => {
        cell.classList.remove('cell-animate');
        cell.style.animationDelay = '';
      });
      gridContainer.appendChild(cell);
    }
  }
  // Clear the animation state after rendering
  lastAnimatedCell = null;
  lastAnimatedDominoRow = null;
  animateAllRows = false;
}

// Patch checkSolution to animate the row when the word updates
const originalCheckSolution = checkSolution;
checkSolution = function() {
  // Find which row(s) changed
  if (solutionWords) {
    for (let row = 0; row < 5; row++) {
      let prev = solutionWords[row];
      // After a word is entered, animate all rows
      if (!prev || prev !== (solutionWords && solutionWords[row])) {
        lastAnimatedWordRow = row;
      }
    }
  }
  originalCheckSolution.apply(this, arguments);
}

startBtn.addEventListener('click', () => {
  const word = wordInput.value.trim().toUpperCase();
  if (word.length !== 5 || !/^[A-Z]{5}$/.test(word)) {
    alert('Please enter a valid 5-letter word.');
    return;
  }
  currentWord = word;
  resetGrid();
  renderGrid();
  checkSolution();
});

function resetGrid() {
  grid = Array.from({ length: 5 }, () => Array(5).fill(0));
  solutionWords = null;
  solutionArea.textContent = '';
}
