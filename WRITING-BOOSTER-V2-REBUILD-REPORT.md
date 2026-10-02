# VIVID IELTS — Writing Booster V2 rebuild

## User-requested fixes

- Every 50-day course exercise now has a real **Tekshirish** action. The old `Bajarildi deb belgilash` button was removed from Writing Booster.
- Course progress is marked automatically only after the exercise check reaches its local pass rule.
- **Exercise 3 — Band 9 Detective** now displays the **full essay**. The learner can drag-select sentence text with the mouse, choose one of six colors/functions, and check the whole essay at the end.
- **Sample Answers Library** uses the same full-essay mouse highlighting system. Dropdown-per-sentence analysis was removed.
- Mouse workflow supports: select text → floating color palette appears → choose color → final `Tekshirish`.
- The six functions remain: Thesis/position, Main idea, Explanation, Example, Cohesion, Advanced grammar.
- Paragraph Reconstruction, Missing Sentence, Sentence Upgrade, Vocabulary/Expression, Error Challenge, Task 1 Lab, Idea Builder and Outline Builder all return check feedback and a model/benchmark only after checking.
- Error Challenge still reveals a strong Band 8+ model after checking.
- Expression Games now also have `Tekshirish`.

## Grammar Lab rebuilt

- 30 Task 2 structures × 30 drills = **900 drills**.
- 20 Task 1 structures × 30 drills = **600 drills**.
- Total = **1,500 grammar drills**.
- Every structure now shows:
  - English function/meaning;
  - **Uzbek explanation**;
  - **3 English examples**;
  - **Uzbek translation for each of the 3 examples**.
- Every grammar drill now has `Tekshirish`.
- Drill types rotate through identify, gap fill, reorder, error correction, Uzbek→English translation, and own-sentence production.
- Closed-answer drills compare against the expected answer; own-sentence drills verify minimum sentence length plus the target structure signal and then show a model.

## Existing Writing Booster content retained

- 50 days.
- 44 course micro-tasks per day = **2,200 total**.
- Sample Answers Library = **356 samples**.
- Idea Bank, Expressions, Writing Mock and Supabase/cloud progress integration remain.
- Existing Reading, Listening, Speaking, Grammar and other VIVID IELTS sections remain in the package.

## Validation

- `node --check dist/writing-engine.js` — PASS.
- `node --check dist/server/index.js` — PASS.
- `scripts/smoke_writing_v2.cjs` — PASS.
- Existing Reading/MAX Speaking smoke — PASS.
- Existing Listening Boost v3 smoke — PASS.
- Browser-level isolated smoke test with Chromium — PASS, including:
  - all 9 course exercise types showing the correct number of `Tekshirish` buttons;
  - no Writing Booster `Bajarildi` buttons;
  - full-essay color analysis in course and Sample Answers;
  - mouse selection opening the floating color palette;
  - 3 grammar examples + Uzbek translation;
  - correct Grammar Lab answer validation;
  - no JavaScript page errors during the smoke flow.
