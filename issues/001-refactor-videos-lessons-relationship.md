# Refactor Data Model - Videos Must Exist Within Lessons & Lessons Require Exactly One Video

## Description

Currently, our application allows videos to exist independently and lessons can have multiple videos. We need to refactor the data model and application logic to enforce that:

1. Videos can only exist within lessons (no standalone videos)
2. Each lesson must have exactly one video (one-to-one relationship)

## Current Implementation

Our current implementation has several inconsistencies:

1. **Database Schema**: 
   - The `lessons` table has a `video_url` field, suggesting a direct video association
   - There's also a separate `videos` table with its own records
   - The schema allows for parent-child relationships between lessons

2. **Upload Flow**:
   - `app/dashboard/upload/page.tsx` allows uploading videos that can be standalone or part of lessons
   - `app/dashboard/add-videos-to-lesson/page.tsx` allows adding multiple videos to a lesson

3. **Display and Purchase**:
   - We have separate routes for videos (`/videos/[id]`) and lessons (`/lessons/[id]`)
   - Separate checkout processes for videos and lessons
   - Library page shows both purchased videos and lessons

## Required Changes

### Database Schema

1. **Simplify Lesson-Video Relationship**:
   - Remove parent-child relationship between lessons
   - Ensure each lesson has exactly one video
   - Remove or migrate the standalone `videos` table

2. **Update Schema**:
   - Modify `lessons` table to require `video_url` (not nullable)
   - Remove `videos_count` field from `lessons` table
   - Remove or repurpose `parent_lesson_id` field

### API Routes

1. **Consolidate Checkout Process**:
   - Remove `app/api/checkout/video/route.ts` and use only `app/api/checkout/route.ts`
   - Update `app/api/verify-purchase/route.ts` to only handle lesson purchases

2. **Product Creation**:
   - Update `app/api/stripe/create-product/route.ts` to only create products for lessons

### UI Components

1. **Remove Video-Specific Components**:
   - Replace `components/video-card.tsx` with `components/lesson-card.tsx`
   - Remove `components/video-checkout-button.tsx` and use only `components/lesson-checkout-button.tsx`

2. **Update Lesson Card**:
   - Modify `components/lesson-card.tsx` to reflect that a lesson contains exactly one video

### Pages

1. **Remove Video-Specific Pages**:
   - Remove or redirect `app/videos/page.tsx` to `app/lessons/page.tsx`
   - Remove or redirect `app/videos/[id]/page.tsx` to `app/lessons/[id]/page.tsx`

2. **Update Upload Flow**:
   - Modify `app/dashboard/upload/page.tsx` to always create a lesson with one video
   - Remove `app/dashboard/add-videos-to-lesson/page.tsx` or repurpose it

3. **Update Library**:
   - Modify `app/library/page.tsx` to only show purchased lessons

### Types

1. **Update TypeScript Types**:
   - Update `types/supabase.ts` to reflect the new data model
   - Remove or update Video type to be part of Lesson type

## Migration Plan

1. **Data Migration**:
   - Create a script to convert standalone videos to lessons
   - For lessons with multiple videos, split them into separate lessons
   - Update purchase records to reference lessons instead of videos

2. **Code Deployment**:
   - Update database schema first
   - Deploy application changes
   - Run data migration scripts

3. **Testing**:
   - Test purchase flow for lessons
   - Verify that existing purchases still work
   - Check instructor dashboard functionality

## Acceptance Criteria

1. Users can only purchase lessons, not individual videos
2. Each lesson contains exactly one video
3. Instructors can only upload videos as part of lessons
4. All existing content and purchases are migrated correctly
5. The library page shows all purchased lessons
6. No standalone video pages or components exist in the application

## Technical Notes

- This is a significant refactoring that touches multiple parts of the application
- We should consider implementing this in phases to minimize disruption
- Special attention should be paid to the migration of existing data
- We need to update the Stripe integration to only handle lesson products

## Related Files

- Database: `supabase/migrations/20250403000000_consolidated_schema.sql`
- API: `app/api/checkout/route.ts`, `app/api/checkout/video/route.ts`, `app/api/verify-purchase/route.ts`, `app/api/stripe/create-product/route.ts`
- Components: `components/video-card.tsx`, `components/lesson-card.tsx`, `components/video-checkout-button.tsx`
- Pages: `app/videos/page.tsx`, `app/videos/[id]/page.tsx`, `app/dashboard/upload/page.tsx`, `app/dashboard/add-videos-to-lesson/page.tsx`, `app/library/page.tsx`, `app/lessons/[id]/page.tsx`, `app/dashboard/lessons/[id]/page.tsx`
- Types: `types/supabase.ts`
- Utils: `lib/utils.ts`

## Priority

High - This refactoring is fundamental to our data model and user experience.
