export const dynamic = "force-dynamic"

import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the video path and lesson ID from the request
    const { videoPath, lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json({ error: "Missing required parameter: lessonId" }, { status: 400 });
    }

    // Fetch the lesson to get information
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("video_url, instructor_id, price") // Added price here
      .eq("id", lessonId)
      .single();

    if (lessonError) {
      console.error("Error fetching lesson:", lessonError);
      return NextResponse.json({ error: "Error fetching lesson" }, { status: 500 });
    }

    // If videoPath is not provided, try to get it from the lesson's video_url field
    let finalVideoPath = videoPath;
    if (!finalVideoPath) {
      if (!lesson?.video_url) {
        return NextResponse.json({ error: "Video path not found for this lesson" }, { status: 404 });
      }

      finalVideoPath = lesson.video_url;

      // If the video_url is already a signed URL or contains a direct file path, extract the path
      if (finalVideoPath.includes('/storage/v1/object/sign/videos/')) {
        try {
          const urlParts = finalVideoPath.split('/videos/');
          if (urlParts.length >= 2) {
            const pathParts = urlParts[1].split('?');
            finalVideoPath = pathParts[0];
          }
        } catch (error) {
          console.error("Error extracting video path:", error);
        }
      } else if (finalVideoPath.includes('/lessons/')) {
        // Handle direct file paths that might be in the format /lessons/{id}/{filename}
        try {
          const pathParts = finalVideoPath.split('/lessons/');
          if (pathParts.length >= 2) {
            // Extract the filename after the lesson ID
            const lessonParts = pathParts[1].split('/');
            if (lessonParts.length >= 2) {
              finalVideoPath = lessonParts[1];
            }
          }
        } catch (error) {
          console.error("Error extracting video path from direct URL:", error);
        }
      }
    }

    // Check if user is the instructor (they always have access)
    const isInstructor = lesson?.instructor_id === user.id;

    // If not instructor, verify the user has purchased this lesson
    if (!isInstructor) {
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (purchaseError) {
        console.error("Error verifying purchase:", purchaseError);
        return NextResponse.json({ error: "Error verifying purchase" }, { status: 500 });
      }

      if (!purchase) {
        // For free lessons, allow access without purchase
        if (lesson.price === 0) {
          console.log("Free lesson, allowing access without purchase");
        } else {
          // Check if this is a preview request (for the first few seconds of video)
          const isPreview = request.headers.get('x-preview-request') === 'true';
          if (isPreview) {
            console.log("Allowing preview access");
          } else {
            return NextResponse.json({ error: "You have not purchased this content" }, { status: 403 });
          }
        }
      }
    }

    console.log("Generating signed URL for path:", finalVideoPath);

    console.log("Final video path before signing:", finalVideoPath);

    // Check if the path is valid before trying to create a signed URL
    if (!finalVideoPath) {
      return NextResponse.json({ error: "Invalid video path" }, { status: 400 });
    }

    // Handle paths that include the lesson ID as a prefix (common format in your DB)
    if (finalVideoPath.includes(lessonId + '/')) {
      console.log("Path includes lesson ID prefix, using as is");
    }
    // If the path doesn't include the lesson ID but should, add it
    else if (!finalVideoPath.includes('/') && lessonId) {
      console.log("Adding lesson ID prefix to path");
      finalVideoPath = `${lessonId}/${finalVideoPath}`;
    }

    // Handle URL encoding properly
    try {
      // First decode the path to handle any double-encoding issues
      if (finalVideoPath.includes('%')) {
        try {
          finalVideoPath = decodeURIComponent(finalVideoPath);
          console.log("Decoded path:", finalVideoPath);
        } catch (e) {
          console.error("Error decoding path:", e);
          // Continue with original path if decoding fails
        }
      }

      // Then encode spaces properly
      if (finalVideoPath.includes(' ')) {
        console.log("Path contains spaces, encoding them");
        // We don't want to encode the whole path, just the spaces
        finalVideoPath = finalVideoPath.replace(/ /g, '%20');
      }
    } catch (e) {
      console.error("Error handling path encoding:", e);
    }

    console.log("Final path with lesson ID prefix and encoding:", finalVideoPath);

    try {
      console.log("Getting video URL for:", finalVideoPath);

      // First try using the RPC function which bypasses RLS
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_video_signed_url',
          {
            lesson_id: lessonId,
            user_id: user.id
          }
        );

        if (!rpcError && rpcData) {
          console.log("Successfully got signed URL via RPC function");
          return NextResponse.json({
            url: rpcData,
            isSignedUrl: true,
            method: "rpc"
          });
        } else {
          console.log("RPC function unavailable or returned an error:", rpcError?.message);
          // Continue to the fallback methods if RPC fails
        }
      } catch (rpcError) {
        console.error("Error using RPC function:", rpcError);
        // Continue to the fallback methods if RPC fails
      }

      // Fallback to direct signed URL creation
      console.log("Trying direct signed URL creation for path:", finalVideoPath);
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(finalVideoPath, 43200); // 12 hours in seconds

      if (error) {
        console.error("Error creating signed URL:", error);

        // Check if this is an "Object not found" error or another issue
        // This can happen during the transition period
        const isObjectNotFoundError = error.message?.includes("Object not found");
        const isBadRequestError = 'status' in error && typeof error.status === 'number' && error.status === 400;
        const isRlsError = error.message?.includes("new row violates row-level security policy");

        if (isObjectNotFoundError || isBadRequestError || isRlsError) {
          console.log("Error accessing object or RLS issue, attempting fallback for user:", user.id);

          // Let's check if this user has actually purchased the lesson
          // This ensures we only provide fallback access to authorized users
          let isAuthorized = isInstructor; // Instructors are always authorized

          if (!isAuthorized) {
            // Check purchase in database
            const { data: purchase, error: purchaseError } = await supabase
              .from("purchases")
              .select("id")
              .eq("user_id", user.id)
              .eq("lesson_id", lessonId)
              .maybeSingle();

            if (purchaseError) {
              console.error("Error verifying purchase during fallback:", purchaseError);
            } else {
              isAuthorized = !!purchase || lesson.price === 0;
              console.log(`User ${isAuthorized ? 'is' : 'is not'} authorized for this content`);
            }
          }

          if (isAuthorized) {
            // During transition period, fall back to public URL if signed URL fails
            // This ensures users don't lose access to content during the security migration
            // This should be removed once all videos have been properly migrated
            const publicUrl = `https://fduuujxzwwrbshamtriy.supabase.co/storage/v1/object/public/videos/${finalVideoPath}`;
            console.log("Authorized user - using fallback public URL:", publicUrl);

            // Return public URL as a fallback
            return NextResponse.json({
              url: publicUrl,
              isSignedUrl: false,
              warning: "Using public URL as fallback - this is temporary during migration",
              method: "fallback"
            });
          } else {
            // If not authorized, don't provide fallback
            console.log("User not authorized, denying fallback access");
            return NextResponse.json({ error: "You have not purchased this content" }, { status: 403 });
          }
        }

        // For other errors, return error response
        return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 });
      }

      if (!data || !data.signedUrl) {
        console.error("No signed URL returned");
        return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 });
      }

      console.log("Successfully created signed URL (valid for 12 hours)");

      return NextResponse.json({
        url: data.signedUrl,
        isSignedUrl: true,
        method: "direct"
      });
    } catch (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in get-video-url:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
