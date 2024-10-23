import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import {
  allowedOrigins,
  corsHeaders,
  createCorsResponse,
} from "../_shared/config.ts";

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

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }
    return new Response(null, { status: 403 });
  }

  // Check if the origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
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
