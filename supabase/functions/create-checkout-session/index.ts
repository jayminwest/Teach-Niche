// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://deno.land/x/supabase@1.0.0/mod.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const allowedOrigins = [
  "http://localhost:3000",
  "https://teach-niche.com", // Replace with your production domain
];

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
});

serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    // Handle CORS preflight request
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

  if (req.method === "POST") {
    if (!allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    const supabaseAccessToken = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!supabaseAccessToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAccessToken);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    try {
      const { lessonId } = await req.json();

      // Validate Input
      if (!lessonId) {
        return new Response(JSON.stringify({ error: "Missing lessonId" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        });
      }

      // Fetch the lesson details from the database
      const { data: lesson, error } = await supabase
        .from("tutorials")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (error || !lesson) {
        return new Response(JSON.stringify({ error: "Lesson not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        });
      }

      // Ensure Stripe Price ID exists
      if (!lesson.stripe_price_id) {
        return new Response(JSON.stringify({ error: "Stripe Price ID not found" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        });
      }

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
        success_url: `${Deno.env.get("FRONTEND_URL")}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${Deno.env.get("FRONTEND_URL")}/cancel`,
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
  }

  // If method is not POST or OPTIONS
  return new Response(null, {
    status: 405,
    statusText: "Method Not Allowed",
  });
});
