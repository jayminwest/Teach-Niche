-- Create tables
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID NOT NULL,
    price NUMERIC NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    instructor_id UUID NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    price NUMERIC NOT NULL,
    lesson_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    video_id UUID NOT NULL,
    stripe_payment_id VARCHAR NOT NULL,
    amount NUMERIC NOT NULL,
    lesson_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (video_id) REFERENCES public.videos(id),
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
    lessons l ON p.lesson_id = l.id
WHERE 
    p.lesson_id IS NOT NULL;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES 
    ('thumbnails', 'thumbnails', true, now(), now()),
    ('videos', 'videos', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create policies for storage buckets to match existing policies
CREATE POLICY "Allow Public Access 16v3daf_0"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Allow authenticated uploads 16v3daf_0"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Allow Owner Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
