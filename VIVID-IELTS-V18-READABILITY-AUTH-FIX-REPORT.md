# VIVID IELTS V18 — Readability + Auth Transition Fix

## Tuzatilgan muammolar

1. **Login input matni ko‘rinmasligi**
   - Email va Password maydonlarida oddiy holat, focus holati va Chrome autofill holati uchun aniq dark text qo‘yildi.
   - `-webkit-text-fill-color` alohida belgilandi, shuning uchun browser autofill matnni oq qilib yubormaydi.
   - Placeholder ranglari ham qayta aniqlandi.
   - Dark login theme tanlansa, input text avtomatik oq rangga o‘tadi.

2. **Writing Booster’dagi oq/bo‘sh ko‘ringan yozuvlar**
   - 50 kun yonidagi barcha tab nomlari qayta ko‘rinadigan dark rangga o‘tkazildi.
   - Idea Bank, Sample Answers, Writing Topic Collocations, 15-card Collocations, Writing Grammar va Writing Mock tablari light fonda aniq ko‘rinadi.
   - Writing filter input/select, grammar input/textarea, mock textarea va boshqa light form control matnlari ham aniq dark rangga mahkamlandi.
   - Active purple tablar oq rangda qoladi.

3. **Login’dan keyingi entry-page flash**
   - `cloud.js` startup’dagi oldindan majburiy `renderEntry()` olib tashlandi.
   - Endi `VocabCloud.start()` session holatini tekshiradi va faqat kerakli sahifani render qiladi.
   - Valid session/login bo‘lsa entry page bir lahzaga qayta chizilmaydi; workspace to‘g‘ridan-to‘g‘ri ochiladi.
   - Logout qilinganda entry page odatdagidek yana chiqadi.

4. **Cache**
   - Service Worker cache V18 ga yangilandi: `vivid-ielts-v18-auth-readability-fix`.
   - `cloud.js` va classic CSS query versiyalari yangilandi.
   - Server bundle ichidagi index/cloud/CSS/service-worker assetlari ham yangilandi.

## Saqlangan funksiyalar

- 22 ta sidebar route
- 850 Speaking Words
- Listening Boost 60 lesson
- Writing Grammar 3,270 drill
- Reading Words / MAX Speaking
- Supabase cloud sync
- Google/email login
- Autumn Rain / Leaves / Focus
- Entry page va optional preparation/duo flow

## Tekshiruv

- `cloud.js` syntax — PASS
- `app.js` syntax — PASS
- `writing-engine.js` syntax — PASS
- server bundle syntax — PASS
- 22 sidebar routes — PASS
- Speaking Words = 850 — PASS
- Listening smoke test — PASS
- Writing V6 smoke test — PASS
- Reading/MAX Speaking smoke test — PASS
