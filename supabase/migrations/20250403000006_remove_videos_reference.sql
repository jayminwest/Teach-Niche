-- This migration removes references to the videos table which was removed
-- and adds a videos_count column to the lessons table to store this information directly

-- Add videos_count column to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS videos_count INTEGER DEFAULT 0;

-- Create or replace function to update videos_count (placeholder for future implementation if needed)
CREATE OR REPLACE FUNCTION public.update_lesson_videos_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder function that would update the videos_count
    -- Since the videos table was removed, this just maintains the structure for future use
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
