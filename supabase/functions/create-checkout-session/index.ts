// functions/create-checkout-session/index.ts

// curl -X POST 'https://wcqpttujocyvueudlcnt.functions.supabase.co/create-checkout-session' \
  // -H 'Content-Type: application/json' \
  // -H 'Origin: http://localhost:3000' \
  // -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  // -d '{"priceId": "price_1Q8OvxK15NpNFIt8ldu3vvod"}' -i

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.5.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15',
});

const allowedOrigins = [
  'http://localhost:3000',
  'https://teach-niche.com', // Replace with your production domain
];

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin',
});

serve(async (req) => {
  const origin = req.headers.get('origin') || '';

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    if (allowedOrigins.includes(origin)) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    } else {
      return new Response(null, {
        status: 403,
        statusText: 'Forbidden',
      });
    }
  }

  if (req.method === 'POST') {
    if (!allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    try {
      const { priceId } = await req.json();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        success_url: 'https://your-domain.com/success',
        cancel_url: 'https://your-domain.com/cancel',
      });

      return new Response(JSON.stringify({ sessionId: session.id }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin),
          },
        }
      );
    }
  }

  // If method is not POST or OPTIONS
  return new Response(null, {
    status: 405,
    statusText: 'Method Not Allowed',
  });
});
