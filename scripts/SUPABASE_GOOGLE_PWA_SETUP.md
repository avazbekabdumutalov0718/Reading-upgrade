# Supabase + Google/Gmail + PWA app sozlamasi

Bu versiyada sayt va o‘rnatiladigan PWA app **bir xil Supabase akkauntini** ishlatadi. Shu Google/Gmail bilan boshqa qurilmada kirilsa, bir xil `auth.users.id` olinadi va shu IDga tegishli ma’lumotlar yuklanadi.

## 1. Database va Storage

Supabase Dashboard → **SQL Editor** → New query → `scripts/supabase_full_setup.sql` faylini to‘liq qo‘ying → **Run**.

U quyidagilarni tayyorlaydi:
- `profiles` — email/Gmail va profil ma’lumoti;
- `vocab_atlas_state` — asosiy IELTS saytining barcha JSON progressi;
- `settings`, `daily_logs`, `tracker_preferences` — 100 kunlik tracker;
- `task_files` — tracker fayllari;
- `vocab-atlas-audio` — Speaking audio;
- `task-files` — PDF/HTML/rasm/video/audio biriktirmalar;
- RLS — har bir user faqat o‘z ma’lumotini ko‘radi.

## 2. Google bilan kirishni yoqish

Google Cloud Console → Google Auth Platform → Clients → **Web application** yarating.

Authorized JavaScript origins ga sayt originini qo‘shing, masalan:
- `https://ielts-max-intensive-speaking-2026.vividielts.chatgpt.site`
- lokal test uchun `http://localhost:5500` va ishlatayotgan Live Server origini.

Authorized redirect URI sifatida **Supabase callback** qo‘shing:
- `https://opsyyvuvhdqikmuwfnkz.supabase.co/auth/v1/callback`

Keyin Supabase Dashboard → Authentication → Providers → Google:
- Enable Google
- Google Client ID ni kiriting
- Google Client Secret ni kiriting
- Save

**Client Secretni hech qachon `dist/` ichiga yoki GitHub frontend kodiga qo‘ymang.**

## 3. Supabase redirect URL

Supabase Dashboard → Authentication → URL Configuration:
- Site URL: production saytingizning asosiy manzili
- Redirect URLs: production origin/path va lokal test originlarini qo‘shing.

Frontend `signInWithOAuth({ provider: 'google' })` bilan joriy sahifaga qaytadi.

## 4. Web va app qanday sync qiladi?

1. Webda Google/Gmail bilan kirasiz.
2. Natija Supabase’da `user_id`ga saqlanadi.
3. Saytni telefon/kompyuterda **Appni o‘rnatish** bilan PWA sifatida o‘rnatasiz.
4. Appda shu Google/Gmail bilan kirasiz.
5. Bir xil `user_id` bo‘lgani uchun barcha cloud ma’lumotlari chiqadi.

Asosiy sayt cloudga saqlaydiganlar: vocabulary progress, ballar, sessions, mistakes, favorites, custom packs, activity, Speaking text/audio metadata, Grammar progress/sessions/errors, Daily Speaking, Mock draft/error practice, MAX Speaking javob/o‘yin/baraban holati, Reading Booster progress.

100 kunlik tracker alohida jadvallarda saqlaydi: ism/sana/goal/custom categories, 1–100 kun vazifalari, qiymatlar, priority, notes, timer/reminder tanlovi va fayl biriktirmalari.

Brauzer notification ruxsati va vaqtinchalik session-only UI holatlari qurilmaga xos bo‘lib qoladi; o‘quv progressining o‘zi Supabase’da.

## 5. Muhim xavfsizlik

`dist/supabase-config.js` ichidagi publishable key frontend uchun mo‘ljallangan. `service_role`, `sb_secret_...` yoki Google Client Secret frontendga qo‘yilmaydi. Xavfsizlik RLS orqali bajariladi.
