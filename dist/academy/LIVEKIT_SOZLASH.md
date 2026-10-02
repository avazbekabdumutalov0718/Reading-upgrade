# LiveKit ulash — sozlash qo'llanmasi

Bu paket eski brauzer-ichida (peer-to-peer) video tizimini LiveKit (SFU)ga
almashtiradi. Endi tomoshabinlar soni sizning internet tezligingizga bog'liq
emas — hamma odam faqat LiveKit serveriga ulanadi.

## 1-qadam — LiveKit Cloud'da hisob oching

1. https://cloud.livekit.io ga kiring, bepul (Build tarif) hisob oching.
2. Yangi loyiha (project) yarating.
3. **Settings → Keys** bo'limidan:
   - `API Key` (masalan `APIxxxxxxxx`)
   - `API Secret`
   - Loyihangizning **WebSocket URL**'ini nusxalang (masalan
     `wss://your-project-name.livekit.cloud`)

## 2-qadam — schema.sql'ni yangilang

Supabase → SQL Editor → yangilangan `schema.sql`ni to'liq nusxalab **Run**
qiling. Bu safar oxiriga `live_invites` jadvali qo'shiladi (xavfsiz, oldingi
hech narsaga tegmaydi) — bu jadval orqali admin bitta tomoshabinni
"gapirishga" taklif qilishi xavfsiz tekshiriladi.

Agar avval `is_admin` ustunini allaqachon `true` qilib belgilagan bo'lsangiz,
uni qayta qilish shart emas.

## 3-qadam — Edge Function'larni joylashtiring (deploy)

Kompyuteringizda [Supabase CLI](https://supabase.com/docs/guides/cli) o'rnatilgan bo'lishi kerak.

```bash
# loyiha papkasida (schema.sql bilan bir joyda) turib:
supabase link --project-ref <sizning-project-ref>

# maxfiy kalitlarni saqlang (LiveKit dashboard'dan olgan qiymatlar):
supabase secrets set LIVEKIT_URL=wss://your-project-name.livekit.cloud
supabase secrets set LIVEKIT_API_KEY=APIxxxxxxxx
supabase secrets set LIVEKIT_API_SECRET=yourSecretHere

# ikkita funksiyani joylashtiring:
supabase functions deploy livekit-token
supabase functions deploy live-invite
```

`SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` — bular har doim avtomatik
mavjud bo'ladi, ularni qo'lda qo'shish shart emas.

## 4-qadam — fayllarni saytingizga yuklang

Ushbu paketdagi yangilangan `community.html` va `community.js`ni
saytingizdagi eskilarining ustidan almashtirib qo'ying (fayl nomlari bir xil,
faqat qayta yuklang / deploy qiling).

## Bu qanday ishlaydi (qisqacha)

- **Admin "Efirni boshlash"ni bosganda** — brauzeri Supabase Edge Function
  (`livekit-token`)dan token so'raydi. Funksiya sizning `profiles.is_admin`
  ustuningizni serverda tekshiradi va faqat shundagina "men kamera
  yubora olaman" (publish) huquqi bilan token beradi.
- **Tomoshabinlar** — "Tomosha qilish"ni bosganda, faqat "qabul qiluvchi"
  (subscribe-only) token oladi — ular hech qachon o'z kamerasini yuborolmaydi,
  hatto so'rov yuborsalar ham, agar taklif qilinmagan bo'lsa.
- **"🎤 Taklif qilish"** bosilganda — ikkita narsa sodir bo'ladi: (1) server
  o'sha aniq odamga 10 daqiqalik, bir martalik "ruxsat" yozib qo'yadi
  (`live_invites` jadvalida), (2) LiveKit orqali o'sha odamga to'g'ridan-to'g'ri
  xabar yuboriladi. Odam rozi bo'lsa, brauzeri yangi so'rov yuboradi va bu
  safar serverdan "ha, sizga ruxsat berilgan" javobi bilan kamera yoqiladi.
  Boshqa hech kim — hatto to'g'ridan-to'g'ri so'rov yuborsa ham — bu ruxsatni
  o'zi uchun ololmaydi.

## Xarajat haqida

LiveKit Cloud'ning bepul **Build** tarifi oyiga 5,000 WebRTC daqiqa va 50 GB
trafik beradi, kredit karta talab qilmaydi. Kuniga 1 soatlik efir + o'rtacha
tomoshabinlar bilan odatda shu chegarada bemalol sig'asiz. Agar oshib ketsa,
LiveKit dashboard'ida sizga xabar beradi — o'shanda Ship ($50/oy) yoki Scale
($500/oy) tarifiga o'tish kerak bo'ladi.
