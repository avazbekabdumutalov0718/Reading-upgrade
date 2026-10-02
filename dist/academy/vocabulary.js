// ===================== DATA =====================
let UNITS = [];
let ALL_WORDS = [];
let learnedCache = new Set();
let unitWordCache = new Map();
let collocationUnits = [];
let collocationProgress = {};
let currentMode = 'landing';
let currentUnit = null;
let flashWords = [];
let flashIndex = 0;
let flashMode = 'reading';
let currentCollocationUnit = null;
let collocationIndex = 0;

function getLearned() {
  return learnedCache;
}

function markLearned(id) {
  learnedCache.add(id);
  updateProgressBadges();
  if (typeof VividDB !== 'undefined') {
    VividDB.markWordLearned(id);
    VividDB.showSavedToast('✓ Word saved');
  }
}

function unmarkLearned(id) {
  learnedCache.delete(id);
  updateProgressBadges();
  if (typeof VividDB !== 'undefined') VividDB.unmarkWordLearned(id);
}

async function loadVocabularyData() {
  try {
    const [wordsRes, collocationsRes] = await Promise.all([
      fetch('data/words.json'),
      fetch('data/collocations.json'),
    ]);

    UNITS = await wordsRes.json();
    ALL_WORDS = UNITS.flatMap((u) => u.words.map((w) => ({ ...w, unit: u.unit, unitTitle: u.title })));

    if (typeof VividDB !== 'undefined') {
      learnedCache = await VividDB.getLearnedWordIds();
      collocationProgress = await VividDB.getCollocationProgress();
    }

    const collocationPayload = await collocationsRes.json();
    collocationUnits = Array.isArray(collocationPayload) ? collocationPayload : [];
    renderUnitGrid();
    renderCollocationUnits();
    updateProgressBadges();
    showView('landingView');
  } catch (err) {
    console.error('Failed to load vocabulary data:', err);
  }
}

function updateProgressBadges() {
  const learned = getLearned();
  const totalEl = document.getElementById('totalProgress');
  const readingEl = document.getElementById('readingProgress');
  const statEl = document.getElementById('vocabStat');
  const collocationEl = document.getElementById('collocationProgress');

  if (totalEl) totalEl.textContent = `${learned.size} / ${ALL_WORDS.length} learned`;
  if (readingEl) readingEl.textContent = `${learned.size} / ${ALL_WORDS.length} learned`;
  if (statEl) statEl.textContent = `${learned.size} words learned`;

  document.querySelectorAll('.unit-card').forEach((card) => {
    const unitNum = Number(card.dataset.unit);
    const unit = UNITS.find((u) => u.unit === unitNum);
    if (!unit) return;
    const done = unit.words.filter((w) => learned.has(w.id)).length;
    const bar = card.querySelector('.unit-card-fill');
    const label = card.querySelector('.unit-card-count');
    if (bar) bar.style.width = `${(done / unit.words.length) * 100}%`;
    if (label) label.textContent = `${done}/${unit.words.length}`;
  });

  if (collocationEl) {
    const completed = Object.keys(collocationProgress).length;
    collocationEl.textContent = `${completed} / ${collocationUnits.length} completed`;
  }
}

// ===================== VIEW SWITCHING =====================
const views = ['landingView', 'unitGridView', 'unitDetailView', 'flashcardView', 'testView', 'searchView', 'collocationUnitView'];
function showView(id) {
  views.forEach((v) => {
    const el = document.getElementById(v);
    if (el) el.hidden = v !== id;
  });
}

function selectLibraryMode(mode) {
  currentMode = mode;
  if (mode === 'reading') {
    showView('unitGridView');
    updateProgressBadges();
  } else if (mode === 'collocations') {
    showView('collocationUnitView');
    updateProgressBadges();
  }
}

// ===================== UNIT GRID =====================
function renderUnitGrid() {
  const grid = document.getElementById('unitGrid');
  if (!grid) return;
  grid.innerHTML = UNITS.map((u) => `
    <button class="unit-card" data-unit="${u.unit}">
      <span class="unit-card-num">Unit ${u.unit}</span>
      <span class="unit-card-title">${capitalize(u.title)}</span>
      <span class="unit-card-count">0/${u.words.length}</span>
      <div class="unit-card-bar"><div class="unit-card-fill" style="width:0%"></div></div>
    </button>
  `).join('');
  grid.querySelectorAll('.unit-card').forEach((card) => {
    card.addEventListener('click', () => openUnit(Number(card.dataset.unit)));
  });
}

function renderCollocationUnits() {
  const grid = document.getElementById('collocationUnitGrid');
  if (!grid) return;
  grid.innerHTML = collocationUnits.map((u) => {
    const completed = collocationProgress[u.unit] ? 'Completed' : `${u.items.length} cards`;
    return `
      <button class="unit-card" data-collocation-unit="${u.unit}">
        <span class="unit-card-num">Unit ${u.unit}</span>
        <span class="unit-card-title">${capitalize(u.title)}</span>
        <span class="unit-card-count">${completed}</span>
        <div class="unit-card-bar"><div class="unit-card-fill" style="width:${collocationProgress[u.unit] ? '100%' : '0%'}"></div></div>
      </button>
    `;
  }).join('');
  grid.querySelectorAll('.unit-card').forEach((card) => {
    card.addEventListener('click', () => openCollocationUnit(Number(card.dataset.collocationUnit)));
  });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ===================== UNIT DETAIL =====================
async function openUnit(unitNum) {
  currentUnit = UNITS.find((u) => u.unit === unitNum);
  if (!currentUnit) return;
  document.getElementById('unitTitle').textContent = `Unit ${currentUnit.unit}: ${capitalize(currentUnit.title)}`;
  document.getElementById('unitSub').textContent = `${currentUnit.words.length} words`;
  const listEl = document.getElementById('unitWordList');
  if (listEl) {
    listEl.innerHTML = '<div class="weak-empty">Loading words…</div>';
  }
  showView('unitDetailView');

  if (!unitWordCache.has(currentUnit.unit)) {
    unitWordCache.set(currentUnit.unit, currentUnit.words);
  }
  renderWordTable(unitWordCache.get(currentUnit.unit), listEl);
}

function renderWordTable(words, container) {
  const learned = getLearned();
  if (!container) return;
  container.innerHTML = `
    <div class="word-row word-row-head">
      <span>Word</span><span>Definition</span><span>Translation</span><span></span>
    </div>
    ${words.slice(0, 80).map((w) => `
      <div class="word-row ${learned.has(w.id) ? 'is-learned' : ''}" data-id="${w.id}">
        <span class="word-cell-word">
          <button class="mini-pronounce" data-word="${escapeAttr(w.word)}" title="Listen">🔊</button>
          ${w.word}
        </span>
        <span>${w.definition}</span>
        <span>${w.translation}</span>
        <span><input type="checkbox" class="word-learned-check" ${learned.has(w.id) ? 'checked' : ''} data-id="${w.id}"></span>
      </div>
    `).join('')}
  `;
  if (words.length > 80) {
    const more = document.createElement('div');
    more.className = 'weak-empty';
    more.textContent = `Showing 80 of ${words.length} words. Open the unit again later to load more items.`;
    container.appendChild(more);
  }
  container.querySelectorAll('.mini-pronounce').forEach((btn) => {
    btn.addEventListener('click', () => speak(btn.dataset.word));
  });
  container.querySelectorAll('.word-learned-check').forEach((box) => {
    box.addEventListener('change', () => {
      const id = Number(box.dataset.id);
      if (box.checked) markLearned(id); else unmarkLearned(id);
      box.closest('.word-row').classList.toggle('is-learned', box.checked);
    });
  });
}

function escapeAttr(s) { return s.replace(/"/g, '&quot;'); }

// ===================== PRONUNCIATION =====================
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ===================== FLASHCARDS =====================
function renderReadingFlashcard() {
  const w = flashWords[flashIndex];
  document.getElementById('flashProgress').textContent = `${flashIndex + 1} / ${flashWords.length}`;
  document.getElementById('flashWord').textContent = w.word;
  document.getElementById('flashBackWord').textContent = w.word;
  document.getElementById('flashDef').textContent = w.definition;
  document.getElementById('flashTranslation').textContent = w.translation;
  document.getElementById('flashSynonyms').innerHTML = getSynonyms(w.word, w.definition)
    .map((s) => `<span class="flash-syn-chip">${s}</span>`).join('');
  document.getElementById('flashExample').textContent = generateExample(w.word);
  document.getElementById('flashTag').textContent = 'Tap to reveal meaning';
  document.getElementById('flashcardInner').classList.remove('flipped');
  document.getElementById('flashReview').hidden = false;
  document.getElementById('flashKnow').hidden = false;
  document.getElementById('flipFlashcard').hidden = true;
  document.getElementById('markCollocationDone').hidden = true;
}

function splitCollocationText(item) {
  const rawEnglish = item?.english || '';
  const rawTranslation = item?.translation || '';
  const separatorMatch = rawEnglish.match(/^(.*?)\s[-–—]\s(.*)$/);

  if (separatorMatch) {
    return {
      english: separatorMatch[1].trim(),
      uzbek: separatorMatch[2].trim(),
    };
  }

  if (rawTranslation) {
    return {
      english: rawEnglish.trim(),
      uzbek: rawTranslation.trim(),
    };
  }

  return {
    english: rawEnglish.trim(),
    uzbek: '',
  };
}

function renderCollocationFlashcard() {
  const item = currentCollocationUnit.items[collocationIndex];
  if (!item) return;
  const { english, uzbek } = splitCollocationText(item);

  document.getElementById('flashProgress').textContent = `${collocationIndex + 1} / ${currentCollocationUnit.items.length}`;
  document.getElementById('flashWord').textContent = english || 'Collocation';
  document.getElementById('flashBackWord').textContent = uzbek || '—';
  document.getElementById('flashDef').textContent = 'Uzbek translation';
  document.getElementById('flashTranslation').textContent = '';
  document.getElementById('flashSynonyms').innerHTML = '';
  document.getElementById('flashExample').textContent = 'Use this collocation in an essay, speaking answer, or reading note.';
  document.getElementById('flashTag').textContent = 'Flip to reveal the Uzbek meaning';
  document.getElementById('flashcardInner').classList.remove('flipped');
  document.getElementById('flashReview').hidden = true;
  document.getElementById('flashKnow').hidden = true;
  document.getElementById('flipFlashcard').hidden = false;
  document.getElementById('markCollocationDone').hidden = false;
}

function renderFlashcard() {
  if (flashMode === 'collocation') {
    renderCollocationFlashcard();
  } else {
    renderReadingFlashcard();
  }
}

function getSynonyms(word, definition) {
  let parts = definition.split(/\s+or\s+/i);
  if (parts.length < 2) parts = definition.split(/,\s*/);
  parts = parts.map((p) => p.trim()).filter(Boolean).filter((p) => p.toLowerCase() !== word.toLowerCase());
  if (parts.length >= 2) return parts.slice(0, 2);
  if (parts.length === 1) return [parts[0]];
  return [definition];
}

function guessPartOfSpeech(word) {
  const w = word.toLowerCase();
  if (/(tion|sion|ment|ness|ity|ance|ence|ery|ship|hood|dom)$/.test(w)) return 'noun';
  if (/(ive|ous|al|ic|ful|less|able|ible|ent|ant|ary)$/.test(w)) return 'adj';
  if (/ing$/.test(w)) return 'verb';
  return 'other';
}

function generateExample(word) {
  const templates = {
    noun: `The ${word} of the situation became clear after the report was published.`,
    adj: `Her approach to the problem was remarkably ${word}.`,
    verb: `Researchers hope to ${word} the process within the next few years.`,
    other: `This word often appears in IELTS passages on this topic: "${word}."`,
  };
  return templates[guessPartOfSpeech(word)];
}

function nextFlash() {
  if (flashMode === 'collocation') {
    if (collocationIndex < currentCollocationUnit.items.length - 1) {
      collocationIndex += 1;
      renderFlashcard();
      return;
    }
    markCollocationUnitComplete();
    return;
  }
  if (flashIndex < flashWords.length - 1) {
    flashIndex += 1;
    renderFlashcard();
  }
}

function prevFlash() {
  if (flashMode === 'collocation') {
    if (collocationIndex > 0) {
      collocationIndex -= 1;
      renderFlashcard();
    }
    return;
  }
  if (flashIndex > 0) {
    flashIndex -= 1;
    renderFlashcard();
  }
}

async function markCollocationUnitComplete() {
  if (!currentCollocationUnit) return;
  const key = currentCollocationUnit.unit;
  collocationProgress[key] = {
    title: currentCollocationUnit.title,
    completed_at: new Date().toISOString(),
    items: currentCollocationUnit.items.length,
  };
  if (typeof VividDB !== 'undefined' && typeof VividDB.markCollocationUnitCompleted === 'function') {
    await VividDB.markCollocationUnitCompleted(currentCollocationUnit.unit, currentCollocationUnit.title);
  }
  renderCollocationUnits();
  updateProgressBadges();
  if (typeof VividDB !== 'undefined' && typeof VividDB.showSavedToast === 'function') {
    VividDB.showSavedToast('✓ Collocation unit saved');
  }
}

function toggleFlashcardFace() {
  document.getElementById('flashcardInner').classList.toggle('flipped');
}

document.getElementById('startFlashcards').addEventListener('click', () => {
  flashMode = 'reading';
  flashWords = [...currentUnit.words];
  flashIndex = 0;
  showView('flashcardView');
  renderFlashcard();
});

document.getElementById('backFromFlashcards').addEventListener('click', () => {
  if (flashMode === 'collocation') {
    showView('collocationUnitView');
  } else {
    showView('unitDetailView');
  }
});

document.getElementById('flashcard').addEventListener('click', (e) => {
  if (e.target.closest('.pronounce-btn')) return;
  toggleFlashcardFace();
});
document.getElementById('pronounceBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const text = flashMode === 'collocation' && currentCollocationUnit?.items?.[collocationIndex]?.english
    ? currentCollocationUnit.items[collocationIndex].english
    : flashWords[flashIndex]?.word;
  speak(text || '');
});
document.getElementById('flipFlashcard').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFlashcardFace();
});
document.getElementById('flashNext').addEventListener('click', nextFlash);
document.getElementById('flashPrev').addEventListener('click', prevFlash);
document.getElementById('flashKnow').addEventListener('click', () => {
  markLearned(flashWords[flashIndex].id);
  nextFlash();
});
document.getElementById('flashReview').addEventListener('click', () => {
  unmarkLearned(flashWords[flashIndex].id);
  nextFlash();
});
document.getElementById('markCollocationDone').addEventListener('click', () => {
  markCollocationUnitComplete();
  nextFlash();
});

// ===================== TEST (MCQ) =====================
let testQuestions = [];
let testIndex = 0;
let testScore = 0;

document.getElementById('startTest').addEventListener('click', () => {
  buildTest(currentUnit.words);
  showView('testView');
  document.getElementById('testWrap').hidden = false;
  document.getElementById('testResult').hidden = true;
  renderQuestion();
});
document.getElementById('backFromTest').addEventListener('click', () => showView('unitDetailView'));
document.getElementById('backFromResult').addEventListener('click', () => showView('unitDetailView'));
document.getElementById('retakeTest').addEventListener('click', () => {
  buildTest(currentUnit.words);
  document.getElementById('testWrap').hidden = false;
  document.getElementById('testResult').hidden = true;
  renderQuestion();
});

function buildTest(words) {
  const pool = shuffle([...words]).slice(0, Math.min(10, words.length));
  testQuestions = pool.map((w) => {
    const distractors = shuffle(words.filter((x) => x.id !== w.id)).slice(0, 3).map((x) => x.translation);
    const options = shuffle([w.translation, ...distractors]);
    return { word: w.word, answer: w.translation, options };
  });
  testIndex = 0;
  testScore = 0;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuestion() {
  const q = testQuestions[testIndex];
  document.getElementById('testProgress').textContent = `Question ${testIndex + 1} / ${testQuestions.length}`;
  document.getElementById('testQuestion').textContent = `What does "${q.word}" mean?`;
  const optionsEl = document.getElementById('testOptions');
  optionsEl.innerHTML = q.options.map((opt) => `<button class="test-option">${opt}</button>`).join('');
  optionsEl.querySelectorAll('.test-option').forEach((btn) => {
    btn.addEventListener('click', () => selectAnswer(btn, q));
  });
}

function selectAnswer(btn, q) {
  const optionsEl = document.getElementById('testOptions');
  optionsEl.querySelectorAll('.test-option').forEach((b) => b.disabled = true);
  const correct = btn.textContent === q.answer;
  btn.classList.add(correct ? 'correct' : 'incorrect');
  if (!correct) {
    [...optionsEl.children].find((b) => b.textContent === q.answer)?.classList.add('correct');
  } else {
    testScore++;
  }
  setTimeout(() => {
    testIndex++;
    if (testIndex < testQuestions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }, 700);
}

function showResult() {
  document.getElementById('testWrap').hidden = true;
  document.getElementById('testResult').hidden = false;
  const pct = Math.round((testScore / testQuestions.length) * 100);
  document.getElementById('testScoreTitle').textContent =
    pct >= 80 ? 'Excellent work! 🎉' : pct >= 50 ? 'Good progress!' : 'Keep practicing!';
  document.getElementById('testScoreText').textContent = `You got ${testScore}/${testQuestions.length} correct (${pct}%).`;
}

// ===================== EVENT WIRING =====================
document.querySelectorAll('.vocab-mode-card').forEach((card) => {
  card.addEventListener('click', async () => {
    const mode = card.dataset.mode;
    // Check if user is trying to access premium collocations without premium access
    if (mode === 'collocations') {
      if (typeof isPremium === 'function') {
        const premium = await isPremium();
        if (!premium) {
          showPremiumModal();
          return;
        }
      }
    }
    selectLibraryMode(mode);
  });
});

document.getElementById('backToLanding').addEventListener('click', () => showView('landingView'));
document.getElementById('backToLandingFromCollocations').addEventListener('click', () => showView('landingView'));

document.getElementById('backToUnits').addEventListener('click', () => {
  showView('unitGridView');
  updateProgressBadges();
});

function openCollocationUnit(unitNum) {
  currentCollocationUnit = collocationUnits.find((u) => u.unit === unitNum);
  if (!currentCollocationUnit) return;
  collocationIndex = 0;
  flashMode = 'collocation';
  showView('flashcardView');
  renderFlashcard();
}

loadVocabularyData();

// ===================== SEARCH =====================
const vocabSearch = document.getElementById('vocabSearch');
let searchDebounce;
vocabSearch.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    const q = vocabSearch.value.trim().toLowerCase();
    if (!q) { showView('unitGridView'); return; }
    const results = ALL_WORDS.filter((w) =>
      w.word.toLowerCase().includes(q) ||
      w.translation.toLowerCase().includes(q) ||
      w.definition.toLowerCase().includes(q)
    ).slice(0, 100);
    renderWordTable(results, document.getElementById('searchResults'));
    showView('searchView');
  }, 200);
});
document.getElementById('clearSearch').addEventListener('click', (e) => {
  e.preventDefault();
  vocabSearch.value = '';
  showView('unitGridView');
});

// ===================== INIT =====================
loadWords();