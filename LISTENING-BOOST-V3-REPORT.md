# Listening Boost v3 — qayta ishlangan versiya

## Asosiy o‘zgarishlar

- MCQ endi gap-fill emas. Har bir MCQ audio mazmunini tushunishga oid comprehension/understanding question sifatida ishlaydi.
- Short lesson: 5 MCQ, 10 Gap Fill, 5 T/F/NG, 5 Paraphrase, 10 Note Taking, 10 Dictation = 45 task.
- Long lesson: 10 MCQ, 25 Gap Fill, 10 T/F/NG, 10 Paraphrase, 15 Note Taking, 25 Dictation = 95 task.
- Daraja rejasi qat’iy qo‘shildi:
  - 1–10-kun: B2
  - 11–20-kun: C1
  - 21–30-kun: C2
- Daraja MCQ, T/F/NG, paraphrase va note-taking promptlarining murakkabligiga ta’sir qiladi.
- Audio Focus rejimi qo‘shildi. Mashq paytida YouTube video tasviri yashiriladi, audio esa sayt ichidagi embedded player orqali boshqariladi.
- Custom audio controls: Play, Pause, -5s, +5s, boshidan.
- Gap Fill / T/F/NG / Note Taking / Dictationda timestamp bo‘lsa, “shu joydan eshitish” tugmasi sayt ichidagi audio playerni kerakli vaqtga olib boradi.
- Dictation segmenti avtomatik ravishda qisqa segment oxirida pause bo‘lishi uchun endTime bilan yaratiladi.
- Dictationda oldindan “Javobni ko‘rsatish” tugmasi olib tashlandi. To‘g‘ri javob faqat bo‘lim tekshirilgandan keyin ko‘rinadi.
- Transcript mashq vaqtida ko‘rsatilmaydi.
- Oldingi v2 Listening progress/content bo‘lsa, migration qo‘shildi: eski cloze-MCQ yangi comprehension formatiga o‘tkaziladi. Day 1 TED-Ed lesson esa yangi tayyor kontent bilan almashtiriladi.
- Supabase/localStorage progress sinxi saqlangan.
- PWA/service worker cache versiyasi yangilandi.
- Hosting worker qayta build qilindi.

## Day 1 TED-Ed

User bergan “How to practice effectively...for just about anything” transcriptidan Day 1 short lesson uchun tayyor kontent paketga qo‘shildi. 5 ta MCQ qo‘lda comprehension formatida qayta yozildi. Transcriptning o‘zi learner UI’da ko‘rsatilmaydi.

## Muhim cheklov

60 ta video URL paketda tayyor. Lekin real dictation va audio-specific savollar xatosiz bo‘lishi uchun har bir videoning real transcripti kerak. Paketga user tomonidan berilgan transcript faqat Day 1 TED-Ed uchun mavjud edi. Boshqa lessonlarda oldin localStorage’da yaratilgan transcript-based content bo‘lsa v3 ga migratsiya qilinadi; bo‘lmasa Admin transcript import paneli ko‘rinadi. Soxta yoki taxminiy dictation gaplari paketga qo‘shilmadi.

## Tekshiruvlar

- listening-engine.js: syntax PASS
- app.js: syntax PASS
- dist/server/index.js: syntax PASS
- 60 lesson / 30 day structure PASS
- Har kuni 1 short + 1 long PASS
- B2/C1/C2 day mapping PASS
- Short 45 / Long 95 task count PASS
- YouTube direct URL / player embed URL checks PASS
- MCQ cloze emasligi smoke testda PASS
- Dictation answer + segment endTime checks PASS
- Reading / MAX SPEAKING smoke checks PASS
