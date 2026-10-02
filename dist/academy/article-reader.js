/* Expects a global ARTICLE_WORDS = [{word, def}, ...] (20 B2/C1 words) defined
   in the article HTML file before this script, and an element with id
   "articleBody" wrapping the readable paragraphs. */

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===================== DARK / LIGHT + FONT SIZE ===================== */
(function initTopControls() {
  const darkBtn = document.getElementById('aDarkToggle');
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      darkBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    });
  }
  let fontStep = 0;
  const body = document.getElementById('articleBody');
  const applyFont = () => { if (body) body.style.fontSize = (1.08 + fontStep * 0.12) + 'rem'; };
  const dec = document.getElementById('aFontDec');
  const inc = document.getElementById('aFontInc');
  if (dec) dec.addEventListener('click', () => { fontStep = Math.max(-2, fontStep - 1); applyFont(); });
  if (inc) inc.addEventListener('click', () => { fontStep = Math.min(3, fontStep + 1); applyFont(); });
})();

/* ===================== HIGHLIGHT ===================== */
(function initHighlight() {
  const popup = document.getElementById('aHighlightPopup');
  const body = document.getElementById('articleBody');
  if (!popup || !body) return;
  let lastRange = null;

  function handleSelection(e) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim() === '') { popup.classList.remove('visible'); return; }
    const range = sel.getRangeAt(0);
    if (!body.contains(range.commonAncestorContainer)) { popup.classList.remove('visible'); return; }
    lastRange = range.cloneRange();
    const rect = range.getBoundingClientRect();
    popup.style.left = (rect.left + rect.width / 2 - 70 + window.scrollX) + 'px';
    popup.style.top = (rect.top - 46 + window.scrollY) + 'px';
    popup.classList.add('visible');
  }
  body.addEventListener('mouseup', handleSelection);

  document.getElementById('aHpHighlight').addEventListener('click', () => {
    if (!lastRange) return;
    const mark = document.createElement('mark');
    mark.className = 'user-highlight';
    try { lastRange.surroundContents(mark); }
    catch (e) { try { mark.appendChild(lastRange.extractContents()); lastRange.insertNode(mark); } catch (e2) {} }
    window.getSelection().removeAllRanges();
    popup.classList.remove('visible');
  });
  document.getElementById('aHpRemove').addEventListener('click', () => {
    document.querySelectorAll('.user-highlight').forEach((m) => {
      const parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
    popup.classList.remove('visible');
  });
  document.getElementById('aHpClose').addEventListener('click', () => popup.classList.remove('visible'));
})();

/* ===================== NOTES PANEL ===================== */
(function initNotes() {
  const btn = document.getElementById('aNotesBtn');
  const panel = document.getElementById('aNotesPanel');
  const area = document.getElementById('aNotesArea');
  if (!btn || !panel || !area) return;
  const key = 'article_notes_' + (document.body.dataset.articleId || 'default');
  try { area.value = localStorage.getItem(key) || ''; } catch (e) {}
  area.addEventListener('input', () => { try { localStorage.setItem(key, area.value); } catch (e) {} });
  btn.addEventListener('click', () => panel.classList.toggle('open'));
  document.getElementById('aNotesClose').addEventListener('click', () => panel.classList.remove('open'));
})();

/* ===================== DOUBLE-CLICK DICTIONARY LOOKUP ===================== */
(function initDictionary() {
  const body = document.getElementById('articleBody');
  const popup = document.getElementById('dictPopup');
  if (!body || !popup) return;

  body.addEventListener('dblclick', async (e) => {
    const sel = window.getSelection();
    const raw = sel.toString().trim();
    const word = raw.replace(/[^a-zA-Z'-]/g, '');
    if (!word) return;

    popup.style.left = (e.pageX + 12) + 'px';
    popup.style.top = (e.pageY + 12) + 'px';
    popup.classList.add('visible');
    popup.innerHTML = '<p class="dict-loading">Looking up "' + word + '"...</p>';

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const entry = data[0];
      const meaning = entry.meanings && entry.meanings[0];
      const def = meaning?.definitions?.[0]?.definition || 'No definition available.';
      const pos = meaning?.partOfSpeech || '';
      const phon = entry.phonetic || (entry.phonetics || []).find((p) => p.text)?.text || '';
      popup.innerHTML = `
        <p class="dict-word">${entry.word}</p>
        ${phon ? `<p class="dict-phonetic">${phon}</p>` : ''}
        ${pos ? `<span class="dict-pos">${pos}</span>` : ''}
        <p class="dict-def">${def}</p>
        <p class="dict-hint">Double-click any word for a quick definition.</p>`;
    } catch (err) {
      popup.innerHTML = `
        <p class="dict-word">${word}</p>
        <p class="dict-error">No definition found (or you're offline). Try a simpler word form.</p>`;
    }
  });

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && e.target !== popup) {
      // keep open on the same dblclick target; close on any other click
      if (!body.contains(e.target) || e.detail < 2) popup.classList.remove('visible');
    }
  });
})();

/* ===================== VOCAB TEST + COMPLETION ===================== */
function getArticleMeta() {
  const title = document.querySelector('.a-title')?.textContent?.trim() || document.title.replace(' — VIVID IELTS Article', '');
  const id = document.body.dataset.articleId || location.pathname.split('/').pop().replace('.html', '');
  return { id, title };
}

async function saveArticleCompletion() {
  const meta = getArticleMeta();
  if (typeof VividDB === 'undefined') return;
  const existing = (await VividDB.loadUserState('article_progress', [])) || [];
  const next = existing.filter((item) => item.articleId !== meta.id);
  next.push({ articleId: meta.id, title: meta.title, completed_at: new Date().toISOString(), category: 'article' });
  await VividDB.saveUserState('article_progress', next);
  VividDB.showSavedToast('✓ Article saved');
}

const finishBtn = document.getElementById('aFinishBtn') || document.getElementById('aStartTestBtn');
if (finishBtn) finishBtn.addEventListener('click', startArticleVocabTest);

function startArticleVocabTest() {
  const source = (typeof ARTICLE_WORDS !== 'undefined' && ARTICLE_WORDS.length) ? ARTICLE_WORDS : [];
  const words = shuffleArr(source).slice(0, 20);
  let vIndex = 0, vScore = 0;

  const overlay = document.createElement('div');
  overlay.id = 'aVocabOverlay';
  document.body.appendChild(overlay);
  render();

  function render() {
    if (vIndex >= words.length) { overlay.remove(); showComplete(vScore, words.length); return; }
    const w = words[vIndex];
    const distractors = shuffleArr(words.filter((x) => x.word !== w.word)).slice(0, 3).map((x) => x.def);
    const options = shuffleArr([w.def, ...distractors]);
    overlay.innerHTML = `
      <div class="a-vocab-card">
        <p class="a-vocab-progress">WORD ${vIndex + 1} / ${words.length}</p>
        <h2>${w.word}</h2>
        <p class="a-vocab-sub">Choose the correct meaning:</p>
        <div class="a-vocab-options">
          ${options.map((o) => `<button class="a-vocab-option">${o}</button>`).join('')}
        </div>
      </div>`;
    overlay.querySelectorAll('.a-vocab-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.a-vocab-option').forEach((b) => (b.disabled = true));
        const correct = btn.textContent === w.def;
        btn.classList.add(correct ? 'correct' : 'incorrect');
        if (!correct) {
          [...overlay.querySelectorAll('.a-vocab-option')].find((b) => b.textContent === w.def)?.classList.add('correct');
        } else vScore++;
        setTimeout(() => { vIndex++; render(); }, 700);
      });
    });
  }
}

async function showComplete(score, total) {
  const pct = Math.round((score / total) * 100);
  await saveArticleCompletion();
  const overlay = document.createElement('div');
  overlay.id = 'aCompleteOverlay';
  overlay.innerHTML = `
    <div class="a-complete-card">
      <h2>${pct >= 80 ? 'Excellent work! 🎉' : pct >= 50 ? 'Good progress!' : 'Keep practising!'}</h2>
      <div class="a-complete-score">${score}/${total}</div>
      <p>You've finished the article and its vocabulary test.</p>
      <div class="a-complete-actions">
        <a href="reading.html">Back to Reading</a>
        <button class="secondary" id="aRetakeVocab">Retake vocabulary test</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('aRetakeVocab').addEventListener('click', () => {
    overlay.remove();
    startArticleVocabTest();
  });
}