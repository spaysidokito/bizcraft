-- Users
create table if not exists public.users (
  id text primary key,
  full_name text not null,
  email text not null unique,
  username text not null unique,
  password text not null,
  role text not null
);

-- Student profiles
create table if not exists public.student_profiles (
  user_id text primary key references public.users(id) on delete cascade,
  grade_level text,
  section text,
  xp int,
  avatar_url text
);

-- Entrepreneur stories
create table if not exists public.entrepreneur_stories (
  id text primary key,
  name text not null,
  business_name text,
  business_type text,
  location text,
  photo_url text,
  short_description text,
  biography text,
  video_url text,
  content jsonb,
  key_lessons jsonb,
  is_published boolean
);

-- Quiz questions
create table if not exists public.quiz_questions (
  id text primary key,
  story_id text references public.entrepreneur_stories(id) on delete cascade,
  question_text text not null,
  choices jsonb,
  correct_choice_id text,
  explanation text
);

-- Quiz attempts
create table if not exists public.quiz_attempts (
  id text primary key,
  student_id text references public.users(id) on delete cascade,
  story_id text references public.entrepreneur_stories(id) on delete cascade,
  score int,
  total_questions int,
  xp_earned int,
  answers jsonb,
  completed_at timestamptz
);

-- Badges
create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text,
  requirement text,
  icon text
);

-- Student badges
create table if not exists public.student_badges (
  student_id text references public.users(id) on delete cascade,
  badge_id text references public.badges(id) on delete cascade,
  earned_at timestamptz,
  primary key (student_id, badge_id)
);

-- Student progress
create table if not exists public.student_progress (
  student_id text references public.users(id) on delete cascade,
  story_id text references public.entrepreneur_stories(id) on delete cascade,
  status text,
  last_viewed_at timestamptz,
  primary key (student_id, story_id)
);

-- RLS policy to allow all authenticated and anon access for these tables in demo mode.
alter table public.users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.entrepreneur_stories enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.badges enable row level security;
alter table public.student_badges enable row level security;
alter table public.student_progress enable row level security;

drop policy if exists "Allow all anon" on public.users;
create policy "Allow all anon" on public.users for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.student_profiles;
create policy "Allow all anon" on public.student_profiles for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.entrepreneur_stories;
create policy "Allow all anon" on public.entrepreneur_stories for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.quiz_questions;
create policy "Allow all anon" on public.quiz_questions for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.quiz_attempts;
create policy "Allow all anon" on public.quiz_attempts for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.badges;
create policy "Allow all anon" on public.badges for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.student_badges;
create policy "Allow all anon" on public.student_badges for all using (true) with check (true);

drop policy if exists "Allow all anon" on public.student_progress;
create policy "Allow all anon" on public.student_progress for all using (true) with check (true);
