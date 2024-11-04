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
      vimeo_url, 
      content, 
      category_ids,
      vimeo_video_id,
      create_stripe_only = false
    } = requestData;

    console.log("Received data:", {
      title: title || 'MISSING',
      description: description || 'MISSING',
      price: price || 'MISSING',
      vimeo_url: vimeo_url || 'MISSING',
      content: content ? `${content.slice(0, 50)}...` : 'MISSING',
      category_ids: category_ids || 'MISSING',
      vimeo_video_id: vimeo_video_id || 'MISSING'
    });

    // Detailed validation
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (price === undefined || price === null) missingFields.push('price');
    if (!content) missingFields.push('content');

    if (missingFields.length > 0) {
      console.error("Missing required fields:", {
        missingFields,
        receivedData: {
          hasTitle: !!title,
          hasPrice: price !== undefined && price !== null,
          hasContent: !!content,
          priceValue: price,
          titleLength: title?.length,
          contentLength: content?.length
        }
      });
      
      return createCorsResponse(
        400,
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received: { 
            title: !!title, 
            price: price !== undefined && price !== null, 
            content: !!content 
          }
        },
        origin,
      );
    }

    // If we're only creating Stripe products, skip the validation
    if (!create_stripe_only) {
      // Get user's Stripe account ID only if the lesson is not free
      let stripeAccountId = null;
      let stripeOnboardingComplete = false;

      if (parseFloat(price) > 0) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("stripe_account_id, stripe_onboarding_complete")
          .eq("id", user.id)
          .single();

        if (profileError) {
          return createCorsResponse(500, {
            error: "Failed to fetch user profile",
          }, origin);
        }

        stripeAccountId = profile.stripe_account_id;
        stripeOnboardingComplete = profile.stripe_onboarding_complete;

        if (!stripeAccountId || !stripeOnboardingComplete) {
          return createCorsResponse(403, {
            error: "Please connect your Stripe account before creating paid lessons.",
          }, origin);
        }
      }
    }

    // If we're only creating Stripe products, return early with just the Stripe IDs
    if (create_stripe_only) {
      const product = await stripe.products.create({
        name: title,
        description: description || "",
      });

      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: "usd",
        product: product.id,
      });

      return createCorsResponse(201, { 
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id
      }, origin);
    }

    let stripe_product_id = null;
    let stripe_price_id = null;

    // Create Stripe product and price if lesson is not free
    if (parseFloat(price) > 0) {
      const product = await stripe.products.create({
        name: title,
        description: description || "",
      });

      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: "usd",
        product: product.id,
      });

      stripe_product_id = product.id;
      stripe_price_id = stripePrice.id;
    }

    // Return just the Stripe IDs without creating the lesson
    return createCorsResponse(201, { 
      stripe_product_id,
      stripe_price_id
    }, origin);
  } catch (error) {
    console.error("Error in create-lesson:", error);
    return createCorsResponse(500, {
      error: error instanceof Error ? error.message : "Internal server error",
      details: error instanceof Error ? error.stack : String(error)
    }, origin);
  }
});
