# Supabase sozlamasi

Sayt va 100 kunlik jurnal bitta Supabase hisobidan foydalanadi. Lug‘at, Speaking matnlari, o‘yin natijalari va jurnal taymeri jurnalning mavjud `daily_logs` jadvalida alohida yashirin yozuvlar sifatida saqlanadi. Bu ma’lumotlar uchun yangi SQL talab qilinmaydi.

1. Saytni ochib, bitta email va parol bilan kiring.
2. Lug‘at saytidagi avvalgi natijalar shu qurilmada bo‘lsa, birinchi kirishda ularni hisobga ko‘chirishni tanlang.
3. Audio yozuvlarni ham shaxsiy bulutga saqlash uchun Supabase Dashboard → SQL Editor bo‘limida `supabase_vocab_setup.sql` faylini bir marta bajaring. Bu yopiq audio joyini yaratadi va lug‘at yozuvlarini alohida jadvalga ko‘chiradi.

SQL mavjud `settings`, `daily_logs` va `task_files` yozuvlarini o‘chirmaydi. Sayt yangi lug‘at jadvali yaratilgach eski saqlangan lug‘at yozuvini undan o‘qib, yangi jadvalga ko‘chiradi. ZIPdagi `schema_addon_files.sql` boshqa, avvalgi jurnal fayllari uchun qo‘shimcha; agar `task_files` jadvali va `task-files` bucketi allaqachon mavjud bo‘lsa, uni qayta bajarish kerak emas.

`task-files` bucketi yuborilgan loyihada ommaviy o‘qiladigan qilib tuzilgan. Shaxsiy audio uchun yangi `vocab-atlas-audio` bucketi yopiq bo‘ladi.
