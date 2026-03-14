-- Migration: Complete Messaging Fix & UI Metadata
-- Purpose: Resolve missing columns and add metadata for advanced UX
-- Run this in Supabase SQL Editor

-- 1. Resolve missing direct_messages columns
ALTER TABLE public.direct_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reaction_meta JSONB DEFAULT '{}'::jsonB;

-- 2. Ensure storage bucket exists
-- Run this ONLY IF you haven't created the bucket yet. 
-- Note: inserting into buckets can sometimes fail due to duplicate IDs if already exists.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true) ON CONFLICT (id) DO NOTHING;

-- 3. Update Storage Policies for 'message-attachments'
-- If policies already exist, these will error unless you drop them first or use CREATE OR REPLACE (if supported)
-- Drop existing if they exist to ensure clean setup
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-attachments');

-- 4. Presence & Typing Indicator Support (Metadata on Profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
