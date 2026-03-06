-- Community feed table and policies
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  user_handle text not null,
  content text not null check (char_length(content) >= 8),
  tags text[] not null default '{}',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
  on public.community_posts(created_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "community_posts_select_authenticated" on public.community_posts;
create policy "community_posts_select_authenticated"
  on public.community_posts
  for select
  to authenticated
  using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
  on public.community_posts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
  on public.community_posts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "community_posts_delete_own" on public.community_posts;
create policy "community_posts_delete_own"
  on public.community_posts
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  user_handle text not null,
  content text not null check (char_length(content) >= 2),
  created_at timestamptz not null default now()
);

create index if not exists community_post_comments_post_id_idx
  on public.community_post_comments(post_id, created_at asc);

alter table public.community_post_comments enable row level security;

drop policy if exists "community_post_comments_select_authenticated" on public.community_post_comments;
create policy "community_post_comments_select_authenticated"
  on public.community_post_comments
  for select
  to authenticated
  using (true);

drop policy if exists "community_post_comments_insert_own" on public.community_post_comments;
create policy "community_post_comments_insert_own"
  on public.community_post_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "community_post_comments_update_own" on public.community_post_comments;
create policy "community_post_comments_update_own"
  on public.community_post_comments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "community_post_comments_delete_own" on public.community_post_comments;
create policy "community_post_comments_delete_own"
  on public.community_post_comments
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists community_post_likes_post_id_idx
  on public.community_post_likes(post_id, created_at desc);

create index if not exists community_post_likes_user_id_idx
  on public.community_post_likes(user_id, created_at desc);

alter table public.community_post_likes enable row level security;

drop policy if exists "community_post_likes_select_authenticated" on public.community_post_likes;
create policy "community_post_likes_select_authenticated"
  on public.community_post_likes
  for select
  to authenticated
  using (true);

drop policy if exists "community_post_likes_insert_own" on public.community_post_likes;
create policy "community_post_likes_insert_own"
  on public.community_post_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "community_post_likes_delete_own" on public.community_post_likes;
create policy "community_post_likes_delete_own"
  on public.community_post_likes
  for delete
  to authenticated
  using (auth.uid() = user_id);
