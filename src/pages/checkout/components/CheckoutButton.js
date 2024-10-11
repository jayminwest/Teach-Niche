// CheckoutButton.js
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const functionsUrl = process.env.REACT_APP_SUPABASE_FUNCTIONS_URL;

function CheckoutButton({ priceId }) {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch(`${functionsUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ priceId }),
    });

    const { sessionId, error } = await response.json();

    if (error) {
      console.error('Error creating checkout session:', error);
      return;
    }

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error('Error redirecting to checkout:', result.error.message);
    }
  };

  return <button className="btn btn-primary" onClick={handleClick}>Buy Tutorial</button>;
}

export default CheckoutButton;
