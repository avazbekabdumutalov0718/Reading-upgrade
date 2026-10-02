# VIVID IELTS

IELTS so‘zlari, flashcardlar, o‘yinlar, Speaking, grammar va 100 kunlik jurnal uchun saytning to‘liq kodi.

Speaking Part 1–3 bo‘limi `scripts/speaking-master.md` manbasidan yangilangan: Part 1 — 57 mavzuda 418 savol; Part 2 — 91 cue card; Part 3 — 129 to‘plamda 1 029 savol. Eski Speaking savollar banki olib tashlangan. **100 topic · 3 zamon** bo‘limi esa ikkinchi paketdan qayta tiklandi va yangi Speaking Part 1–3 bilan yonma-yon ishlaydi. Mock savollari yangi bankdan olinadi.

Reading Booster’da 30 kunlik Real Exam, Training, to‘liq o‘zbekcha passage tarjimasi, alohida so‘z tarjimasi va 7 ta Words o‘yini bor. Passage va savoldagi so‘zlarning oldindan tayyorlangan tarjimasi `dist/reading-translations.json` faylida. Translation Challenge namunasi ham shu fayldan olinadi. Tarjimalar avtomatik hosil qilingan, murakkab joylarda asl matn bilan solishtirish lozim.

MAX SPEAKING barabani 30 mavzudan foydalanilmagan bittasini tugma bosilganda tasodifiy tanlaydi. Keyingi aylantirish 12 soatdan keyin ochiladi; tushgan mavzu yana tanlanmaydi. 30 tasi tugagach baraban yakunlanadi. Holat hisobga bog‘langan Supabase saqlash tizimiga ham qo‘shilgan.

## VS Code’da ochish

1. ZIP faylni oching va `IELTS-MAX-INTENSIVE` papkasini VS Code’da **File → Open Folder** orqali tanlang.
2. VS Code’ga **Live Server** kengaytmasini o‘rnating.
3. `dist/index.html` faylini o‘ng tugma bilan bosing va **Open with Live Server** ni tanlang. `.vscode/settings.json` sayt ildizini `dist` papkasiga sozlaydi; 100 kunlik jurnal ham shu manzilda ishlaydi.

Yoki terminalda Python orqali ishga tushiring:

```bash
python -m http.server 5500 --directory dist
```

So‘ng `http://localhost:5500/` manzilini oching. HTML faylni bevosita `file://` orqali ochmang: saytning JSON ma’lumotlari va ichki sahifalariga mahalliy server kerak.

## Papkalar

- `dist/` — ishlaydigan sayt, 100 kunlik jurnal, `topic-lab.json`, JSON ma’lumotlar, kirish videosi va stillar.
- `scripts/` — ma’lumotlarni, videoni va sayt Worker paketini yig‘ish kodlari; Supabase uchun SQL yo‘riqnomalari.
- `scripts/speaking-master.md` — yangi Speaking materialining to‘liq manbasi; `python scripts/build_speaking_from_master.py` JSON savollar bankini qayta hosil qiladi.
- `dist/reading-translations.json` — 30 passage matni va Reading savollaridagi so‘zlarning tayyor mashina tarjimasi; sayt ishlaganda tarjima xizmati yoki tarjima modeli o‘rnatilmaydi.
- `worker/` — Sites platformasida ishlatiladigan statik Worker manbasi.
- `.openai/hosting.json` — mavjud Sites loyihasining identifikatori.

Saytning Supabase hisobiga kirish va bulutga saqlash funksiyalari internet aloqasiga bog‘liq. `dist/supabase-config.js` faqat ommaviy *publishable* kalitni saqlaydi; serverning maxfiy kaliti ZIP ichida yo‘q. Mavjud natijalarni saqlaydigan ichki `vocab-atlas-*` kalitlari moslik uchun ataylab o‘zgartirilmagan.

Worker faylini manbalardan qayta yig‘ish:

```bash
python scripts/build_mock_worker.py
```

Tarjimalarni qayta tayyorlash ixtiyoriy. `scripts/build_reading_translations.py` mahalliy CTranslate2 formatidagi [HPLT English–Uzbek MT v2.0](https://huggingface.co/HPLT/translate-en-uz-v2.0-hplt) (CC BY 4.0) modeli va SentencePiece tokenizeri bilan ishlaydi. Model fayllari ZIPga kiritilmagan, chunki ishlaydigan sayt uchun kerak emas. Yangi tarjimalar hosil qilinsa, Worker’ni qayta yig‘ing. Qo‘shimcha WordNet/UzWordnet manbalari `dist/reading-wordnet-license.txt` va `scripts/build_reading_lexicon.py` da ko‘rsatilgan.

## Toshkent vaqti va Reading Real Exam to‘liq ekrani

- `dist/tashkent-clock.js` va `dist/tashkent-clock.css` — sayt tepasida, barcha bo‘limlarda (Reading Real Exam to‘liq ekranida ham) Toshkent (O‘zbekiston, UTC+5) vaqtini soat:daqiqa:soniya ko‘rinishida ko‘rsatadi. Qurilma vaqt mintaqasi boshqa bo‘lsa ham Toshkent vaqti chiqadi.
- Reading Booster → Real Exam ochilganda sayt brauzerning to‘liq ekran rejimiga o‘tadi, yon menyu yashiriladi va matn/savollar butun ekranni egallaydi. Imtihon panelidagi **⛶ To‘liq ekran** tugmasi Esc bosilgandan keyin qaytadan to‘liq ekranga o‘tkazadi.
- Manba: `scripts/reading-booster-ui-snippet.js`. O‘zgartirgach `python scripts/inject_latest_sections.py` va `python scripts/build_mock_worker.py` ni ishga tushiring.

## Supabase + Google/Gmail + o‘rnatiladigan app

Bu paketda Google/Gmail login va PWA app qo‘shilgan. Sayt yoki o‘rnatilgan appda bir xil Google hisob bilan kirilganda Supabase’dagi bir xil foydalanuvchi ID ishlatiladi va cloud progress qayta yuklanadi. To‘liq SQL: `scripts/supabase_full_setup.sql`. Google provider va redirect sozlamalari: `scripts/SUPABASE_GOOGLE_PWA_SETUP.md`.

`task-files` va Speaking audio bucketlari private: fayl ko‘rishda vaqtinchalik signed URL ishlatiladi. Frontendda faqat publishable Supabase key bo‘ladi; Google Client Secret va Supabase service-role key frontendga qo‘yilmaydi.

PWA fayllari: `dist/manifest.webmanifest`, `dist/service-worker.js`, `dist/pwa.js`, `dist/app-icon-192.png`, `dist/app-icon-512.png`. Chrome/Edge/Android’da install prompt mavjud bo‘lsa tepada **Appni o‘rnatish** tugmasi chiqadi.

## Listening Boost — 30 kun / 60 lesson

Listening Boost alohida menyu bo‘limi sifatida qo‘shilgan. Reja har kuni 2 ta listeningdan iborat:

- **Short-form — 30 lesson:** 15 ta TED-Ed + 15 ta Kurzgesagt.
- **Long-form — 30 lesson:** The Diary Of A CEO (8), Ali Abdaal (8), Jay Shetty Podcast (7), Alex Hormozi (7).
- **Short lesson:** MCQ 5 + Gap Fill 10 + T/F/NG 5 + Synonym/Paraphrase 5 + Note Taking 10 + Dictation 10 = **45 task**.
- **Long lesson:** MCQ 10 + Gap Fill 25 + T/F/NG 10 + Synonym/Paraphrase 10 + Note Taking 15 + Dictation 25 = **95 task**.
- Har kun: **140 task**. To‘liq 30 kun: **4 200 task**.

`dist/listening-data.json` 30 kunlik 60 lesson planini saqlaydi. `dist/listening-engine.js` transcriptni timestamp bilan yoki timestampsiz o‘qib, kerakli miqdordagi mashqlarni hosil qiladi. `dist/listening-boost.css` yangi UI stillari.

Aniqlik uchun YouTube gaplari sayt ichida taxmin qilinmaydi. Lesson ichida YouTube qidiruvi ochiladi; tanlangan videoning aniq URL’i saqlanadi va **Show transcript** matni bir marta kiritiladi. Mashqlar faqat shu kiritilgan transcriptdan yaratiladi. Timestamp mavjud bo‘lsa Dictation savolida tegishli vaqtga o‘tish linki ko‘rinadi. Transcriptning to‘liq xom matni saqlanmaydi; yaratilgan mashqlar, javoblar, note’lar, score va progress `vocab-atlas-listening-booster-v1` orqali mavjud Supabase cloud snapshotga qo‘shiladi. Shu sababli yangi SQL migration kerak emas.

Listening regression testi:

```bash
node scripts/smoke_listening.cjs
```


## Listening Boost — tayyor YouTube embed (v2)

- 60 ta lessonning har birida aniq YouTube video URL oldindan biriktirilgan.
- Kun sahifasida short va long video embed holatda ko‘rinadi; qidirish shart emas.
- Lesson ichida ham video player doim tepada turadi.
- Privacy-enhanced YouTube embed (`youtube-nocookie.com`) ishlatiladi.
- Agar muallif embeddingni o‘chirsa yoki video keyin o‘chirilsa, `YouTube’da ochish` fallback tugmasi bor.
- Faqat mashq yaratish uchun real `Show transcript` matnini paste qilish kerak; sayt transcriptni taxmin qilmaydi.
