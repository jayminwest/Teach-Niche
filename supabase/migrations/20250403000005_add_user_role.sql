-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update existing instructors to have the instructor role
UPDATE public.users
SET role = 'instructor'
WHERE id IN (
    SELECT user_id FROM public.instructor_profiles
);

-- Create a function to automatically set role to instructor when a user is added to instructor_profiles
CREATE OR REPLACE FUNCTION public.set_user_as_instructor()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET role = 'instructor'
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a new instructor is added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_instructor_role_trigger'
    ) THEN
        CREATE TRIGGER set_instructor_role_trigger
        AFTER INSERT ON public.instructor_profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.set_user_as_instructor();
    END IF;
END
$$;
