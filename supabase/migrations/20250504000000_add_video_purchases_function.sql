-- Add a function to safely query purchases by video IDs
-- This function handles the case where the video_id column may or may not exist
CREATE OR REPLACE FUNCTION public.get_purchases_by_video_ids(video_ids UUID[])
RETURNS SETOF purchases AS $$
DECLARE
  has_video_id BOOLEAN;
BEGIN
  -- Check if the video_id column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'purchases'
    AND column_name = 'video_id'
  ) INTO has_video_id;
  
  -- If the video_id column exists, query using video_id
  IF has_video_id THEN
    RETURN QUERY
    SELECT p.*
    FROM purchases p
    WHERE p.video_id = ANY(video_ids);
  END IF;
  
  -- Return an empty result set if the column doesn't exist
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to the function
COMMENT ON FUNCTION public.get_purchases_by_video_ids IS 'Safely queries purchases by video IDs, handling the case where the video_id column may not exist';

-- Create an RPC endpoint for the function
CREATE OR REPLACE PROCEDURE public.handle_legacy_purchases()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the video_id column exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'purchases'
    AND column_name = 'video_id'
  ) THEN
    -- Create a temporary table to store purchases with video_id
    CREATE TEMPORARY TABLE temp_video_purchases AS
    SELECT * FROM purchases WHERE video_id IS NOT NULL;
    
    -- For each purchase with a video_id but no lesson_id, find the corresponding lesson
    FOR rec IN 
      SELECT p.*, v.lesson_id 
      FROM temp_video_purchases p
      JOIN videos v ON p.video_id = v.id
      WHERE p.lesson_id IS NULL AND v.lesson_id IS NOT NULL
    LOOP
      -- Update the purchase with the lesson_id
      UPDATE purchases
      SET lesson_id = rec.lesson_id
      WHERE id = rec.id;
    END LOOP;
  END IF;
END;
$$;

-- Comment on the procedure
COMMENT ON PROCEDURE public.handle_legacy_purchases IS 'Migrates legacy purchases with video_id to use lesson_id based on the videos table';