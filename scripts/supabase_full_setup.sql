-- VIVID IELTS — TO'LIQ SUPABASE SETUP (2026-09)
-- Supabase Dashboard -> SQL Editor -> New query -> hammasini Run qiling.
-- Bu SQL hech qanday service_role/secret kalitni frontendga qo'ymaydi.
-- Ma'lumotlar EMAIL bilan ko'rinadi, lekin xavfsiz bog'lash auth.users.id (UUID) orqali bo'ladi.

begin;

-- 1) Foydalanuvchi profili: Gmail/emailni ko'rish uchun.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_auth_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(user_id,email,display_name,avatar_url,updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    now()
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_sync_profile on auth.users;
create trigger on_auth_user_sync_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_profile();

insert into public.profiles(user_id,email,display_name,avatar_url)
select id,email,
       coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(coalesce(email,''),'@',1)),
       coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
from auth.users
on conflict (user_id) do update set email=excluded.email, updated_at=now();

-- 2) VIVID IELTS asosiy saytining barcha JSON progressi.
create table if not exists public.vocab_atlas_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3) 100 kunlik tracker profili.
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_name text not null default '',
  start_date date,
  main_goal text not null default '',
  custom_categories jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.settings add column if not exists main_goal text not null default '';
alter table public.settings add column if not exists custom_categories jsonb not null default '[]'::jsonb;
alter table public.settings add column if not exists updated_at timestamptz not null default now();

-- 4) 100 kunlik barcha checkbox/value/note yozuvlari.
create table if not exists public.daily_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 100),
  category text not null,
  completed boolean not null default false,
  value numeric,
  priority text not null default 'mid',
  note text,
  updated_at timestamptz not null default now()
);
alter table public.daily_logs add column if not exists note text;
alter table public.daily_logs add column if not exists updated_at timestamptz not null default now();
create unique index if not exists daily_logs_user_day_category_uidx
  on public.daily_logs(user_id, day_number, category);
create index if not exists daily_logs_user_idx on public.daily_logs(user_id);

-- 5) Tracker taymeri / reminder tanlovi.
create table if not exists public.tracker_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timer_minutes integer not null default 0 check (timer_minutes >= 0),
  reminders_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 6) Tracker fayl metadata.
create table if not exists public.task_files (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 100),
  category text not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  created_at timestamptz not null default now()
);
create index if not exists task_files_user_idx on public.task_files(user_id);
create index if not exists task_files_user_day_idx on public.task_files(user_id,day_number,category);

-- 7) RLS: har bir user faqat o'z ma'lumotini ko'radi/yozadi/o'chiradi.
alter table public.profiles enable row level security;
alter table public.vocab_atlas_state enable row level security;
alter table public.settings enable row level security;
alter table public.daily_logs enable row level security;
alter table public.tracker_preferences enable row level security;
alter table public.task_files enable row level security;

revoke all on public.profiles, public.vocab_atlas_state, public.settings, public.daily_logs, public.tracker_preferences, public.task_files from anon;
grant select, insert, update, delete on public.profiles, public.vocab_atlas_state, public.settings, public.daily_logs, public.tracker_preferences, public.task_files to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- profiles
drop policy if exists "profiles own read" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own read" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles own update" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- vocab state
drop policy if exists "vocab own read" on public.vocab_atlas_state;
drop policy if exists "vocab own insert" on public.vocab_atlas_state;
drop policy if exists "vocab own update" on public.vocab_atlas_state;
drop policy if exists "vocab own delete" on public.vocab_atlas_state;
create policy "vocab own read" on public.vocab_atlas_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "vocab own insert" on public.vocab_atlas_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vocab own update" on public.vocab_atlas_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vocab own delete" on public.vocab_atlas_state for delete to authenticated using ((select auth.uid()) = user_id);

-- settings
drop policy if exists "settings own all" on public.settings;
create policy "settings own all" on public.settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- daily logs
drop policy if exists "daily logs own all" on public.daily_logs;
create policy "daily logs own all" on public.daily_logs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- tracker prefs
drop policy if exists "tracker prefs own all" on public.tracker_preferences;
create policy "tracker prefs own all" on public.tracker_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- task files metadata
drop policy if exists "task files own all" on public.task_files;
create policy "task files own all" on public.task_files for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 8) PRIVATE Storage. Papkaning birinchi qismi user UUID bo'lishi shart.
insert into storage.buckets(id,name,public,file_size_limit)
values ('vocab-atlas-audio','vocab-atlas-audio',false,12000000)
on conflict(id) do update set public=false,file_size_limit=12000000;

insert into storage.buckets(id,name,public,file_size_limit)
values ('task-files','task-files',false,52428800)
on conflict(id) do update set public=false,file_size_limit=52428800;

-- Eski policy nomlari va yangi policylar tozalanadi.
drop policy if exists "vocab audio read own" on storage.objects;
drop policy if exists "vocab audio insert own" on storage.objects;
drop policy if exists "vocab audio update own" on storage.objects;
drop policy if exists "vocab audio delete own" on storage.objects;
drop policy if exists "task-files read" on storage.objects;
drop policy if exists "task-files insert own" on storage.objects;
drop policy if exists "task-files update own" on storage.objects;
drop policy if exists "task-files delete own" on storage.objects;
drop policy if exists "task files read own" on storage.objects;
drop policy if exists "task files insert own" on storage.objects;
drop policy if exists "task files update own" on storage.objects;
drop policy if exists "task files delete own" on storage.objects;

create policy "vocab audio read own" on storage.objects for select to authenticated
using (bucket_id='vocab-atlas-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "vocab audio insert own" on storage.objects for insert to authenticated
with check (bucket_id='vocab-atlas-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "vocab audio update own" on storage.objects for update to authenticated
using (bucket_id='vocab-atlas-audio' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='vocab-atlas-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "vocab audio delete own" on storage.objects for delete to authenticated
using (bucket_id='vocab-atlas-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);

create policy "task files read own" on storage.objects for select to authenticated
using (bucket_id='task-files' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "task files insert own" on storage.objects for insert to authenticated
with check (bucket_id='task-files' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "task files update own" on storage.objects for update to authenticated
using (bucket_id='task-files' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='task-files' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "task files delete own" on storage.objects for delete to authenticated
using (bucket_id='task-files' and (storage.foldername(name))[1]=(select auth.uid())::text);

commit;
