-- Add social/username columns used by the app to profiles

alter table public.profiles
  add column if not exists user_name text;

alter table public.profiles
  add column if not exists followers_count integer not null default 0;

alter table public.profiles
  add column if not exists following_count integer not null default 0;

alter table public.profiles
  add column if not exists total_platform_likes integer not null default 0;
