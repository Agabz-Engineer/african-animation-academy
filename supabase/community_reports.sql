-- Community reports table for admin moderation
-- Run this in Supabase SQL Editor.

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reporter_name text not null,
  reason text not null check (char_length(reason) >= 10),
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists community_reports_post_id_idx
  on public.community_reports(post_id);

create index if not exists community_reports_status_idx
  on public.community_reports(status);

create index if not exists community_reports_created_at_idx
  on public.community_reports(created_at desc);

alter table public.community_reports enable row level security;

-- Policy for authenticated users to create reports
drop policy if exists "community_reports_insert_authenticated" on public.community_reports;
create policy "community_reports_insert_authenticated"
  on public.community_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Policy for admins to view all reports
drop policy if exists "community_reports_select_admin" on public.community_reports;
create policy "community_reports_select_admin"
  on public.community_reports
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policy for admins to update reports
drop policy if exists "community_reports_update_admin" on public.community_reports;
create policy "community_reports_update_admin"
  on public.community_reports
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );
