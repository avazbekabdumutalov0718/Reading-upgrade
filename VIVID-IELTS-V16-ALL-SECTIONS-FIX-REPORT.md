# VIVID IELTS V16 — All Sections Fix

## Root cause fixed
V15 rebuilt the sidebar and removed the old `navAll` counter, but `updateNav()` still accessed `#navAll.textContent` on every render. That threw a JavaScript error before the selected section could render. The startup catch then incorrectly displayed “So‘zlarni yuklab bo‘lmadi”, making unrelated sections such as Listening Boost, Writing Booster and Speaking Upgrade look like their data was broken.

V16 makes every optional sidebar counter null-safe, so removing or renaming one navigation item can no longer crash the whole app.

## Auth / cloud fix
V15 also contained a temporary local-only `VocabCloud.start()` stub. It loaded the UI but skipped the real Supabase session/state startup path. V16 restores the real auth flow from the working cloud implementation:
- VIVID entry page -> Log in / Sign up
- Supabase session detection
- `user_state` load
- unified state apply
- background saving after the app opens

Raw `Invalid login credentials` is replaced by a clearer message telling the learner to use Google or reset the password. Wrong passwords are not silently accepted.

## Startup / module resilience
- Vocabulary data loading and section rendering are now separated.
- `data.json` is loaded with an explicit resolved URL and validated before use.
- A section render error no longer gets mislabeled as a vocabulary download error.
- Reading Library, Listening Library, Writing Booster and 12 Tenses explicitly verify that their module loaded.
- The topbar eyebrow and all sidebar counters are null-safe.

## 22 navigation sections checked
1. Reading Booster
2. Listening Boost
3. Writing Booster
4. Speaking Upgrade
5. Reading Passages
6. Listening Tests
7. Speaking Mock
8. Mocks
9. Speaking Words
10. Daily Speaking
11. Topic 100
12. Topiclar
13. Topic barabani
14. Takrorlash
15. So‘z qidirish
16. Xato daftar
17. Sevimli so‘zlar
18. O‘yinlar
19. 12 Tenses
20. Grammar structures
21. Grammar o‘yinlari
22. Natijalar

## Preserved content
- Speaking Words: 850 entries
- Listening Boost: 60 lessons
- Writing Grammar: 3,270 drills
- Reading Booster and Reading Library
- Listening Tests
- Speaking Mock / archive / PDF flow
- Writing Booster / collocations / mock
- Autumn Focus, Rain and Leaves controls
- Supabase project from the working old VIVID site

## PWA / deployment fix
The service-worker cache was bumped to `vivid-ielts-v16-all-sections-fix` so the browser does not keep serving the broken V15 JavaScript.

The bundled server build was also rebuilt. It now includes:
- the V16 app/cloud files
- `v15-upgrade.css` (required by the current UI)
- the merged academy Reading/Listening HTML/CSS/JS/JSON assets
- the VIVID auth background video and academy images required by the unified UI

## Validation
PASS:
- JavaScript syntax: app, cloud, Writing, Listening, Imported Library, 12 Tenses, service worker, server bundle
- exact requested 22-section sidebar order
- every local CSS/JS asset referenced by index.html exists
- every academy HTML path referenced by Imported Library exists
- all top-level JSON files parse
- data.json: 4,402 entries, exactly 850 Speaking Words
- Listening Boost: 60 lessons
- Listening smoke test
- Reading/MAX Speaking smoke test
- Writing V6 smoke test: 3,270 drills
- cloud auth startup restored (no local-only stub)
