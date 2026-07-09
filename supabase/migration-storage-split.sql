-- ==========================================
-- ValyryeFans Storage Optimization Migration
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Ensure the main 'media' bucket is PRIVATE for Gold-tier security
UPDATE storage.buckets SET public = false WHERE id = 'media';

-- 2. Create a new 'public_media' bucket for Free-tier / cached assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_media', 'public_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Clean up any existing conflicting policies for public_media
DROP POLICY IF EXISTS "Public media is publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to public media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update public media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete public media" ON storage.objects;

-- 4. Create policies for the public_media bucket
-- Allow public SELECT access to all objects in public_media
CREATE POLICY "Public media is publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public_media');

-- Allow only Admin profiles to INSERT into public_media
CREATE POLICY "Admins can upload to public media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public_media' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE tier = 'admin')
);

-- Allow only Admin profiles to UPDATE objects in public_media
CREATE POLICY "Admins can update public media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public_media' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE tier = 'admin')
);

-- Allow only Admin profiles to DELETE objects in public_media
CREATE POLICY "Admins can delete public media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public_media' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE tier = 'admin')
);
