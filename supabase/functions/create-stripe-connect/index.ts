import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import { allowedOrigins, corsHeaders, createCorsResponse } from "../_shared/config.ts";

// Main handler function to serve requests
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      return new Response("ok", { headers: corsHeaders(origin) });
    } else {
      return new Response(null, {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  try {
    const { userId } = await req.json();
    console.log(`Initiating Stripe OAuth for userId: ${userId}`);

    if (!userId) {
      console.error("User ID is required.");
      return createCorsResponse(400, { error: "User ID is required." }, origin);
    }

    // Initialize Stripe with the secret key from environment variables
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Prepare OAuth parameters
    const state = userId; // Use the user ID as the state
    const redirectUri = Deno.env.get("STRIPE_REDIRECT_URI")!;
    const clientId = Deno.env.get("STRIPE_CLIENT_ID")!;

    console.log("Stripe Client ID:", clientId);
    console.log("Redirect URI:", redirectUri);

    // Generate the Stripe OAuth URL
    const url = stripe.oauth.authorizeUrl({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      state,
      redirect_uri: redirectUri,
    });

    console.log("Generated Stripe OAuth URL:", url);

    return createCorsResponse(200, { url }, origin);
  } catch (error: any) {
    console.error("Error in create-stripe-connect:", error);
    return createCorsResponse(500, {
      error: error.message || "An unexpected error occurred",
    }, origin);
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-stripe-connect' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
