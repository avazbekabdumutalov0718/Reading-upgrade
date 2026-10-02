# VIVID IELTS V10 — Login & Preparation UX Fix

## User-requested fixes

- The VIVID IELTS login is now the first visible entry screen every time the site is opened.
- If Supabase already remembers a session, the login still remains visible and shows an **Account remembered** card with **Continue** and **Other account** actions.
- Email/password login, Sign up, Forgot password and Google OAuth remain available.
- The blocking messages **“Hisob tekshirilmoqda…”** and **“Hisobingizdagi natijalar yuklanmoqda…”** were removed from the startup UI.
- Supabase/cloud data is loaded silently while the branded login screen remains visible.
- The main application is only revealed after local + cloud state is ready, so the user does not see an unfinished/loading dashboard.
- After account data is ready, the optional dua/tasbeh choice opens as a modal **over the already loaded VIVID IELTS site**, instead of replacing the whole page with a narrow card and empty background.
- The dua/tasbeh choice was redesigned to match VIVID IELTS: V-logo, cream/purple autumn palette, rounded product card, gradient accent, feature chips and responsive layout.
- The full tasbeh/dua card also inherits the same VIVID IELTS visual system.
- After Skip or completion, the overlay disappears and the already-loaded site becomes active immediately.

## Existing features preserved

- Supabase account/cloud progress sync
- Google OAuth logic
- Email/password auth and signup
- 12 Tenses
- Reading Passages / Listening Tests libraries
- Reading Booster / Listening Boost
- Writing Booster and grammar systems
- Autumn background, leaves, rain and Focus Mode
- PWA/service worker

## Validation

- `cloud.js` syntax: PASS
- `preparation.js` syntax: PASS
- `app.js` syntax: PASS
- `tenses.js` syntax: PASS
- `service-worker.js` syntax: PASS
- bundled hosting `dist/server/index.js`: PASS
- Reading/MAX Speaking smoke: PASS
- Listening Boost smoke: PASS
- Writing Booster V6 smoke: PASS (3270 grammar drills)
- Local HTTP checks for `/`, `cloud.js`, `preparation.js`, CSS and tenses: 200 OK
