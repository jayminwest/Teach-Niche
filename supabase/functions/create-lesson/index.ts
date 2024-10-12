// supabase/functions/create-lesson/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6?target=deno";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

// Initialize Supabase Client with Service Role Key
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS Configuration
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

  // Get the user from the access token using Supabase v1
  const { user, error: authError } = await supabase.auth.api.getUser(supabaseAccessToken);

  if (authError || !user) {
    return createCorsResponse(401, { error: "Unauthorized user" }, origin);
  }

  try {
    const { title, description, price, content_url, category_ids } = await req.json();

    // Validate Input
    if (!title || !price || !content_url) {
      return createCorsResponse(400, { error: "Missing required fields" }, origin);
    }

    // Create Stripe Product
    const product = await stripe.products.create({
      name: title,
      description: description || "",
    });

    // Create Stripe Price
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
      currency: "usd",
      product: product.id,
    });

    // Insert Lesson into Supabase
    const { data, error: insertError } = await supabase
      .from("tutorials")
      .insert([
        {
          title,
          description,
          price: parseFloat(price),
          content_url,
          creator_id: user.id,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
        },
      ])
      .select();

    if (insertError || !data) {
      return createCorsResponse(500, { error: insertError?.message || "Failed to create lesson" }, origin);
    }

    // If categories are provided, insert into tutorial_categories
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const tutorialCategories = category_ids.map((category_id: number) => ({
        tutorial_id: data[0].id,
        category_id,
      }));

      const { error: categoryError } = await supabase
        .from("tutorial_categories")
        .insert(tutorialCategories);

      if (categoryError) {
        console.error("Error inserting tutorial categories:", categoryError.message);
      }
    }

    return createCorsResponse(201, { lesson: data[0] }, origin);
  } catch (error: any) {
    console.error("Error creating lesson:", error);
    return createCorsResponse(500, { error: error.message }, origin);
  }
});
