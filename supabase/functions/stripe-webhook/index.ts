// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6?target=deno";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Webhook secret for verifying Stripe signatures
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

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
  const tutorialId = session.metadata?.tutorial_id;
  const userId = session.client_reference_id;

  if (!tutorialId || !userId) {
    console.error("Missing tutorial_id or user_id in session metadata.");
    return;
  }

  const { data: existingPurchase, error: existingError } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("tutorial_id", tutorialId)
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    console.error("Error checking existing purchase:", existingError.message);
    return;
  }

  if (existingPurchase) {
    console.log("Purchase already exists:", existingPurchase.id);
    return;
  }

  const { data, error } = await supabase
    .from("purchases")
    .insert([
      {
        user_id: userId,
        tutorial_id: tutorialId,
        purchase_date: new Date(),
      },
    ]);

  if (error) {
    console.error("Error recording purchase:", error.message);
  } else {
    console.log("Purchase recorded successfully:", data[0].id);
  }
};

// Main handler function
serve(async (req) => {
  if (req.method === "POST") {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return new Response("Missing Stripe signature.", { status: 400 });
    }

    try {
      const event = await verifyStripeSignature(payload, sig, webhookSecret);

      if (event.type === "checkout.session.completed") {
        await handleCheckoutSession(event.data.object);
      } else {
        console.log(`Unhandled event type ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err: any) {
      console.error("Webhook Error:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  } else if (req.method === "GET") {
    return new Response("Stripe webhook is functioning correctly", {
      status: 200,
    });
  } else {
    return new Response("Method Not Allowed", { status: 405 });
  }
});
