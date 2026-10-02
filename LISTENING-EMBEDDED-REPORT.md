# LISTENING BOOST — EMBEDDED VIDEO HISOBOTI

Sana: 2026-09-30

## Qilingan ishlar

- 60 ta Listening Boost lesson uchun aniq YouTube URL oldindan biriktirildi.
- 30 kunning har birida 1 ta short va 1 ta long video tayyor embed ko‘rinishida chiqadi.
- Foydalanuvchi YouTube’da video qidirib yurishi shart emas.
- Kun sahifasida ikkala video ham ko‘rinadi; lesson ichida ham player tepada qoladi.
- Embed uchun privacy-enhanced `youtube-nocookie.com` format ishlatiladi.
- Video embed cheklansa/o‘chirilsa `YouTube’da ochish` fallback tugmasi mavjud.
- Muqobil YouTube URL qo‘yish imkoniyati faqat fallback sifatida yopiq `<details>` ichida qoldirildi.
- Dictation timestamp tugmalari aynan lessonning tayyor video URL’iga ulanadi.
- PWA service-worker cache versiyasi yangilandi va front-end asset cache-bust `lb2` ga ko‘tarildi.
- `dist/server/index.js` static Worker bundle ham yangi embed/data bilan qayta build qilindi.

## Mashq hajmi

- Short: 5 MCQ + 10 Gap Fill + 5 T/F/NG + 5 Paraphrase + 10 Note Taking + 10 Dictation = 45.
- Long: 10 MCQ + 25 Gap Fill + 10 T/F/NG + 10 Paraphrase + 15 Note Taking + 25 Dictation = 95.
- Har kun: 45 + 95 = 140 task.
- 30 kun: 4,200 task maksimal reja.

## Video taqsimoti

- TED-Ed: 15 ta
- Kurzgesagt – In a Nutshell: 15 ta
- The Diary Of A CEO: 8 ta
- Ali Abdaal: 8 ta
- Jay Shetty Podcast: 7 ta
- Alex Hormozi: 7 ta

## Tekshiruvlar

- `node --check dist/app.js` — PASS
- `node --check dist/listening-engine.js` — PASS
- `node scripts/smoke_sections.cjs` — PASS
- `node scripts/smoke_listening.cjs` — PASS
- JSON: 60/60 lessonda direct YouTube URL bor — PASS
- 60 ta YouTube video ID unique — PASS
- 1–30 kunning har birida aynan 1 short + 1 long — PASS
- Har kun jami 140 task — PASS
- Local HTTP orqali index/data/JS/CSS/service worker — 200 OK

## Muhim izoh

YouTube’da video egasi keyinchalik embeddingni o‘chirishi, videoni o‘chirishi yoki hududiy cheklov qo‘yishi mumkin. Shu holat uchun lesson ichida `YouTube’da ochish` fallback tugmasi qoldirilgan. Mashqlarni xatosiz real audio asosida yaratish uchun Show transcript matnini paste qilish qismi saqlangan; transcript taxmin qilinmaydi.
