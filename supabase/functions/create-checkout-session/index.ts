// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno"; // Ensure using Supabase v2

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
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
  const supabaseAccessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!supabaseAccessToken) {
    return createCorsResponse(401, { error: "Unauthorized token" }, origin);
  }

  // Use Supabase v2 method to get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(supabaseAccessToken);

  if (authError || !user) {
    return createCorsResponse(401, { error: "Unauthorized user" }, origin);
  }

  try {
    const { lessonId } = await req.json();

    // Validate Input
    if (!lessonId) {
      return createCorsResponse(400, { error: "Missing lessonId" }, origin);
    }

    // Fetch the lesson details from the database
    const { data: lesson, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (error || !lesson) {
      return createCorsResponse(404, { error: "Lesson not found" }, origin);
    }

    // Ensure Stripe Price ID exists
    if (!lesson.stripe_price_id) {
      return createCorsResponse(500, { error: "Stripe Price ID not found" }, origin);
    }
    
    const frontend_url = Deno.env.get("FRONTEND_URL");

    // Create Checkout Session using the stored Stripe Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: lesson.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/cancel`,
      client_reference_id: user.id,
      metadata: {
        tutorial_id: lesson.id,
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id, sessionUrl: session.url }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }
});
