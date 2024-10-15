/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || '', {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Stripe OAuth callback invoked.");
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  console.log(`Received OAuth callback with code: ${code} and state: ${state}`);

  if (!code) {
    console.error("Missing authorization code.");
    return new Response(JSON.stringify({ error: "Missing authorization code" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Exchange the authorization code for an access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const connectedAccountId = response.stripe_user_id;
    console.log(`Obtained connected account ID: ${connectedAccountId}`);

    if (!connectedAccountId) {
      throw new Error("Failed to obtain connected account ID");
    }

    const userId = state;
    console.log(`Updating profile for userId: ${userId} with Stripe Account ID: ${connectedAccountId}`);

    // Update the user's profile
    const { data: updateData, error: updateError, count } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: connectedAccountId,
        stripe_onboarding_complete: true,
      })
      .eq("id", userId)
      .select();

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      throw updateError;
    }

    console.log(`Number of profiles updated: ${count}`);
    console.log("Profile updated successfully:", updateData);
    
    // Redirect to success
    const successUrl = `${Deno.env.get("FRONTEND_URL")}/profile?stripe_connected=true`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': successUrl },
    });

  } catch (error: any) {
    console.error("Error in Stripe OAuth callback:", error);
    const errorUrl = `${Deno.env.get("FRONTEND_URL")}/profile?stripe_error=${encodeURIComponent(error.message)}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': errorUrl },
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