# VIVID IELTS V12 — Reading Exam Rebuild

## Reading design
- Reading Library'dagi **92 ta single passage** va **20 ta full mock** bir xil clean IELTS test yo'nalishiga moslandi.
- Import qilingan 13 ta full mock endi single-passage testlardagi kabi oq, ikki-panel Reading interface'da ishlaydi.
- Full mocklarda 60 daqiqa, Passage 1/2/3 tablari va 1–40 question navigation saqlangan.
- Single passage rejimida 20 daqiqa va tegishli question range saqlangan.
- Pastdagi floating `VIVID IELTS · Orqaga` olib tashlandi. Back control testning yuqori header qismiga ko'chirildi; passage highlight hududiga kirmaydi.

## Highlight
- Passage va question matnlarida highlight barcha Reading testlarda ishlaydi.
- Import qilingan yangi testlarda selection popup orqali highlight qilinadi.
- Eski testlarning mavjud highlight tizimi saqlanadi; submitdan keyin universal Words selection ishlaydi.

## Submitdan keyingi yangi funksiyalar
- Har bir savol uchun to'g'ri javob ko'rsatiladi.
- Har bir savol uchun o'zbekcha explanation card yaratiladi.
- Explanation passage'dan savolga eng yaqin evidence jumlasini topib ko'rsatadi.
- TRUE/YES, FALSE/NO va NOT GIVEN uchun alohida izoh logikasi mavjud.
- `Matnga qaytish · Words qo'shish` tugmasi natija oynasida chiqadi.

## Words
- `+ Words` faqat test submit qilingandan keyin chiqadi.
- Passage yoki question'dan so'z/ibora belgilanadi va Words ro'yxatiga qo'shiladi.
- Tarjima avtomatik qo'shilmaydi (talab bo'yicha).
- Saqlangan test words brauzer localStorage'da qoladi.
- `Words PDF` tugmasi saqlangan so'z/iboralarni real `.pdf` fayl sifatida yuklaydi.

## Data fixes
- Imported Reading data'laridagi barcha answer key'lar audit qilindi.
- Oldin answer key yo'q bo'lgan `new-reading-06` Q25–26 to'ldirildi va passage'dagi buzilgan jumla tiklandi.
- Hozir 25 ta imported reading data faylining barcha savollarida answer key mavjud.
- Reading Library metadata'dagi `2 answers unavailable` yozuvi olib tashlandi.

## Coverage
- 16 legacy single Reading test
- 25 classic single-passage test
- 7 classic full mock
- 12 imported single-passage source
- 13 imported full mock
- Reading Library: **92 single passages + 20 full mocks**

## Validation
- `reading-v12.js` syntax: PASS
- imported Reading engine syntax: PASS
- imported answer-key completeness: PASS
- Reading/MAX Speaking smoke: PASS
- Listening Boost smoke: PASS
- Writing Booster V6 (3270 drills) smoke: PASS
- 49 Reading HTML entry points include V12 enhancement assets: PASS
