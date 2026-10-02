# VIVID IELTS V19 — Premium + Real Test + Cloud Sync

## Kirish sahifasi
- Landing/entry page’dagi aniq material sonlari olib tashlandi.
- Endi Reading testlari, Listening testlari, Boosters, Writing, Speaking, Grammar, Vocabulary, Mocks va cloud progress mazmuni matn bilan tushuntiriladi.
- Promo video yangilandi: unda ham aniq material sonlari yo‘q.
- Real Exam uchun alohida katta bo‘lim qo‘shildi: Reading Passages va Listening Tests haqida tushuntirish bor.
- Study flow, tools va Premium CTA qo‘shildi.

## Reading Passages / Listening Tests muammosi
- Eski academy premium/auth guard sabab test bosilganda eski dashboard/locked page’ga ketib qoladigan redirectlar direct Reading va Listening test sahifalaridan olib tashlandi.
- Library kartalari mavjud direct test fayllarga ulanadi.
- Reading/Listening test sahifalarida faqat bitta kichik `←` VIVID back tugmasi bor; matn yoki savolni yopmaydi.
- Oldingi academy dashboardga qaytaradigan ichki linklar VIVID IELTS Reading/Listening library’ga qaytariladi.

## Test ma’lumotlarini saqlash
- Reading va Listening testlardagi input/select/textarea javoblari autosave qilinadi.
- Submit qilinganda batafsil test history saqlanadi.
- Authenticated account mavjud bo‘lsa, external test state Supabase `user_state` ichidagi unified state bilan merge qilinadi.
- Main app snapshot ichiga `externalTests` ham qo‘shildi.
- Natijalar/history, Boosterlar, Writing progress, Grammar, Tenses, Speaking, vocabulary va mocklar avvalgi cloud snapshot tizimida qoladi.

## Writing Topic Collocations
- Writing Topic barabani Speaking Upgrade’dagiga yaqin katta wheel ko‘rinishiga o‘tkazildi.
- Wheel, selected topic, topic selector, collocation kartalari va game tugmasi bir bo‘limda tartibli ko‘rinadi.

## Premium
Tariflar foydalanuvchi bergan narxlar asosida:
- VIVID Basic: 129 000 so‘m → 79 000 so‘m (`39%` chegirma)
- VIVID Premium: 199 000 so‘m → 149 000 so‘m (`25%` chegirma)
- VIVID Gold Max: 349 000 so‘m → 299 000 so‘m (`14%` chegirma)

Har bir plan uchun `Bot orqali olish` tugmasi `https://t.me/vividielts_bot` ni ochadi.
Premium bo‘limi sidebar’ga ham qo‘shildi.

## Orqaga tugmasi
- Main workspace bo‘limlarida bitta kichik floating `←` tugma mavjud.
- Reading/Listening standalone testlarida ham bitta kichik `←` tugma mavjud.
- Tugmalar matn va savollarga xalal bermaydigan joyda turadi.

## Tekshiruv
- `app.js`, `cloud.js`, `writing-engine.js`, `imported-library.js`, `max-bridge.js`, `activity-bridge-v15.js`, `service-worker.js`: syntax PASS.
- Reading library hreflar: mavjud fayllarga ulangan.
- Listening library hreflar: mavjud fayllarga ulangan.
- Direct Reading/Listening testlarda eski `requirePremium/auth-guard` redirectlari: 0.
- Direct testlarda activity autosave bridge coverage: PASS.
- Entry page’da eski fixed material-count statistikasi: yo‘q.
- Premium narxlari va discount badge’lari: mavjud.
- V19 promo video + poster: mavjud.
- Service worker cache: V19.
