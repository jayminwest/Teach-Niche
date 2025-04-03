-- Migration to enforce one-to-one relationship between lessons and videos

-- 1. Make video_url NOT NULL in lessons table
ALTER TABLE public.lessons ALTER COLUMN video_url SET NOT NULL;

-- 2. Remove videos_count and parent_lesson_id columns from lessons table
ALTER TABLE public.lessons DROP COLUMN IF EXISTS videos_count;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS parent_lesson_id;

-- 3. Make lesson_id NOT NULL in purchases table
ALTER TABLE public.purchases ALTER COLUMN lesson_id SET NOT NULL;

-- 4. Drop the videos table (if it exists) - already gone in consolidated schema but ensuring it's removed
DROP TABLE IF EXISTS public.videos;

-- 5. Update trigger functions related to videos
DROP FUNCTION IF EXISTS public.update_lesson_videos_count();

-- 6. Update the user_purchased_lessons view to work with the new schema
CREATE OR REPLACE VIEW public.user_purchased_lessons AS
SELECT 
    p.user_id,
    p.lesson_id,
    l.title,
    l.description,
    l.thumbnail_url,
    l.video_url,
    p.created_at AS purchase_date
FROM 
    purchases p
JOIN 
    lessons l ON p.lesson_id = l.id;
