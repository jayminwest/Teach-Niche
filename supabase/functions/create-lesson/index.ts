// supabase/functions/create-lesson/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://deno.land/x/supabase@1.0.0/mod.ts";

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

// Function to generate CORS headers based on origin
const getCorsHeaders = (origin: string) => {
  if (allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    };
  } else {
    return {
      "Access-Control-Allow-Origin": "null",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    };
  }
};

// Main Handler
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS Preflight (OPTIONS) Request
  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    } else {
      return new Response("Forbidden", {
        status: 403,
        headers: getCorsHeaders(origin),
      });
    }
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: getCorsHeaders(origin),
    });
  }

  // Check if Origin is Allowed
  if (!allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  // Authenticate User
  const supabaseAccessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!supabaseAccessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: getCorsHeaders(origin),
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAccessToken);
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: getCorsHeaders(origin),
    });
  }

  try {
    const { title, description, price, content_url, category_ids } = await req.json();

    // Validate Input
    if (!title || !price || !content_url) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: getCorsHeaders(origin),
      });
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
      return new Response(JSON.stringify({ error: insertError?.message || "Failed to create lesson" }), {
        status: 500,
        headers: getCorsHeaders(origin),
      });
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

    return new Response(JSON.stringify({ lesson: data[0] }), {
      status: 201,
      headers: getCorsHeaders(origin),
    });
  } catch (error: any) {
    console.error("Error creating lesson:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
});
