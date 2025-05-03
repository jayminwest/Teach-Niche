-- Add improved purchase verification functions
CREATE OR REPLACE FUNCTION public.user_has_purchased_lesson(user_id UUID, lesson_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_purchase BOOLEAN;
BEGIN
  -- Check for exact match
  SELECT EXISTS (
    SELECT 1 FROM purchases
    WHERE purchases.user_id = user_has_purchased_lesson.user_id
    AND purchases.lesson_id = user_has_purchased_lesson.lesson_id
  ) INTO has_purchase;
  
  -- If exact match found, return true
  IF has_purchase THEN
    RETURN true;
  END IF;
  
  -- Check if it's a free lesson
  SELECT (price = 0 OR price IS NULL) INTO has_purchase
  FROM lessons
  WHERE lessons.id = user_has_purchased_lesson.lesson_id;
  
  -- If it's a free lesson, return true
  IF has_purchase THEN
    RETURN true;
  END IF;
  
  -- Check if the user is the instructor
  SELECT EXISTS (
    SELECT 1 FROM lessons
    WHERE lessons.id = user_has_purchased_lesson.lesson_id
    AND lessons.instructor_id = user_has_purchased_lesson.user_id
  ) INTO has_purchase;
  
  -- Return the result of the instructor check
  RETURN has_purchase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for the function
COMMENT ON FUNCTION public.user_has_purchased_lesson IS 'Checks if a user has purchased a specific lesson, the lesson is free, or the user is the instructor';

-- Add RLS policy that uses the function
CREATE POLICY "Users can view lessons they have purchased" ON public.lessons
FOR SELECT USING (
  public.user_has_purchased_lesson(auth.uid(), id) 
  OR 
  auth.uid() = instructor_id
);

-- Ensure public can read free lessons 
CREATE POLICY "Public can view free lessons" ON public.lessons
FOR SELECT USING (
  price = 0 OR price IS NULL
);

-- Update the view for more efficient querying
DROP VIEW IF EXISTS public.user_purchased_lessons;
CREATE OR REPLACE VIEW public.user_purchased_lessons AS
SELECT 
  p.user_id,
  p.lesson_id,
  l.title,
  l.description,
  l.thumbnail_url,
  l.video_url,
  l.price,
  l.instructor_id,
  p.created_at AS purchase_date
FROM 
  purchases p
JOIN 
  lessons l ON p.lesson_id = l.id
UNION ALL
-- Include lessons where the user is the instructor
SELECT 
  l.instructor_id AS user_id,
  l.id AS lesson_id,
  l.title,
  l.description,
  l.thumbnail_url,
  l.video_url,
  l.price,
  l.instructor_id,
  l.created_at AS purchase_date
FROM 
  lessons l
WHERE 
  l.instructor_id IS NOT NULL;