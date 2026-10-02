# VIVID IELTS V20 — Speed Listening 30

- Sidebar grouped into Upgrade Skills / Mocks / Premium / Speaking & Vocab / Review & Games / Grammar / Progress.
- Renamed: Reading Upgrade, Listening Upgrade, Writing Upgrade, Reading Mock, Listening Mock.
- Added Speed Listening 30 inside Listening Upgrade.
- 30 fresh videos: 15 TED + 15 Kurzgesagt, alternating by day and verified not to overlap existing listening-data video IDs.
- Audio-only YouTube player; video image stays hidden.
- Playback rates: 1.0x, 1.25x, 1.5x MAX.
- Each day: 15 segment-based Gap Filling inputs + 15 full-sentence Dictation inputs + Speed Max stages.
- Progress is stored inside the existing listeningBoostProgress cloud payload, so no new Supabase SQL is required.
- Third-party transcript text is not bundled. Dictation/gap work as audio segment self-check practice, avoiding copied transcript distribution.
- Speed stage uses 1.25x instead of 1.2x because YouTube playback rates are video/API-supported discrete values; 1.25x is the reliable nearby training rate.
- Validation: app.js/imported-library.js/listening-engine.js syntax OK; original Listening Boost smoke test OK; Reading/MAX Speaking smoke test OK; V20 Speed Listening smoke test OK.
