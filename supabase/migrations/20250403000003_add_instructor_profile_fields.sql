-- Add name and bio columns to instructor_profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'instructor_profiles' AND column_name = 'name') THEN
        ALTER TABLE public.instructor_profiles ADD COLUMN name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'instructor_profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.instructor_profiles ADD COLUMN bio TEXT;
    END IF;
END
$$;
