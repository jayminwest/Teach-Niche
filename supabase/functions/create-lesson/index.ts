// supabase/functions/create-lesson/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0?target=deno";
import {
  allowedOrigins,
  corsHeaders,
  createCorsResponse,
} from "../_shared/config.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Main handler function
serve(async (req) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // Check if the origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return createCorsResponse(403, { error: "Forbidden" }, origin);
  }

  if (req.method !== "POST") {
    return createCorsResponse(405, { error: "Method not allowed" }, origin);
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return createCorsResponse(401, { error: "Unauthorized" }, origin);
  }

  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      token,
    );
    if (authError || !user) {
      return createCorsResponse(401, { error: "Unauthorized" }, origin);
    }

    const { title, description, price, vimeo_url, content, category_ids } =
      await req.json();

    if (!title || !price || !content) {
      return createCorsResponse(
        400,
        { error: "Missing required fields" },
        origin,
      );
    }

    // Get user's Stripe account ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (
      profileError || !profile.stripe_account_id ||
      !profile.stripe_onboarding_complete
    ) {
      return createCorsResponse(403, {
        error: "Please connect your Stripe account before creating lessons.",
      }, origin);
    }

    // Create Stripe product and price
    const product = await stripe.products.create({
      name: title,
      description: description || "",
    }, { stripeAccount: profile.stripe_account_id });

    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(parseFloat(price) * 100),
      currency: "usd",
      product: product.id,
    }, { stripeAccount: profile.stripe_account_id });

    // Insert lesson into Supabase
    const { data, error: insertError } = await supabase
      .from("tutorials")
      .insert([
        {
          title,
          description,
          price: parseFloat(price),
          vimeo_url: vimeo_url || null,
          content,
          creator_id: user.id,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
        },
      ])
      .select();

    if (insertError || !data) {
      return createCorsResponse(500, {
        error: insertError?.message || "Failed to create lesson",
      }, origin);
    }

    // Insert tutorial categories if provided
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
      }
    }

    return createCorsResponse(201, { lesson: data[0] }, origin);
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return createCorsResponse(500, { error: "Internal server error" }, origin);
  }
});
