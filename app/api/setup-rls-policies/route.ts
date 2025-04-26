export const dynamic = "force-dynamic"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the bucket name from the query parameters
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get("bucket")

    if (!bucketName) {
      return NextResponse.json({ success: false, message: "Bucket name is required" }, { status: 400 })
    }

    // Check if the bucket exists, create it if it doesn't
    try {
      const { data: bucketExists, error: bucketError } = await supabase.storage.getBucket(bucketName)

      if (bucketError && bucketError.message?.includes("not found")) {
        console.log(`Bucket ${bucketName} not found, creating it`);
        
        if (bucketName === "videos") {
          const { error: createError } = await supabase.storage.createBucket(
            bucketName,
            { public: false, fileSizeLimit: 2147483648 } // 2GB limit
          );
          
          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
            return NextResponse.json(
              { success: false, message: `Failed to create bucket ${bucketName}`, error: createError },
              { status: 500 },
            );
          }
        } else if (bucketName === "thumbnails") {
          const { error: createError } = await supabase.storage.createBucket(
            bucketName,
            { public: true, fileSizeLimit: 5242880 } // 5MB limit
          );
          
          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
            return NextResponse.json(
              { success: false, message: `Failed to create bucket ${bucketName}`, error: createError },
              { status: 500 },
            );
          }
        }
      } else if (bucketError) {
        console.error(`Error checking if bucket ${bucketName} exists:`, bucketError);
        // Don't return early, try to create policies anyway
      }
    } catch (error) {
      // Continue anyway, as we might get an error if we don't have permission to check buckets
      console.error(`Error checking if bucket ${bucketName} exists:`, error);
    }

    const policies = []

    if (bucketName === "videos") {
      // For videos bucket: create comprehensive security policies
      
      // 1. Allow authenticated users to upload videos
      const uploadPolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: "authenticated_uploads_videos",
        policy_definition: `(auth.role() = 'authenticated')`,
        policy_action: "INSERT"
      });
      policies.push({ name: "authenticated_uploads_videos", result: uploadPolicy });
      
      // 2. Allow instructors to access videos they've uploaded
      const instructorPolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: "instructor_video_access",
        policy_definition: `(
          auth.uid() IN (
            SELECT instructor_id FROM public.lessons 
            WHERE video_url LIKE '%' || storage.objects.name || '%'
          )
        )`,
        policy_action: "SELECT"
      });
      policies.push({ name: "instructor_video_access", result: instructorPolicy });
      
      // 3. Allow users to access videos they've purchased
      const purchasePolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: "purchased_video_access",
        policy_definition: `(
          auth.uid() IN (
            SELECT p.user_id FROM public.purchases p
            JOIN public.lessons l ON p.lesson_id = l.id
            WHERE l.video_url LIKE '%' || storage.objects.name || '%'
          )
        )`,
        policy_action: "SELECT"
      });
      policies.push({ name: "purchased_video_access", result: purchasePolicy });
      
      // 4. Allow access to free videos (price = 0)
      const freePolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: "free_video_access",
        policy_definition: `(
          EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE video_url LIKE '%' || storage.objects.name || '%'
            AND price = 0
          )
        )`,
        policy_action: "SELECT"
      });
      policies.push({ name: "free_video_access", result: freePolicy });
    } else if (bucketName === "thumbnails") {
      // For thumbnails bucket: public access for reading, only authenticated for uploading
      const selectPolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: "public_access",
        policy_definition: `(true)`,
        policy_action: "SELECT"
      })

      const insertPolicy = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: "authenticated_uploads",
        policy_definition: `(auth.role() = 'authenticated')`,
        policy_action: "INSERT"
      })

      policies.push({ name: "public_access", result: selectPolicy })
      policies.push({ name: "authenticated_uploads", result: insertPolicy })
    } else {
      return NextResponse.json({ success: false, message: `Unsupported bucket: ${bucketName}` }, { status: 400 })
    }

    // Check if any policy creation failed
    const hasErrors = policies.some((policy) => policy.result.error)

    return NextResponse.json({
      success: !hasErrors,
      bucket: bucketName,
      policies,
    })
  } catch (error: any) {
    console.error("Error setting up RLS policies:", error)
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

