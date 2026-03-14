-- profile_live_patch.sql
-- Run this in your Supabase SQL Editor to enable "Live" profile features.

-- 1. Expand Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 2. Ensure following system triggers (if they don't exist yet)
-- This assumes standard profiles table. 

-- Create a bucket for cover photos if you haven't already:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-backgrounds', 'profile-backgrounds', true) ON CONFLICT (id) DO NOTHING;

-- RLS for cover photos (Standard policy)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-backgrounds');
-- CREATE POLICY "User Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-backgrounds' AND auth.uid() = owner);
