import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.15.0?target=deno';
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
});

// Initialize Supabase Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

serve(async (req) => {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  const endpointSecret = 'your-webhook-signing-secret';

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Fulfill the purchase
    const { error } = await supabaseClient
      .from('purchases')
      .insert([{ user_id: session.client_reference_id, tutorial_id: session.metadata.tutorial_id }]);
    if (error) console.error('Error updating purchase:', error);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
