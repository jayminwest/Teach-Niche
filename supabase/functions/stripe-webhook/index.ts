// Using direct imports that don't require bundling
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

// Simple webhook handler that doesn't require Stripe library for initial deployment
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    // For initial deployment, just log the event and return success
    const body = await req.text();
    console.log("Received webhook event with signature:", signature);
    
    // Store the raw body for debugging
    console.log("Webhook body:", body.substring(0, 100) + "...");

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
});
