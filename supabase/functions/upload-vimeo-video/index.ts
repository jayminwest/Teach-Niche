import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  allowedOrigins,
  corsHeaders,
  createCorsResponse,
} from "../_shared/config.ts";

const VIMEO_API_URL = "https://api.vimeo.com";
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin") || "";
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  try {
    // Origin checks...
    if (!origin && !allowedOrigins.includes(origin)) {
      console.log("Request has no origin or origin is not in the allowed list");
    } else if (!allowedOrigins.includes(origin)) {
      return createCorsResponse(403, { error: "Origin not allowed" }, origin);
    }

    // Supabase setup...
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vimeoAccessToken = Deno.env.get("VIMEO_ACCESS_TOKEN"); // Add this to your env variables

    if (!supabaseUrl || !supabaseServiceRoleKey || !vimeoAccessToken) {
      console.error("Missing environment variables");
      return createCorsResponse(
        500,
        { error: "Server configuration error" },
        origin,
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Auth check...
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createCorsResponse(
        401,
        { error: "Missing Authorization header" },
        origin,
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      token,
    );

    if (authError || !user) {
      return createCorsResponse(401, { error: "Unauthorized" }, origin);
    }

    const url = new URL(req.url);
    
    // Initialize upload endpoint
    if (url.pathname.endsWith('/initialize')) {
      console.log("Initializing upload...");
      const formData = await req.formData();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const fileSize = parseInt(formData.get("fileSize") as string);
      const fileName = formData.get("fileName") as string;

      if (!title || !fileSize || !fileName) {
        return createCorsResponse(400, { error: "Missing required fields" }, origin);
      }

      console.log(`Creating video on Vimeo: ${title}, size: ${fileSize} bytes`);

      // Create video on Vimeo using platform account
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
            size: fileSize,
          },
          name: title,
          description: description,
          privacy: {
            view: "disable",  // Makes video private by default
            embed: "public"   // Allows embedding
          }
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Vimeo creation error:", errorData);
        throw new Error(`Failed to create video on Vimeo: ${JSON.stringify(errorData)}`);
      }

      const createData = await createResponse.json();
      console.log("Vimeo creation response:", createData);

      const vimeoId = createData.uri.split("/").pop();
      const vimeoUrl = `https://vimeo.com/${vimeoId}`;

      return new Response(JSON.stringify({
        upload_link: createData.upload.upload_link,
        vimeo_video_id: vimeoId,
        vimeo_url: vimeoUrl,
        chunk_size: CHUNK_SIZE,
        access_token: vimeoAccessToken
      }), {
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    return createCorsResponse(405, { error: "Method not allowed" }, origin);
  } catch (error) {
    console.error("Error in upload handler:", error);
    return createCorsResponse(500, { 
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      details: error instanceof Error ? error.stack : String(error)
    }, origin);
  }
});
