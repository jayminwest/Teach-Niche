-- This is a consolidated migration file that replaces all previous migrations
-- It represents the current state of the database schema

-- Create utility functions
CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT COUNT(*) > 0 INTO exists
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2;
  RETURN exists;
END;
$$;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to set user as instructor
CREATE OR REPLACE FUNCTION public.set_user_as_instructor()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET role = 'instructor'
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update lesson videos count
CREATE OR REPLACE FUNCTION public.update_lesson_videos_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder function that would update the videos_count
    -- Since the videos table was removed, this just maintains the structure for future use
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create instructor_profiles table
CREATE TABLE IF NOT EXISTS public.instructor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    stripe_account_id TEXT,
    stripe_account_enabled BOOLEAN DEFAULT FALSE,
    stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
    total_earnings NUMERIC DEFAULT 0,
    name TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID NOT NULL REFERENCES auth.users(id),
    price NUMERIC NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT,
    videos_count INTEGER DEFAULT 0,
    parent_lesson_id UUID REFERENCES public.lessons(id),
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    lesson_id UUID REFERENCES public.lessons(id),
    video_id UUID,
    stripe_payment_id VARCHAR NOT NULL,
    stripe_product_id VARCHAR,
    stripe_price_id VARCHAR,
    amount NUMERIC NOT NULL,
    instructor_payout_amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create view for user purchased lessons
CREATE OR REPLACE VIEW public.user_purchased_lessons AS
SELECT 
    p.user_id,
    p.lesson_id,
    l.title,
    l.description,
    l.thumbnail_url,
    p.created_at AS purchase_date
FROM 
    purchases p
JOIN 
    lessons l ON p.lesson_id = l.id;

-- Create triggers
DO $$
BEGIN
    -- Users updated_at trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'users_updated_at_trigger'
    ) THEN
        CREATE TRIGGER users_updated_at_trigger
        BEFORE UPDATE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Instructor profiles updated_at trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'instructor_profiles_updated_at_trigger'
    ) THEN
        CREATE TRIGGER instructor_profiles_updated_at_trigger
        BEFORE UPDATE ON public.instructor_profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Set instructor role trigger
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

-- Update existing instructors to have the instructor role
UPDATE public.users
SET role = 'instructor'
WHERE id IN (
    SELECT user_id FROM public.instructor_profiles
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES 
    ('thumbnails', 'thumbnails', true, now(), now()),
    ('videos', 'videos', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create policies for storage buckets
DO $$
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Public Access 16v3daf_0'
    ) THEN
        CREATE POLICY "Allow Public Access 16v3daf_0"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'thumbnails');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated uploads 16v3daf_0'
    ) THEN
        CREATE POLICY "Allow authenticated uploads 16v3daf_0"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Public Access Videos'
    ) THEN
        CREATE POLICY "Allow Public Access Videos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'videos');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated uploads'
    ) THEN
        CREATE POLICY "Allow authenticated uploads"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
    END IF;
END
$$;

-- Create RLS policies for purchases
CREATE POLICY "System can insert purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (("auth"."uid"() = "user_id"));
ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;
