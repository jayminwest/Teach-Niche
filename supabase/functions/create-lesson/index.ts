// supabase/functions/create-lesson/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import { allowedOrigins, corsHeaders, createCorsResponse } from "../_shared/config.ts";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client with URL and service role key from environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Main handler function to serve requests
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      return new Response("ok", {
        status: 200,
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
    console.error(`Method ${req.method} not allowed.`);
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Authenticate the user using the Supabase access token
  const supabaseAccessToken = req.headers.get("Authorization")?.replace(
    "Bearer ",
    "",
  );
  if (!supabaseAccessToken) {
    console.error("No Authorization header found.");
    return new Response(JSON.stringify({ error: "Unauthorized token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Retrieve the user from the access token
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    supabaseAccessToken,
  );
  if (authError || !user) {
    console.error("Authentication failed:", authError);
    return new Response(JSON.stringify({ error: "Unauthorized user" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log(`[create-lesson] Authenticated user: ${user.id}`);
    const { title, description, price, video_url, content, category_ids } =
      await req.json();
    console.log(
      `[create-lesson] Received data: ${
        JSON.stringify({
          title,
          description,
          price,
          video_url,
          content,
          category_ids,
        })
      }`,
    );

    // Validate input fields
    if (!title || !price || !content) {
      console.error("Missing required fields.");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Retrieve user's Stripe Account ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (
      profileError || !profile.stripe_account_id ||
      !profile.stripe_onboarding_complete
    ) {
      console.error("Stripe account not set up:", profileError);
      return new Response(
        JSON.stringify({
          error: "Please connect your Stripe account before creating lessons.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `[create-lesson] Retrieved stripe_account_id: ${profile.stripe_account_id}`,
    );

    // Create Stripe Product on behalf of the connected account
    const product = await stripe.products.create({
      name: title,
      description: description || "",
    }, {
      stripeAccount: profile.stripe_account_id,
    });
    console.log(`[create-lesson] Created Stripe Product: ${product.id}`);

    // Create Stripe Price on behalf of the connected account
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
      currency: "usd",
      product: product.id,
    }, {
      stripeAccount: profile.stripe_account_id,
    });
    console.log(`[create-lesson] Created Stripe Price: ${stripePrice.id}`);

    // Insert Lesson into Supabase
    const { data, error: insertError } = await supabase
      .from("tutorials")
      .insert([
        {
          title,
          description,
          price: parseFloat(price),
          video_url: video_url || null,
          content, // This will be stored as JSONB
          creator_id: user.id,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
        },
      ])
      .select();

    if (insertError || !data) {
      console.error(`[create-lesson] Error inserting lesson: ${insertError}`);
      return new Response(
        JSON.stringify({
          error: insertError?.message || "Failed to create lesson",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(`[create-lesson] Inserted lesson: ${JSON.stringify(data[0])}`);

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
        console.error(
          "Error inserting tutorial categories:",
          categoryError.message,
        );
      } else {
        console.log("Inserted tutorial categories successfully.");
      }
    }

    return new Response(JSON.stringify({ lesson: data[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(`[create-lesson] Unexpected error: ${error}`);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
