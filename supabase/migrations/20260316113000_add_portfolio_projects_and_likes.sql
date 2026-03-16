-- Add the portfolio projects schema and portfolio likes support.
-- This brings the remote database in line with the app's current portfolio pages.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists education jsonb default '[]'::jsonb,
  add column if not exists experience jsonb default '[]'::jsonb;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  user_handle text not null,
  title text not null,
  description text,
  category text not null,
  thumbnail_url text,
  media_url text,
  tags text[] not null default '{}',
  community_post_id uuid references public.community_posts(id) on delete set null,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_projects_user_id_idx
  on public.portfolio_projects(user_id);

create index if not exists portfolio_projects_created_at_idx
  on public.portfolio_projects(created_at desc);

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
  with check (
    auth.uid() = user_id
    and public.user_can_create_portfolio_project(auth.uid())
  );

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

create table if not exists public.portfolio_likes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

alter table public.portfolio_likes enable row level security;

drop policy if exists "Portfolio likes are viewable by everyone" on public.portfolio_likes;
create policy "Portfolio likes are viewable by everyone"
  on public.portfolio_likes
  for select
  to authenticated
  using (true);

drop policy if exists "Users can like projects" on public.portfolio_likes;
create policy "Users can like projects"
  on public.portfolio_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can unlike projects" on public.portfolio_likes;
create policy "Users can unlike projects"
  on public.portfolio_likes
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_portfolio_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.portfolio_projects
    set likes_count = likes_count + 1
    where id = new.project_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.portfolio_projects
    set likes_count = greatest(likes_count - 1, 0)
    where id = old.project_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists on_portfolio_like on public.portfolio_likes;
create trigger on_portfolio_like
  after insert or delete on public.portfolio_likes
  for each row
  execute function public.handle_portfolio_like();
