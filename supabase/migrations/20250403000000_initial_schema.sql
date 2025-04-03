-- Create tables
CREATE TABLE IF NOT EXISTS public.instructor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    stripe_account_id TEXT,
    stripe_account_enabled BOOLEAN DEFAULT FALSE,
    stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to lessons table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'stripe_product_id') THEN
        ALTER TABLE public.lessons ADD COLUMN stripe_product_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'stripe_price_id') THEN
        ALTER TABLE public.lessons ADD COLUMN stripe_price_id TEXT;
    END IF;
END
$$;

-- Create lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID NOT NULL,
    price NUMERIC NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add parent_lesson_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'parent_lesson_id') THEN
        ALTER TABLE public.lessons ADD COLUMN parent_lesson_id UUID REFERENCES public.lessons(id);
    END IF;
END
$$;

-- Add video_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'video_url') THEN
        ALTER TABLE public.lessons ADD COLUMN video_url TEXT;
    END IF;
END
$$;

-- Add columns to purchases table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'stripe_product_id') THEN
        ALTER TABLE public.purchases ADD COLUMN stripe_product_id VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'stripe_price_id') THEN
        ALTER TABLE public.purchases ADD COLUMN stripe_price_id VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'instructor_payout_amount') THEN
        ALTER TABLE public.purchases ADD COLUMN instructor_payout_amount NUMERIC;
    END IF;
END
$$;

-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    stripe_payment_id VARCHAR NOT NULL,
    stripe_product_id VARCHAR,
    stripe_price_id VARCHAR,
    amount NUMERIC NOT NULL,
    instructor_payout_amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
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

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES 
    ('thumbnails', 'thumbnails', true, now(), now()),
    ('videos', 'videos', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create policies for storage buckets to match existing policies (only if they don't exist)
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
