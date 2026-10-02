-- ============================================================
-- VIVID IELTS — Supabase schema
-- Run this once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- 1) Profile info for each signed-up user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  target_band numeric default 7.0,
  current_band numeric default 5.5,
  telegram_id bigint unique,
  created_at timestamptz default now()
);

-- 1b) If profiles already existed from an earlier run, add the new column safely.
alter table public.profiles add column if not exists telegram_id bigint unique;
alter table public.profiles add column if not exists is_admin boolean default false;

-- 2) Vocabulary Lab progress — one row per learned word
create table if not exists public.vocab_progress (
  user_id uuid references auth.users(id) on delete cascade,
  word_id integer not null,
  learned_at timestamptz default now(),
  primary key (user_id, word_id)
);

-- 3) Grammar progress — one row per tense (12 total)
create table if not exists public.grammar_progress (
  user_id uuid references auth.users(id) on delete cascade,
  tense_id integer not null,
  unlocked boolean default false,
  best_score integer default 0,
  passed boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, tense_id)
);

-- 4) Reading test results
create table if not exists public.reading_results (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  test_id text not null,
  score integer not null,
  total integer not null,
  band numeric,
  vocab_score integer,
  completed_at timestamptz default now()
);

-- 5) Generic per-user app state (plan checkboxes, UI settings, etc.)
create table if not exists public.user_state (
  user_id uuid references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

-- 6) Community — real, shared-across-all-users forum data
create table if not exists public.community_posts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  channel text not null default 'general',
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.community_comments (
  id bigint generated always as identity primary key,
  post_id bigint references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.community_likes (
  post_id bigint references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- ============================================================
-- Row Level Security — every user can only read/write their own rows
-- ============================================================
alter table public.profiles enable row level security;
alter table public.vocab_progress enable row level security;
alter table public.grammar_progress enable row level security;
alter table public.reading_results enable row level security;
alter table public.user_state enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

create policy "Users manage their own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their own vocab progress" on public.vocab_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own grammar progress" on public.grammar_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own reading results" on public.reading_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own app state" on public.user_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Community: everyone (all logged-in users) can READ every post/comment/like —
-- that's what makes it a real shared community instead of per-browser fake data.
-- Writing/deleting is only ever allowed as yourself.
create policy "Anyone can read community posts" on public.community_posts
  for select using (true);
create policy "Users can create their own posts" on public.community_posts
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.community_posts
  for delete using (auth.uid() = user_id);

create policy "Anyone can read community comments" on public.community_comments
  for select using (true);
create policy "Users can create their own comments" on public.community_comments
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.community_comments
  for delete using (auth.uid() = user_id);

create policy "Anyone can read community likes" on public.community_likes
  for select using (true);
create policy "Users can like as themselves" on public.community_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own like" on public.community_likes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Auto-create a profile row whenever a new user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'IELTS Student'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LiveKit integration: live_invites table (safe to re-run)
-- ============================================================

-- Run this once in Supabase -> SQL Editor -> Run.
-- Safe to run even if you already ran the earlier schema.sql — every
-- statement here is guarded with "if not exists".
--
-- What it does: adds a small table the LiveKit integration uses to let the
-- broadcast host authorize ONE specific viewer to turn their camera on
-- ("🎤 Taklif qilish"). Only the livekit-token and live-invite Edge
-- Functions ever read/write this table (via the service role key, which
-- bypasses RLS) — no direct client access is granted, so RLS is left with
-- no policies at all, which means "deny everything" for normal users.

create table if not exists public.live_invites (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  invitee_identity text not null,
  invited_by uuid references public.profiles(id) on delete set null,
  used boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

create index if not exists live_invites_lookup_idx
  on public.live_invites (room_name, invitee_identity, used, expires_at);

alter table public.live_invites enable row level security;
-- No policies added on purpose: only the service role (used inside the
-- livekit-token / live-invite Edge Functions) can touch this table.
