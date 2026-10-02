/* ============================================================
   AVAZBEK READER BOOSTER — shared engine
   ============================================================ */
const ARB_KEY = 'arb_progress_v1';

/* ---------------- Progress store ---------------- */
function arbLoad() {
  try {
    const raw = localStorage.getItem(ARB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { items: {} };
}
function arbSave(state) {
  try { localStorage.setItem(ARB_KEY, JSON.stringify(state)); } catch (e) {}
}
function arbGetItem(id) {
  const st = arbLoad();
  return st.items[id] || { quiz: false, vocab: false, score: null };
}
function arbSetItem(id, patch) {
  const st = arbLoad();
  st.items[id] = Object.assign({ quiz: false, vocab: false, score: null }, st.items[id] || {}, patch);
  arbSave(st);
  return st.items[id];
}
function arbIsComplete(id) {
  const it = arbGetItem(id);
  return !!(it.quiz && it.vocab);
}
/* order = array of {id, mock:bool} in the sequence they must be unlocked */
function arbIsUnlocked(order, id) {
  const idx = order.findIndex(o => o.id === id);
  if (idx <= 0) return true;
  return arbIsComplete(order[idx - 1].id);
}
function arbCountDone(order) {
  return order.filter(o => arbIsComplete(o.id)).length;
}

/* ---------------- Section navigation ---------------- */
function arbGo(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------- Text-to-speech article player ---------------- */
function ArbPlayer(blockSelector, opts) {
  opts = opts || {};
  const blocks = Array.from(document.querySelectorAll(blockSelector));
  let idx = 0, playing = false, rate = 1;
  const playBtn = document.getElementById(opts.playBtnId || 'playBtn');
  const stopBtn = document.getElementById(opts.stopBtnId || 'stopBtn');
  const plTitle = document.getElementById(opts.titleId || 'plTitle');
  const plSub = document.getElementById(opts.subId || 'plSub');
  const rateSel = document.getElementById(opts.rateId || 'rateSelect');

  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /en-US/i.test(v.lang) && /female|Samantha|Zira|Aria/i.test(v.name))
      || voices.find(v => /en-US/i.test(v.lang))
      || voices.find(v => /^en/i.test(v.lang))
      || voices[0];
  }
  function speakBlock() {
    if (idx >= blocks.length) { stop(); return; }
    blocks.forEach(b => b.classList.remove('speaking'));
    const b = blocks[idx];
    b.classList.add('speaking');
    b.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const u = new SpeechSynthesisUtterance(b.textContent);
    u.rate = rate; u.pitch = 1; u.lang = 'en-US';
    const v = pickVoice(); if (v) u.voice = v;
    u.onend = () => { idx++; if (playing) speakBlock(); };
    speechSynthesis.speak(u);
  }
  function play() {
    if (!blocks.length) return;
    playing = true;
    playBtn.innerHTML = '&#10074;&#10074;';
    plTitle.textContent = 'Playing…';
    plSub.textContent = 'Tap pause to stop reading';
    speakBlock();
  }
  function pause() {
    playing = false;
    speechSynthesis.cancel();
    playBtn.innerHTML = '&#9654;';
    plTitle.textContent = 'Paused';
    plSub.textContent = 'Tap play to resume';
  }
  function stop() {
    playing = false;
    speechSynthesis.cancel();
    blocks.forEach(b => b.classList.remove('speaking'));
    idx = 0;
    playBtn.innerHTML = '&#9654;';
    plTitle.textContent = 'Listen to the article';
    plSub.textContent = 'American accent · tap play to start';
  }
  if (playBtn) playBtn.onclick = () => (playing ? pause() : play());
  if (stopBtn) stopBtn.onclick = stop;
  if (rateSel) rateSel.onchange = () => { rate = parseFloat(rateSel.value); };
  window.addEventListener('beforeunload', () => speechSynthesis.cancel());
  return { play, pause, stop };
}

/* ---------------- Vocab popup ---------------- */
function ArbVocabPopup(vocabData, opts) {
  opts = opts || {};
  const pop = document.getElementById(opts.popId || 'vocabPop');
  if (!pop) return;
  document.querySelectorAll('.vocab[data-w]').forEach(span => {
    span.addEventListener('click', () => {
      const w = vocabData[parseInt(span.dataset.w, 10)];
      if (!w) return;
      pop.querySelector('.vp-word').textContent = w.word;
      pop.querySelector('.vp-pos').textContent = w.pos || '';
      pop.querySelector('.vp-def').innerHTML = w.def + (w.uz ? ' — <span class="vp-uz">' + w.uz + '</span>' : '');
      pop.querySelector('.vp-ex').textContent = w.example || '';
      pop.classList.add('open');
      pop.dataset.currentWord = w.word;
    });
  });
  const closeBtn = pop.querySelector('.vp-close');
  if (closeBtn) closeBtn.onclick = () => pop.classList.remove('open');
  const sayBtn = pop.querySelector('.vp-say');
  if (sayBtn) sayBtn.onclick = () => {
    const word = pop.dataset.currentWord;
    if (!word) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    speechSynthesis.speak(u);
  };
}

/* ---------------- Timer ---------------- */
function ArbTimer(opts) {
  opts = opts || {};
  let total = (opts.minutes || 20) * 60, left = total, interval = null;
  const disp = document.getElementById(opts.dispId || 'timerDisplay');
  const banner = document.getElementById(opts.bannerId || 'timeupBanner');
  function fmt() {
    const m = Math.floor(left / 60), s = left % 60;
    disp.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    disp.classList.toggle('low', left <= 120);
  }
  function set() {
    const m = parseInt(document.getElementById(opts.minId || 'tMin').value, 10) || 0;
    const s = parseInt(document.getElementById(opts.secId || 'tSec').value, 10) || 0;
    total = m * 60 + s; left = total;
    if (banner) banner.style.display = 'none';
    fmt();
  }
  function start() {
    if (interval) return;
    interval = setInterval(() => {
      if (left > 0) { left--; fmt(); }
      else { clearInterval(interval); interval = null; if (banner) banner.style.display = 'block'; }
    }, 1000);
  }
  function pause() { clearInterval(interval); interval = null; }
  function reset() { pause(); left = total; if (banner) banner.style.display = 'none'; fmt(); }
  fmt();
  return { set, start, pause, reset };
}

/* ---------------- Highlighter ---------------- */
function ArbHighlighter(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const handler = () => {
      const sel = window.getSelection();
      if (sel.isCollapsed || !sel.toString().trim()) return;
      const range = sel.getRangeAt(0);
      const parent = range.commonAncestorContainer.nodeType === 3 ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer;
      if (parent.closest('input, select, button, .timer-bar')) return;
      const mark = document.createElement('mark');
      mark.className = 'user-hl';
      mark.title = 'Tap to remove';
      try { range.surroundContents(mark); } catch (e) {}
      sel.removeAllRanges();
    };
    el.addEventListener('mouseup', handler);
    el.addEventListener('touchend', handler);
  });
  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('user-hl')) {
      const m = e.target, frag = document.createDocumentFragment();
      while (m.firstChild) frag.appendChild(m.firstChild);
      m.replaceWith(frag);
    }
  });
}

/* ---------------- Quiz grading ----------------
   quizData: array of { id, type:'text'|'radio'|'checkbox', answer: string|string[] }
   Renders feedback classes on .q-block[data-q=id] and computes score.
*/
function ArbGradeQuiz(quizData, opts) {
  opts = opts || {};
  let correct = 0;
  quizData.forEach(q => {
    const block = document.querySelector('.q-block[data-q="' + q.id + '"]');
    if (!block) return;
    let userVal = '';
    let ok = false;
    if (q.type === 'text') {
      const inp = block.querySelector('input[type=text]');
      userVal = (inp.value || '').trim().toLowerCase();
      const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
      ok = accepted.some(a => a.toLowerCase() === userVal);
    } else if (q.type === 'radio') {
      const checked = block.querySelector('input[type=radio]:checked');
      userVal = checked ? checked.value : '';
      ok = userVal === q.answer;
    } else if (q.type === 'checkbox') {
      const checked = Array.from(block.querySelectorAll('input[type=checkbox]:checked')).map(c => c.value).sort();
      const answer = (Array.isArray(q.answer) ? q.answer.slice() : [q.answer]).sort();
      ok = JSON.stringify(checked) === JSON.stringify(answer);
    }
    block.classList.remove('correct', 'wrong');
    block.classList.add(ok ? 'correct' : 'wrong');
    let fb = block.querySelector('.q-feedback');
    if (!fb) { fb = document.createElement('div'); fb.className = 'q-feedback'; block.appendChild(fb); }
    const answerText = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
    fb.textContent = ok ? 'Correct' : ('Correct answer: ' + answerText);
    fb.className = 'q-feedback ' + (ok ? 'ok' : 'no');
    if (ok) correct++;
  });
  const banner = document.getElementById(opts.bannerId || 'scoreBanner');
  if (banner) {
    banner.classList.add('show');
    banner.innerHTML = '<div class="big">' + correct + ' / ' + quizData.length + '</div><div style="color:var(--muted);font-size:.85rem;margin-top:4px">questions answered correctly</div>';
  }
  return correct;
}

/* ---------------- Flashcards ---------------- */
function ArbFlashcards(vocabData, opts) {
  opts = opts || {};
  let deck = vocabData.map((w, i) => i);
  let pos = 0, known = 0, round = 1, flipped = false;
  const card = document.getElementById(opts.cardId || 'fcCard');
  const status = document.getElementById(opts.statusId || 'fcStatus');
  const stage = document.getElementById(opts.stageId || 'fcStage');
  const doneEl = document.getElementById(opts.doneId || 'fcDone');
  function render() {
    if (pos >= deck.length) { finishRound(); return; }
    if (stage) stage.style.display = '';
    if (doneEl) doneEl.classList.remove('show');
    const w = vocabData[deck[pos]];
    flipped = false;
    card.innerHTML = '<div class="fc-word">' + w.word + '</div><div class="fc-hint">tap to flip</div>';
    status.textContent = 'Round ' + round + ' · card ' + (pos + 1) + ' of ' + deck.length + ' · known: ' + known + '/' + vocabData.length;
  }
  function flip() {
    const w = vocabData[deck[pos]];
    flipped = !flipped;
    if (flipped) {
      card.innerHTML = '<div class="fc-def">' + w.def + '</div>' + (w.uz ? '<div class="fc-uz">' + w.uz + '</div>' : '');
    } else {
      card.innerHTML = '<div class="fc-word">' + w.word + '</div><div class="fc-hint">tap to flip</div>';
    }
  }
  function markKnown(isKnown) {
    if (isKnown) known++;
    else deck.push(deck[pos]);
    pos++;
    render();
  }
  function finishRound() {
    if (stage) stage.style.display = 'none';
    if (doneEl) {
      doneEl.classList.add('show');
      if (known >= vocabData.length) {
        doneEl.innerHTML = '<div class="big">🎉</div><h3>All words mastered!</h3><p style="color:var(--muted)">You know all ' + vocabData.length + ' words in this list.</p>';
        if (opts.onComplete) opts.onComplete();
      } else {
        doneEl.innerHTML = '<div class="big">🔁</div><h3>Round finished</h3><p style="color:var(--muted)">' + known + '/' + vocabData.length + ' known. Reviewing the rest…</p><button class="btn btn-gold" onclick="(' + opts.restartFnName + ')()">Continue</button>';
      }
    }
  }
  render();
  if (card) card.onclick = flip;
  return {
    know: () => markKnown(true),
    review: () => markKnown(false),
    restart: () => { deck = vocabData.map((w, i) => i).filter((_, i) => true); pos = 0; round++; render(); },
    getKnown: () => known,
    isComplete: () => known >= vocabData.length
  };
}

/* ---------------- Speak with Vocab (pronunciation practice) ---------------- */
function ArbSpeakPractice(vocabData, opts) {
  opts = opts || {};
  const wrap = document.getElementById(opts.wrapId || 'spWrap');
  if (!wrap) return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    wrap.innerHTML = '<div class="sp-unsupported">🎤 Speech recognition is not supported in this browser. Try Chrome or Edge on desktop or Android.</div>';
    return null;
  }
  let pos = 0, correctCount = 0;
  const recog = new SR();
  recog.lang = 'en-US';
  recog.interimResults = false;
  recog.maxAlternatives = 3;

  function clean(s) { return (s || '').toLowerCase().replace(/[^a-z ]/g, '').trim(); }

  function render() {
    const w = vocabData[pos];
    wrap.innerHTML =
      '<div class="sp-status">Word ' + (pos + 1) + ' of ' + vocabData.length + ' &middot; correct: ' + correctCount + '</div>' +
      '<div class="sp-card">' +
        '<div class="sp-word">' + w.word + '</div>' +
        '<div class="sp-def">' + w.def + '</div>' +
        '<button class="sp-mic" id="spMicBtn">&#127908;</button>' +
        '<div class="sp-hint">Tap the microphone and say the word aloud</div>' +
        '<div class="sp-feedback" id="spFeedback"></div>' +
        '<div class="sp-heard" id="spHeard"></div>' +
      '</div>' +
      '<div class="sp-nav">' +
        '<button class="btn" id="spListenBtn">&#128266; Hear it</button>' +
        '<button class="btn btn-gold" id="spNextBtn">Next word &rarr;</button>' +
      '</div>';
    document.getElementById('spMicBtn').onclick = startListening;
    document.getElementById('spListenBtn').onclick = () => arbSay(w.word);
    document.getElementById('spNextBtn').onclick = next;
  }
  function startListening() {
    const btn = document.getElementById('spMicBtn');
    const fb = document.getElementById('spFeedback');
    const heard = document.getElementById('spHeard');
    fb.textContent = ''; fb.className = 'sp-feedback'; heard.textContent = '';
    btn.classList.add('listening');
    try { recog.start(); } catch (e) {}
    recog.onresult = (ev) => {
      btn.classList.remove('listening');
      const said = ev.results[0][0].transcript;
      heard.textContent = 'Heard: "' + said + '"';
      const target = clean(vocabData[pos].word);
      const said_c = clean(said);
      const ok = said_c === target || said_c.includes(target) || target.includes(said_c);
      fb.textContent = ok ? '✓ Well pronounced!' : '✗ Try again';
      fb.className = 'sp-feedback ' + (ok ? 'ok' : 'no');
      if (ok) correctCount++;
    };
    recog.onerror = () => { btn.classList.remove('listening'); };
    recog.onend = () => { btn.classList.remove('listening'); };
  }
  function next() {
    pos++;
    if (pos >= vocabData.length) pos = 0;
    render();
  }
  render();
  return { getCorrectCount: () => correctCount };
}

/* ---------------- Word list renderer ---------------- */
function ArbRenderWordList(vocabData, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = vocabData.map(w =>
    '<div class="wordlist-item"><div class="wl-left"><span class="w">' + w.word + '</span><span class="pos">' + (w.pos || '') + '</span>' +
    '<div class="def">' + w.def + '</div>' + (w.uz ? '<div class="uz">' + w.uz + '</div>' : '') + '</div>' +
    '<button class="wl-say" onclick="arbSay(\'' + w.word.replace(/'/g, "\\'") + '\')">🔊</button></div>'
  ).join('');
}
function arbSay(word) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US';
  speechSynthesis.speak(u);
}
