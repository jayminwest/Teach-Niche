// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno"; // Ensure using Supabase v2
import {
  allowedOrigins,
  cleanUrl,
  corsHeaders,
  createCorsResponse,
} from "../_shared/config.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Handle CORS preflight request
 * @param origin - Request origin
 * @returns Response for CORS preflight
 */
const handleCorsPreflightRequest = (origin: string) => {
  if (allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }
  return new Response(null, { status: 403 });
};

/**
 * Authenticate user using Supabase token
 * @param token - Supabase access token
 * @returns User object or null if authentication fails
 */
const authenticateUser = async (token: string) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    console.error("Authentication failed:", error);
    return null;
  }
  return user;
};

/**
 * Fetch tutorial details
 * @param tutorialId - ID of the tutorial
 * @returns Tutorial object or null if not found
 */
const fetchTutorial = async (tutorialId: string) => {
  const { data: tutorial, error } = await supabase
    .from("tutorials")
    .select("*, profiles:creator_id(stripe_account_id)")
    .eq("id", tutorialId)
    .single();

  if (error) {
    console.error("Error fetching tutorial:", error);
    return null;
  }
  return tutorial;
};

/**
 * Create Stripe checkout session
 * @param tutorial - Tutorial object
 * @param userId - ID of the user making the purchase
 * @returns Stripe checkout session URL
 */
const createStripeCheckoutSession = async (tutorial: any, userId: string) => {
  if (tutorial.price === 0) {
    return null;
  }

  const account = await stripe.accounts.retrieve(
    tutorial.profiles.stripe_account_id,
  );

  const feePercentage = account.metadata?.default_application_fee_percent || 15;
  const applicationFeeAmount = Math.round(
    tutorial.price * 100 * (feePercentage / 100),
  );

  const frontendUrl = Deno.env.get("FRONTEND_URL")?.replace(/\/$/, "");

  if (!frontendUrl) {
    throw new Error("Frontend URL not configured");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: tutorial.stripe_price_id, quantity: 1 }],
    mode: "payment",
    success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/marketplace`,
    metadata: {
      tutorial_id: tutorial.id,
      creator_id: tutorial.creator_id,
      fee_percentage: feePercentage,
    },
    client_reference_id: userId,
    payment_intent_data: {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: tutorial.profiles.stripe_account_id,
      },
    }
  });

  return session.url;
};

// Main handler function
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(origin);
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!allowedOrigins.includes(origin)) {
    return createCorsResponse(403, { error: "Origin not allowed" }, origin);
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return createCorsResponse(401, { error: "Unauthorized token" }, origin);
  }

  const user = await authenticateUser(token);
  if (!user) {
    return createCorsResponse(401, { error: "Unauthorized user" }, origin);
  }

  try {
    const { tutorialId } = await req.json();
    if (!tutorialId) {
      return createCorsResponse(
        400,
        { error: "tutorialId is required" },
        origin,
      );
    }

    const tutorial = await fetchTutorial(tutorialId);
    if (!tutorial) {
      return createCorsResponse(404, { error: "Tutorial not found" }, origin);
    }

    if (!tutorial.profiles?.stripe_account_id) {
      return createCorsResponse(500, {
        error: "Stripe account not set up for this tutorial",
      }, origin);
    }

    const sessionUrl = await createStripeCheckoutSession(tutorial, user.id);

    if (!sessionUrl && tutorial.price === 0) {
      // Handle free lesson
      const now = new Date().toISOString();
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: user.id,
            tutorial_id: tutorial.id,
            purchase_date: now,
            amount: 0,
            platform_fee: 0,
            creator_earnings: 0,
            status: "completed",
            created_at: now,
            updated_at: now,
          },
        ]);

      if (purchaseError) {
        return createCorsResponse(500, {
          error: "Failed to grant access to free lesson",
        }, origin);
      }

      return createCorsResponse(200, {
        isFree: true,
        lessonId: tutorial.id,
      }, origin);
    }

    return createCorsResponse(200, { sessionUrl }, origin);
  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return createCorsResponse(500, {
      error: "Internal server error",
      details: JSON.stringify(error),
    }, origin);
  }
});
