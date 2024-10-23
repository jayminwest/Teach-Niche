import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  createCorsResponse, 
  allowedOrigins 
} from "../_shared/config.ts";

serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  // Check if the origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return createCorsResponse(403, { error: "Origin not allowed" }, origin);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createCorsResponse(401, { error: "Missing Authorization header" }, origin);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) {
      return createCorsResponse(401, { error: "Unauthorized" }, origin);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("vimeo_access_token")
      .eq("id", user.id)
      .single();

    if (profileError || !profile.vimeo_access_token) {
      return createCorsResponse(400, { error: "Vimeo account not connected" }, origin);
    }

    const vimeoAccessToken = profile.vimeo_access_token;

    const formData = await req.formData();
    const video = formData.get("video") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!video || !title) {
      return createCorsResponse(400, { error: "Missing required fields" }, origin);
    }

    // Create a new video on Vimeo
    const createResponse = await fetch("https://api.vimeo.com/me/videos", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${vimeoAccessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        upload: {
          approach: "tus",
          size: video.size,
        },
        name: title,
        description: description,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("Vimeo API error:", errorData);
      let errorMessage = 'Failed to create video on Vimeo';
      if (errorData.developer_message) {
        errorMessage += `: ${errorData.developer_message}`;
      }
      if (errorData.error_code) {
        errorMessage += ` (Error code: ${errorData.error_code})`;
      }
      return createCorsResponse(500, { error: errorMessage }, origin);
    }

    const createData = await createResponse.json();
    const uploadLink = createData.upload.upload_link;
    const vimeoVideoId = createData.uri.split("/").pop();

    // Upload the video file to Vimeo
    const uploadResponse = await fetch(uploadLink, {
      method: "PATCH",
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "0",
        "Content-Type": "application/offset+octet-stream",
      },
      body: await video.arrayBuffer(),
    });

    if (!uploadResponse.ok) {
      return createCorsResponse(500, { error: "Failed to upload video to Vimeo" }, origin);
    }

    return createCorsResponse(200, { vimeo_video_id: vimeoVideoId }, origin);
  } catch (error) {
    console.error("Error in upload-vimeo-video:", error);
    return createCorsResponse(500, { 
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      details: error
    }, origin);
  }
});
