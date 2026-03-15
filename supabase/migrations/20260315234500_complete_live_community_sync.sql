create extension if not exists "pgcrypto";

alter table public.community_posts
  add column if not exists status text not null default 'approved';

alter table public.community_posts
  drop constraint if exists community_posts_status_check;

alter table public.community_posts
  add constraint community_posts_status_check
  check (status in ('pending', 'approved', 'rejected', 'flagged'));

alter table public.community_posts
  add column if not exists media_urls text[] not null default '{}';

alter table public.community_posts
  add column if not exists shares_count integer not null default 0;

alter table public.community_posts
  add column if not exists updated_at timestamptz not null default now();

create index if not exists community_posts_status_idx
  on public.community_posts(status);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_community_posts_updated_at on public.community_posts;
create trigger handle_community_posts_updated_at
  before update on public.community_posts
  for each row
  execute function public.handle_updated_at();

create or replace function public.handle_community_post_like_counts()
returns trigger as $$
declare
  target_post_id uuid;
  target_author_id uuid;
begin
  target_post_id := case when TG_OP = 'INSERT' then new.post_id else old.post_id end;

  update public.community_posts
  set likes_count = (
    select count(*)
    from public.community_post_likes
    where post_id = target_post_id
  )
  where id = target_post_id
  returning user_id into target_author_id;

  if target_author_id is not null then
    update public.profiles
    set total_platform_likes = (
      select count(*)
      from public.community_post_likes cpl
      join public.community_posts cp on cp.id = cpl.post_id
      where cp.user_id = target_author_id
    )
    where id = target_author_id;
  end if;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_community_post_like_counts on public.community_post_likes;
create trigger on_community_post_like_counts
  after insert or delete on public.community_post_likes
  for each row
  execute function public.handle_community_post_like_counts();

create or replace function public.handle_community_post_comment_counts()
returns trigger as $$
declare
  target_post_id uuid;
begin
  target_post_id := case when TG_OP = 'INSERT' then new.post_id else old.post_id end;

  update public.community_posts
  set comments_count = (
    select count(*)
    from public.community_post_comments
    where post_id = target_post_id
  )
  where id = target_post_id;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_community_post_comment_counts on public.community_post_comments;
create trigger on_community_post_comment_counts
  after insert or delete on public.community_post_comments
  for each row
  execute function public.handle_community_post_comment_counts();

update public.community_posts cp
set
  likes_count = counts.likes_count,
  comments_count = counts.comments_count,
  updated_at = coalesce(cp.updated_at, cp.created_at, now())
from (
  select
    p.id,
    coalesce(l.likes_count, 0) as likes_count,
    coalesce(c.comments_count, 0) as comments_count
  from public.community_posts p
  left join (
    select post_id, count(*)::integer as likes_count
    from public.community_post_likes
    group by post_id
  ) l on l.post_id = p.id
  left join (
    select post_id, count(*)::integer as comments_count
    from public.community_post_comments
    group by post_id
  ) c on c.post_id = p.id
) counts
where cp.id = counts.id;

update public.profiles p
set
  followers_count = coalesce(f.followers_count, 0),
  following_count = coalesce(g.following_count, 0),
  total_platform_likes = coalesce(l.total_platform_likes, 0)
from (
  select id from public.profiles
) base
left join (
  select following_id as id, count(*)::integer as followers_count
  from public.user_follows
  group by following_id
) f on f.id = base.id
left join (
  select follower_id as id, count(*)::integer as following_count
  from public.user_follows
  group by follower_id
) g on g.id = base.id
left join (
  select cp.user_id as id, count(*)::integer as total_platform_likes
  from public.community_posts cp
  join public.community_post_likes cpl on cpl.post_id = cp.id
  group by cp.user_id
) l on l.id = base.id
where p.id = base.id;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_posts'
  ) then
    alter publication supabase_realtime add table public.community_posts;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_post_comments'
  ) then
    alter publication supabase_realtime add table public.community_post_comments;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_post_likes'
  ) then
    alter publication supabase_realtime add table public.community_post_likes;
  end if;
end $$;
