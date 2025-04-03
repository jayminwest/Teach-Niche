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
    
    // Get the video path from the request
    const { videoPath, lessonId } = await request.json();
    
    if (!videoPath || !lessonId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    
    // Verify the user has purchased this lesson
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*")
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
    
    // Generate a signed URL valid for 30 days
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("videos")
      .createSignedUrl(videoPath, 2592000); // 30 days in seconds
    
    if (signedUrlError) {
      console.error("Error generating signed URL:", signedUrlError);
      return NextResponse.json({ error: "Error generating video URL" }, { status: 500 });
    }
    
    return NextResponse.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error("Error in get-video-url:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
