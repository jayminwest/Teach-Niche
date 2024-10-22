/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import { allowedOrigins, corsHeaders } from "../_shared/config.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Exchange authorization code for Stripe access token
 * @param code - Authorization code
 * @returns Connected account ID
 */
const exchangeCodeForToken = async (code: string) => {
  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });
  return response.stripe_user_id;
};

/**
 * Update user profile with Stripe account ID
 * @param userId - User ID
 * @param connectedAccountId - Stripe connected account ID
 */
const updateUserProfile = async (
  userId: string,
  connectedAccountId: string,
) => {
  const { error, count } = await supabase
    .from("profiles")
    .update({
      stripe_account_id: connectedAccountId,
      stripe_onboarding_complete: true,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
  console.log(`Number of profiles updated: ${count}`);
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

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  try {
    console.log("Received code:", code);
    console.log("Received state (userId):", state);

    const connectedAccountId = await exchangeCodeForToken(code);
    console.log("Connected Account ID:", connectedAccountId);

    if (!connectedAccountId) {
      throw new Error("Failed to obtain connected account ID");
    }

    await updateUserProfile(state!, connectedAccountId);
    console.log("User profile updated successfully");

    const successUrl = `${
      Deno.env.get("FRONTEND_URL")
    }/profile?stripe_connected=true`;
    console.log("Redirecting to:", successUrl);

    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders(origin), "Location": successUrl },
    });
  } catch (error: any) {
    console.error("Error in Stripe OAuth callback:", error);
    const errorUrl = `${Deno.env.get("FRONTEND_URL")}/profile?stripe_error=${
      encodeURIComponent(error.message)
    }`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders(origin), "Location": errorUrl },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-oauth-callback' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
