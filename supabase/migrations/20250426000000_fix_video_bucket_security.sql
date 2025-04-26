-- 20250426000000_fix_video_bucket_security.sql
-- This migration fixes security issues with the videos storage bucket
-- IMPORTANT: This includes a rollback section at the end if needed during transition

-- 1. Set videos bucket to non-public
UPDATE storage.buckets 
SET public = false 
WHERE name = 'videos';

-- 2. Drop any existing public access policy for videos bucket
DROP POLICY IF EXISTS "Allow Public Access Videos" ON storage.objects;

-- 3. Create proper RLS policies to ensure only authorized users can access videos

-- 3.1 Allow authenticated users to upload to the videos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated_uploads_videos'
  ) THEN
    CREATE POLICY "authenticated_uploads_videos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
  END IF;
END
$$;

-- 3.2 Allow instructors to access videos they've uploaded
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'instructor_video_access'
  ) THEN
    CREATE POLICY "instructor_video_access"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'videos' AND 
      auth.uid() IN (
        SELECT instructor_id FROM public.lessons 
        WHERE video_url LIKE '%' || storage.objects.name || '%'
      )
    );
  END IF;
END
$$;

-- 3.3 Allow users to access videos they've purchased
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'purchased_video_access'
  ) THEN
    CREATE POLICY "purchased_video_access"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'videos' AND 
      auth.uid() IN (
        SELECT p.user_id FROM public.purchases p
        JOIN public.lessons l ON p.lesson_id = l.id
        WHERE l.video_url LIKE '%' || storage.objects.name || '%'
      )
    );
  END IF;
END
$$;

-- 3.4 Allow users to access free videos (price = 0)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'free_video_access'
  ) THEN
    CREATE POLICY "free_video_access"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'videos' AND 
      EXISTS (
        SELECT 1 FROM public.lessons 
        WHERE video_url LIKE '%' || storage.objects.name || '%'
        AND price = 0
      )
    );
  END IF;
END
$$;

-- 4. Fix video paths in the database to ensure they are stored consistently

-- 4.1 Fix public URLs
UPDATE public.lessons
SET video_url = REGEXP_REPLACE(video_url, '.*/videos/', '')
WHERE video_url LIKE '%/storage/v1/object/public/videos/%';

-- 4.2 Fix signed URLs
UPDATE public.lessons
SET video_url = REGEXP_REPLACE(video_url, '.*/videos/', '')
WHERE video_url LIKE '%/storage/v1/object/sign/videos/%';

-- 4.3 Remove query parameters from video paths
UPDATE public.lessons
SET video_url = SPLIT_PART(video_url, '?', 1)
WHERE video_url LIKE '%?%';

-- 4.4 Remove leading slashes from video paths
UPDATE public.lessons
SET video_url = LTRIM(video_url, '/')
WHERE video_url LIKE '/%';

-- 4.5 Add lesson ID prefix if missing
-- This ensure all video paths follow the format: lesson_id/filename.ext
DO $$
DECLARE
    lesson_record RECORD;
BEGIN
    FOR lesson_record IN 
        SELECT id, video_url 
        FROM public.lessons 
        WHERE video_url IS NOT NULL
        AND NOT video_url LIKE ''
        AND video_url NOT LIKE '%/%'  -- Only paths without slashes
    LOOP
        UPDATE public.lessons
        SET video_url = lesson_record.id || '/' || lesson_record.video_url
        WHERE id = lesson_record.id;
    END LOOP;
END
$$;

-- ==========================================================================
-- EMERGENCY ROLLBACK SECTION - Uncomment if needed during transition period
-- ==========================================================================
/*
-- ROLLBACK: If you encounter issues during the migration and need to revert:
-- 1. Uncomment this section and run it
-- 2. This will restore public access to the videos bucket temporarily

-- Set videos bucket back to public
-- UPDATE storage.buckets 
-- SET public = true
-- WHERE name = 'videos';

-- Recreate public access policy
-- CREATE POLICY "Allow Public Access Videos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'videos');

-- Drop the restrictive policies if needed
-- DROP POLICY IF EXISTS "instructor_video_access" ON storage.objects;
-- DROP POLICY IF EXISTS "purchased_video_access" ON storage.objects;
-- DROP POLICY IF EXISTS "free_video_access" ON storage.objects;

-- NOTE: This is for emergency rollback only. Once issues are resolved,
-- reapply the security fixes by commenting out this section and running the migration again.
*/