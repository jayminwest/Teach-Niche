# Video Security Migration Guide

This guide outlines the steps to fix the security issue with public access to videos while ensuring that users who have purchased lessons still have access to the content.

## Understanding the Issue

The Supabase storage buckets for videos are currently set to public, which means anyone who knows or can guess the URL pattern can directly access the videos without authorization. This is a security risk for paid content.

## Pre-Migration Steps

1. **Back up your database**
   - Use Supabase Dashboard to create a backup of your database before proceeding
   - This ensures you can restore if any issues occur

2. **Deploy the updated API code**
   - The `get-video-url` endpoint has been updated to handle multiple URL generation methods
   - This endpoint will continue to work during and after the migration

## Migration Steps

### Step 1: Run the SQL Script

1. Go to the Supabase Dashboard for your project
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/video-security-fix.sql` into the editor
4. Run the script

This script will:
- Check if the buckets exist and configure them correctly
- Set the videos bucket to non-public
- Set up proper RLS policies
- Fix video paths in the database
- Create an RPC function for generating signed URLs

### Step 2: Test Access for Existing Users

1. Test access for:
   - Users who have purchased content
   - Instructors accessing their own content
   - Free content
   - Unauthorized access

2. Monitor video access via logs:
   - Check for 403 errors
   - Verify that the fallback mechanism is working

## Rollback Plan

If issues arise, you can use the rollback SQL provided at the end of the script:

1. Go to the Supabase Dashboard for your project
2. Navigate to the SQL Editor
3. Copy and paste the rollback section of the SQL script (uncomment it first)
4. Run the script

This will:
- Set the videos bucket back to public
- Recreate the public access policy
- Remove the restrictive policies

## Technical Details

### How the New System Works

1. **Multiple Access Mechanisms**
   - First tries to use the RPC function (bypasses RLS)
   - Falls back to direct signed URL creation
   - Finally falls back to public URL if needed (during migration period)

2. **Authorization Checks**
   - The system verifies authorization in multiple places:
     - RPC function checks user purchases and instructor status
     - API endpoint also verifies authorization before providing fallback access

3. **Video Path Standardization**
   - Video paths in the database are standardized to ensure consistent matching
   - This helps the RLS policies work correctly

### Security Considerations

- The videos bucket is now private, preventing unauthorized access
- RLS policies ensure only authorized users (instructors, purchasers) can access videos
- Signed URLs have a 12-hour expiration, adding another layer of security
- The fallback mechanism ensures continuity of service during transition

## Long-term Maintenance

After confirming the migration works:

1. **Remove Fallback Mechanism**
   - Once all videos are confirmed to be accessible via signed URLs
   - This step can be done weeks after the initial migration

2. **Monitor API Logs**
   - Watch for patterns of URL method usage (RPC vs direct vs fallback)
   - This helps identify any areas that need attention

3. **Update Cloud Functions**
   - If you have any cloud functions that generate video URLs, update them to use the new approach