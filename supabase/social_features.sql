-- Social features: Follows and Direct Messages
-- Run this in Supabase SQL Editor.

-- 1. User Follows Table
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists user_follows_follower_id_idx on public.user_follows(follower_id);
create index if not exists user_follows_following_id_idx on public.user_follows(following_id);

alter table public.user_follows enable row level security;

drop policy if exists "user_follows_select_all" on public.user_follows;
create policy "user_follows_select_all" on public.user_follows
  for select to authenticated using (true);

drop policy if exists "user_follows_insert_own" on public.user_follows;
create policy "user_follows_insert_own" on public.user_follows
  for insert to authenticated with check (auth.uid() = follower_id);

drop policy if exists "user_follows_delete_own" on public.user_follows;
create policy "user_follows_delete_own" on public.user_follows
  for delete to authenticated using (auth.uid() = follower_id);

-- 2. Direct Messages Table
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists direct_messages_participants_idx on public.direct_messages(sender_id, receiver_id);
create index if not exists direct_messages_created_at_idx on public.direct_messages(created_at asc);

alter table public.direct_messages enable row level security;

drop policy if exists "direct_messages_select_involved" on public.direct_messages;
create policy "direct_messages_select_involved" on public.direct_messages
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "direct_messages_insert_own" on public.direct_messages;
create policy "direct_messages_insert_own" on public.direct_messages
  for insert to authenticated with check (auth.uid() = sender_id);

-- 3. Update Profiles with aggregate counts (Optional but good for performance)
-- For now we'll calculate them dynamically, but adding columns can help.
alter table public.profiles add column if not exists followers_count integer default 0;
alter table public.profiles add column if not exists following_count integer default 0;
alter table public.profiles add column if not exists total_platform_likes integer default 0;

-- 4. Function to update follower counts
create or replace function public.handle_user_follow_counts()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
  elsif (TG_OP = 'DELETE') then
    update public.profiles set following_count = following_count - 1 where id = old.follower_id;
    update public.profiles set followers_count = followers_count - 1 where id = old.following_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_user_follow on public.user_follows;
create trigger on_user_follow
  after insert or delete on public.user_follows
  for each row execute function public.handle_user_follow_counts();

-- 5. Trigger for total platform likes
create or replace function public.handle_post_like_for_profile()
returns trigger as $$
declare
  post_author_id uuid;
begin
  select user_id into post_author_id from public.community_posts where id = (case when TG_OP = 'INSERT' then new.post_id else old.post_id end);
  
  if (TG_OP = 'INSERT') then
    update public.profiles set total_platform_likes = total_platform_likes + 1 where id = post_author_id;
  elsif (TG_OP = 'DELETE') then
    update public.profiles set total_platform_likes = total_platform_likes - 1 where id = post_author_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_post_like_total on public.community_post_likes;
create trigger on_post_like_total
  after insert or delete on public.community_post_likes
  for each row execute function public.handle_post_like_for_profile();
