-- Enable Row Level Security on all tables

-- Users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Instructor_profiles table
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view instructor profiles" ON public.instructor_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own instructor profile" ON public.instructor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own instructor profile" ON public.instructor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Instructors can insert their own lessons" ON public.lessons FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update their own lessons" ON public.lessons FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can delete their own lessons" ON public.lessons FOR DELETE USING (auth.uid() = instructor_id);

-- Purchases table - already has RLS enabled in the main schema, but adding policies for completeness
-- Existing: CREATE POLICY "System can insert purchases" ON public.purchases FOR INSERT WITH CHECK (true);
-- Existing: CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (("auth"."uid"() = "user_id"));
-- ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users, public.instructor_profiles, public.lessons, public.purchases TO authenticated;

-- Grant anon users only necessary permissions (read-only for most tables)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.lessons, public.users, public.instructor_profiles TO anon;