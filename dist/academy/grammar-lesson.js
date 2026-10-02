function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function norm(s) {
  return s.toLowerCase().replace(/['’]/g, "'").replace(/\s+/g, ' ').trim();
}

const params = new URLSearchParams(window.location.search);
const tenseId = Number(params.get('tense')) || 1;
const tense = GRAMMAR_TENSES.find((t) => t.id === tenseId) || GRAMMAR_TENSES[0];

(async function init() {
  // Guard: block direct access to a locked tense (previous one not passed yet).
  if (typeof VividDB !== 'undefined' && tense.id > 1) {
    const progress = await VividDB.getGrammarProgress();
    const prevPassed = (progress[tense.id - 1] || {}).passed;
    if (!prevPassed) {
      window.location.href = 'grammar.html';
      return;
    }
  }
  renderExplanation();
})();

function renderExplanation() {
  document.getElementById('pageTitle').textContent = `${tense.name} — VIVID IELTS`;
  document.getElementById('lessonTenseLabel').textContent = `Tense ${tense.id} of 12`;
  document.getElementById('tenseEyebrow').textContent = `GRAMMAR · TENSE ${tense.id}/12`;
  document.getElementById('tenseName').textContent = tense.name;
  document.getElementById('tenseSubtitle').textContent = tense.subtitle;

  document.getElementById('tenseStructure').innerHTML = `
    <div class="structure-row"><span class="structure-label">Affirmative</span><span class="structure-value">${tense.structure.pos}</span></div>
    <div class="structure-row"><span class="structure-label">Negative</span><span class="structure-value">${tense.structure.neg}</span></div>
    <div class="structure-row"><span class="structure-label">Question</span><span class="structure-value">${tense.structure.q}</span></div>
  `;

  document.getElementById('usageList').innerHTML = tense.usage.map((u) => `
    <div class="usage-item">
      <h4>${u.title}</h4>
      <p>${u.explain}</p>
      <p class="usage-example">“${u.example}”</p>
    </div>
  `).join('');

  document.getElementById('signalChips').innerHTML = tense.signalWords
    .map((w) => `<span class="signal-chip">${w}</span>`).join('');

  document.getElementById('mistakeList').innerHTML = tense.mistakes.map((m) => `
    <div class="mistake-item">
      <p class="mistake-wrong">✗ ${m.wrong}</p>
      <p class="mistake-right">✓ ${m.right}</p>
      <p class="mistake-note">${m.note}</p>
    </div>
  `).join('');
}

document.getElementById('toExercisesBtn').addEventListener('click', () => {
  document.getElementById('explainStep').hidden = true;
  document.getElementById('exerciseStep').hidden = false;
  renderExercises();
  window.scrollTo(0, 0);
});
document.getElementById('backToExplain').addEventListener('click', () => {
  document.getElementById('exerciseStep').hidden = true;
  document.getElementById('explainStep').hidden = false;
  window.scrollTo(0, 0);
});

function renderExercises() {
  const list = document.getElementById('exerciseList');
  list.innerHTML = tense.exercises.map((ex, i) => `
    <div class="exercise-row" data-index="${i}">
      <p class="exercise-prompt">${i + 1}. ${ex.prompt}</p>
      <div class="exercise-input-row">
        <input type="text" class="exercise-input" placeholder="Type your answer...">
        <button class="btn btn-outline exercise-check">Check</button>
      </div>
      <p class="exercise-feedback"></p>
    </div>
  `).join('');

  list.querySelectorAll('.exercise-row').forEach((row) => {
    const i = Number(row.dataset.index);
    const input = row.querySelector('.exercise-input');
    const btn = row.querySelector('.exercise-check');
    const feedback = row.querySelector('.exercise-feedback');
    btn.addEventListener('click', () => {
      const correctAnswers = tense.exercises[i].answer.split('/').map((a) => norm(a));
      const isCorrect = correctAnswers.includes(norm(input.value));
      feedback.textContent = isCorrect ? '✅ Correct!' : `Not quite — correct answer: ${tense.exercises[i].answer}`;
      feedback.className = 'exercise-feedback ' + (isCorrect ? 'correct' : 'incorrect');
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
  });
}

document.getElementById('toTestBtn').addEventListener('click', () => {
  document.getElementById('exerciseStep').hidden = true;
  document.getElementById('testStep').hidden = false;
  startTest();
  window.scrollTo(0, 0);
});

// ===================== TEST =====================
let testQuestions = [];
let testIndex = 0;
let testScore = 0;

function startTest() {
  testQuestions = shuffleArr(tense.test);
  testIndex = 0;
  testScore = 0;
  renderQuestion();
}

function renderQuestion() {
  const q = testQuestions[testIndex];
  document.getElementById('grammarTestProgress').textContent = `Question ${testIndex + 1} / ${testQuestions.length}`;
  document.getElementById('grammarTestQuestion').textContent = q.q;

  // Keep option order stable relative to the correct index (don't reshuffle —
  // options are already meaningfully ordered in the data).
  const optionsEl = document.getElementById('grammarTestOptions');
  optionsEl.innerHTML = q.options.map((opt) => `<button class="test-option">${opt}</button>`).join('');
  optionsEl.querySelectorAll('.test-option').forEach((btn, idx) => {
    btn.addEventListener('click', () => selectAnswer(btn, idx, q));
  });
}

function selectAnswer(btn, idx, q) {
  const optionsEl = document.getElementById('grammarTestOptions');
  optionsEl.querySelectorAll('.test-option').forEach((b) => (b.disabled = true));
  const correct = idx === q.correct;
  btn.classList.add(correct ? 'correct' : 'incorrect');
  if (!correct) {
    optionsEl.children[q.correct].classList.add('correct');
  } else {
    testScore++;
  }
  setTimeout(() => {
    testIndex++;
    if (testIndex < testQuestions.length) renderQuestion();
    else finishTest();
  }, 700);
}

async function finishTest() {
  document.getElementById('testStep').hidden = true;
  document.getElementById('resultStep').hidden = false;

  const total = testQuestions.length;
  const pct = Math.round((testScore / total) * 100);
  const passed = pct >= 70;

  let saved = { passed };
  if (typeof VividDB !== 'undefined') {
    saved = await VividDB.saveGrammarResult(tense.id, testScore, total);
    VividDB.showSavedToast('✓ Result saved');
  }

  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const continueBtn = document.getElementById('continueBtn');

  if (saved.passed) {
    resultTitle.textContent = `Passed! 🎉 ${testScore}/${total}`;
    const next = GRAMMAR_TENSES.find((t) => t.id === tense.id + 1);
    if (next) {
      resultText.textContent = `Great work — you scored ${pct}%. "${next.name}" is now unlocked.`;
      continueBtn.textContent = `Start "${next.name}" →`;
      continueBtn.href = `grammar-lesson.html?tense=${next.id}`;
    } else {
      resultText.textContent = `Amazing — you scored ${pct}% and have completed all 12 tenses!`;
      continueBtn.textContent = 'Back to Grammar Hub';
      continueBtn.href = 'grammar.html';
    }
  } else {
    resultTitle.textContent = `${testScore}/${total} — not quite there yet`;
    resultText.textContent = `You need at least 70% (11/15) to unlock the next tense. Review the explanation and try again.`;
    continueBtn.textContent = 'Back to Grammar Hub';
    continueBtn.href = 'grammar.html';
  }
}

document.getElementById('retakeBtn').addEventListener('click', () => {
  document.getElementById('resultStep').hidden = true;
  document.getElementById('testStep').hidden = false;
  startTest();
});