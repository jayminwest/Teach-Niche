-- Add functions to verify access to lessons and videos with RLS enabled

-- Function to check if a user has purchased a lesson
CREATE OR REPLACE FUNCTION public.has_purchased_lesson(user_id UUID, lesson_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_purchase BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM purchases p
    WHERE p.user_id = has_purchased_lesson.user_id
    AND p.lesson_id = has_purchased_lesson.lesson_id
  ) INTO has_purchase;
  
  RETURN has_purchase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has access to a video (either as buyer or creator)
CREATE OR REPLACE FUNCTION public.has_video_access(user_id UUID, lesson_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_creator BOOLEAN;
  has_purchase BOOLEAN;
BEGIN
  -- Check if user is the lesson creator
  SELECT EXISTS (
    SELECT 1
    FROM lessons l
    WHERE l.id = has_video_access.lesson_id
    AND l.instructor_id = has_video_access.user_id
  ) INTO is_creator;
  
  -- If user is creator, they have access
  IF is_creator THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has purchased the lesson
  SELECT public.has_purchased_lesson(has_video_access.user_id, has_video_access.lesson_id)
  INTO has_purchase;
  
  RETURN has_purchase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for storage.objects to allow access to videos based on purchases
CREATE POLICY "Allow access to purchased videos" 
ON storage.objects 
FOR SELECT
USING (
  bucket_id = 'videos' AND 
  (
    -- Extract the lesson_id from the path which is in format: 'lesson_id/filename'
    -- Path format is expected to be 'lesson_id/filename'
    EXISTS (
      SELECT 1 
      FROM public.lessons l
      WHERE l.id::text = SPLIT_PART(name, '/', 1)
      AND l.instructor_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 
      FROM public.purchases p
      JOIN public.lessons l ON p.lesson_id = l.id
      WHERE p.user_id = auth.uid()
      AND l.id::text = SPLIT_PART(name, '/', 1)
    )
  )
);