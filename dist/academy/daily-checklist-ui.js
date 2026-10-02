/* ===================== VIVID IELTS — Daily Checklist UI (full view) =====================
   Renders into #checklist on roadmap.html. Requires daily-checklist.js (VividChecklist)
   to be loaded first, plus db.js (VividDB).
=================================================================== */
(function () {
  const C = window.VividChecklist;
  if (!C) {
    document.addEventListener('DOMContentLoaded', () => {
      const section = document.getElementById('checklist');
      if (!section) return;
      const box = document.createElement('div');
      box.style.cssText = 'background:#fff0f0;border:2px solid #ff5a5f;color:#a12a2a;padding:14px 16px;border-radius:10px;margin-bottom:14px;font-family:monospace;font-size:12px;';
      box.textContent = "⚠️ daily-checklist.js yuklanmadi (VividChecklist topilmadi). Fayl roadmap.html bilan bir papkadami va <script src=\"daily-checklist.js\"> daily-checklist-ui.js dan OLDIN turibdimi — tekshiring. F12 → Console'da qizil xato bo'lsa screenshot tashlang.";
      section.prepend(box);
    });
    return;
  }

  function fmtMin(sec) {
    if (!sec) return '0 daq';
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m < 60) return s ? `${m}d ${s}s` : `${m} daq`;
    const h = Math.floor(m / 60), rm = m % 60;
    return `${h}s ${rm}d`;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  async function renderAll() {
    await C.loadState();
    renderReminders();
    renderAlerts();
    renderTopStats();
    renderQuote();
    renderSkillChips();
    renderItems();
    renderWeakNote();
    renderBadges();
    renderHeatmap();
    renderMonthChart();
    renderMostSkipped();
    updateHardDayBtn();
  }

  function renderReminders() {
    const el = document.getElementById('dclReminders');
    if (!el) return;
    const rems = C.computeReminders();
    el.innerHTML = rems.map((r) => `<div class="dcl-reminder-banner">${esc(r)}</div>`).join('');
  }
  function renderAlerts() {
    const el = document.getElementById('dclAlerts');
    if (!el) return;
    const alerts = C.computeSkipAlerts();
    el.innerHTML = alerts.map((a) =>
      `<div class="dcl-alert-banner">\u26A0\uFE0F "${esc(a)}" 3 kundan beri bajarilmayapti \u2014 e'tibor bering.</div>`
    ).join('');
  }

  function renderTopStats() {
    const streak = C.computeStreak();
    document.getElementById('dclStreakNum').textContent = streak;
    document.getElementById('dclConsistencyNum').textContent = C.computeConsistencyScore() + '%';
    document.getElementById('dclTimeNum').textContent = fmtMin(C.computeTodayTimeSec());
    const shareBtn = document.getElementById('dclShareStreakBtn');
    if (shareBtn) shareBtn.hidden = streak < 3;

    const comp = C.dayCompletion(C.TODAY);
    document.getElementById('dclProgressLabel').textContent = `${comp.done}/${comp.total} bajarildi`;
    document.getElementById('dclProgressPct').textContent = comp.pct + '%';
    document.getElementById('dclProgressFill').style.width = comp.pct + '%';
  }

  function renderQuote() {
    const el = document.getElementById('dclQuote');
    if (el) el.textContent = '\u201C' + C.todaysQuote() + '\u201D';
  }

  function renderSkillChips() {
    const el = document.getElementById('dclSkillRows');
    if (!el) return;
    const bySkill = C.computeSkillProgress(C.TODAY);
    el.innerHTML = C.SKILL_ORDER.map((key) => {
      const meta = C.SKILLS[key];
      const s = bySkill[key] || { done: 0, total: 0 };
      const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
      return `
        <div class="dcl-skill-chip">
          <span class="dcl-chip-dot" style="background:${meta.color}"></span>
          ${meta.icon} ${meta.name} <span style="opacity:.6">${s.done}/${s.total}</span>
          <span class="dcl-chip-mini-bar"><span class="dcl-chip-mini-fill" style="width:${pct}%;background:${meta.color}"></span></span>
        </div>`;
    }).join('');
  }

  function renderItems() {
    const el = document.getElementById('dclItems');
    if (!el) return;
    const day = C.getDay(C.TODAY);
    const items = C.todaysActiveItems(C.TODAY);
    let html = '';
    let lastSkill = null;
    items.forEach((it) => {
      if (it.skill !== lastSkill) {
        const meta = C.SKILLS[it.skill] || { name: it.skill, icon: '' };
        html += `<div class="dcl-group-label">${meta.icon} ${meta.name}</div>`;
        lastSkill = it.skill;
      }
      const rec = day.items[it.id] || {};
      const skip = day.skipped[it.id];
      const done = !!rec.done;
      const running = C.liveElapsedSec ? false : false;
      const isTimerRunning = window.__dclTimers && window.__dclTimers[it.id];
      const elapsed = C.liveElapsedSec(it.id) + (rec.timeSpentSec || 0) - (rec.timeSpentSec ? 0 : 0);
      html += `
        <div class="dcl-item ${done ? 'is-done' : ''} ${skip ? 'is-skipped' : ''}" data-item="${it.id}">
          <button type="button" class="dcl-check ${done ? 'is-checked' : ''}" data-toggle="${it.id}" title="Bajarildi deb belgilash">${done ? '\u2713' : ''}</button>
          <div class="dcl-item-label">
            ${esc(it.label)}${it.tod ? ` <span style="opacity:.55">(${esc(it.tod)})</span>` : ''}
            <span class="dcl-item-time">${it.scheduled ? '\u23F0 ' + it.scheduled + ' \u00b7 ' : ''}${it.time ? it.time + ' daq rejalashtirilgan' : ''}${rec.timeSpentSec ? ' \u00b7 sarflandi: ' + fmtMin(rec.timeSpentSec) : ''}</span>
            ${skip ? `<span class="dcl-skip-reason">\u23ED\uFE0F O'tkazildi: ${esc(skip.reason)} <button class="dcl-del-btn" data-unskip="${it.id}" title="Bekor qilish">\u21A9</button></span>` : ''}
          </div>
          <div class="dcl-item-actions">
            <span class="dcl-timer-display" data-timer-display="${it.id}"></span>
            <button type="button" class="dcl-timer-btn" data-timer="${it.id}" title="Taymer">\u25B6\uFE0F</button>
            <button type="button" class="dcl-skip-btn" data-skip="${it.id}" title="O'tkazib yuborish">\u23ED\uFE0F</button>
            ${it.custom ? `<button type="button" class="dcl-del-btn" data-remove="${it.id}" title="O'chirish">\u2715</button>` : ''}
          </div>
        </div>`;
    });
    el.innerHTML = html || '<p class="dcl-empty-small">Vazifalar yo\u2018q. Tahrirlash tugmasi orqali qo\u2018shing.</p>';

    // wire events
    el.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.classList.add('dcl-pop');
        await C.toggleItem(C.TODAY, btn.dataset.toggle);
        renderAll();
      });
    });
    el.querySelectorAll('[data-skip]').forEach((btn) => {
      btn.addEventListener('click', async () => { await C.skipItem(C.TODAY, btn.dataset.skip); renderAll(); });
    });
    el.querySelectorAll('[data-unskip]').forEach((btn) => {
      btn.addEventListener('click', async () => { await C.unskipItem(C.TODAY, btn.dataset.unskip); renderAll(); });
    });
    el.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (confirm("Bu vazifani ro'yxatdan olib tashlashni xohlaysizmi?")) { await C.removeItem(btn.dataset.remove); renderAll(); }
      });
    });
    el.querySelectorAll('[data-timer]').forEach((btn) => {
      const id = btn.dataset.timer;
      btn.addEventListener('click', async () => {
        window.__dclTimers = window.__dclTimers || {};
        if (window.__dclTimers[id]) {
          clearInterval(window.__dclTimers[id]);
          delete window.__dclTimers[id];
          await C.stopTimer(C.TODAY, id);
          btn.textContent = '\u25B6\uFE0F'; btn.classList.remove('is-running');
          renderAll();
        } else {
          C.startTimer(id);
          btn.textContent = '\u23F9\uFE0F'; btn.classList.add('is-running');
          window.__dclTimers[id] = setInterval(() => {
            const disp = el.querySelector(`[data-timer-display="${id}"]`);
            if (disp) disp.textContent = fmtMin(C.liveElapsedSec(id));
          }, 1000);
        }
      });
    });
  }

  function renderWeakNote() {
    const ta = document.getElementById('dclWeakNote');
    if (!ta) return;
    ta.value = C.getDay(C.TODAY).weakNote || '';
    ta.oninput = () => C.setWeakNote(C.TODAY, ta.value);
  }

  function renderBadges() {
    const el = document.getElementById('dclBadges');
    if (!el) return;
    const badges = C.earnedBadges();
    el.innerHTML = badges.map((m) => `<span class="dcl-badge">\uD83C\uDFC5 ${m} kun</span>`).join('') ||
      '<span class="dcl-empty-small">Badge yo\u2018q hali \u2014 3 kunlik streakdan boshlanadi.</span>';
  }

  function renderHeatmap() {
    const el = document.getElementById('dclHeatmap');
    if (!el) return;
    const cells = C.computeWeeklyHeatmap(8);
    el.innerHTML = cells.map((c) => {
      let bg = 'var(--canvas-2)';
      if (c.pct !== null) {
        if (c.pct >= 100) bg = '#189488';
        else if (c.pct >= 60) bg = '#22c1b4';
        else if (c.pct >= 30) bg = '#ffb067';
        else if (c.pct > 0) bg = '#ffdca3';
      }
      return `<div class="dcl-heat-cell" style="background:${bg}" title="${c.iso}: ${c.pct === null ? "ma'lumot yo'q" : c.pct + '%'}"></div>`;
    }).join('');
  }

  function renderMonthChart() {
    const el = document.getElementById('dclMonthChart');
    if (!el) return;
    const data = C.computeMonthChart(30);
    el.innerHTML = data.map((d) =>
      `<div class="dcl-bar-col" style="height:${Math.max(2, d.pct)}%" title="${d.iso}: ${d.pct}%"></div>`
    ).join('');
  }

  function renderMostSkipped() {
    const el = document.getElementById('dclMostSkipped');
    if (!el) return;
    const rows = C.computeMostSkipped(5);
    el.innerHTML = rows.length
      ? rows.map((r) => `<div class="dcl-skipped-row"><span>${esc(r.label)}</span><span>${r.n}x</span></div>`).join('')
      : '<p class="dcl-empty-small">Hozircha hech narsa o\u2018tkazib yuborilmagan \uD83C\uDF89</p>';
  }

  function updateHardDayBtn() {
    const btn = document.getElementById('dclHardDayBtn');
    if (!btn) return;
    const isHard = C.getDay(C.TODAY).hardDay;
    btn.classList.toggle('is-active', !!isHard);
    btn.textContent = isHard ? "\uD83D\uDE2E\u200D\uD83D\uDCA8 Qiyin kun: YONIQ" : "\uD83D\uDE2E\u200D\uD83D\uDCA8 Qiyin kun";
  }

  function wireStaticControls() {
    const hardBtn = document.getElementById('dclHardDayBtn');
    if (hardBtn) hardBtn.addEventListener('click', async () => { await C.toggleHardDay(C.TODAY); renderAll(); });

    const exportBtn = document.getElementById('dclExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => C.exportCSV());

    const shareBtn = document.getElementById('dclShareStreakBtn');
    if (shareBtn) shareBtn.addEventListener('click', async () => {
      const r = await C.shareStreak();
      if (!r || !r.error) VividDB.showSavedToast && VividDB.showSavedToast('Community\u2019ga ulashildi!');
    });

    const closeBtn = document.getElementById('dclCloseDayBtn');
    if (closeBtn) closeBtn.addEventListener('click', async () => { await C.closeDay(C.TODAY); renderAll(); });

    const editBtn = document.getElementById('dclEditBtn');
    const addRow = document.getElementById('dclAddRow');
    if (editBtn && addRow) {
      const sel = document.getElementById('dclNewSkill');
      sel.innerHTML = C.SKILL_ORDER.map((k) => `<option value="${k}">${C.SKILLS[k].icon} ${C.SKILLS[k].name}</option>`).join('');
      editBtn.addEventListener('click', () => { addRow.hidden = !addRow.hidden; editBtn.classList.toggle('is-active', !addRow.hidden); });
      document.getElementById('dclAddItemBtn').addEventListener('click', async () => {
        const label = document.getElementById('dclNewLabel').value;
        const time = document.getElementById('dclNewTime').value;
        const skill = sel.value;
        await C.addCustomItem(skill, label, time);
        document.getElementById('dclNewLabel').value = '';
        document.getElementById('dclNewTime').value = '';
        renderAll();
      });
    }
  }

  function showFatalError(err) {
    const section = document.getElementById('checklist');
    if (!section) { console.error('Checklist fatal error', err); return; }
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff0f0;border:2px solid #ff5a5f;color:#a12a2a;padding:14px 16px;border-radius:10px;margin-bottom:14px;font-family:monospace;font-size:12px;white-space:pre-wrap;';
    box.textContent = '⚠️ Checklist skripti ishlamadi (screenshot qilib yuboring):\n\n' + (err && err.stack ? err.stack : String(err));
    section.prepend(box);
    console.error('Checklist fatal error', err);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('checklist')) return;
    try {
      wireStaticControls();
      await renderAll();
      // live-refresh reminders/alerts every minute
      setInterval(() => { renderReminders(); renderAlerts(); }, 60000);
    } catch (err) {
      showFatalError(err);
    }
  });
})();
