// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6?target=deno";
import { cleanUrl } from "../_shared/config.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Add webhook secrets for both types
const platformWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const connectWebhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET")!;

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Convert ArrayBuffer to Hex string
 * @param buffer - ArrayBuffer to convert
 * @returns Hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify Stripe webhook signature
 * @param payload - Webhook payload
 * @param sigHeader - Stripe signature header
 * @param secret - Webhook secret
 * @returns Parsed event object
 */
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<any> {
  if (!crypto || !crypto.subtle) {
    throw new Error("Crypto API is not available in this environment.");
  }

  const parts = sigHeader.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid Stripe signature.");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );

  const computedSignature = arrayBufferToHex(signatureBuffer);

  if (!signatures.some((sig) => sig === computedSignature)) {
    throw new Error("Signature verification failed.");
  }

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
    throw new Error("Timestamp outside the tolerance zone.");
  }

  return JSON.parse(payload);
}

/**
 * Handle checkout session completion
 * @param session - Checkout session object
 */
const handleCheckoutSession = async (session: any) => {
  console.log(
    "Starting handleCheckoutSession with full session data:",
    session,
  );

  // Only process completed payments
  if (session.payment_status !== "paid") {
    console.log(
      `Skipping session ${session.id} - payment status is ${session.payment_status}`,
    );
    return;
  }

  try {
    // Calculate amounts first to ensure we have valid numbers
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const platformFee = session.application_fee_amount
      ? session.application_fee_amount / 100
      : 0;
    const creatorEarnings = totalAmount - platformFee;

    // Validate required fields
    if (
      !session.client_reference_id || !session.metadata?.tutorial_id ||
      !session.metadata?.creator_id
    ) {
      console.error("Missing required fields:", {
        userId: session.client_reference_id,
        tutorialId: session.metadata?.tutorial_id,
        creatorId: session.metadata?.creator_id,
      });
      throw new Error("Missing required fields for purchase");
    }

    // Prepare purchase data
    const purchaseData = {
      user_id: session.client_reference_id,
      tutorial_id: session.metadata.tutorial_id,
      creator_id: session.metadata.creator_id,
      purchase_date: new Date().toISOString(),
      amount: totalAmount,
      platform_fee: platformFee,
      creator_earnings: creatorEarnings,
      payment_intent_id: session.payment_intent,
      fee_percentage: session.metadata?.fee_percentage,
      status: "completed",
      stripe_session_id: session.id,
      metadata: {
        stripe_customer: session.customer,
        payment_status: session.payment_status,
        payment_method_types: session.payment_method_types,
      },
    };

    console.log("Attempting to insert purchase with data:", purchaseData);

    // Insert purchase record
    const { data: purchase, error: insertError } = await supabase
      .from("purchases")
      .insert([purchaseData])
      .select();

    if (insertError) {
      console.error("Failed to insert purchase:", insertError);
      throw insertError;
    }

    if (!purchase || purchase.length === 0) {
      throw new Error("Purchase was not inserted successfully");
    }

    console.log("Purchase successfully recorded:", purchase[0]);
    return { success: true, purchaseId: purchase[0].id };
  } catch (error) {
    console.error("Error in handleCheckoutSession:", error);
    throw error;
  }
};

// Main handler function
serve(async (req: Request) => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No signature provided");
      return new Response("No signature provided", { status: 400 });
    }

    const body = await req.text();
    console.log("Received webhook body:", body);

    try {
      // Replace Stripe's verification with our custom async verification
      const event = await verifyStripeSignature(
        body,
        signature,
        platformWebhookSecret, // Use platform webhook secret by default
      );
      console.log("Webhook event verified:", event.type);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("Processing checkout session:", session.id);

        try {
          const result = await handleCheckoutSession(session);
          console.log("Checkout session handled successfully:", result);
        } catch (error) {
          console.error("Error handling checkout session:", error);
          throw error;
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err) {
      console.error("Error verifying webhook event:", err);
      throw err;
    }
  } catch (err) {
    const error = err as Error;
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
