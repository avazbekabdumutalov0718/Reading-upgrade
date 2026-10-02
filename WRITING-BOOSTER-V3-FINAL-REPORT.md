# VIVID IELTS — Writing Booster V3 Final

## User-requested corrections

1. All 9 Writing Booster exercise types use **Tekshirish**. There is no manual “Bajarildi deb belgilash” workflow in Writing Booster.
2. Exercise 3 — **Band 9 Detective** displays the **full essay**. The learner can drag-select sentence text with the mouse, choose a color/function, and check the full analysis at the end.
3. **Sample Answers Library** uses the same full-essay mouse highlighting workflow.
4. Color/function system:
   - 🟣 Thesis / position
   - 🔵 Main idea
   - 🟢 Explanation
   - 🟡 Example
   - 🟠 Cohesion
   - 🔴 Advanced grammar
5. Selection workflow: select text with mouse → floating color palette appears → choose role → final **Tekshirish** gives sentence-level feedback.
6. Grammar Lab rebuilt so every drill has **Tekshirish** and real answer validation.
7. Every grammar structure shows:
   - English function/meaning;
   - Uzbek explanation;
   - 3 English examples;
   - Uzbek translation of all 3 examples.
8. Task 2 Grammar: 30 structures × 30 drills = 900 drills.
9. Task 1 Grammar: 20 structures × 30 drills = 600 drills.
10. Grammar exercise types rotate through identify, gap fill, reorder, error correction, Uzbek→English translation and own-sentence production.
11. Wrong answers show corrective feedback/model; own-sentence production checks target-structure usage and minimum development.
12. Existing 50-day course, Idea Bank, Expressions, Writing Mock, Supabase progress, Reading, Listening, Speaking and other sections are retained.

## Verified totals

- 50 writing days
- 44 micro-tasks/day
- 2,200 course micro-tasks
- 356 full sample answers
- 30 Task 2 grammar structures
- 20 Task 1 grammar structures
- 1,500 grammar drills

## Validation completed

- `node --check dist/writing-engine.js` — PASS
- `node --check dist/app.js` — PASS
- `node --check dist/server/index.js` — PASS
- `scripts/smoke_writing_v2.cjs` — PASS
- Reading/MAX Speaking smoke — PASS
- Listening Boost v3 smoke — PASS
- Data validation: 50 days, 356 samples, 2,200 tasks, 1,500 grammar drills — PASS
- No old Writing Booster `Bajarildi deb belgilash` string — PASS
