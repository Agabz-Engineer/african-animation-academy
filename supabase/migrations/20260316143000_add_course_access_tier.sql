-- Allow Pro subscription courses without using a visible per-course price.

alter table public.courses
  add column if not exists access_tier text not null default 'free'
  check (access_tier in ('free', 'pro'));

update public.courses
set access_tier = 'pro'
where coalesce(price, 0) > 0
  and access_tier <> 'pro';

grant select (access_tier) on public.courses to authenticated;
