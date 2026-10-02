# VIVID IELTS — Writing Booster 50-Day Report

## Final scope
The 50-day course does **not** force every uploaded book item into the daily plan. The daily course selects useful, IELTS-relevant material. The **Sample Answers Library keeps every extracted sample answer by source**, including duplicates that appear in multiple source PDFs.

## 50-day course
Each day contains 44 micro-tasks:

1. Idea Builder — 2/day
2. Outline Builder — 2/day
3. Band 9 / Model Essay Detective — 2/day
4. Paragraph Reconstruction — 3/day
5. Missing Sentence — 5/day
6. Sentence Upgrade — 15/day
7. Vocabulary → Sentence → Paragraph — 10/day
8. Error Challenge — 3/day, with a strong model paragraph under the weak paragraph
9. Task 1 Lab — 2/day

Total: **50 × 44 = 2,200 course micro-tasks**.

The 50-day topic plan prioritizes common IELTS domains: education, technology, environment, health, work, crime, government, transport, culture, family, media, tourism, science, globalisation, inequality, etc.

## Idea Bank
- IELTS Liz-derived topic bank: **124 extracted topic sections** from the uploaded book text layer / answer-key material.
- Displays extracted idea/argument notes when available.
- Displays vocabulary from the same topic section when available.
- Adds related model-essay ideas so each topic can be developed as: position → why → result → example.

## Sample Answers Library
All extracted model/sample answers are kept by source:

- 240 Writing Topics — **120** model essays
- Sample Band 9 Essays — **36**
- Simon Task 2 — **38**
- Simon Task 1 — **51**
- Essays From Examiners 2019 — **111**

Total: **356 sample-answer entries**.

Duplicates are intentionally preserved when they appear in different uploaded sources.

### Color Analysis
Every sample can be practiced sentence by sentence with:
- 🟣 Thesis / position
- 🔵 Main idea
- 🟢 Explanation
- 🟡 Example
- 🟠 Cohesion
- 🔴 Advanced grammar

The learner selects a role and presses **Tekshirish**. There is also a reveal option.

## Expressions
- **1,173 unique extracted useful expressions** from the 240 Writing Topics sample material.
- 7 game modes:
  1. Topic Match
  2. Gap Fill
  3. Reorder
  4. Connector Swap
  5. Sentence Finish
  6. Error Fix
  7. Own Sentence

The daily 50-day course uses 10 expression/vocabulary tasks per day.

## Grammar Lab
### Task 2
- 30 high-utility structures
- 30 exercises per structure
- Total: **900 drills**

### Task 1
- 20 high-utility structures
- 30 exercises per structure
- Total: **600 drills**

Total grammar drills: **1,500**.

Exercise rotation includes identify, gap, reorder, correction and own-sentence/rewrite practice.

## Writing Mock
Three modes:
- Full Academic Writing — **60 minutes**
- Task 1 — **20 minutes**
- Task 2 — **40 minutes**

Full mode uses Task 1 + Task 2, and the overall practice estimate weights Task 2 twice.

Four criteria:
- Task Achievement / Task Response
- Coherence & Cohesion
- Lexical Resource
- Grammatical Range & Accuracy

The site gives a **local practice estimate**, not an official IELTS examiner score. Band-9-labelled uploaded samples are shown as benchmark models with a four-criteria practice analysis.

## Saving / sync
Writing Booster progress is included in the existing VIVID IELTS Supabase/cloud snapshot:
- 50-day completion
- notes/drafts inside course tasks
- Sample Answer color-analysis selections
- grammar drill completion
- mock history

It is also included in local backup export/import.

## PWA / hosting
Added to:
- main navigation
- PWA service-worker shell
- static Worker bundle
- cloud snapshot

New files:
- `dist/writing-data.json`
- `dist/writing-engine.js`
- `dist/writing-boost.css`

## Validation
Passed:
- `app.js` syntax
- `writing-engine.js` syntax
- generated Worker syntax
- existing Listening Boost smoke test
- existing Reading/MAX SPEAKING smoke test
- 50-day count and reference integrity
- 356 sample-answer count integrity
- 7 expression games
- 30×30 Task 2 grammar integrity
- 20×30 Task 1 grammar integrity
- static Worker contains all Writing assets
