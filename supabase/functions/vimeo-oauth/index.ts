import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  createCorsResponse, 
  allowedOrigins 
} from "../_shared/config.ts";

const VIMEO_CLIENT_ID = Deno.env.get("VIMEO_CLIENT_ID");
const VIMEO_CLIENT_SECRET = Deno.env.get("VIMEO_CLIENT_SECRET");
const VIMEO_REDIRECT_URI = Deno.env.get("VIMEO_REDIRECT_URI");

serve(async (req) => {
  console.log("Function invoked with method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders("*") });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  console.log("Parsed URL parameters:", { code, error, state });

  // Handle the OAuth callback (GET request)
  if (req.method === "GET" && code) {
    console.log("Handling OAuth callback");
    try {
      if (!state) {
        console.error("Missing state parameter");
        throw new Error("Missing state parameter");
      }

      const decodedState = JSON.parse(atob(state));
      console.log("Decoded state:", decodedState);
      const { user_id, origin } = decodedState;

      console.log("Exchanging code for token...");
      const tokenResponse = await fetch("https://api.vimeo.com/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: VIMEO_REDIRECT_URI,
          client_id: VIMEO_CLIENT_ID,
          client_secret: VIMEO_CLIENT_SECRET,
        }),
      });

      console.log("Token response status:", tokenResponse.status);
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Vimeo token error:", errorData);
        throw new Error("Failed to get Vimeo access token");
      }

      const tokenData = await tokenResponse.json();
      console.log("Received token data:", JSON.stringify(tokenData, null, 2));
      const { access_token, user: vimeoUser } = tokenData;

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

      console.log("Updating user profile...");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          vimeo_access_token: access_token,
          vimeo_user_id: vimeoUser.uri.split('/').pop(),
          vimeo_account_type: vimeoUser.account
        })
        .eq("id", user_id);

      if (updateError) {
        console.error("Error updating user profile:", updateError);
        throw updateError;
      }

      console.log("Profile updated successfully");

      // Return a response that will send a message to the opener window
      const htmlResponse = `
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'vimeo-oauth-success' }, '*');
              document.write('Vimeo account connected successfully. You can close this window now.');
            </script>
          </body>
        </html>
      `;
      return new Response(htmlResponse, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      // Return an error response that will send an error message to the opener window
      const htmlResponse = `
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'vimeo-oauth-error', error: '${error instanceof Error ? error.message : String(error)}' }, '*');
              document.write('Failed to connect Vimeo account. You can close this window and try again.');
            </script>
          </body>
        </html>
      `;
      return new Response(htmlResponse, {
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  // Handle the initial OAuth request (POST request)
  if (req.method === "POST") {
    console.log("Handling initial OAuth request");
    const origin = req.headers.get("origin") || "";
    console.log("Request origin:", origin);

    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return createCorsResponse(401, { error: "Missing Authorization header" }, origin);
    }

    try {
      console.log("Vimeo configuration:", { VIMEO_CLIENT_ID, VIMEO_REDIRECT_URI });
      if (!VIMEO_CLIENT_ID || !VIMEO_CLIENT_SECRET || !VIMEO_REDIRECT_URI) {
        console.error("Missing Vimeo configuration");
        throw new Error("Missing Vimeo configuration");
      }

      const body = await req.json();
      console.log("Request body:", body);
      const { user_id } = body;
      if (!user_id) {
        console.error("Missing user_id in request body");
        throw new Error("Missing user_id in request body");
      }

      const state = btoa(JSON.stringify({ user_id, origin }));
      const authUrl = `https://api.vimeo.com/oauth/authorize?response_type=code&client_id=${VIMEO_CLIENT_ID}&redirect_uri=${encodeURIComponent(VIMEO_REDIRECT_URI)}&state=${state}&scope=public%20private%20create%20edit%20delete%20interact%20upload`;
      
      console.log("Generated auth URL:", authUrl);
      return createCorsResponse(200, { url: authUrl }, origin);
    } catch (error) {
      console.error("Error in initial OAuth request:", error);
      return createCorsResponse(500, { 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }, origin);
    }
  }

  // If none of the above conditions are met, return a 405 Method Not Allowed
  console.error("Method not allowed:", req.method);
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
    status: 405,
    headers: {
      ...corsHeaders("*"),
      "Content-Type": "application/json"
    }
  });
});
