-- Courses table for the academy
-- Run via Supabase migrations.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) >= 3),
  description text not null,
  instructor text not null,
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  duration integer not null check (duration > 0), -- in minutes
  lessons integer not null default 1 check (lessons > 0),
  price decimal(10,2) not null default 0.00 check (price >= 0),
  rating decimal(3,2) default 0.00 check (rating >= 0 and rating <= 5),
  enrolled_count integer not null default 0 check (enrolled_count >= 0),
  thumbnail_url text,
  video_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists courses_status_idx
  on public.courses(status);

create index if not exists courses_level_idx
  on public.courses(level);

create index if not exists courses_created_at_idx
  on public.courses(created_at desc);

create index if not exists courses_rating_idx
  on public.courses(rating desc);

alter table public.courses enable row level security;

-- Policy for authenticated users to view published courses
drop policy if exists "courses_select_authenticated" on public.courses;
create policy "courses_select_authenticated"
  on public.courses
  for select
  to authenticated
  using (status = 'published');

-- Policy for admins to view all courses
drop policy if exists "courses_select_admin" on public.courses;
create policy "courses_select_admin"
  on public.courses
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policy for admins to insert courses
drop policy if exists "courses_insert_admin" on public.courses;
create policy "courses_insert_admin"
  on public.courses
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policy for admins to update courses
drop policy if exists "courses_update_admin" on public.courses;
create policy "courses_update_admin"
  on public.courses
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policy for admins to delete courses
drop policy if exists "courses_delete_admin" on public.courses;
create policy "courses_delete_admin"
  on public.courses
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
drop trigger if exists handle_courses_updated_at on public.courses;
create trigger handle_courses_updated_at
  before update on public.courses
  for each row
  execute function public.handle_updated_at();
