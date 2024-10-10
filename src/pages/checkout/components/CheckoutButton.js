// CheckoutButton.js
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51P2FopK15NpNFIt8Eg5lvzMbAGYjLv5YCqMHPzpAEQwoiYIrCq0gI9VJF8dyeTjBtr8jnIHli1KPLy7fSmtb2hIx006NUfr5He');

function CheckoutButton({ priceId }) {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch('https://wcqpttujocyvueudlcnt.functions.supabase.co/create-checkout-session', {
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

  return <button onClick={handleClick}>Buy Tutorial</button>;
}

export default CheckoutButton;
