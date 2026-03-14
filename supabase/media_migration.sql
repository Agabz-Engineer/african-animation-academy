-- Migration: Add image support to direct messages
-- Run this in Supabase SQL Editor

-- 1. Add image_url and is_pinned column
alter table public.direct_messages add column if not exists image_url text;
alter table public.direct_messages add column if not exists is_pinned boolean default false;

-- 2. Create storage bucket for message attachments
-- Note: This is usually done via the UI, but here are the policies.
/*
  insert into storage.buckets (id, name, public) values ('message-attachments', 'message-attachments', true);
*/

-- 3. Storage Policies for message-attachments
-- Allow authenticated users to upload their own attachments
create policy "Allow authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'message-attachments');

-- Allow everyone (or specific participants) to read attachments
create policy "Allow public read"
on storage.objects for select
to public
using (bucket_id = 'message-attachments');
