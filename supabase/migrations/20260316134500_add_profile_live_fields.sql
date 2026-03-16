-- Profile page fields used by the app but missing from the base profiles schema.

alter table public.profiles
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists website_url text,
  add column if not exists cover_url text,
  add column if not exists twitter_url text,
  add column if not exists instagram_url text,
  add column if not exists linkedin_url text,
  add column if not exists education jsonb not null default '[]'::jsonb,
  add column if not exists experience jsonb not null default '[]'::jsonb;
