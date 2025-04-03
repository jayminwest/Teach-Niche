-- Drop not-null constraint on video_id if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'purchases' 
        AND column_name = 'video_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.purchases ALTER COLUMN video_id DROP NOT NULL;
    END IF;
END
$$;
