import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import { corsHeaders, createCorsResponse } from "../_shared/config.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  try {
    const { accountId, feePercentage, tier } = await req.json();

    // Update the connected account's fee percentage
    await stripe.accounts.update(accountId, {
      metadata: {
        default_application_fee_percent: feePercentage,
        account_tier: tier
      }
    });

    return createCorsResponse(200, { 
      message: "Fee rate updated successfully" 
    }, origin);
  } catch (error) {
    return createCorsResponse(500, { 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, origin);
  }
}); 