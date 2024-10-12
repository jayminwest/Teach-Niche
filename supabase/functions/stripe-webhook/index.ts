// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6?target=deno";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Webhook Secret
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig!, webhookSecret);
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      // Fulfill the purchase
      await handleCheckoutSession(session);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

const handleCheckoutSession = async (session: Stripe.Checkout.Session) => {
  const tutorialId = session.metadata?.tutorial_id;
  const userId = session.client_reference_id;

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
    // console.log("Purchase recorded successfully:", data[0].id);
    // Optional: Send a confirmation email or trigger other workflows here
  }
};
