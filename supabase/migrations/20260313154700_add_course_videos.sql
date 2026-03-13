-- Course video uploads for admin users.
-- Bucket: course-videos (private), large file size for high-quality uploads.

alter table public.courses
  add column if not exists video_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-videos',
  'course-videos',
  false,
  10737418240,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "course_videos_select_admin" on storage.objects;
create policy "course_videos_select_admin"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'course-videos'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "course_videos_insert_admin" on storage.objects;
create policy "course_videos_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'course-videos'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "course_videos_update_admin" on storage.objects;
create policy "course_videos_update_admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'course-videos'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    bucket_id = 'course-videos'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "course_videos_delete_admin" on storage.objects;
create policy "course_videos_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'course-videos'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
