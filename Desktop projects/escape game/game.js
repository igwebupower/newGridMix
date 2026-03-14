/* ======================================================
   ESCAPE ROOM — ADDITION GAME
   10 levels: simple → hard
   ====================================================== */

// ── LEVEL DEFINITIONS ──────────────────────────────────
const LEVELS = [
  // 1 — Single digits, no carrying
  {
    id: 1,
    name: "The Cellar",
    icon: "🪣",
    timeLimit: 90,
    description: "Single-digit numbers. A simple warm-up.",
    puzzles: [
      { id: "p1", icon: "🔑", label: "Rusty Key",  q: "3 + 4",    a: 7,  clue: "Count the old keys on the hook.",    hint: "3 fingers + 4 fingers = ?" },
      { id: "p2", icon: "📦", label: "Old Box",    q: "5 + 2",    a: 7,  clue: "How many candles are in the box?",   hint: "5 + 2 = ?" },
      { id: "p3", icon: "🕯️", label: "Candle",     q: "1 + 8",    a: 9,  clue: "The wax number is the answer.",      hint: "1 + 8 = ?" },
    ]
  },

  // 2 — Single digits, some up to 10
  {
    id: 2,
    name: "The Kitchen",
    icon: "🍳",
    timeLimit: 90,
    description: "Adding up to 10. Getting warmer!",
    puzzles: [
      { id: "p1", icon: "🥄", label: "Spoon",   q: "6 + 4",  a: 10, clue: "Count the spoons in both drawers.",  hint: "6 + 4 = ?" },
      { id: "p2", icon: "🥚", label: "Eggs",    q: "7 + 3",  a: 10, clue: "Two baskets of eggs.",               hint: "7 + 3 = ?" },
      { id: "p3", icon: "🧂", label: "Salt",    q: "8 + 2",  a: 10, clue: "Grams of salt in each shaker.",      hint: "8 + 2 = ?" },
      { id: "p4", icon: "🍞", label: "Bread",   q: "5 + 5",  a: 10, clue: "Slices in each half of the loaf.",   hint: "5 + 5 = ?" },
    ]
  },

  // 3 — Teens (no carry)
  {
    id: 3,
    name: "The Library",
    icon: "📚",
    timeLimit: 100,
    description: "Two-digit totals. Check the bookshelves.",
    puzzles: [
      { id: "p1", icon: "📖", label: "Red Book",   q: "10 + 5",   a: 15, clue: "Page number of the hidden note.",  hint: "10 + 5 = ?" },
      { id: "p2", icon: "🗂️", label: "Folder",     q: "12 + 4",   a: 16, clue: "Files on the left + right shelf.", hint: "12 + 4 = ?" },
      { id: "p3", icon: "🔭", label: "Telescope",  q: "11 + 7",   a: 18, clue: "Years on the brass plate.",        hint: "11 + 7 = ?" },
      { id: "p4", icon: "🖊️", label: "Quill",      q: "13 + 6",   a: 19, clue: "Ink drops in each bottle.",       hint: "13 + 6 = ?" },
    ]
  },

  // 4 — Adding to 20 with carry
  {
    id: 4,
    name: "The Study",
    icon: "🖋️",
    timeLimit: 100,
    description: "Carrying starts here. Think carefully!",
    puzzles: [
      { id: "p1", icon: "⏰", label: "Clock",    q: "8 + 9",    a: 17, clue: "Ticks on the clock face.",          hint: "Try counting on: 8, 9, 10 … 17" },
      { id: "p2", icon: "🖼️", label: "Painting", q: "9 + 7",    a: 16, clue: "Colours used in the portrait.",    hint: "9 + 7 = ?" },
      { id: "p3", icon: "🏺", label: "Vase",     q: "6 + 8",    a: 14, clue: "Petals on each bunch of flowers.",  hint: "6 + 8 = ?" },
      { id: "p4", icon: "🗝️", label: "Gold Key", q: "7 + 9",    a: 16, clue: "Notches on the old gold key.",     hint: "7 + 9 = ?" },
      { id: "p5", icon: "📜", label: "Scroll",   q: "8 + 8",    a: 16, clue: "Words in the secret message.",     hint: "Double 8 = ?" },
    ]
  },

  // 5 — Two-digit + one-digit
  {
    id: 5,
    name: "The Vault",
    icon: "🏦",
    timeLimit: 110,
    description: "Two-digit numbers appear. Stay sharp!",
    puzzles: [
      { id: "p1", icon: "💰", label: "Coins",   q: "24 + 5",   a: 29, clue: "Coins in both trays.",              hint: "24 + 5: add the ones first" },
      { id: "p2", icon: "💎", label: "Gem",     q: "35 + 8",   a: 43, clue: "Carats engraved on the gem.",       hint: "5 + 8 = 13, carry the 1" },
      { id: "p3", icon: "📊", label: "Ledger",  q: "47 + 6",   a: 53, clue: "Entries on both ledger pages.",     hint: "7 + 6 = 13, carry the 1" },
      { id: "p4", icon: "🔐", label: "Safe",    q: "58 + 7",   a: 65, clue: "The safe combination digits.",      hint: "8 + 7 = 15, carry the 1" },
      { id: "p5", icon: "🧾", label: "Receipt", q: "63 + 9",   a: 72, clue: "Total items on both receipts.",     hint: "3 + 9 = 12, carry the 1" },
    ]
  },

  // 6 — Two-digit + two-digit (no carry)
  {
    id: 6,
    name: "The Gallery",
    icon: "🎨",
    timeLimit: 120,
    description: "Double figures, no carrying. Keep going!",
    puzzles: [
      { id: "p1", icon: "🖌️", label: "Brush",   q: "21 + 34",  a: 55, clue: "Bristles on each pair of brushes.", hint: "Ones: 1+4, Tens: 2+3" },
      { id: "p2", icon: "🖼️", label: "Canvas",  q: "43 + 25",  a: 68, clue: "Square inches of each canvas.",    hint: "Ones: 3+5, Tens: 4+2" },
      { id: "p3", icon: "🎭", label: "Mask",    q: "32 + 46",  a: 78, clue: "Beads on each theatre mask.",      hint: "Ones: 2+6, Tens: 3+4" },
      { id: "p4", icon: "🎼", label: "Score",   q: "51 + 38",  a: 89, clue: "Notes on both pages of the score.", hint: "Ones: 1+8, Tens: 5+3" },
      { id: "p5", icon: "🪞", label: "Mirror",  q: "14 + 65",  a: 79, clue: "Reflections counted in each frame.", hint: "Ones: 4+5, Tens: 1+6" },
    ]
  },

  // 7 — Two-digit + two-digit with carry
  {
    id: 7,
    name: "The Tower",
    icon: "🏰",
    timeLimit: 130,
    description: "Carrying across columns. You can do it!",
    puzzles: [
      { id: "p1", icon: "🪬", label: "Amulet",  q: "36 + 47",  a: 83, clue: "Symbols engraved on both sides.",  hint: "6+7=13, write 3 carry 1; 3+4+1=8" },
      { id: "p2", icon: "⚔️",  label: "Sword",   q: "58 + 25",  a: 83, clue: "Jewels on hilt + scabbard.",       hint: "8+5=13, carry 1; 5+2+1=8" },
      { id: "p3", icon: "🛡️",  label: "Shield",  q: "74 + 49",  a: 123,clue: "Rivets on both battle shields.",   hint: "4+9=13, carry 1; 7+4+1=12" },
      { id: "p4", icon: "🏹", label: "Quiver",  q: "67 + 58",  a: 125,clue: "Arrows in both quivers.",           hint: "7+8=15, carry 1; 6+5+1=12" },
      { id: "p5", icon: "🔔", label: "Bell",    q: "89 + 76",  a: 165,clue: "Carvings on each side of the bell.",hint: "9+6=15, carry 1; 8+7+1=16" },
    ]
  },

  // 8 — Three-digit + two-digit
  {
    id: 8,
    name: "The Observatory",
    icon: "🌌",
    timeLimit: 140,
    description: "Three-digit sums. Look to the stars!",
    puzzles: [
      { id: "p1", icon: "🌟", label: "Star Chart",   q: "124 + 53",  a: 177, clue: "Stars catalogued on both charts.",  hint: "Add ones, tens, then hundreds" },
      { id: "p2", icon: "🪐", label: "Planet Map",   q: "235 + 48",  a: 283, clue: "Moons recorded in the log.",         hint: "5+8=13, carry 1; 3+4+1=8; 2+0=2" },
      { id: "p3", icon: "🔭", label: "Telescope",    q: "367 + 85",  a: 452, clue: "Light-years on the telescope dial.", hint: "7+5=12, carry; 6+8+1=15, carry; 3+0+1=4" },
      { id: "p4", icon: "📡", label: "Antenna",      q: "418 + 96",  a: 514, clue: "Signals captured by each dish.",     hint: "8+6=14, carry; 1+9+1=11, carry; 4+0+1=5" },
      { id: "p5", icon: "🌙", label: "Moon Log",     q: "579 + 87",  a: 666, clue: "Cycles in the ancient moon log.",    hint: "9+7=16, carry; 7+8+1=16, carry; 5+0+1=6" },
    ]
  },

  // 9 — Three-digit + three-digit
  {
    id: 9,
    name: "The Catacombs",
    icon: "💀",
    timeLimit: 150,
    description: "Large numbers in the dark. Keep calm!",
    puzzles: [
      { id: "p1", icon: "🦴", label: "Bone Tablet",  q: "231 + 456", a: 687, clue: "Years since the catacombs were sealed.", hint: "Ones: 1+6, Tens: 3+5, Hundreds: 2+4" },
      { id: "p2", icon: "⚗️",  label: "Flask",        q: "348 + 275", a: 623, clue: "Drops of potion in each flask.",          hint: "8+5=13, carry; 4+7+1=12, carry; 3+2+1=6" },
      { id: "p3", icon: "🪦", label: "Gravestone",   q: "467 + 358", a: 825, clue: "Names etched on both gravestones.",       hint: "7+8=15, carry; 6+5+1=12, carry; 4+3+1=8" },
      { id: "p4", icon: "🕸️", label: "Web Tablet",   q: "589 + 476", a: 1065,clue: "Threads woven in the ancient web.",      hint: "9+6=15, carry; 8+7+1=16, carry; 5+4+1=10, carry" },
      { id: "p5", icon: "🔮", label: "Crystal",      q: "693 + 847", a: 1540,clue: "Facets on both crystal orbs.",            hint: "3+7=10, carry; 9+4+1=14, carry; 6+8+1=15, carry" },
    ]
  },

  // 10 — Mixed large numbers + word problem clues
  {
    id: 10,
    name: "The Final Door",
    icon: "🚪",
    timeLimit: 180,
    description: "The ultimate challenge. Solve all to escape!",
    puzzles: [
      { id: "p1", icon: "🧩", label: "Cipher A",  q: "1234 + 567",  a: 1801, clue: "The first code fragment.",  hint: "Add column by column right to left" },
      { id: "p2", icon: "🧩", label: "Cipher B",  q: "2468 + 1357", a: 3825, clue: "The second code fragment.", hint: "8+7=15, carry; 6+5+1=12, carry; 4+3+1=8; 2+1=3" },
      { id: "p3", icon: "🧩", label: "Cipher C",  q: "3579 + 2864", a: 6443, clue: "The third code fragment.",  hint: "9+4=13, carry; 7+6+1=14, carry; 5+8+1=14, carry; 3+2+1=6" },
      { id: "p4", icon: "🧩", label: "Cipher D",  q: "4896 + 3745", a: 8641, clue: "The fourth code fragment.", hint: "6+5=11, carry; 9+4+1=14, carry; 8+7+1=16, carry; 4+3+1=8" },
      { id: "p5", icon: "🚪", label: "Final Key", q: "9999 + 1",    a: 10000,clue: "The last piece. Freedom awaits!", hint: "9+1=10, carry all the way!" },
    ]
  }
];

// ── SAVE DATA ─────────────────────────────────────────
const SAVE_KEY = "escape_save";

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || { progress: {}, totalScore: 0 };
  } catch { return { progress: {}, totalScore: 0 }; }
}

function writeSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

// ── STATE ─────────────────────────────────────────────
let state = {
  save: loadSave(),
  currentLevel: null,
  currentPuzzleIndex: 0,
  solvedPuzzles: new Set(),
  lives: 3,
  score: 0,
  startTime: null,
  timerInterval: null,
  hintUsed: false,
};

// ── DOM HELPERS ───────────────────────────────────────
const $ = id => document.getElementById(id);
const showScreen = id => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
};

// ── START SCREEN ──────────────────────────────────────
function buildLevelGrid() {
  const grid = $('level-grid');
  grid.innerHTML = '';
  const save = state.save;

  LEVELS.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';

    const isCompleted = save.progress[level.id]?.completed;
    const isUnlocked = i === 0 || save.progress[LEVELS[i - 1].id]?.completed;
    const stars = save.progress[level.id]?.stars || 0;

    if (isCompleted) {
      btn.classList.add('completed');
      btn.innerHTML = `<span>${level.icon}</span><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span><span style="font-size:0.65rem">${level.id}</span>`;
    } else if (isUnlocked) {
      btn.classList.add('unlocked');
      btn.innerHTML = `<span>${level.icon}</span><span style="font-size:0.65rem">Lv ${level.id}</span>`;
    } else {
      btn.classList.add('locked');
      btn.innerHTML = `<span>🔒</span><span style="font-size:0.65rem">Lv ${level.id}</span>`;
      btn.disabled = true;
    }

    if (isUnlocked || isCompleted) {
      btn.addEventListener('click', () => startLevel(level.id));
    }

    grid.appendChild(btn);
  });
}

// ── START LEVEL ───────────────────────────────────────
function startLevel(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  state.currentLevel = level;
  state.currentPuzzleIndex = 0;
  state.solvedPuzzles = new Set();
  state.lives = 3;
  state.score = 0;
  state.hintUsed = false;
  clearInterval(state.timerInterval);

  showScreen('screen-game');
  renderRoom();
  selectPuzzle(0);
  startTimer(level.timeLimit);
}

// ── TIMER ─────────────────────────────────────────────
function startTimer(seconds) {
  state.startTime = Date.now();
  let remaining = seconds;
  $('timer-count').textContent = remaining + 's';

  state.timerInterval = setInterval(() => {
    remaining--;
    $('timer-count').textContent = remaining + 's';
    if (remaining <= 10) $('timer-count').style.color = 'var(--red)';
    else $('timer-count').style.color = '';

    if (remaining <= 0) {
      clearInterval(state.timerInterval);
      loseLife("Time's up!");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function elapsedSeconds() {
  return Math.round((Date.now() - state.startTime) / 1000);
}

// ── RENDER ROOM ───────────────────────────────────────
function renderRoom() {
  const level = state.currentLevel;
  $('room-name').textContent = level.name;
  $('level-badge').textContent = `Level ${level.id}`;
  updateHUD();
  renderScene();
  updateProgress();
}

function renderScene() {
  const scene = $('room-scene');
  scene.innerHTML = '';
  const level = state.currentLevel;

  level.puzzles.forEach((puzzle, i) => {
    const div = document.createElement('div');
    div.className = 'puzzle-object';
    div.dataset.index = i;

    const isSolved = state.solvedPuzzles.has(puzzle.id);
    const isActive = i === state.currentPuzzleIndex;
    const isLocked = i > 0 && !state.solvedPuzzles.has(level.puzzles[i - 1].id);

    if (isSolved)      div.classList.add('solved');
    else if (isActive) div.classList.add('active');
    else if (isLocked) div.classList.add('locked-obj');

    div.innerHTML = `
      <span class="obj-icon">${puzzle.icon}</span>
      <span class="obj-label">${puzzle.label}</span>
      <span class="obj-status ${isSolved ? 'done' : isLocked ? 'locked' : 'pending'}">
        ${isSolved ? 'UNLOCKED' : isLocked ? 'LOCKED' : 'ACTIVE'}
      </span>
      ${isSolved ? '<span class="solved-check">✅</span>' : ''}
    `;

    if (!isSolved && !isLocked) {
      div.addEventListener('click', () => selectPuzzle(i));
    }

    scene.appendChild(div);
  });
}

function updateHUD() {
  $('lives-count').textContent = '❤️'.repeat(state.lives).replace(/❤️/g, '♥').replace(/(?<=♥{1,})/g, '');
  $('lives-count').textContent = state.lives;
  $('score-count').textContent = state.score;
}

function updateProgress() {
  const total = state.currentLevel.puzzles.length;
  const done = state.solvedPuzzles.size;
  const pct = (done / total) * 100;
  $('progress-fill').style.width = pct + '%';
  $('puzzle-counter').textContent = `${done} / ${total}`;
}

// ── SELECT PUZZLE ─────────────────────────────────────
function selectPuzzle(index) {
  const level = state.currentLevel;
  const puzzle = level.puzzles[index];
  if (!puzzle) return;

  state.currentPuzzleIndex = index;
  state.hintUsed = false;
  $('hint-text').textContent = '';

  // Update scene highlight
  document.querySelectorAll('.puzzle-object').forEach((el, i) => {
    el.classList.remove('active');
    if (i === index && !state.solvedPuzzles.has(puzzle.id)) {
      el.classList.add('active');
    }
  });

  // Lock visual
  $('lock-shackle').classList.remove('open');
  $('lock-visual').querySelector('.lock-body').classList.remove('solved-lock');
  $('lock-digits').textContent = '???';

  // Question
  $('puzzle-title').textContent = puzzle.label;
  $('puzzle-question').innerHTML = `
    <div class="question-text">${puzzle.q} = ?</div>
    <div class="question-clue">${puzzle.clue}</div>
  `;

  // Reset input
  const input = $('answer-input');
  input.value = '';
  input.className = 'answer-input';
  input.disabled = false;
  input.focus();

  // Feedback
  hideFeedback();

  // Submit button
  $('btn-submit').disabled = false;
  $('btn-submit').textContent = 'Unlock';
}

// ── SUBMIT ANSWER ─────────────────────────────────────
function submitAnswer() {
  const level = state.currentLevel;
  const puzzle = level.puzzles[state.currentPuzzleIndex];
  if (!puzzle) return;
  if (state.solvedPuzzles.has(puzzle.id)) return;

  const input = $('answer-input');
  const val = parseInt(input.value.trim(), 10);

  if (isNaN(val)) {
    showFeedback('Type a number first!', 'info');
    return;
  }

  if (val === puzzle.a) {
    // CORRECT
    state.solvedPuzzles.add(puzzle.id);
    const points = calcPoints();
    state.score += points;

    input.className = 'answer-input correct';
    input.disabled = true;
    $('btn-submit').disabled = true;

    // Animate lock open
    $('lock-digits').textContent = puzzle.a;
    $('lock-shackle').classList.add('open');
    $('lock-visual').querySelector('.lock-body').classList.add('solved-lock');

    showFeedback(`✓ Correct! +${points} pts`, 'success');
    updateHUD();
    updateProgress();
    renderScene();

    // Advance or complete
    const nextIndex = state.currentPuzzleIndex + 1;
    setTimeout(() => {
      if (nextIndex < level.puzzles.length) {
        selectPuzzle(nextIndex);
      } else {
        levelComplete();
      }
    }, 1200);

  } else {
    // WRONG
    state.lives = Math.max(0, state.lives - 1);
    input.className = 'answer-input wrong';
    setTimeout(() => { input.className = 'answer-input'; }, 400);
    updateHUD();

    if (state.lives === 0) {
      setTimeout(() => loseLife('No lives left!'), 500);
    } else {
      showFeedback(`✗ Not quite. Try again! (${state.lives} ❤ left)`, 'error');
    }
  }
}

function calcPoints() {
  const base = 100;
  const hintPenalty = state.hintUsed ? 30 : 0;
  const timeBonus = Math.max(0, 20 - Math.floor(elapsedSeconds() / 5));
  return Math.max(10, base - hintPenalty + timeBonus);
}

// ── FEEDBACK ──────────────────────────────────────────
function showFeedback(msg, type) {
  const el = $('feedback');
  el.textContent = msg;
  el.className = `feedback ${type}`;
}

function hideFeedback() {
  $('feedback').className = 'feedback hidden';
}

// ── HINT ──────────────────────────────────────────────
function showHint() {
  const puzzle = state.currentLevel.puzzles[state.currentPuzzleIndex];
  if (!puzzle) return;
  state.hintUsed = true;
  $('hint-text').textContent = '💡 ' + puzzle.hint;
}

// ── LOSE LIFE / GAME OVER ─────────────────────────────
function loseLife(reason) {
  stopTimer();
  showScreen('screen-gameover');
}

// ── LEVEL COMPLETE ────────────────────────────────────
function levelComplete() {
  stopTimer();
  const elapsed = elapsedSeconds();
  const level = state.currentLevel;
  const stars = calcStars(elapsed, level.timeLimit);

  // Save progress
  const existing = state.save.progress[level.id];
  if (!existing || existing.stars < stars) {
    state.save.progress[level.id] = { completed: true, stars, score: state.score };
  }
  state.save.totalScore = (state.save.totalScore || 0) + state.score;
  writeSave(state.save);

  // Show result screen
  const isLast = level.id === LEVELS.length;
  $('result-icon').textContent = isLast ? '🏆' : '🔓';
  $('result-title').textContent = isLast ? 'You Escaped!' : 'Door Unlocked!';
  $('result-msg').textContent = isLast
    ? `Incredible! You solved all ${LEVELS.length} rooms and escaped!`
    : `You unlocked "${level.name}" and moved one step closer to freedom.`;

  $('stat-score').textContent = state.score;
  $('stat-time').textContent = elapsed + 's';
  $('stat-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('star-display').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  const nextBtn = $('btn-next');
  if (isLast) {
    nextBtn.textContent = 'Play Again';
    nextBtn.onclick = () => { showScreen('screen-start'); buildLevelGrid(); };
  } else {
    nextBtn.textContent = 'Next Level →';
    nextBtn.onclick = () => startLevel(level.id + 1);
  }

  showScreen('screen-level-complete');
}

function calcStars(elapsed, limit) {
  const ratio = elapsed / limit;
  if (ratio < 0.4) return 3;
  if (ratio < 0.75) return 2;
  return 1;
}

// ── EVENT LISTENERS ───────────────────────────────────
$('btn-start').addEventListener('click', () => startLevel(1));

$('answer-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitAnswer();
});

$('btn-submit').addEventListener('click', submitAnswer);
$('btn-hint').addEventListener('click', showHint);

$('btn-menu').addEventListener('click', () => {
  stopTimer();
  showScreen('screen-start');
  buildLevelGrid();
});

$('btn-replay').addEventListener('click', () => {
  startLevel(state.currentLevel.id);
});

$('btn-gameover-menu').addEventListener('click', () => {
  showScreen('screen-start');
  buildLevelGrid();
});

$('btn-gameover-retry').addEventListener('click', () => {
  startLevel(state.currentLevel.id);
});

// ── INIT ──────────────────────────────────────────────
buildLevelGrid();
