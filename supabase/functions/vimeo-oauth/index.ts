import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  allowedOrigins,
  corsHeaders,
  createCorsResponse,
} from "../_shared/config.ts";

const VIMEO_CLIENT_ID = Deno.env.get("VIMEO_CLIENT_ID");
const VIMEO_CLIENT_SECRET = Deno.env.get("VIMEO_CLIENT_SECRET");
const VIMEO_REDIRECT_URI = Deno.env.get("VIMEO_REDIRECT_URI");

serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  console.log("Received request:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
    origin,
  });

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders(origin),
    });
  }

  try {
    if (req.method === "POST") {
      console.log("Processing POST request");

      // Get and verify authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        console.error("Missing Authorization header");
        return createCorsResponse(401, {
          error: "Missing Authorization header",
        }, origin);
      }

      console.log("Authorization header present:", authHeader);

      // Create Supabase client
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      console.log("Supabase client created");

      // Verify the user's token
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", ""),
      );

      if (authError || !user) {
        console.error("Authentication error:", authError);
        return createCorsResponse(401, {
          error: "Unauthorized",
          details: authError || "No user found",
        }, origin);
      }

      console.log("User authenticated:", user.id);

      // Get user_id from request body
      const body = await req.json();
      console.log("Request body:", body);

      if (!body.user_id || body.user_id !== user.id) {
        console.error("Invalid user_id", {
          provided: body.user_id,
          expected: user.id,
        });
        return createCorsResponse(400, {
          error: "Invalid user_id",
          provided: body.user_id,
          expected: user.id,
        }, origin);
      }

      // Generate state parameter
      const state = btoa(JSON.stringify({ user_id: user.id, origin }));

      // Generate Vimeo OAuth URL
      const authUrl =
        `https://api.vimeo.com/oauth/authorize?response_type=code&client_id=${
          Deno.env.get("VIMEO_CLIENT_ID")
        }&redirect_uri=${
          encodeURIComponent(Deno.env.get("VIMEO_REDIRECT_URI") || "")
        }&state=${state}&scope=public%20private%20create%20edit%20delete%20interact%20upload`;

      console.log("Generated Vimeo OAuth URL");

      return createCorsResponse(200, { url: authUrl }, origin);
    }

    // Handle OAuth callback
    if (req.method === "GET") {
      const url = new URL(req.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      console.log("OAuth callback params:", { code, state, error });

      if (error) {
        throw new Error(`Vimeo OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Missing code or state parameter");
      }

      // Decode state to get user_id and origin
      const { user_id, origin: stateOrigin } = JSON.parse(atob(state));

      // Exchange code for access token
      const tokenResponse = await fetch(
        "https://api.vimeo.com/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${
              btoa(
                `${Deno.env.get("VIMEO_CLIENT_ID")}:${
                  Deno.env.get("VIMEO_CLIENT_SECRET")
                }`,
              )
            }`,
          },
          body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: Deno.env.get("VIMEO_REDIRECT_URI"),
          }),
        },
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange error:", errorData);
        throw new Error("Failed to exchange code for token");
      }

      const { access_token } = await tokenResponse.json();

      // Store the access token in the user's profile
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          vimeo_access_token: access_token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user_id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error("Failed to store access token");
      }

      // Redirect back to frontend with success message
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders(stateOrigin),
          "Location": `${stateOrigin}?vimeo_connected=true`,
        },
      });
    }

    return createCorsResponse(405, { error: "Method not allowed" }, origin);
  } catch (error) {
    console.error("Error in vimeo-oauth function:", error);
    return createCorsResponse(500, {
      error: error instanceof Error
        ? error.message
        : "An unexpected error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    }, origin);
  }
});
