# VIVID IELTS V11 — Entry, Login & Autumn Weather Fix

## 1. New entry page before login
- The site now opens on a dedicated VIVID IELTS landing/entry experience before authentication.
- Added platform explanation, major study areas, quick statistics, and two entry actions: **VIVID IELTS'ni boshlash** and **Hisobga kirish**.
- A clean feature strip explains Reading, Listening, Writing and Grammar.
- Autumn rain/leaves are intentionally hidden on the entry and login screens so authentication stays clean and readable.

## 2. New VIVID IELTS promo video
- Created a new 18-second 1280×720 MP4 specifically for this project.
- Visual direction follows the supplied minimalist website-presentation reference: light editorial background, floating website/browser frames, large typography and smooth scene changes.
- The promo uses VIVID IELTS screenshots/content rather than reusing the reference footage.
- File: `dist/vivid-ielts-promo-v11.mp4`
- Poster: `dist/vivid-ielts-promo-v11-poster.jpg`
- It autoplays muted and loops on the entry page.

## 3. Login redesigned/fixed
- The login remains based on the original `site (5)` VIVID IELTS auth layout.
- Removed the large **ACCOUNT REMEMBERED** card that was making the form crowded.
- Fixed Email/Password label and input alignment.
- Restored a clean two-column desktop layout: visual/video on the left, authentication on the right.
- Log in / Sign up tabs, password Show/Hide, Forgot password and Google OAuth remain.
- Added a small **← VIVID IELTS** action to return to the entry page.

## 4. Background account loading
- Removed visible email + `Supabase` status from the application top bar.
- Cloud sync still works internally.
- Account data is loaded while the authentication design remains visible; no separate full-screen “data loading” page is used.
- After login, the optional lesson-preparation modal appears over the already-loaded VIVID IELTS interface.

## 5. Autumn controls
- Existing **Focus** and **Rain** controls remain.
- Added **Leaves ON/OFF** so falling leaves and October leaf badges can be disabled.
- Added `Alt + L` shortcut for leaves.
- Rain is now noticeably clearer: more raindrops, higher contrast/opacity, and better evening visibility.
- Weather effects do not cover the landing or login screens.

## 6. Session behaviour
- A new tab starts with the VIVID IELTS entry page.
- After choosing Start/Login, the auth screen opens.
- Once successfully logged in, refreshing within the same tab can resume the signed-in app directly.
- Logging out resets the entry state so the landing page appears again.

## 7. Preserved features
The unified Reading/Listening libraries, Reading Booster, Listening Boost, Writing Booster, 12 Tenses, Grammar drills, Speaking tools, Autumn theme, optional dua/tasbeh preparation, PWA and cloud progress are preserved.

## Validation
- `cloud.js`: syntax PASS
- `autumn-theme.js`: syntax PASS
- `preparation.js`: syntax PASS
- `app.js`: syntax PASS
- `listening-engine.js`: syntax PASS
- `writing-engine.js`: syntax PASS
- `tenses.js`: syntax PASS
- `service-worker.js`: syntax PASS
- Writing V6 smoke: PASS — 3,270 drills
- Listening Boost smoke: PASS
- Reading/MAX Speaking smoke: PASS
- Promo video: 18.0 seconds, MP4/H.264, 1280×720
