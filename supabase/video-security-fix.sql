-- Video Security Fix
-- This SQL script should be run directly in the Supabase dashboard SQL editor

-- 1. First, make sure the buckets exist and configure them correctly
DO $$
BEGIN
    -- Check if videos bucket exists
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'videos') THEN
        -- Update videos bucket to not be public
        UPDATE storage.buckets SET public = false WHERE name = 'videos';
    ELSE
        -- Insert videos bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types, owner, created_at, updated_at)
        VALUES ('videos', 'videos', false, false, 2147483648, NULL, NULL, now(), now());
    END IF;
    
    -- Check if thumbnails bucket exists
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'thumbnails') THEN
        -- Update thumbnails bucket to be public
        UPDATE storage.buckets SET public = true WHERE name = 'thumbnails';
    ELSE
        -- Insert thumbnails bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types, owner, created_at, updated_at)
        VALUES ('thumbnails', 'thumbnails', true, false, 5242880, NULL, NULL, now(), now());
    END IF;
END;
$$;

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
END;
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
END;
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
END;
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
END;
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
END;
$$;

-- 5. Create a function to get signed URLs for videos via RPC (allows bypassing RLS for API calls)
CREATE OR REPLACE FUNCTION public.get_video_signed_url(lesson_id UUID, user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- This function runs with the privileges of the creator
AS $$
DECLARE
    v_video_url TEXT;
    v_instructor_id UUID;
    v_price NUMERIC;
    v_purchased BOOLEAN;
    v_has_access BOOLEAN;
    v_signed_url TEXT;
BEGIN
    -- Get video path and lesson details
    SELECT video_url, instructor_id, price INTO v_video_url, v_instructor_id, v_price
    FROM public.lessons
    WHERE id = lesson_id;
    
    IF v_video_url IS NULL THEN
        RETURN NULL; -- Lesson not found or no video
    END IF;
    
    -- Default no access
    v_has_access := FALSE;
    
    -- Check if user is the instructor
    IF user_id IS NOT NULL AND user_id = v_instructor_id THEN
        v_has_access := TRUE;
    END IF;
    
    -- If not instructor, check if video is free
    IF NOT v_has_access AND v_price = 0 THEN
        v_has_access := TRUE;
    END IF;
    
    -- If not free and not instructor, check if user has purchased
    IF NOT v_has_access AND user_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.purchases
            WHERE user_id = get_video_signed_url.user_id
            AND lesson_id = get_video_signed_url.lesson_id
        ) INTO v_purchased;
        
        IF v_purchased THEN
            v_has_access := TRUE;
        END IF;
    END IF;
    
    -- If user has access, generate a signed URL
    IF v_has_access THEN
        SELECT storage.sign_url('videos', v_video_url, 43200) INTO v_signed_url;
        RETURN v_signed_url;
    ELSE
        RETURN NULL; -- No access
    END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_video_signed_url TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_video_signed_url TO anon;

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