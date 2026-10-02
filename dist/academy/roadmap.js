/* ===================== VIVID IELTS — Roadmap 2027 ===================== */
(function () {
  /* =====================================================================
     PART 0 — shared date helpers
  ===================================================================== */
  const MS_DAY = 86400000;
  const START_DATE = '2026-09-12';
  const END_DATE = '2027-01-01';

  function todayISO() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return isoOf(d);
  }
  // IMPORTANT: never use d.toISOString() here — it converts to UTC first, which
  // silently rolls the date back by one day in any timezone ahead of UTC
  // (e.g. Tashkent, UTC+5). Format from local getFullYear/getMonth/getDate instead.
  function isoOf(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / MS_DAY);
  }
  function addDays(iso, n) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return isoOf(d);
  }
  const MONTHS_UZ = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
  const WEEKDAYS_UZ = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  function shortDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}`;
  }
  function longDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return `${WEEKDAYS_UZ[d.getDay()]}, ${d.getDate()}-${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`;
  }
  const TODAY = todayISO();

  /* =====================================================================
     PART 1 — checkpoint mountain (macro, every ~15 days) — unchanged logic,
     just rendered smaller in the new layout.
  ===================================================================== */
  const CHECKPOINTS = [
    { id: 'start', date: '2026-09-12', dateLabel: '12-sentyabr, 2026', shortLabel: '12-sen', title: 'Start — boshlang\u2018ich natija',
      expect: { ielts: 'hozirgi darajangiz', sat: 'hozirgi darajangiz', turkish: 'hozirgi daraja' } },
    { id: 'cp1', date: '2026-10-01', dateLabel: '1-oktyabr, 2026', shortLabel: '1-okt', title: 'Checkpoint 1',
      expect: { ielts: '\u2248 6.0', sat: '\u2248 950', turkish: 'A1' } },
    { id: 'cp2', date: '2026-10-15', dateLabel: '15-oktyabr, 2026', shortLabel: '15-okt', title: 'Checkpoint 2',
      expect: { ielts: '\u2248 6.5', sat: '\u2248 1000', turkish: 'A1\u2192A2' } },
    { id: 'cp3', date: '2026-11-01', dateLabel: '1-noyabr, 2026', shortLabel: '1-noy', title: 'Checkpoint 3',
      expect: { ielts: '\u2248 6.5', sat: '\u2248 1050', turkish: 'A2' } },
    { id: 'cp4', date: '2026-11-15', dateLabel: '15-noyabr, 2026', shortLabel: '15-noy', title: 'Checkpoint 4',
      expect: { ielts: '\u2248 7.0', sat: '\u2248 1100', turkish: 'A2' } },
    { id: 'cp5', date: '2026-12-01', dateLabel: '1-dekabr, 2026', shortLabel: '1-dek', title: 'Checkpoint 5',
      expect: { ielts: '\u2248 7.0', sat: '\u2248 1150', turkish: 'A2\u2192B1' } },
    { id: 'cp6', date: '2026-12-15', dateLabel: '15-dekabr, 2026', shortLabel: '15-dek', title: 'Checkpoint 6',
      expect: { ielts: '\u2248 7.5', sat: '\u2248 1200', turkish: 'B1' } },
    { id: 'cp7', date: '2026-12-30', dateLabel: '30-dekabr, 2026', shortLabel: '30-dek', title: 'Checkpoint 7',
      expect: { ielts: '\u2248 7.5', sat: '\u2248 1200', turkish: 'B1' } },
    { id: 'summit', date: '2027-01-01', dateLabel: '1-yanvar, 2027', shortLabel: '1-yan \u201927', title: 'CHO\u2018QQI \u2014 yakuniy maqsad',
      expect: { ielts: '7.5+', sat: '1200+', turkish: 'A2/B1' } },
  ];

  const GOALS = {
    ielts: { key: 'ielts', name: 'IELTS', icon: '\uD83C\uDFAF', color: '#ff5a5f', target: 7.5, baseline: 5.0, unit: '', fmt: (v) => Number(v).toFixed(1) },
    sat: { key: 'sat', name: 'SAT', icon: '\uD83D\uDCD8', color: '#7c5cfc', target: 1200, baseline: 900, unit: '', fmt: (v) => Math.round(v) },
    turkish: { key: 'turkish', name: 'Turkcha', icon: '\uD83C\uDDF9\uD83C\uDDF7', color: '#00c2d1', target: 'B1', targetLabel: 'A2 / B1', baseline: 'A0',
      order: ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'] },
  };

  const CP_STORAGE_KEY = 'roadmap_checkpoints_2027';
  let cpData = {};
  let activeCheckpointId = null;

  function cpHasData(id) {
    const d = cpData[id];
    return !!(d && (d.ielts !== undefined && d.ielts !== null && d.ielts !== '' ||
                     d.sat !== undefined && d.sat !== null && d.sat !== '' ||
                     d.turkish));
  }
  function cpStatus(cp) {
    if (cpHasData(cp.id)) return 'done';
    const isPast = daysBetween(TODAY, cp.date) < 0;
    if (isPast) return 'missed';
    const firstUpcoming = CHECKPOINTS.find((c) => !cpHasData(c.id) && daysBetween(TODAY, c.date) >= 0);
    return firstUpcoming && firstUpcoming.id === cp.id ? 'current' : 'future';
  }
  function formatCountdown() {
    const diff = daysBetween(TODAY, END_DATE);
    if (diff > 0) return `\u23F3 Cho'qqigacha ${diff} kun qoldi`;
    if (diff === 0) return `\uD83C\uDFC1 Bugun \u2014 yakuniy sana!`;
    return `\u2705 Muddat tugagan (${Math.abs(diff)} kun oldin)`;
  }

  async function loadCpData() {
    try {
      if (typeof VividDB !== 'undefined' && typeof VividDB.loadUserState === 'function') {
        cpData = (await VividDB.loadUserState(CP_STORAGE_KEY, {})) || {};
      }
    } catch (err) { console.error('Roadmap: cp load failed', err); cpData = {}; }
  }
  async function persistCpData() {
    try {
      if (typeof VividDB !== 'undefined' && typeof VividDB.saveUserState === 'function') {
        await VividDB.saveUserState(CP_STORAGE_KEY, cpData);
        if (typeof VividDB.showSavedToast === 'function') VividDB.showSavedToast('Checkpoint saqlandi');
      }
    } catch (err) { console.error('Roadmap: cp save failed', err); }
  }

  function renderCpMarkers() {
    CHECKPOINTS.forEach((cp) => {
      const g = document.getElementById(`marker-${cp.id}`);
      if (!g) return;
      const status = cpStatus(cp);
      g.classList.remove('rm-done', 'rm-missed', 'rm-current', 'rm-future');
      g.classList.add(`rm-${status}`);
      const oldCheck = g.querySelector('.rm-check');
      if (oldCheck) oldCheck.remove();
      if (status === 'done') {
        const circle = g.querySelector('circle.rm-dot');
        const cx = circle.getAttribute('cx'), cy = circle.getAttribute('cy');
        const check = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        check.setAttribute('x', cx);
        check.setAttribute('y', Number(cy) + 4.5);
        check.setAttribute('text-anchor', 'middle');
        check.setAttribute('class', 'rm-check');
        check.textContent = '\u2713';
        g.appendChild(check);
      }
    });
  }

  function renderCpTrailFill() {
    const path = document.getElementById('rmProgressPath');
    if (!path) return;
    const total = path.getTotalLength();
    const doneCount = CHECKPOINTS.reduce((acc, cp, idx) => {
      if (acc.broken) return acc;
      if (cpHasData(cp.id)) { acc.count = idx + 1; return acc; }
      acc.broken = true;
      return acc;
    }, { count: 0, broken: false }).count;
    const segments = CHECKPOINTS.length - 1;
    const fraction = segments > 0 ? Math.max(0, Math.min(1, (doneCount - 1) / segments)) : 0;
    path.style.strokeDasharray = String(total);
    path.style.strokeDashoffset = String(total * (1 - fraction));
  }

  function cpLatestValueFor(key) {
    for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
      const cp = CHECKPOINTS[i];
      const d = cpData[cp.id];
      if (d && d[key] !== undefined && d[key] !== null && d[key] !== '') return { value: d[key], atLabel: cp.shortLabel };
    }
    return null;
  }

  function renderSummaryCards() {
    const wrap = document.getElementById('goalSummaryCards');
    if (!wrap) return;
    const cards = Object.values(GOALS).map((goal) => {
      const latest = cpLatestValueFor(goal.key);
      let pct = 0, valueLabel = '\u2014', subLabel = 'Hali natija kiritilmagan';
      if (goal.key === 'turkish') {
        const order = goal.order;
        const baselineIdx = order.indexOf(goal.baseline);
        const targetIdx = order.indexOf(goal.target);
        if (latest) {
          const curIdx = order.indexOf(latest.value);
          pct = curIdx >= 0 ? Math.max(0, Math.min(1, (curIdx - baselineIdx) / (targetIdx - baselineIdx))) : 0;
          valueLabel = latest.value;
          subLabel = `${latest.atLabel} holatiga ko'ra`;
        }
      } else if (latest) {
        const v = Number(latest.value);
        pct = Math.max(0, Math.min(1, (v - goal.baseline) / (goal.target - goal.baseline)));
        valueLabel = goal.fmt(v);
        subLabel = `${latest.atLabel} holatiga ko'ra`;
      }
      const targetLabel = goal.targetLabel || (goal.key === 'ielts' ? '7.5+' : goal.key === 'sat' ? '1200+' : goal.target);
      return `
        <div class="goal-summary-card" style="--gc:${goal.color}">
          <div class="gsc-top">
            <span class="gsc-icon">${goal.icon}</span>
            <span class="gsc-name">${goal.name}</span>
            <span class="gsc-target">Maqsad: <strong>${targetLabel}</strong></span>
          </div>
          <div class="gsc-value">${valueLabel}</div>
          <div class="gsc-sub">${subLabel}</div>
          <div class="gsc-bar"><div class="gsc-bar-fill" style="width:${Math.round(pct * 100)}%"></div></div>
          <div class="gsc-pct">${Math.round(pct * 100)}% bosib o'tildi</div>
        </div>`;
    });
    wrap.innerHTML = cards.join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function openCheckpointModal(id) {
    const cp = CHECKPOINTS.find((c) => c.id === id);
    if (!cp) return;
    activeCheckpointId = id;
    const els = {
      modalOverlay: document.getElementById('rmModalOverlay'),
      modalTitle: document.getElementById('rmModalTitle'),
      modalSub: document.getElementById('rmModalSub'),
      modalNote: document.getElementById('rmModalNote'),
      expectIelts: document.getElementById('rmExpectIelts'),
      expectSat: document.getElementById('rmExpectSat'),
      expectTurkish: document.getElementById('rmExpectTurkish'),
      inputIelts: document.getElementById('rmInputIelts'),
      inputSat: document.getElementById('rmInputSat'),
      inputTurkish: document.getElementById('rmInputTurkish'),
      inputNote: document.getElementById('rmInputNote'),
    };
    els.modalTitle.textContent = cp.title;
    els.modalSub.textContent = cp.dateLabel;
    els.expectIelts.textContent = cp.expect.ielts ? `kutilgan: ${cp.expect.ielts}` : '';
    els.expectSat.textContent = cp.expect.sat ? `kutilgan: ${cp.expect.sat}` : '';
    els.expectTurkish.textContent = cp.expect.turkish ? `kutilgan: ${cp.expect.turkish}` : '';
    const status = cpStatus(cp);
    if (status === 'missed') {
      els.modalNote.hidden = false;
      els.modalNote.textContent = "\u26A0\uFE0F Bu checkpoint sanasi o'tib ketgan. Natijangizni hozir kiriting yoki bo'sh qoldiring.";
    } else els.modalNote.hidden = true;
    const d = cpData[id] || {};
    els.inputIelts.value = d.ielts ?? '';
    els.inputSat.value = d.sat ?? '';
    els.inputTurkish.value = d.turkish ?? '';
    els.inputNote.value = d.note ?? '';
    els.modalOverlay.classList.add('open');
  }
  function closeCheckpointModal() {
    const overlay = document.getElementById('rmModalOverlay');
    if (overlay) overlay.classList.remove('open');
    activeCheckpointId = null;
  }
  async function saveCheckpoint() {
    if (!activeCheckpointId) return;
    const inputIelts = document.getElementById('rmInputIelts');
    const inputSat = document.getElementById('rmInputSat');
    const inputTurkish = document.getElementById('rmInputTurkish');
    const inputNote = document.getElementById('rmInputNote');
    const saveBtn = document.getElementById('rmSaveBtn');
    const ielts = inputIelts.value !== '' ? Number(inputIelts.value) : '';
    const sat = inputSat.value !== '' ? Number(inputSat.value) : '';
    const turkish = inputTurkish.value || '';
    const note = inputNote.value.trim();
    cpData[activeCheckpointId] = { ielts, sat, turkish, note, savedAt: new Date().toISOString() };
    saveBtn.disabled = true; saveBtn.textContent = 'Saqlanmoqda...';
    await persistCpData();
    saveBtn.disabled = false; saveBtn.textContent = 'Saqlash';
    closeCheckpointModal();
    renderCheckpointSection();
  }

  // The mountain SVG has viewBox "0 0 1000 460" (aspect ratio 0.46). When the
  // card is expanded we must give the wrap exactly that height for the
  // rendered width, otherwise overflow:hidden silently crops the bottom of
  // the chart (the early/low checkpoints) — this fixes the "xarita to'liq
  // emas" (map isn't complete) bug.
  function syncMountainHeight() {
    const wrap = document.querySelector('.rm-svg-wrap');
    const card = document.getElementById('rmMountainCard');
    if (!wrap || !card) return;
    if (card.classList.contains('is-expanded')) {
      const w = Math.max(wrap.clientWidth, 640);
      wrap.style.height = Math.ceil(w * 0.46) + 'px';
    } else {
      wrap.style.height = '';
    }
  }

  function wireCheckpointEvents() {
    document.querySelectorAll('.rm-marker').forEach((g) => {
      g.addEventListener('click', () => openCheckpointModal(g.dataset.cp));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCheckpointModal(g.dataset.cp); }
      });
    });
    const modalClose = document.getElementById('rmModalClose');
    const cancelBtn = document.getElementById('rmCancelBtn');
    const modalOverlay = document.getElementById('rmModalOverlay');
    const saveBtn = document.getElementById('rmSaveBtn');
    const expandBtn = document.getElementById('rmExpandMiniBtn');
    if (modalClose) modalClose.addEventListener('click', closeCheckpointModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeCheckpointModal);
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeCheckpointModal(); });
    if (saveBtn) saveBtn.addEventListener('click', saveCheckpoint);
    if (expandBtn) expandBtn.addEventListener('click', () => {
      document.getElementById('rmMountainCard').classList.toggle('is-expanded');
      expandBtn.textContent = document.getElementById('rmMountainCard').classList.contains('is-expanded') ? 'Kichraytirish \u2191' : 'Kattalashtirish \u2193';
      syncMountainHeight();
    });
    window.addEventListener('resize', syncMountainHeight);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) closeCheckpointModal();
    });
  }

  function renderCheckpointSection() {
    const countdown = document.getElementById('roadmapCountdown');
    if (countdown) countdown.textContent = formatCountdown();
    renderCpMarkers();
    renderCpTrailFill();
    renderSummaryCards();
  }

  /* =====================================================================
     PART 2 — IndexedDB file store (for pdf/html/image/video attachments)
  ===================================================================== */
  const FILEDB_NAME = 'vivid_roadmap_files';
  const FILEDB_STORE = 'files';
  let filedbPromise = null;

  function openFileDb() {
    if (filedbPromise) return filedbPromise;
    filedbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('IndexedDB not supported')); return; }
      const req = indexedDB.open(FILEDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(FILEDB_STORE)) {
          const store = db.createObjectStore(FILEDB_STORE, { keyPath: 'id' });
          store.createIndex('day', 'day', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return filedbPromise;
  }
  async function fdbPut(record) {
    const db = await openFileDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILEDB_STORE, 'readwrite');
      tx.objectStore(FILEDB_STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function fdbGet(id) {
    const db = await openFileDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILEDB_STORE, 'readonly');
      const req = tx.objectStore(FILEDB_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  async function fdbDelete(id) {
    const db = await openFileDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILEDB_STORE, 'readwrite');
      tx.objectStore(FILEDB_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /* =====================================================================
     PART 3 — 113-day daily journal engine
  ===================================================================== */
  const DAY_STORAGE_KEY = 'roadmap_daily_journal_2027';
  const SEGMENT_SIZE = 15;
  const FILES_BUCKET = 'roadmap-files';
  let dayData = {}; // { [iso]: { entries: [{id,type:'text'|'file',text,name,mime,size,ts,url?,storagePath?}] } }
  let activeDayIso = null;

  // Build the full list of days between START_DATE and END_DATE inclusive.
  const ALL_DAYS = (function build() {
    const out = [];
    let cursor = START_DATE;
    let guard = 0;
    while (cursor <= END_DATE && guard < 500) {
      out.push(cursor);
      cursor = addDays(cursor, 1);
      guard++;
    }
    return out;
  })();

  // Chunk into 15-day segments.
  const SEGMENTS = (function chunk() {
    const out = [];
    for (let i = 0; i < ALL_DAYS.length; i += SEGMENT_SIZE) {
      out.push(ALL_DAYS.slice(i, i + SEGMENT_SIZE));
    }
    return out;
  })();

  function dayEntries(iso) {
    const d = dayData[iso];
    return (d && Array.isArray(d.entries)) ? d.entries : [];
  }
  function dayHasContent(iso) { return dayEntries(iso).length > 0; }
  function dayStatus(iso) {
    if (dayHasContent(iso)) return 'done';
    if (iso === TODAY) return 'current';
    if (iso < TODAY) return 'missed';
    return 'future';
  }

  async function loadDayData() {
    try {
      if (typeof VividDB !== 'undefined' && typeof VividDB.loadUserState === 'function') {
        dayData = (await VividDB.loadUserState(DAY_STORAGE_KEY, {})) || {};
      }
    } catch (err) { console.error('Roadmap: day load failed', err); dayData = {}; }
  }
  async function persistDayData(silent) {
    try {
      if (typeof VividDB !== 'undefined' && typeof VividDB.saveUserState === 'function') {
        await VividDB.saveUserState(DAY_STORAGE_KEY, dayData);
        if (!silent && typeof VividDB.showSavedToast === 'function') VividDB.showSavedToast('Saqlandi');
      }
    } catch (err) { console.error('Roadmap: day save failed', err); }
  }

  function overallStats() {
    let done = 0, missed = 0;
    ALL_DAYS.forEach((iso) => {
      const s = dayStatus(iso);
      if (s === 'done') done++;
      else if (s === 'missed') missed++;
    });
    return { done, missed, total: ALL_DAYS.length, pct: Math.round((done / ALL_DAYS.length) * 100) };
  }

  /* ---------- rendering: overall daily progress strip ---------- */
  function renderDailyOverview() {
    const el = document.getElementById('dailyOverviewStats');
    if (!el) return;
    const s = overallStats();
    const diff = daysBetween(TODAY, END_DATE);
    el.innerHTML = `
      <div class="dov-item"><span class="dov-num">${s.done}</span><span class="dov-label">kun to'ldirilgan</span></div>
      <div class="dov-item"><span class="dov-num">${s.missed}</span><span class="dov-label">bo'sh o'tib ketgan</span></div>
      <div class="dov-item"><span class="dov-num">${diff > 0 ? diff : 0}</span><span class="dov-label">kun qoldi</span></div>
      <div class="dov-bar-wrap"><div class="dov-bar"><div class="dov-bar-fill" style="width:${s.pct}%"></div></div><span class="dov-pct">${s.pct}%</span></div>
    `;
  }

  /* ---------- rendering: 15-day segments ---------- */
  const STATUS_META = {
    done: { label: 'Bajarildi', dot: '#22c1b4' },
    current: { label: 'Bugun', dot: '#7c5cfc' },
    missed: { label: "Bo'sh o'tgan", dot: '#ffb067' },
    future: { label: 'Kelajakda', dot: 'transparent' },
  };

  function renderSegments() {
    const wrap = document.getElementById('daySegmentsWrap');
    if (!wrap) return;
    const todayIdx = ALL_DAYS.indexOf(TODAY);

    const html = SEGMENTS.map((seg, segIdx) => {
      const segDone = seg.filter((iso) => dayStatus(iso) === 'done').length;
      const segFrom = shortDate(seg[0]);
      const segTo = shortDate(seg[seg.length - 1]);
      const containsToday = seg.includes(TODAY);

      const nodes = seg.map((iso, i) => {
        const globalIdx = segIdx * SEGMENT_SIZE + i + 1;
        const status = dayStatus(iso);
        const meta = STATUS_META[status];
        const entries = dayEntries(iso);
        const badgeCount = entries.length ? `<span class="day-node-count">${entries.length}</span>` : '';
        return `
          <button type="button" class="day-node day-node-${status}" data-day="${iso}" title="${longDate(iso)}">
            <span class="day-node-num">${globalIdx}</span>
            <span class="day-node-date">${shortDate(iso)}</span>
            ${badgeCount}
          </button>`;
      }).join('');

      return `
        <div class="day-segment ${containsToday ? 'is-current-segment' : ''}">
          <div class="day-segment-head">
            <div>
              <span class="day-segment-title">${segIdx + 1}-blok</span>
              <span class="day-segment-range">${segFrom} \u2014 ${segTo}</span>
            </div>
            <span class="day-segment-progress">${segDone}/${seg.length} kun</span>
          </div>
          <div class="day-segment-track">${nodes}</div>
        </div>`;
    }).join('');

    wrap.innerHTML = html;

    wrap.querySelectorAll('.day-node').forEach((btn) => {
      btn.addEventListener('click', () => openDayGroup(btn.dataset.day));
    });

    // auto-scroll today's segment into view on first render
    if (todayIdx >= 0) {
      const activeSeg = wrap.querySelector('.is-current-segment');
      if (activeSeg) activeSeg.scrollIntoView({ block: 'nearest' });
    }
  }

  /* ---------- day group panel (chat-like journal) ---------- */
  function fileIcon(mime) {
    if (mime.startsWith('image/')) return '\uD83D\uDDBC\uFE0F';
    if (mime.startsWith('video/')) return '\uD83C\uDFA5';
    if (mime === 'application/pdf') return '\uD83D\uDCC4';
    if (mime === 'text/html') return '\uD83C\uDF10';
    return '\uD83D\uDCCE';
  }
  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }
  function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  }

  async function openDayGroup(iso) {
    activeDayIso = iso;
    const overlay = document.getElementById('dayModalOverlay');
    const idx = ALL_DAYS.indexOf(iso) + 1;
    document.getElementById('dayModalTitle').textContent = `${idx}-kun guruhi`;
    document.getElementById('dayModalSub').textContent = longDate(iso);
    const status = dayStatus(iso);
    const badge = document.getElementById('dayModalStatus');
    badge.textContent = STATUS_META[status].label;
    badge.className = 'day-modal-status day-modal-status-' + status;

    overlay.classList.add('open');
    document.getElementById('dayNoteInput').value = '';
    await renderDayThread(iso);
  }
  function closeDayGroup() {
    document.getElementById('dayModalOverlay').classList.remove('open');
    activeDayIso = null;
  }

  async function renderDayThread(iso) {
    const thread = document.getElementById('dayThread');
    const entries = dayEntries(iso);
    if (!entries.length) {
      thread.innerHTML = `<div class="day-thread-empty">Bu kunga hali hech narsa yozilmagan.<br>Pastdan matn yozing yoki fayl (pdf, html, rasm, video) yuklang.</div>`;
      return;
    }
    thread.innerHTML = entries.map((e) => renderEntryShell(e)).join('');
    // hydrate file previews asynchronously
    for (const e of entries) {
      if (e.type === 'file') hydrateFilePreview(e);
    }
    thread.scrollTop = thread.scrollHeight;
  }

  function renderEntryShell(e) {
    const time = fmtTime(e.ts);
    if (e.type === 'text') {
      return `
        <div class="day-bubble day-bubble-text" data-entry="${e.id}">
          <div class="day-bubble-body">${escapeHtml(e.text)}</div>
          <div class="day-bubble-meta">${time} <button class="day-entry-del" data-del="${e.id}" title="O'chirish">\u2715</button></div>
        </div>`;
    }
    return `
      <div class="day-bubble day-bubble-file" data-entry="${e.id}">
        <div class="day-file-preview" id="filePreview-${e.id}">
          <span class="day-file-icon">${fileIcon(e.mime)}</span>
        </div>
        <div class="day-file-meta">
          <span class="day-file-name">${escapeHtml(e.name)}</span>
          <span class="day-file-size">${fmtBytes(e.size)}</span>
        </div>
        <div class="day-bubble-meta">${time} <button class="day-entry-del" data-del="${e.id}" title="O'chirish">\u2715</button></div>
      </div>`;
  }

  async function hydrateFilePreview(entry) {
    const container = document.getElementById(`filePreview-${entry.id}`);
    if (!container) return;
    try {
      let url = entry.url || null;
      if (!url) {
        const rec = await fdbGet(entry.id);
        if (!rec || !rec.blob) return;
        url = URL.createObjectURL(rec.blob);
      }
      if (entry.mime.startsWith('image/')) {
        container.innerHTML = `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${escapeHtml(entry.name)}" loading="lazy"></a>`;
      } else if (entry.mime.startsWith('video/')) {
        container.innerHTML = `<video controls preload="metadata" src="${url}"></video>`;
      } else {
        container.innerHTML = `
          <span class="day-file-icon">${fileIcon(entry.mime)}</span>
          <a class="day-file-open" href="${url}" target="_blank" rel="noopener" download="${escapeHtml(entry.name)}">Ochish / yuklab olish</a>`;
      }
    } catch (err) {
      console.error('Preview hydrate failed', err);
    }
  }

  function uid() { return 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); }

  async function addTextEntry() {
    if (!activeDayIso) return;
    const input = document.getElementById('dayNoteInput');
    const text = input.value.trim();
    if (!text) return;
    if (!dayData[activeDayIso]) dayData[activeDayIso] = { entries: [] };
    dayData[activeDayIso].entries.push({ id: uid(), type: 'text', text, ts: Date.now() });
    input.value = '';
    await persistDayData(true);
    await renderDayThread(activeDayIso);
    renderSegments();
    renderDailyOverview();
  }

  const ACCEPTED_MIME_PREFIXES = ['image/', 'video/'];
  const ACCEPTED_MIME_EXACT = ['application/pdf', 'text/html'];
  function isAcceptedFile(file) {
    if (ACCEPTED_MIME_EXACT.includes(file.type)) return true;
    return ACCEPTED_MIME_PREFIXES.some((p) => file.type.startsWith(p));
  }

  async function addFileEntries(fileList) {
    if (!activeDayIso) return;
    const files = Array.from(fileList);
    if (!dayData[activeDayIso]) dayData[activeDayIso] = { entries: [] };

    // Determine once whether we can use cloud storage for this batch.
    let cloudUser = null;
    if (typeof VividDB !== 'undefined' && VividDB.isConfigured) {
      try { cloudUser = await VividDB.getUser(); } catch (err) { cloudUser = null; }
    }

    for (const file of files) {
      if (!isAcceptedFile(file)) {
        if (typeof VividDB !== 'undefined' && typeof VividDB.showSavedToast === 'function') {
          VividDB.showSavedToast(`${file.name}: qabul qilinmaydigan format`);
        }
        continue;
      }
      const id = uid();
      const baseEntry = { id, type: 'file', name: file.name, mime: file.type || 'application/octet-stream', size: file.size, ts: Date.now() };

      let uploaded = false;
      if (cloudUser) {
        try {
          const path = `${cloudUser.id}/${activeDayIso}/${id}-${sanitizeFileName(file.name)}`;
          const { data, error } = await VividDB.uploadFile(FILES_BUCKET, path, file);
          if (!error && data && data.publicUrl) {
            baseEntry.url = data.publicUrl;
            baseEntry.storagePath = path;
            uploaded = true;
          } else if (error) {
            console.warn('Cloud upload failed, falling back to local storage:', error.message || error);
          }
        } catch (err) {
          console.warn('Cloud upload threw, falling back to local storage:', err);
        }
      }

      if (!uploaded) {
        // Guest mode, not logged in, or upload failed — keep the file locally so it isn't lost.
        await fdbPut({ id, day: activeDayIso, name: file.name, mime: baseEntry.mime, size: file.size, blob: file });
      }

      dayData[activeDayIso].entries.push(baseEntry);
    }
    await persistDayData(true);
    await renderDayThread(activeDayIso);
    renderSegments();
    renderDailyOverview();
  }

  function sanitizeFileName(name) {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(-80);
  }

  async function deleteEntry(entryId) {
    if (!activeDayIso) return;
    const d = dayData[activeDayIso];
    if (!d) return;
    const entry = d.entries.find((e) => e.id === entryId);
    d.entries = d.entries.filter((e) => e.id !== entryId);
    if (entry && entry.type === 'file') {
      try {
        if (entry.storagePath && typeof VividDB !== 'undefined' && VividDB.isConfigured) {
          await VividDB.removeFile(FILES_BUCKET, entry.storagePath);
        } else {
          await fdbDelete(entryId);
        }
      } catch (err) { console.error(err); }
    }
    await persistDayData(true);
    await renderDayThread(activeDayIso);
    renderSegments();
    renderDailyOverview();
  }

  function wireDayEvents() {
    const overlay = document.getElementById('dayModalOverlay');
    const closeBtn = document.getElementById('dayModalClose');
    const sendBtn = document.getElementById('daySendBtn');
    const noteInput = document.getElementById('dayNoteInput');
    const fileInput = document.getElementById('dayFileInput');
    const fileBtn = document.getElementById('dayFileBtn');
    const thread = document.getElementById('dayThread');

    if (closeBtn) closeBtn.addEventListener('click', closeDayGroup);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDayGroup(); });
    if (sendBtn) sendBtn.addEventListener('click', addTextEntry);
    if (noteInput) noteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTextEntry(); }
    });
    if (fileBtn) fileBtn.addEventListener('click', () => fileInput && fileInput.click());
    if (fileInput) fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length) addFileEntries(fileInput.files);
      fileInput.value = '';
    });
    if (thread) thread.addEventListener('click', (e) => {
      const btn = e.target.closest('.day-entry-del');
      if (btn) deleteEntry(btn.dataset.del);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeDayGroup();
    });

    // drag & drop onto the modal
    if (overlay) {
      ['dragover', 'drop'].forEach((evt) => overlay.addEventListener(evt, (e) => e.preventDefault()));
      overlay.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          addFileEntries(e.dataTransfer.files);
        }
      });
    }
  }

  function jumpToToday() {
    const el = document.querySelector(`.day-node[data-day="${TODAY}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
  }

  async function renderCloudBadge() {
    const el = document.getElementById('rmCloudBadge');
    if (!el) return;
    try {
      if (typeof VividDB === 'undefined' || !VividDB.isConfigured) {
        el.textContent = '📴 Faqat shu brauzerda (Supabase ulanmagan)';
        el.className = 'rm-cloud-badge is-offline';
        return;
      }
      const user = await VividDB.getUser();
      if (user) {
        el.textContent = `☁️ Bulutga ulangan — doimiy saqlanadi (${user.email || 'akkaunt'})`;
        el.className = 'rm-cloud-badge is-online';
      } else {
        el.textContent = '📴 Tizimga kirilmagan — faqat shu brauzerda saqlanadi';
        el.className = 'rm-cloud-badge is-offline';
      }
    } catch (err) {
      el.textContent = '📴 Faqat shu brauzerda';
      el.className = 'rm-cloud-badge is-offline';
    }
  }

  /* =====================================================================
     INIT
  ===================================================================== */
  async function init() {
    const hasCpUi = !!document.getElementById('goalSummaryCards');
    const hasDayUi = !!document.getElementById('daySegmentsWrap');
    if (!hasCpUi && !hasDayUi) return; // not on this page

    if (hasCpUi) {
      await loadCpData();
      wireCheckpointEvents();
      renderCheckpointSection();
      requestAnimationFrame(renderCpTrailFill);
    }
    if (hasDayUi) {
      await loadDayData();
      wireDayEvents();
      renderDailyOverview();
      renderSegments();
      renderCloudBadge();
      const todayBtn = document.getElementById('rmJumpTodayBtn');
      if (todayBtn) todayBtn.addEventListener('click', jumpToToday);
    }
  }

  init();
})();