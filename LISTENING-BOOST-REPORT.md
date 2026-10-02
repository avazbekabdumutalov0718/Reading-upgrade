# VIVID IELTS — Listening Boost hisoboti

## Qo‘shilgan reja

- 30 kunlik plan.
- Har kuni 2 ta listening: 1 short + 1 long.
- Jami 60 lesson.
- Short katalog: TED-Ed 15 + Kurzgesagt 15.
- Long katalog: The Diary Of A CEO 8 + Ali Abdaal 8 + Jay Shetty Podcast 7 + Alex Hormozi 7.

## Mashqlar soni

### Short-form — 45 task
- MCQ: 5
- Gap Fill: 10
- True / False / Not Given: 5
- Synonym & Paraphrase: 5
- Note Taking: 10
- Dictation: 10

### Long-form — 95 task
- MCQ: 10
- Gap Fill: 25
- True / False / Not Given: 10
- Synonym & Paraphrase: 10
- Note Taking: 15
- Dictation: 25

Kunlik jami: 140 task. 30 kunlik jami: 4,200 task.

## Aniqlik mexanizmi

Podcast/video matni o‘ylab topilmaydi. Har lesson uchun:
1. Saytdagi YouTube qidiruv tugmasi kerakli channel + topicni ochadi.
2. Foydalanuvchi tanlagan videoning aniq YouTube URL’ini saqlashi mumkin.
3. YouTube `Show transcript` matni paste qilinadi.
4. Generator aynan shu transcript asosida lessonning belgilangan task sonini yaratadi.
5. Timestamp mavjud bo‘lsa Dictation itemlarida vaqt ko‘rsatiladi va saqlangan YouTube URL orqali o‘sha vaqtdan ochish mumkin.

Bu yondashuv video gaplarini taxmin qilishdan saqlaydi. Xom transcript cloudga alohida saqlanmaydi; yaratilgan tasklar va foydalanuvchi progressi saqlanadi.

## Cloud / Supabase

`listeningBoostProgress` asosiy `vocab_atlas_state.data` JSON snapshotiga qo‘shildi. Quyidagilar cloud syncga kiradi:
- generated exercise content;
- MCQ/Gap/T-F-NG/Paraphrase/Dictation javoblari;
- Note Taking yozuvlari;
- section scorelari;
- saved exact YouTube URL;
- lesson completion holati.

Yangi Supabase jadvali yoki SQL migration shart emas.

## PWA / Worker

Service Worker cache yangilandi va quyidagi assetlar shellga qo‘shildi:
- `listening-data.json`
- `listening-engine.js`
- `listening-boost.css`

Static Worker ham qayta build qilindi.

## Backup

JSON backup eksport/importiga Listening Boost progressi qo‘shildi. Backup hajmi limiti 5 MB dan 20 MB ga oshirildi.

## Tekshiruvlar

- `node --check dist/app.js` — PASS
- `node --check dist/listening-engine.js` — PASS
- `node --check dist/service-worker.js` — PASS
- `node --check dist/server/index.js` — PASS
- `node scripts/smoke_listening.cjs` — PASS
- `node scripts/smoke_sections.cjs` — PASS
- `listening-data.json`: 60 unique lesson, 30 kun, har kuni 1 short + 1 long — PASS
- Short generator: 45 item — PASS
- Long generator: 95 item — PASS
- Local HTTP static assets: index/listening assets/100day — 200 OK
