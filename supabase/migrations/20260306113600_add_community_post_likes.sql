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
