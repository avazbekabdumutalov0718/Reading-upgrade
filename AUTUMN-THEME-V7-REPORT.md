# VIVID IELTS — Autumn Study Season V7

Base: Writing Booster V6 — 30 Mixed Grammar.

## Added
- Warm cream/beige autumn background (`#FFF9F2 → #F7EFE5`).
- 7 slow falling leaves with CSS-only animation.
- Deep purple → plum → burnt-orange header and Toshkent clock gradients.
- Subtle orange/gold hover glow for Writing, Reading, Listening and common study cards.
- October-only mini leaf badges on selected sidebar study icons.
- `☕ Focus` control: hides sidebar/topbar and centers the active study content while keeping the Toshkent clock visible.
- `🌧 Rain` control: toggles a lightweight 28-drop rain overlay; preference persists in localStorage.
- Automatic Toshkent-time mood:
  - 05:00–17:59 — warm cream morning/day palette.
  - 18:00–04:59 — deep navy/purple evening palette with amber accents.
- Accessibility/performance: weather animation is disabled automatically when `prefers-reduced-motion: reduce` is enabled.
- Keyboard shortcuts: Alt+F = Focus, Alt+R = Rain, Esc exits Focus mode.
- Service worker cache bumped to v11 and autumn assets added for PWA/offline use.

## Files added
- `dist/autumn-theme.css`
- `dist/autumn-theme.js`

## Files updated
- `dist/index.html`
- `dist/service-worker.js`
