-- Add is_free column to purchases table
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Add index for faster queries on free lessons
CREATE INDEX IF NOT EXISTS idx_purchases_is_free ON public.purchases(is_free);

-- Update RLS policies to allow access to free lessons
CREATE OR REPLACE FUNCTION public.check_lesson_access(lesson_id uuid, user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_purchased boolean;
  is_free boolean;
BEGIN
  -- Check if the lesson is free
  SELECT (price = 0 OR price IS NULL) INTO is_free FROM lessons WHERE id = lesson_id;
  
  -- If it's free, allow access
  IF is_free THEN
    RETURN true;
  END IF;
  
  -- Otherwise check if the user has purchased it
  SELECT EXISTS (
    SELECT 1 FROM purchases 
    WHERE purchases.lesson_id = check_lesson_access.lesson_id 
    AND purchases.user_id = check_lesson_access.user_id
  ) INTO is_purchased;
  
  RETURN is_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_lesson_access IS 'Checks if a user has access to a lesson (either purchased or free)';
