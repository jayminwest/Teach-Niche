/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import { allowedOrigins, cleanUrl, corsHeaders } from "../_shared/config.ts";

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

  // Set up account default settings
  await stripe.accounts.update(response.stripe_user_id, {
    settings: {
      payouts: {
        schedule: {
          interval: "manual",
        },
      },
    },
    metadata: {
      default_application_fee_percent: 15, // Can be different per account type
    },
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
  console.log("Starting profile update for user:", userId);
  
  // First check if the profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error("Error fetching profile:", fetchError);
    throw new Error(`Failed to fetch profile: ${fetchError.message}`);
  }

  if (!existingProfile) {
    console.error("Profile not found for user:", userId);
    throw new Error("Profile not found");
  }

  // Then update the profile without .select()
  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_account_id: connectedAccountId,
      stripe_onboarding_complete: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  // Verify the update by fetching the updated profile
  const { data: updatedProfile, error: verifyError } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarding_complete")
    .eq("id", userId)
    .single();

  if (verifyError) {
    console.error("Error verifying update:", verifyError);
    throw verifyError;
  }

  if (!updatedProfile?.stripe_account_id) {
    throw new Error("Failed to verify profile update");
  }

  console.log("Profile update verified successfully");
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
    console.log("Starting OAuth callback process");
    console.log("Request URL:", req.url);
    
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    console.log("Parsed parameters:", { code: "REDACTED", state });

    if (!code) {
      console.error("Missing authorization code");
      return new Response("Missing authorization code", { status: 400 });
    }

    console.log("Attempting to exchange code for token...");
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    }).catch((error: Stripe.StripeError) => {
      console.error("Stripe token exchange error:", error);
      throw error;
    });

    console.log("Token exchange response:", {
      success: !!response.stripe_user_id,
      accountId: "REDACTED"
    });

    if (!response.stripe_user_id) {
      throw new Error("Failed to obtain connected account ID");
    }

    const connectedAccountId = response.stripe_user_id;
    console.log("Connected Account ID: REDACTED");

    console.log("Updating user profile for state:", state);
    await updateUserProfile(state!, connectedAccountId);
    console.log("User profile updated successfully");

    const frontendUrl = Deno.env.get("FRONTEND_URL");
    if (!frontendUrl) {
      console.error("FRONTEND_URL not set");
      throw new Error("FRONTEND_URL environment variable is not set");
    }

    const successUrl = `${cleanUrl(frontendUrl)}/profile?stripe_connected=true`;
    console.log("Redirecting to:", successUrl);

    return new Response(null, {
      status: 302,
      headers: { 
        ...corsHeaders(origin), 
        "Location": successUrl,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache"
      },
    });
  } catch (error: any) {
    console.error("Detailed error in OAuth callback:", {
      message: error.message,
      stack: error.stack,
      type: error.type,
      raw: error
    });
    
    const frontendUrl = Deno.env.get("FRONTEND_URL");
    if (!frontendUrl) {
      return new Response("FRONTEND_URL environment variable is not set", { 
        status: 500,
        headers: corsHeaders(origin)
      });
    }

    const errorMessage = encodeURIComponent(
      error.message || "An unexpected error occurred"
    );
    const errorUrl = `${cleanUrl(frontendUrl)}/profile?stripe_error=${errorMessage}`;
    console.log("Redirecting to error URL:", errorUrl);

    return new Response(null, {
      status: 302,
      headers: { 
        ...corsHeaders(origin), 
        "Location": errorUrl,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache"
      },
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
