# VIVID IELTS — Unified Site V8

Merged sources:
- VIVID IELTS Autumn V7 as the primary application/design.
- site (5) as the imported real-exam content library and login visual reference.

## Main merge decisions
- Main landing/intro: VIVID IELTS kept.
- Login/register: redesigned with SITE-style Log in / Sign up tabs while still using VIVID IELTS Supabase.
- One Supabase project/session: https://opsyyvuvhdqikmuwfnkz.supabase.co
- New VIVID IELTS sidebar section: REAL EXAM · SITE LIBRARY.
- Reading Passages: 92 passage cards.
- Full Reading: 20 full-test cards.
- Listening Tests: 30 cards.
- Existing Reading Booster and Listening Boost remain separate and untouched.
- All imported SITE HTML content copied under dist/academy/ and given an VIVID IELTS theme bridge + floating return control.
- Old academy index/auth/dashboard redirect to the single VIVID IELTS app to avoid two separate sites/login screens.
- Reading result saving in imported classic reading tests is bridged to the existing daily_logs table when possible, with local fallback.

## Navigation
VIVID IELTS → REAL EXAM · SITE LIBRARY → Reading Passages / Listening Tests.

## Validation targets
- app.js and cloud.js syntax
- imported counts 92+20+30
- legacy links exist
- service worker contains merged assets
