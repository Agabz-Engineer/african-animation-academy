-- Portfolio projects table and policies
-- Run this in Supabase SQL Editor.

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  user_handle text not null,
  title text not null,
  description text,
  category text not null,
  thumbnail_url text,
  media_url text, -- Video or Image URL
  tags text[] not null default '{}',
  community_post_id uuid references public.community_posts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_projects_user_id_idx on public.portfolio_projects(user_id);
create index if not exists portfolio_projects_created_at_idx on public.portfolio_projects(created_at desc);

alter table public.portfolio_projects enable row level security;

drop policy if exists "portfolio_projects_select_authenticated" on public.portfolio_projects;
create policy "portfolio_projects_select_authenticated"
  on public.portfolio_projects
  for select
  to authenticated
  using (true);

drop policy if exists "portfolio_projects_insert_own" on public.portfolio_projects;
create policy "portfolio_projects_insert_own"
  on public.portfolio_projects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "portfolio_projects_update_own" on public.portfolio_projects;
create policy "portfolio_projects_update_own"
  on public.portfolio_projects
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "portfolio_projects_delete_own" on public.portfolio_projects;
create policy "portfolio_projects_delete_own"
  on public.portfolio_projects
  for delete
  to authenticated
  using (auth.uid() = user_id);
