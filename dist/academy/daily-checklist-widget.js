/* ===================== VIVID IELTS — Daily Checklist compact widget =====================
   Renders a small summary card into #dclDashboardWidget on dashboard.html, linking to the
   full checklist on roadmap.html#checklist.
=================================================================== */
(function () {
  const C = window.VividChecklist;
  if (!C) return;

  function ring(pct) {
    const r = 26, c = 2 * Math.PI * r;
    const off = c - (c * pct) / 100;
    return `
      <svg viewBox="0 0 64 64" class="dcl-widget-ring">
        <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--canvas-2)" stroke-width="7"/>
        <circle cx="32" cy="32" r="${r}" fill="none" stroke="url(#dclWidgetGrad)" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
          transform="rotate(-90 32 32)"/>
        <defs>
          <linearGradient id="dclWidgetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff5a5f"/><stop offset="100%" stop-color="#7c5cfc"/>
          </linearGradient>
        </defs>
        <text x="32" y="37" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">${pct}%</text>
      </svg>`;
  }

  async function render() {
    const el = document.getElementById('dclDashboardWidget');
    if (!el) return;
    await C.loadState();
    const comp = C.dayCompletion(C.TODAY);
    const streak = C.computeStreak();
    const consistency = C.computeConsistencyScore();
    el.innerHTML = `
      ${ring(comp.pct)}
      <div class="dcl-widget-main">
        <h4>\uD83D\uDCCB Bugungi checklist</h4>
        <p>${comp.done}/${comp.total} vazifa bajarildi \u2014 PDF asosidagi kunlik reja.</p>
      </div>
      <div class="dcl-widget-stats">
        <div class="dcl-widget-stat"><b>\uD83D\uDD25 ${streak}</b><span>streak</span></div>
        <div class="dcl-widget-stat"><b>${consistency}%</b><span>consistency</span></div>
      </div>
      <a class="dcl-widget-link" href="roadmap.html#checklist">To'liq ko'rish \u2192</a>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dclDashboardWidget')) render();
  });
})();
