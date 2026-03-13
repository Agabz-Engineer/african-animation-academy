-- Ensure follow system exists and public profile reads work for follower counts.

-- User follows table
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

-- Keep follower counts in profiles updated
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

-- Allow authenticated users to read public profile data (needed for follower counts and DMs)
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles
  for select
  to authenticated
  using (true);
