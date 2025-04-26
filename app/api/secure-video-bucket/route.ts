export const dynamic = "force-dynamic"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/types/supabase"

/**
 * This route is used to secure the videos bucket by:
 * 1. Ensuring the bucket is not public
 * 2. Setting up proper RLS policies for the bucket
 * 3. Checking and fixing video paths in the database
 * Only administrators should be able to run this endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user is an admin (you may want to implement a more robust check)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()
    
    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Only administrators can run this operation" }, { status: 403 })
    }
    
    // 1. First, check if the videos bucket exists and analyze its current state
    let bucketData;
    let bucketError;
    let bucketWasPublic = false;
    
    try {
      // First, try to get the bucket
      const { data: getBucketData, error: getBucketError } = await supabase.storage.getBucket("videos");
      
      // If it doesn't exist, create it
      if (getBucketError && getBucketError.message.includes("not found")) {
        console.log("Videos bucket not found, creating it");
        const { data: createData, error: createError } = await supabase.storage.createBucket(
          "videos",
          { public: false, fileSizeLimit: 2147483648 } // 2GB limit
        );
        
        bucketData = createData;
        bucketError = createError;
      } 
      // If it exists, check if it's public and update it to be private
      else if (!getBucketError) {
        console.log("Videos bucket found, checking public status");
        
        // Check if the bucket is currently public
        if (getBucketData?.public) {
          console.log("Videos bucket is currently public, marking this for our records");
          bucketWasPublic = true;
          
          // Get a list of files in the bucket before making it private
          // This will help us ensure transition for existing files
          const { data: filesList, error: filesError } = await supabase.storage
            .from("videos")
            .list();
            
          if (filesError) {
            console.error("Error listing files in videos bucket:", filesError);
          } else {
            console.log(`Found ${filesList?.length || 0} files in the videos bucket`);
          }
        }
        
        // Update the bucket to be private
        console.log("Updating videos bucket to be private");
        const { data: updateData, error: updateError } = await supabase.storage.updateBucket(
          "videos",
          { public: false }
        );
        
        bucketData = {
          ...updateData || getBucketData,
          wasPublic: bucketWasPublic
        };
        bucketError = updateError;
      }
      // Some other error occurred when getting the bucket
      else {
        bucketData = null;
        bucketError = getBucketError;
      }
    } catch (error) {
      console.error("Error checking/creating videos bucket:", error);
      bucketData = null;
      bucketError = error;
    }
    
    // Also check/create the thumbnails bucket (which can remain public)
    try {
      const { data: thumbBucketData, error: thumbBucketError } = await supabase.storage.getBucket("thumbnails");
      
      if (thumbBucketError && thumbBucketError.message.includes("not found")) {
        console.log("Thumbnails bucket not found, creating it");
        await supabase.storage.createBucket(
          "thumbnails",
          { public: true, fileSizeLimit: 5242880 } // 5MB limit
        );
      }
    } catch (error) {
      console.error("Error checking/creating thumbnails bucket:", error);
    }
    
    if (bucketError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update videos bucket", 
          error: bucketError, 
          data: bucketData
        }, 
        { status: 500 }
      )
    }
    
    // 2. Remove any public access policies from the videos bucket
    // First, check if the policy exists
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies', {
      table_name: 'objects',
      schema_name: 'storage'
    })
    
    if (policiesError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to retrieve policies", 
          error: policiesError, 
          bucketUpdate: bucketData 
        }, 
        { status: 500 }
      )
    }
    
    // Initialize an array to track policy operations
    let policyOperations = []
    
    // Check for and try to drop the public access policy if it exists
    const publicAccessPolicy = policies?.find(
      p => p.policy_name === 'Allow Public Access Videos' || 
          p.policy_name === 'public_access_videos'
    )
    
    if (publicAccessPolicy) {
      try {
        // Drop the public access policy
        const { error: dropError } = await supabase.rpc('drop_policy', {
          policy_name: publicAccessPolicy.policy_name,
          table_name: 'objects',
          schema_name: 'storage'
        })
        
        policyOperations.push({
          operation: 'drop',
          policy: publicAccessPolicy.policy_name,
          success: !dropError,
          error: dropError
        })
      } catch (error) {
        policyOperations.push({
          operation: 'drop',
          policy: publicAccessPolicy.policy_name,
          success: false,
          error
        })
      }
    }
    
    // Create proper RLS policies for the videos bucket
    
    // 1. Allow authenticated users to upload to the videos bucket
    try {
      const uploadsPolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: 'videos',
        policy_name: 'authenticated_uploads_videos',
        policy_definition: `(auth.role() = 'authenticated')`,
        policy_action: 'INSERT'
      })
      
      policyOperations.push({
        operation: 'create',
        policy: 'authenticated_uploads_videos',
        success: !uploadsPolicy.error,
        error: uploadsPolicy.error
      })
    } catch (error) {
      policyOperations.push({
        operation: 'create',
        policy: 'authenticated_uploads_videos',
        success: false,
        error
      })
    }
    
    // 2. Allow users to view videos they've uploaded (as instructors)
    try {
      const instructorPolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: 'videos',
        policy_name: 'instructor_video_access',
        policy_definition: `(auth.uid() IN (
          SELECT instructor_id FROM lessons 
          WHERE video_url LIKE '%' || storage.objects.name || '%'
        ))`,
        policy_action: 'SELECT'
      })
      
      policyOperations.push({
        operation: 'create',
        policy: 'instructor_video_access',
        success: !instructorPolicy.error,
        error: instructorPolicy.error
      })
    } catch (error) {
      policyOperations.push({
        operation: 'create',
        policy: 'instructor_video_access',
        success: false,
        error
      })
    }
    
    // 3. Allow users to view videos they've purchased
    try {
      const purchasePolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: 'videos',
        policy_name: 'purchased_video_access',
        policy_definition: `(auth.uid() IN (
          SELECT p.user_id FROM purchases p
          JOIN lessons l ON p.lesson_id = l.id
          WHERE l.video_url LIKE '%' || storage.objects.name || '%'
        ))`,
        policy_action: 'SELECT'
      })
      
      policyOperations.push({
        operation: 'create',
        policy: 'purchased_video_access',
        success: !purchasePolicy.error,
        error: purchasePolicy.error
      })
    } catch (error) {
      policyOperations.push({
        operation: 'create',
        policy: 'purchased_video_access',
        success: false,
        error
      })
    }
    
    // 4. Check for existing videos in the database and ensure paths are correct
    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("id, video_url")
      .not("video_url", "is", null);
    
    if (lessonError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to check lesson video paths",
          error: lessonError,
          bucketUpdate: bucketData,
          policyOperations
        },
        { status: 500 }
      );
    }
    
    // Process each lesson to ensure video paths are correctly stored
    let pathCorrections = [];
    
    for (const lesson of lessonData || []) {
      let videoPath = lesson.video_url;
      let needsUpdate = false;
      let newPath = videoPath;
      
      // Fix 1: Check for paths that contain public URLs
      if (videoPath.includes('/storage/v1/object/public/videos/')) {
        try {
          const urlParts = videoPath.split('/videos/');
          if (urlParts.length >= 2) {
            const pathParts = urlParts[1].split('?');
            newPath = pathParts[0];
            needsUpdate = true;
          }
        } catch (e) {
          console.error("Error processing public URL:", e);
        }
      }
      
      // Fix 2: Check for paths that contain signed URLs
      else if (videoPath.includes('/storage/v1/object/sign/videos/')) {
        try {
          const urlParts = videoPath.split('/videos/');
          if (urlParts.length >= 2) {
            const pathParts = urlParts[1].split('?');
            newPath = pathParts[0];
            needsUpdate = true;
          }
        } catch (e) {
          console.error("Error processing signed URL:", e);
        }
      }
      
      // Fix 3: Remove unnecessary prefixes if present
      if (newPath.startsWith('/')) {
        newPath = newPath.substring(1);
        needsUpdate = true;
      }
      
      // If we need to update, do so
      if (needsUpdate) {
        try {
          const { error: updateError } = await supabase
            .from("lessons")
            .update({ video_url: newPath })
            .eq("id", lesson.id);
          
          pathCorrections.push({
            lessonId: lesson.id,
            originalPath: videoPath,
            newPath,
            success: !updateError,
            error: updateError
          });
        } catch (e) {
          pathCorrections.push({
            lessonId: lesson.id,
            originalPath: videoPath,
            newPath,
            success: false,
            error: e
          });
        }
      }
    }
    
    // Create a migration SQL for future deployments
    const migrationSQL = `
-- Fix videos bucket security
UPDATE storage.buckets 
SET public = false 
WHERE name = 'videos';

-- Drop public access policy if it exists
DROP POLICY IF EXISTS "Allow Public Access Videos" ON storage.objects;

-- Create proper RLS policies
CREATE POLICY "authenticated_uploads_videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "instructor_video_access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND 
  auth.uid() IN (
    SELECT instructor_id FROM public.lessons 
    WHERE video_url LIKE '%' || storage.objects.name || '%'
  )
);

CREATE POLICY "purchased_video_access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND 
  auth.uid() IN (
    SELECT p.user_id FROM public.purchases p
    JOIN public.lessons l ON p.lesson_id = l.id
    WHERE l.video_url LIKE '%' || storage.objects.name || '%'
  )
);

CREATE POLICY "free_video_access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND 
  EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE video_url LIKE '%' || storage.objects.name || '%'
    AND price = 0
  )
);

-- Fix video paths in the database to ensure they are stored consistently
UPDATE public.lessons
SET video_url = REGEXP_REPLACE(video_url, '.*/videos/', '')
WHERE video_url LIKE '%/storage/v1/object/%/videos/%';

-- Remove query parameters from video paths
UPDATE public.lessons
SET video_url = SPLIT_PART(video_url, '?', 1)
WHERE video_url LIKE '%?%';

-- Remove leading slashes from video paths
UPDATE public.lessons
SET video_url = LTRIM(video_url, '/')
WHERE video_url LIKE '/%';
`;
    
    return NextResponse.json({
      success: true,
      message: "Videos bucket security updated successfully",
      bucketUpdate: bucketData,
      policyOperations,
      pathCorrections,
      migrationSQL
    })
    
  } catch (error: any) {
    console.error("Error securing videos bucket:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        error,
      },
      { status: 500 },
    )
  }
}