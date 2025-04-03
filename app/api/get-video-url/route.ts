import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session?.user) {
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
    const isInstructor = lesson?.instructor_id === session.user.id;
    
    // If not instructor, verify the user has purchased this lesson
    if (!isInstructor) {
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", session.user.id)
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
      console.log("Using direct public URL approach for video:", finalVideoPath);
      
      // Always use a direct public URL approach, but verify permissions first
      // We've already checked above that the user has permission to access this video
      // (either they're the instructor, they've purchased it, or it's free)
      
      const publicUrl = `https://fduuujxzwwrbshamtriy.supabase.co/storage/v1/object/public/videos/${finalVideoPath}`;
      console.log("Using direct URL:", publicUrl);
      
      return NextResponse.json({ url: publicUrl });
    } catch (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in get-video-url:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
