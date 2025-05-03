# Row Level Security Setup Guide

This guide describes the security improvements added to the Teach Niche platform using Supabase Row Level Security (RLS).

## Overview

We've implemented comprehensive Row Level Security (RLS) across all tables in the database to ensure that:

1. Users can only access data they should have permission to view
2. Instructors can only modify their own content
3. Video content is protected and only accessible to purchasers or content creators

## Migration Files

Two migration files were created:

1. `20250505000000_enable_rls_all_tables.sql`: Enables RLS on all tables and adds appropriate policies
2. `20250505010000_add_access_verification_functions.sql`: Adds helper functions to verify user access to content

## Security Policies Implemented

### Users Table
- Anyone can view public user profiles
- Users can only update their own profile information

### Instructor Profiles Table
- Anyone can view instructor profiles (public information)
- Users can only update their own instructor profile
- Users can only create an instructor profile for themselves

### Lessons Table
- Anyone can view lessons (they're publicly listed)
- Instructors can only create, update, or delete lessons they own

### Purchases Table
- System can insert new purchases (for payment processing)
- Users can only view their own purchases

### Storage Buckets
- Thumbnails are publicly viewable
- Videos are protected by RLS based on purchase history
- Video access is granted to either the creator or users who purchased the lesson

## Helper Functions

We've added two security-definer functions to help verify access rights:

1. `has_purchased_lesson(user_id, lesson_id)`: Checks if a user has purchased a specific lesson
2. `has_video_access(user_id, lesson_id)`: Checks if a user has access to videos in a lesson (either as buyer or creator)

## How to Deploy

To apply these migrations to your Supabase project:

1. Navigate to the Supabase dashboard
2. Select your project
3. Go to the SQL Editor
4. Either:
   - Run each migration file manually in the SQL Editor
   - Use the Supabase CLI to push migrations with `supabase db push`

## Additional Recommendations

1. **Testing**: After applying these migrations, thoroughly test access patterns to ensure:
   - Instructors can still access and modify their content
   - Buyers can access content they've purchased
   - Users cannot access content they haven't purchased

2. **Auth Optimization**: We've also optimized auth requests to reduce the likelihood of rate limiting:
   - Cached Supabase client instances
   - Limited middleware auth checks to only protected routes
   - Improved dependency management in React components

3. **Video Security**: Make sure video paths in storage follow the pattern `{lesson_id}/{filename}` for RLS policies to work properly

## Rollback Plan

If issues occur after enabling RLS, you can temporarily disable it with:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
```

Note: Only disable RLS temporarily while debugging, as it's essential for proper data security.