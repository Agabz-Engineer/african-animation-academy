-- Migration to add professional sections and liking functionality
-- Run this in Supabase SQL Editor

-- 1. Add professional sections to profiles
alter table public.profiles 
add column if not exists education jsonb default '[]'::jsonb,
add column if not exists experience jsonb default '[]'::jsonb;

-- 2. Add likes functionality to portfolio_projects
alter table public.portfolio_projects 
add column if not exists likes_count integer default 0;

-- 3. Create likes table for portfolio_projects to track individual likes
create table if not exists public.portfolio_likes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.portfolio_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- 4. Policies for portfolio_likes
alter table public.portfolio_likes enable row level security;

create policy "Portfolio likes are viewable by everyone"
  on public.portfolio_likes for select
  to authenticated
  using (true);

create policy "Users can like projects"
  on public.portfolio_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike projects"
  on public.portfolio_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. Function/Trigger to sync likes_count
create or replace function public.handle_portfolio_like()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.portfolio_projects
    set likes_count = likes_count + 1
    where id = new.project_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.portfolio_projects
    set likes_count = likes_count - 1
    where id = old.project_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_portfolio_like on public.portfolio_likes;
create trigger on_portfolio_like
  after insert or delete on public.portfolio_likes
  for each row execute function public.handle_portfolio_like();
