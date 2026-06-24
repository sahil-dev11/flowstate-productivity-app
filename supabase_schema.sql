-- ============================================================
-- FlowState Productivity App — Supabase Database Schema
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- 1. Profiles (auto-created on signup via trigger)
create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now()
);

-- 2. Habits
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  icon text,
  color text default '#F5A623',
  frequency text default 'daily',
  target_days int4[] default '{1,2,3,4,5,6,7}',
  archived boolean default false,
  created_at timestamptz default now()
);

-- 3. Habit logs (one row per completion per day)
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  completed_on date not null,
  note text,
  unique(habit_id, completed_on)
);

-- 4. Tasks (daily schedule)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  scheduled_date date not null,
  start_time time,
  end_time time,
  priority text default 'medium',
  completed boolean default false,
  recurring text default 'none',
  created_at timestamptz default now()
);

-- 5. Goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  target_value numeric,
  current_value numeric default 0,
  unit text,
  deadline date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- 6. Journal entries (mood + notes)
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  entry_date date not null,
  mood int2 check (mood between 1 and 5),
  note text,
  gratitude text[],
  created_at timestamptz default now(),
  unique(user_id, entry_date)
);

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
alter table profiles enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;
alter table journal_entries enable row level security;

-- ============================================================
-- RLS Policies — users can only see/modify their own data
-- ============================================================

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Habits
create policy "Users can manage own habits"
  on habits for all using (auth.uid() = user_id);

-- Habit logs
create policy "Users can manage own habit logs"
  on habit_logs for all using (auth.uid() = user_id);

-- Tasks
create policy "Users can manage own tasks"
  on tasks for all using (auth.uid() = user_id);

-- Goals
create policy "Users can manage own goals"
  on goals for all using (auth.uid() = user_id);

-- Journal entries
create policy "Users can manage own journal entries"
  on journal_entries for all using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on user signup trigger
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
