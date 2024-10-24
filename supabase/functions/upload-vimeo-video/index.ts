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
  console.log("Request method:", req.method);
  console.log("All request headers:", JSON.stringify(Object.fromEntries(req.headers), null, 2));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  try {
    if (!origin && !allowedOrigins.includes(origin)) {
      console.log("Request has no origin or origin is not in the allowed list");
    } else if (!allowedOrigins.includes(origin)) {
      console.log("Origin not allowed:", origin);
      return createCorsResponse(403, { error: "Origin not allowed" }, origin);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables");
      return createCorsResponse(500, { error: "Server configuration error" }, origin);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createCorsResponse(401, { error: "Missing Authorization header" }, origin);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createCorsResponse(401, { error: "Unauthorized" }, origin);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("vimeo_access_token")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.vimeo_access_token) {
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
      return createCorsResponse(500, { error: 'Failed to create video on Vimeo', details: errorData }, origin);
    }

    const createData = await createResponse.json();
    const uploadLink = createData.upload.upload_link;
    const vimeoVideoId = createData.uri.split("/").pop();

    if (!uploadLink) {
      return createCorsResponse(500, { error: "Failed to get upload link from Vimeo" }, origin);
    }

    const uploadResponse = await fetch(uploadLink, {
      method: "PATCH",
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "0",
        "Content-Type": "application/offset+octet-stream",
      },
      body: video.stream(),
    });

    if (!uploadResponse.ok) {
      return createCorsResponse(500, { error: "Failed to upload video to Vimeo" }, origin);
    }

    const { data: tutorialData, error: tutorialError } = await supabase
      .from('tutorials')
      .insert({
        title: title,
        description: description,
        vimeo_video_url: `https://vimeo.com/${vimeoVideoId}`,
        creator_id: user.id
      })
      .select();

    if (tutorialError) {
      return createCorsResponse(500, { error: "Failed to store tutorial data", details: tutorialError }, origin);
    }

    return createCorsResponse(200, { 
      vimeo_video_id: vimeoVideoId,
      tutorial_id: tutorialData[0].id,
      message: "Video uploaded successfully. Processing may take some time."
    }, origin);

  } catch (error) {
    return createCorsResponse(500, { 
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      details: error instanceof Error ? error.stack : String(error)
    }, origin);
  }
});
