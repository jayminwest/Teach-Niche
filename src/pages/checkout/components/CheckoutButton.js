// CheckoutButton.js
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51P2FopK15NpNFIt8Eg5lvzMbAGYjLv5YCqMHPzpAEQwoiYIrCq0gI9VJF8dyeTjBtr8jnIHli1KPLy7fSmtb2hIx006NUfr5He');

function CheckoutButton({ priceId }) {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return <button onClick={handleClick}>Buy Tutorial</button>;
}

export default CheckoutButton;
