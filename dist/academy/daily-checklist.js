/* ===================== VIVID IELTS — Daily Checklist engine =====================
   Implements: checkbox list, streak, progress bar, per-skill mini-progress,
   per-task timers, total time today, scheduled reminders, weekly heatmap,
   most-skipped stats, 30-day chart, badges, daily quote, weak-note,
   check animation, close-day with reasons, editable template, cloud/local
   persistence (via VividDB), CSV export, journal linking, skip-with-reason,
   hard-day mode, streak sharing to community, 3-day-skip alerts, consistency
   score. One engine, used both by the full roadmap.html section and the
   compact dashboard.html widget.
=================================================================== */
window.VividChecklist = (function () {
  const STORAGE_KEY = 'vivid_daily_checklist_v1';
  const JOURNAL_KEY = 'roadmap_daily_journal_2027'; // must match roadmap.js DAY_STORAGE_KEY
  const MS_DAY = 86400000;

  /* ---------- date helpers (local time, never UTC-shift) ---------- */
  function isoOf(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function todayISO() { const d = new Date(); d.setHours(0, 0, 0, 0); return isoOf(d); }
  function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return isoOf(d); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / MS_DAY); }
  const TODAY = todayISO();

  /* ---------- default template (from LAST CHANCE PDF) ---------- */
  const SKILLS = {
    reading:   { key: 'reading',   name: 'Reading',   icon: '📖', color: '#ffb067' },
    listening: { key: 'listening', name: 'Listening', icon: '🎧', color: '#67a6ff' },
    speaking:  { key: 'speaking',  name: 'Speaking',  icon: '🗣️', color: '#ffc759' },
    writing:   { key: 'writing',   name: 'Writing',   icon: '✍️', color: '#ff5a5f' },
    daily:     { key: 'daily',     name: "Kundalik",  icon: '🌤️', color: '#78c896' },
    extra:     { key: 'extra',     name: 'Qo\u2018shimcha', icon: '➕', color: '#7c5cfc' },
  };
  const SKILL_ORDER = ['reading', 'listening', 'speaking', 'writing', 'daily', 'extra'];

  function defaultTemplate() {
    return [
      { id: 'r1', skill: 'reading', label: 'ELS kitob \u2014 4 ta passage', time: 40, core: true },
      { id: 'r2', skill: 'reading', label: "1 ta qo'shimcha passage", time: 20, core: false },
      { id: 'l1', skill: 'listening', label: "2 qism to'liq tahlil (keyword table)", time: 40, core: true },
      { id: 'l2', skill: 'listening', label: "2 ta podkast / ChatGPT bilan ishlash", time: 30, core: false },
      { id: 'l3', skill: 'listening', label: 'Listening strategy mashqi', time: 15, core: false },
      { id: 's1', skill: 'speaking', label: '1 ta full mock tahlil', time: 30, core: true },
      { id: 's2', skill: 'speaking', label: "10-15 ta chunk ishlatish", time: 15, core: true },
      { id: 's3', skill: 'speaking', label: 'GBL mashqi', time: 15, core: false },
      { id: 's4', skill: 'speaking', label: 'Shadowing \u2014 25 daqiqa', time: 25, core: true },
      { id: 's5', skill: 'speaking', label: "1-2 ta mavzuda erkin gapirish", time: 15, core: false },
      { id: 's6', skill: 'speaking', label: '1 ta struktura / grammatika mavzusi', time: 15, core: false },
      { id: 'a1', skill: 'speaking', label: 'Peshin: Speaking 1 mavzu', time: 10, core: false, tod: 'Peshin' },
      { id: 'a2', skill: 'speaking', label: 'Peshin: Speaking strukturalari', time: 10, core: false, tod: 'Peshin' },
      { id: 'a3', skill: 'reading', label: 'Peshin: Reading wordlist', time: 10, core: false, tod: 'Peshin' },
      { id: 'n1', skill: 'speaking', label: 'Kechqurun: Speaking 1 mavzu', time: 10, core: false, tod: 'Kechqurun' },
      { id: 'w1', skill: 'writing', label: 'Insho yozish va tahlil', time: 40, core: true },
      { id: 'w2', skill: 'writing', label: '10 ta yangi so\u2018z o\u2018rganish', time: 15, core: true },
      { id: 'w3', skill: 'writing', label: '1 ta struktura o\u2018rganish', time: 10, core: false },
      { id: 'n2', skill: 'writing', label: 'Kechqurun: Writing mavzulari', time: 10, core: false, tod: 'Kechqurun' },
      { id: 'n3', skill: 'writing', label: 'Kechqurun: Writing strukturalari', time: 10, core: false, tod: 'Kechqurun' },
      { id: 'd1', skill: 'daily', label: '5-10 bet kitob o\u2018qish', time: 20, core: false },
      { id: 'd2', skill: 'daily', label: 'Kundalik note yozish', time: 10, core: false },
      { id: 'd3', skill: 'daily', label: '5 vaqt namoz', time: 0, core: true },
      { id: 'd4', skill: 'daily', label: 'GYM', time: 60, core: true, scheduled: '18:00' },
      { id: 'd5', skill: 'daily', label: "21:30 tekshiruv va meditatsiya", time: 15, core: false, scheduled: '21:30' },
      { id: 'e1', skill: 'extra', label: 'SAT \u2014 3 soat', time: 180, core: true, scheduled: '15:15' },
      { id: 'e2', skill: 'extra', label: 'Turkcha \u2014 1 soat', time: 60, core: true, scheduled: '14:00' },
    ];
  }

  const QUOTES = [
    "Har kichik qadam \u2014 cho'qqiga bir qadam yaqinlashish.",
    "Bugungi 1 soat \u2014 ertangi 1 ball.",
    "Streak buzilmasin: kichik bo'lsa ham, har kuni bir narsa qil.",
    "Tanaffus emas, tizim g'alaba qozonadi.",
    "Sen kim bo'lishni tanlaysan \u2014 shu bugun boshlanadi.",
    "Kichik intizom, katta natija.",
    "Cho'qqi ko'rinmasa ham, yo'l davom etmoqda.",
    "Bugun charchading \u2014 lekin baribir 1 ta vazifani bajar.",
    "Consistency talantdan kuchli.",
    "Har checklist \u2014 kelajakdagi natijangizga ovoz.",
  ];

  const BADGE_MILESTONES = [3, 7, 14, 21, 30, 50, 100];

  /* ---------- state ---------- */
  let state = null;
  let loadingPromise = null;
  const timers = {}; // itemId -> { startedAt, elapsedBefore }
  const listeners = []; // functions to call after every render-affecting change

  function defaultState() {
    return { template: defaultTemplate(), hidden: [], days: {}, badgesSeen: [] };
  }

  async function loadState() {
    if (state) return state;
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      try {
        const loaded = (typeof VividDB !== 'undefined')
          ? await VividDB.loadUserState(STORAGE_KEY, null)
          : null;
        state = loaded && typeof loaded === 'object' ? loaded : defaultState();
        if (!Array.isArray(state.template) || !state.template.length) state.template = defaultTemplate();
        if (!Array.isArray(state.hidden)) state.hidden = [];
        if (!state.days || typeof state.days !== 'object') state.days = {};
        if (!Array.isArray(state.badgesSeen)) state.badgesSeen = [];
        // repair: if every default item somehow ended up hidden (corrupted old save), reset hidden
        const visibleCount = state.template.filter((t) => !state.hidden.includes(t.id)).length;
        if (visibleCount === 0) state.hidden = [];
      } catch (err) {
        console.error('Checklist load failed', err);
        state = defaultState();
      }
      return state;
    })();
    return loadingPromise;
  }

  let saveTimer = null;
  function persist(silent) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        if (typeof VividDB !== 'undefined') {
          await VividDB.saveUserState(STORAGE_KEY, state);
          if (!silent) VividDB.showSavedToast && VividDB.showSavedToast('Saqlandi');
        }
      } catch (err) { console.error('Checklist save failed', err); }
    }, 250);
  }

  function activeTemplate() {
    return state.template.filter((t) => !state.hidden.includes(t.id));
  }

  function getDay(iso) {
    if (!state.days[iso]) state.days[iso] = { items: {}, skipped: {}, weakNote: '', closed: false, hardDay: false };
    const d = state.days[iso];
    if (!d.items) d.items = {};
    if (!d.skipped) d.skipped = {};
    return d;
  }

  function todaysActiveItems(iso) {
    const day = getDay(iso);
    const tpl = activeTemplate();
    return day.hardDay ? tpl.filter((t) => t.core) : tpl;
  }

  /* ---------- core actions ---------- */
  function uid() { return 'ci_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }

  async function toggleItem(iso, itemId) {
    await loadState();
    const day = getDay(iso);
    const wasDone = !!(day.items[itemId] && day.items[itemId].done);
    if (wasDone) {
      day.items[itemId] = { ...day.items[itemId], done: false };
    } else {
      day.items[itemId] = { ...(day.items[itemId] || {}), done: true, ts: Date.now() };
      delete day.skipped[itemId];
      linkToJournal(iso, itemId).catch(() => {});
    }
    persist(true);
    checkNewBadges();
    notify();
  }

  async function skipItem(iso, itemId) {
    await loadState();
    const reason = window.prompt("Nega bu vazifani o'tkazib yuboryapsiz? (qisqa sabab)");
    if (reason === null) return; // cancelled
    const day = getDay(iso);
    day.skipped[itemId] = { reason: reason || '\u2014', ts: Date.now() };
    if (day.items[itemId]) day.items[itemId].done = false;
    persist(true);
    notify();
  }

  async function unskipItem(iso, itemId) {
    await loadState();
    const day = getDay(iso);
    delete day.skipped[itemId];
    persist(true);
    notify();
  }

  function startTimer(itemId) {
    if (timers[itemId] && timers[itemId].running) return;
    timers[itemId] = { running: true, startedAt: Date.now(), elapsedBefore: (timers[itemId] && timers[itemId].elapsedBefore) || 0 };
    notify();
  }
  async function stopTimer(iso, itemId) {
    await loadState();
    const t = timers[itemId];
    if (!t || !t.running) return;
    const spent = t.elapsedBefore + (Date.now() - t.startedAt);
    timers[itemId] = { running: false, elapsedBefore: spent };
    const day = getDay(iso);
    const prevSec = (day.items[itemId] && day.items[itemId].timeSpentSec) || 0;
    day.items[itemId] = { ...(day.items[itemId] || {}), timeSpentSec: prevSec + Math.round(spent / 1000) };
    timers[itemId].elapsedBefore = 0;
    persist(true);
    notify();
  }
  function liveElapsedSec(itemId) {
    const t = timers[itemId];
    if (!t) return 0;
    return Math.round(((t.running ? Date.now() - t.startedAt : 0) + t.elapsedBefore) / 1000);
  }

  async function setWeakNote(iso, text) {
    await loadState();
    getDay(iso).weakNote = text;
    persist(true);
  }

  async function toggleHardDay(iso) {
    await loadState();
    const day = getDay(iso);
    day.hardDay = !day.hardDay;
    persist(true);
    notify();
    return day.hardDay;
  }

  async function closeDay(iso) {
    await loadState();
    const day = getDay(iso);
    const items = todaysActiveItems(iso);
    const incomplete = items.filter((it) => !(day.items[it.id] && day.items[it.id].done) && !day.skipped[it.id]);
    for (const it of incomplete) {
      const reason = window.prompt(`"${it.label}" bajarilmadi. Sababi? (bo'sh qoldirsangiz \u2014 "kun yopildi" deb belgilanadi)`);
      day.skipped[it.id] = { reason: (reason && reason.trim()) || 'Kun yopilganda bajarilmagan', ts: Date.now() };
    }
    day.closed = true;
    persist();
    notify();
  }

  /* ---------- template editing ---------- */
  async function addCustomItem(skill, label, time) {
    await loadState();
    if (!label || !label.trim()) return;
    state.template.push({ id: uid(), skill, label: label.trim(), time: Number(time) || 0, core: false, custom: true });
    persist();
    notify();
  }
  async function removeItem(itemId) {
    await loadState();
    if (!state.hidden.includes(itemId)) state.hidden.push(itemId);
    persist();
    notify();
  }

  /* ---------- journal linking (#19) ---------- */
  async function linkToJournal(iso, itemId) {
    if (typeof VividDB === 'undefined' || !VividDB.loadUserState) return;
    const item = state.template.find((t) => t.id === itemId);
    if (!item) return;
    try {
      const journal = (await VividDB.loadUserState(JOURNAL_KEY, {})) || {};
      if (!journal[iso]) journal[iso] = { entries: [] };
      journal[iso].entries.push({
        id: 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
        type: 'text',
        text: `\u2705 Checklist: ${item.label}`,
        ts: Date.now(),
      });
      await VividDB.saveUserState(JOURNAL_KEY, journal);
    } catch (err) { console.warn('Journal link failed', err); }
  }

  /* ---------- computed stats ---------- */
  function dayCompletion(iso) {
    const day = getDay(iso);
    const items = todaysActiveItems(iso);
    if (!items.length) return { done: 0, total: 0, pct: 0 };
    let done = 0;
    items.forEach((it) => { if ((day.items[it.id] && day.items[it.id].done) || day.skipped[it.id]) done++; });
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  }
  function dayCompletionStrict(iso) {
    // for streak/consistency: skips do NOT count as success, only actual done items
    const day = getDay(iso);
    const items = todaysActiveItems(iso);
    if (!items.length) return 0;
    let done = 0;
    items.forEach((it) => { if (day.items[it.id] && day.items[it.id].done) done++; });
    return done / items.length;
  }

  function computeStreak() {
    let streak = 0;
    let cursor = TODAY;
    // if today has zero progress yet, start counting from yesterday so streak isn't broken mid-day
    const todayPct = dayCompletion(TODAY).pct;
    if (todayPct < 100) cursor = addDays(TODAY, -1);
    while (true) {
      const day = state.days[cursor];
      const items = todaysActiveItems(cursor);
      if (!items.length || !day) break;
      let allOk = true;
      items.forEach((it) => { if (!((day.items[it.id] && day.items[it.id].done) || day.skipped[it.id])) allOk = false; });
      if (!allOk) break;
      streak++;
      cursor = addDays(cursor, -1);
      if (streak > 400) break;
    }
    return streak;
  }

  function computeConsistencyScore(windowDays) {
    windowDays = windowDays || 30;
    let sum = 0, count = 0;
    for (let i = 0; i < windowDays; i++) {
      const iso = addDays(TODAY, -i);
      if (daysBetween('2026-09-12', iso) < 0) break;
      sum += dayCompletionStrict(iso);
      count++;
    }
    if (!count) return 0;
    return Math.round((sum / count) * 100);
  }

  function computeTodayTimeSec() {
    const day = getDay(TODAY);
    let total = 0;
    Object.keys(day.items).forEach((id) => { total += (day.items[id].timeSpentSec || 0); });
    Object.keys(timers).forEach((id) => { if (timers[id].running) total += liveElapsedSec(id); });
    return total;
  }

  function computeSkillProgress(iso) {
    const day = getDay(iso);
    const items = todaysActiveItems(iso);
    const bySkill = {};
    SKILL_ORDER.forEach((s) => { bySkill[s] = { done: 0, total: 0 }; });
    items.forEach((it) => {
      if (!bySkill[it.skill]) bySkill[it.skill] = { done: 0, total: 0 };
      bySkill[it.skill].total++;
      if ((day.items[it.id] && day.items[it.id].done) || day.skipped[it.id]) bySkill[it.skill].done++;
    });
    return bySkill;
  }

  function computeWeeklyHeatmap(weeks) {
    weeks = weeks || 8;
    const days = weeks * 7;
    const cells = [];
    for (let i = days - 1; i >= 0; i--) {
      const iso = addDays(TODAY, -i);
      cells.push({ iso, pct: state.days[iso] ? dayCompletion(iso).pct : null });
    }
    return cells;
  }

  function computeMonthChart(windowDays) {
    windowDays = windowDays || 30;
    const out = [];
    for (let i = windowDays - 1; i >= 0; i--) {
      const iso = addDays(TODAY, -i);
      out.push({ iso, pct: state.days[iso] ? dayCompletion(iso).pct : 0 });
    }
    return out;
  }

  function computeMostSkipped(limit) {
    limit = limit || 5;
    const counts = {};
    Object.values(state.days).forEach((day) => {
      Object.keys(day.skipped || {}).forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    });
    const tpl = state.template;
    return Object.entries(counts)
      .map(([id, n]) => ({ id, n, label: (tpl.find((t) => t.id === id) || {}).label || id }))
      .sort((a, b) => b.n - a.n)
      .slice(0, limit);
  }

  function computeSkipAlerts() {
    // items skipped or missed 3 days running (#25)
    const alerts = [];
    activeTemplate().forEach((item) => {
      let streakMiss = 0;
      for (let i = 0; i < 3; i++) {
        const iso = addDays(TODAY, -i);
        if (daysBetween('2026-09-12', iso) < 0) { streakMiss = 0; break; }
        const day = state.days[iso];
        const ok = day && ((day.items[item.id] && day.items[item.id].done));
        if (ok) { streakMiss = 0; break; }
        streakMiss++;
      }
      if (streakMiss >= 3) alerts.push(item.label);
    });
    return alerts;
  }

  function computeReminders() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const day = getDay(TODAY);
    const out = [];
    activeTemplate().forEach((item) => {
      if (!item.scheduled) return;
      const [h, m] = item.scheduled.split(':').map(Number);
      const schedMin = h * 60 + m;
      const done = day.items[item.id] && day.items[item.id].done;
      const skipped = day.skipped[item.id];
      if (!done && !skipped && nowMin >= schedMin && nowMin <= schedMin + 90) {
        out.push(`\u23F0 ${item.scheduled} \u2014 "${item.label}" vaqti keldi!`);
      }
    });
    return out;
  }

  function checkNewBadges() {
    const streak = computeStreak();
    BADGE_MILESTONES.forEach((m) => {
      if (streak >= m && !state.badgesSeen.includes(m)) {
        state.badgesSeen.push(m);
        if (typeof VividDB !== 'undefined' && VividDB.showSavedToast) {
          VividDB.showSavedToast(`\uD83C\uDFC5 Yangi badge: ${m} kunlik streak!`);
        }
      }
    });
  }
  function earnedBadges() { return state.badgesSeen.slice().sort((a, b) => a - b); }

  async function shareStreak() {
    const streak = computeStreak();
    if (typeof VividDB === 'undefined' || !VividDB.createCommunityPost) return { error: 'no-db' };
    const user = VividDB.getUser ? await VividDB.getUser() : null;
    if (!user) { alert('Ulashish uchun avval tizimga kiring.'); return { error: 'not-logged-in' }; }
    return VividDB.createCommunityPost(`\uD83D\uDD25 ${streak} kunlik streak davom etmoqda! Kunlik IELTS/SAT/Turkcha checklist bilan.`, 'general');
  }

  function exportCSV() {
    const rows = [['Sana', 'Vazifa', 'Skill', 'Holat', 'Vaqt (soniya)', 'Sabab']];
    Object.keys(state.days).sort().forEach((iso) => {
      const day = state.days[iso];
      state.template.forEach((item) => {
        const rec = day.items[item.id];
        const skip = day.skipped[item.id];
        if (!rec && !skip) return;
        rows.push([
          iso, item.label, item.skill,
          rec && rec.done ? 'Bajarildi' : (skip ? "O'tkazib yuborildi" : ''),
          (rec && rec.timeSpentSec) || 0,
          skip ? skip.reason : '',
        ]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `checklist-tarix-${TODAY}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function todaysQuote() {
    const dayIndex = Math.floor(new Date(TODAY + 'T00:00:00').getTime() / MS_DAY);
    return QUOTES[dayIndex % QUOTES.length];
  }

  function flushAllTimersSync() {
    // Called on tab close / navigation away: stop every running timer and
    // fold its elapsed time into today's state so nothing is lost or left
    // in a "still running" state next time the page opens.
    const iso = TODAY;
    let changed = false;
    Object.keys(timers).forEach((id) => {
      const t = timers[id];
      if (!t || !t.running) return;
      const spentMs = t.elapsedBefore + (Date.now() - t.startedAt);
      const day = getDay(iso);
      const prevSec = (day.items[id] && day.items[id].timeSpentSec) || 0;
      day.items[id] = { ...(day.items[id] || {}), timeSpentSec: prevSec + Math.round(spentMs / 1000) };
      timers[id] = { running: false, elapsedBefore: 0 };
      changed = true;
    });
    if (changed && state) {
      // best-effort cloud save (may not finish before unload) + guaranteed local save
      try {
        if (typeof VividDB !== 'undefined') VividDB.saveUserState(STORAGE_KEY, state);
      } catch (e) {}
      try { localStorage.setItem('vivid_state:' + STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flushAllTimersSync);
    window.addEventListener('beforeunload', flushAllTimersSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushAllTimersSync();
    });
  }

  /* ---------- change notification (for live widget refresh) ---------- */
  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) {} }); }

  return {
    SKILLS, SKILL_ORDER, TODAY, todayISO, addDays, daysBetween,
    loadState, activeTemplate, getDay, todaysActiveItems, defaultTemplate,
    toggleItem, skipItem, unskipItem, startTimer, stopTimer, liveElapsedSec,
    setWeakNote, toggleHardDay, closeDay, addCustomItem, removeItem,
    dayCompletion, dayCompletionStrict, computeStreak, computeConsistencyScore,
    computeTodayTimeSec, computeSkillProgress, computeWeeklyHeatmap, computeMonthChart,
    computeMostSkipped, computeSkipAlerts, computeReminders, earnedBadges, shareStreak,
    exportCSV, todaysQuote, onChange, notify,
    get state() { return state; },
  };
})();
