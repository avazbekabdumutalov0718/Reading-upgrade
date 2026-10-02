# VIVID IELTS V14 — Clean Reading + site(5) Supabase + Long Entry

- Reading Library now stops at **William Gilbert and Magnetism**.
- All generated/new-reading single passages after William Gilbert were removed from the library.
- Full Reading Mock library was removed completely.
- Imported full-reading assets were removed from the package.
- Main Supabase project switched to the project bundled in `site (5)(1).zip`: `dopccjigpfhukjthrvnf.supabase.co`.
- Google OAuth now uses that project, matching the older site configuration that previously reached Google sign-in.
- Unified progress sync now uses the older project's generic `user_state` table with the key `vivid_ielts_unified_state_v14`, so the new app does not depend on the previous project's custom state tables.
- Enter page rebuilt as a longer landing page with descriptive skill sections instead of numeric inventory counters.
- Entry design uses large soft/3D-like icons, gradient headings, a blue visual study block, and longer explanations inspired by the supplied visual style.
- Listening, Writing, Speaking, Grammar, Boosters, autumn controls, and the rest of the V13 app remain in place.
