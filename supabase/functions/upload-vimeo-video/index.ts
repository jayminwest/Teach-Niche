import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  createCorsResponse, 
  allowedOrigins 
} from "../_shared/config.ts";

const VIMEO_API_URL = "https://api.vimeo.com";

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  console.log("Request origin:", origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin && !allowedOrigins.includes(origin)) {
    console.log("Request has no origin or origin is not in the allowed list");
    // Proceed with the request, but log it for monitoring
  } else if (!allowedOrigins.includes(origin)) {
    console.log("Origin not allowed:", origin);
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

    console.log("Creating video on Vimeo...");
    const createResponse = await fetch(`${VIMEO_API_URL}/me/videos`, {
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
      return createCorsResponse(500, { error: 'Failed to create video on Vimeo', details: errorData }, origin);
    }

    const createData = await createResponse.json();
    console.log("Vimeo API response:", createData);

    const uploadLink = createData.upload.upload_link;
    const vimeoVideoId = createData.uri.split("/").pop();

    if (!uploadLink) {
      return createCorsResponse(500, { error: "Failed to get upload link from Vimeo" }, origin);
    }

    console.log("Uploading video to Vimeo...");
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
      console.error("Vimeo upload error:", await uploadResponse.text());
      return createCorsResponse(500, { error: "Failed to upload video to Vimeo" }, origin);
    }

    console.log("Video uploaded successfully");

    // Wait for the video to be processed
    let videoData;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 5000; // 5 seconds

    while (attempts < maxAttempts) {
      const verifyResponse = await fetch(`${VIMEO_API_URL}/videos/${vimeoVideoId}`, {
        headers: {
          "Authorization": `bearer ${vimeoAccessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      });

      if (!verifyResponse.ok) {
        console.error("Failed to verify video upload:", await verifyResponse.text());
        return createCorsResponse(500, { error: "Failed to verify video upload" }, origin);
      }

      videoData = await verifyResponse.json();
      console.log("Video data:", videoData);

      if (videoData.status === "available") {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }

    if (videoData.status !== "available") {
      console.error("Video processing timed out");
      return createCorsResponse(500, { error: "Video processing timed out" }, origin);
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
