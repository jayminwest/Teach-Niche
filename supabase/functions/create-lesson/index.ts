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

    const requestData = await req.json();
    const {
      title,
      description,
      price,
      content,
      category_ids,
      create_stripe_only = false,
      thumbnail_url = null,
      vimeo_video_id = null,
    } = requestData;

    // Validate fields
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (price === undefined || price === null) missingFields.push("price");
    if (!content) missingFields.push("content");

    if (missingFields.length > 0) {
      return createCorsResponse(400, {
        error: `Missing required fields: ${missingFields.join(", ")}`,
      }, origin);
    }

    // Create Stripe product and price if needed
    let stripe_product_id = null;
    let stripe_price_id = null;

    if (parseFloat(price) > 0) {
      // Get the creator's Stripe account ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_account_id")
        .eq("id", user.id)
        .single();

      if (!profile?.stripe_account_id) {
        return createCorsResponse(400, {
          error: "Creator must connect Stripe account first",
        }, origin);
      }

      // Create product on the platform account
      const product = await stripe.products.create({
        name: title,
        description: description || "",
        metadata: {
          creator_id: user.id,
          creator_stripe_account: profile.stripe_account_id,
        },
      });

      // Create price with application fee
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: "usd",
        product: product.id,
        metadata: {
          creator_id: user.id,
          creator_stripe_account: profile.stripe_account_id,
        },
      });

      stripe_product_id = product.id;
      stripe_price_id = stripePrice.id;
    }

    // If we're only creating Stripe products, return early
    if (create_stripe_only) {
      return createCorsResponse(201, {
        stripe_product_id,
        stripe_price_id,
      }, origin);
    }

    // Create the lesson record
    const { data: lesson, error: lessonError } = await supabase
      .from("tutorials")
      .insert({
        title,
        description,
        price: parseFloat(price),
        content,
        creator_id: user.id,
        thumbnail_url,
        stripe_product_id,
        stripe_price_id,
        status: "draft",
        vimeo_video_id,
      })
      .select()
      .single();

    if (lessonError) {
      throw new Error(`Failed to create lesson: ${lessonError.message}`);
    }

    // Handle category assignments if provided
    if (category_ids?.length > 0) {
      const categoryInserts = category_ids.map((categoryId: string) => ({
        tutorial_id: lesson.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from("tutorial_categories")
        .insert(categoryInserts);

      if (categoryError) {
        throw new Error(
          `Failed to assign categories: ${categoryError.message}`,
        );
      }
    }

    return createCorsResponse(201, {
      lesson_id: lesson.id,
      stripe_product_id,
      stripe_price_id,
    }, origin);
  } catch (error) {
    console.error("Error in create-lesson:", error);
    return createCorsResponse(500, {
      error: error instanceof Error ? error.message : "Internal server error",
    }, origin);
  }
});
