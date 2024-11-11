import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import {
  allowedOrigins,
  corsHeaders,
  createCorsResponse,
} from "../_shared/config.ts";

serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(origin),
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        "Access-Control-Max-Age": "86400", // 24 hours cache for preflight
      },
    });
  }

  // Check if the origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return createCorsResponse(403, { error: "Forbidden" }, origin);
  }

  if (req.method !== "DELETE") {
    return createCorsResponse(405, { error: "Method not allowed" }, origin);
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return createCorsResponse(401, { error: "Unauthorized" }, origin);
  }

  try {
    const vimeoAccessToken = Deno.env.get("VIMEO_ACCESS_TOKEN");
    if (!vimeoAccessToken) {
      throw new Error("Vimeo access token not configured");
    }

    const { videoId } = await req.json();
    if (!videoId) {
      return createCorsResponse(400, { error: "Video ID is required" }, origin);
    }

    // Delete video from Vimeo
    const deleteResponse = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `bearer ${vimeoAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`Failed to delete video: ${JSON.stringify(errorData)}`);
    }

    return createCorsResponse(200, { 
      message: "Video deleted successfully" 
    }, origin);

  } catch (error) {
    console.error("Error in delete-vimeo-video:", error);
    return createCorsResponse(500, {
      error: error instanceof Error ? error.message : "Internal server error"
    }, origin);
  }
}); 