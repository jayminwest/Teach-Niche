// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno"; // Ensure using Supabase v2

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  // This should match the API version listed on the Stripe website
});

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://teach-niche.com", // Replace with your production domain
];

// CORS Headers
const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
});

// Helper Function to Create CORS Response
const createCorsResponse = (status: number, body: any, origin: string) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
};

// Main Handler
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    } else {
      return new Response(null, {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Check if Origin is Allowed
  if (!allowedOrigins.includes(origin)) {
    return createCorsResponse(403, { error: "Origin not allowed" }, origin);
  }

  // Authenticate User
  const supabaseAccessToken = req.headers.get("Authorization")?.replace(
    "Bearer ",
    "",
  );
  if (!supabaseAccessToken) {
    return createCorsResponse(401, { error: "Unauthorized token" }, origin);
  }

  // Get the user from the access token using Supabase v2
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    supabaseAccessToken,
  );

  if (authError || !user) {
    return createCorsResponse(401, { error: "Unauthorized user" }, origin);
  }

  try {
    console.log("Request received");
    const { tutorialId } = await req.json();
    console.log(`Received tutorialId: ${tutorialId}`);

    if (!tutorialId) {
      return createCorsResponse(
        400,
        { error: "tutorialId is required" },
        origin,
      );
    }

    // Fetch the tutorial details using tutorialId, including the stripe_account_id from profiles
    const { data: tutorial, error: tutorialError } = await supabase
      .from("tutorials")
      .select("*, profiles:creator_id(stripe_account_id)")
      .eq("id", tutorialId)
      .single();

    if (tutorialError) {
      console.error(
        "Error fetching tutorial:",
        JSON.stringify(tutorialError, null, 2),
      );
      return createCorsResponse(500, {
        error: "Error fetching tutorial details",
        details: tutorialError,
      }, origin);
    }

    if (!tutorial) {
      console.error(`Tutorial with ID ${tutorialId} not found`);
      return createCorsResponse(404, { error: "Tutorial not found" }, origin);
    }

    console.log("Tutorial found:", JSON.stringify(tutorial, null, 2));

    if (!tutorial.profiles || !tutorial.profiles.stripe_account_id) {
      console.error("Stripe account ID not found for tutorial creator");
      return createCorsResponse(500, {
        error: "Stripe account not set up for this tutorial",
      }, origin);
    }

    console.log("Creating Stripe checkout session");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: tutorial.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        Deno.env.get("FRONTEND_URL")
      }/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("FRONTEND_URL")}/cancel`,

      // Add the following lines
      metadata: {
        tutorial_id: tutorialId,
      },
      client_reference_id: user.id,
    }, {
      stripeAccount: tutorial.profiles.stripe_account_id,
    });

    console.log("Checkout session created:", session.id);
    return createCorsResponse(200, { sessionUrl: session.url }, origin);
  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return createCorsResponse(500, {
      error: "Internal server error",
      details: JSON.stringify(error),
    }, origin);
  }
});
