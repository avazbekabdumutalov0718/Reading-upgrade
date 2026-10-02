-- Run once in the existing Supabase project's SQL Editor.
-- The 100-day journal's settings, daily_logs and task_files stay unchanged.

create table if not exists public.vocab_atlas_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vocab_atlas_state enable row level security;
revoke all on public.vocab_atlas_state from anon;
grant select, insert, update on public.vocab_atlas_state to authenticated;

drop policy if exists "vocab own read" on public.vocab_atlas_state;
drop policy if exists "vocab own insert" on public.vocab_atlas_state;
drop policy if exists "vocab own update" on public.vocab_atlas_state;

create policy "vocab own read" on public.vocab_atlas_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "vocab own insert" on public.vocab_atlas_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vocab own update" on public.vocab_atlas_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.tracker_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timer_minutes integer not null default 0 check (timer_minutes >= 0),
  reminders_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.tracker_preferences enable row level security;
revoke all on public.tracker_preferences from anon;
grant select, insert, update on public.tracker_preferences to authenticated;
drop policy if exists "tracker prefs read own" on public.tracker_preferences;
drop policy if exists "tracker prefs insert own" on public.tracker_preferences;
drop policy if exists "tracker prefs update own" on public.tracker_preferences;
create policy "tracker prefs read own" on public.tracker_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tracker prefs insert own" on public.tracker_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tracker prefs update own" on public.tracker_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
  values ('vocab-atlas-audio', 'vocab-atlas-audio', false, 12000000)
  on conflict (id) do update set public = false, file_size_limit = 12000000;

drop policy if exists "vocab audio read own" on storage.objects;
drop policy if exists "vocab audio insert own" on storage.objects;
drop policy if exists "vocab audio delete own" on storage.objects;

create policy "vocab audio read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'vocab-atlas-audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "vocab audio insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'vocab-atlas-audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "vocab audio delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'vocab-atlas-audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
