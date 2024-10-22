import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { allowedOrigins, corsHeaders, createCorsResponse } from "../_shared/config.ts";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

/**
 * Generate Stripe OAuth URL
 * @param userId - User ID to be used as state
 * @returns Stripe OAuth URL
 */
const generateStripeOAuthUrl = (userId: string) => {
  const redirectUri = Deno.env.get("STRIPE_REDIRECT_URI")!;
  const clientId = Deno.env.get("STRIPE_CLIENT_ID")!;

  return stripe.oauth.authorizeUrl({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    state: userId,
    redirect_uri: redirectUri,
  });
};

// Main handler function
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      return new Response("ok", { headers: corsHeaders(origin) });
    }
    return new Response(null, { status: 403 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return createCorsResponse(400, { error: "User ID is required." }, origin);
    }

    const url = generateStripeOAuthUrl(userId);
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
