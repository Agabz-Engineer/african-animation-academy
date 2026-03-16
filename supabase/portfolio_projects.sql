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

create or replace function public.user_has_active_pro(target_user_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles
      where id = target_user_id
        and (
          role = 'admin'
          or subscription_tier in ('pro', 'team')
        )
    )
    or exists (
      select 1
      from public.subscriptions
      where user_id = target_user_id
        and plan in ('pro', 'team')
        and status = 'active'
        and (ends_at is null or ends_at > now())
    );
$$;

create or replace function public.user_can_create_portfolio_project(target_user_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    public.user_has_active_pro(target_user_id)
    or (
      select count(*)
      from public.portfolio_projects
      where user_id = target_user_id
        and created_at >= date_trunc('month', now())
        and created_at < date_trunc('month', now()) + interval '1 month'
    ) < 3;
$$;

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
