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
      .select("video_url, instructor_id")
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
        return NextResponse.json({ error: "You have not purchased this content" }, { status: 403 });
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
    
    console.log("Final path with lesson ID prefix (if needed):", finalVideoPath);
    
    try {
      // Generate a signed URL valid for 1 hour (shorter expiration for security)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("videos")
        .createSignedUrl(finalVideoPath, 3600); // 1 hour in seconds
      
      if (signedUrlError) {
        console.error("Error generating signed URL:", signedUrlError);
        
        // Check if the error is due to file not found
        if (signedUrlError.message?.includes("not found") || signedUrlError.message?.includes("does not exist")) {
          // Try with the original video_url as a fallback
          if (lesson?.video_url && lesson.video_url !== finalVideoPath) {
            console.log("Trying original video_url as fallback:", lesson.video_url);
            const { data: fallbackData, error: fallbackError } = await supabase.storage
              .from("videos")
              .createSignedUrl(lesson.video_url, 3600);
              
            if (!fallbackError && fallbackData?.signedUrl) {
              return NextResponse.json({ url: fallbackData.signedUrl });
            }
          }
          
          return NextResponse.json({ error: "Video file not found" }, { status: 404 });
        }
        
        return NextResponse.json({ error: "Error generating video URL" }, { status: 500 });
      }
      
      if (!signedUrlData?.signedUrl) {
        return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
      }
      
      return NextResponse.json({ url: signedUrlData.signedUrl });
    } catch (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in get-video-url:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
