// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6?target=deno";

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Webhook Secret
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Helper function to convert ArrayBuffer to Hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = Array.from(byteArray).map((value) =>
    value.toString(16).padStart(2, "0")
  );
  return hexCodes.join("");
}

// Function to verify Stripe webhook signature
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<any> {
  // Ensure 'crypto' is available
  if (!crypto || !crypto.subtle) {
    throw new Error("Crypto API is not available in this environment.");
  }

  // Split the signature header into parts
  const parts = sigHeader.split(',');

  const timestampPart = parts.find(part => part.startsWith('t='));
  const signatureParts = parts
    .filter(part => part.startsWith('v1='))
    .map(part => part.slice(3));

  if (!timestampPart) {
    throw new Error("Timestamp missing in Stripe signature.");
  }

  const timestamp = timestampPart.slice(2);

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    throw new Error("Invalid timestamp in Stripe signature.");
  }

  if (signatureParts.length === 0) {
    throw new Error("No signatures found in Stripe signature.");
  }

  const signedPayload = `${timestamp}.${payload}`;

  // Import the secret key
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const computedSignature = arrayBufferToHex(signatureBuffer);

  // Compare the computed signature with the signatures from Stripe
  const isValid = signatureParts.some(
    (sig) => sig === computedSignature
  );

  if (!isValid) {
    throw new Error("Signature verification failed.");
  }

  // Optionally, verify the timestamp to prevent replay attacks
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const tolerance = 300; // 5 minutes

  if (Math.abs(currentTimestamp - parseInt(timestamp)) > tolerance) {
    throw new Error("Timestamp outside the tolerance zone.");
  }

  // Parse the payload to JSON
  return JSON.parse(payload);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  // Enhanced Logging: Log the raw signature and payload for debugging
  console.log("Received Stripe signature header:", sig);
  console.log("Received payload:", payload);

  if (!sig) {
    console.error("Missing Stripe signature.");
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  let event: any;

  try {
    event = await verifyStripeSignature(payload, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // Fulfill the purchase
      await handleCheckoutSession(session);
      break;
    // ... handle other event types if necessary
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

const handleCheckoutSession = async (session: any) => {
  const tutorialId = session.metadata?.tutorial_id;
  const userId = session.client_reference_id;

  console.log("Handling checkout session:", session.id);
  console.log("Extracted tutorial_id:", tutorialId);
  console.log("Extracted user_id:", userId);

  if (!tutorialId || !userId) {
    console.error("Missing tutorial_id or user_id in session metadata.");
    return;
  }

  // Check if the purchase already exists to prevent duplicates
  const { data: existingPurchase, error: existingError } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("tutorial_id", tutorialId)
    .single();

  if (existingError && existingError.code !== "PGRST116") { // PGRST116: No rows found
    console.error("Error checking existing purchase:", existingError.message);
    return;
  }

  if (existingPurchase) {
    console.log("Purchase already exists:", existingPurchase.id);
    return;
  }

  // Insert the purchase into the purchases table
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
    // Optional: Send a confirmation email or trigger other workflows here
  }
};