-- Keep course metadata visible while hiding premium content links from client-side queries.
-- Actual course access is resolved through a server-side route that checks membership.

revoke select on public.courses from authenticated;
revoke select on public.courses from anon;

grant select (
  id,
  title,
  description,
  instructor,
  level,
  duration,
  lessons,
  price,
  rating,
  enrolled_count,
  thumbnail_url,
  status,
  created_at,
  updated_at,
  created_by
) on public.courses to authenticated;
