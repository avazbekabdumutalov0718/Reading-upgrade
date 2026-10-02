-- 100 KUNLIK TRACKER — Fayllar qo'shimchasi (v1)
-- Bu skript MAVJUD "settings" va "daily_logs" jadvallariga TEGMAYDI.
-- Faqat vazifalarga PDF/HTML/rasm biriktirish uchun yangi jadval va
-- Storage bucket qo'shadi. Supabase Dashboard > SQL Editor > New query'ga
-- to'liq nusxalab, Ctrl+A bilan hammasini tanlab, "Run" tugmasini bosing.

create table if not exists task_files (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null check (day_number between 1 and 100),
  category text not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  created_at timestamptz not null default now()
);
create index if not exists idx_task_files_user on task_files (user_id);
create index if not exists idx_task_files_day on task_files (user_id, day_number, category);

alter table task_files enable row level security;

drop policy if exists "own files select" on task_files;
drop policy if exists "own files insert" on task_files;
drop policy if exists "own files delete" on task_files;

create policy "own files select" on task_files
  for select using (auth.uid() = user_id);
create policy "own files insert" on task_files
  for insert with check (auth.uid() = user_id);
create policy "own files delete" on task_files
  for delete using (auth.uid() = user_id);

-- Storage bucket: "task-files"
-- O'qish hammaga ochiq (fayl PDF/HTML sayt ichida iframe orqali ochilishi uchun),
-- lekin yozish/o'chirish faqat faylning egasiga (papka nomi = user_id) ruxsat etiladi.
insert into storage.buckets (id, name, public)
  values ('task-files', 'task-files', true)
  on conflict (id) do nothing;

drop policy if exists "task-files read" on storage.objects;
drop policy if exists "task-files insert own" on storage.objects;
drop policy if exists "task-files delete own" on storage.objects;

create policy "task-files read" on storage.objects
  for select using (bucket_id = 'task-files');

create policy "task-files insert own" on storage.objects
  for insert with check (
    bucket_id = 'task-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "task-files delete own" on storage.objects
  for delete using (
    bucket_id = 'task-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
