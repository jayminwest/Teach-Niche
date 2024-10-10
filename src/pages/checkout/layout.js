 // CheckoutForm.js
import { loadStripe } from '@stripe/stripe-js';
import CheckoutButton from './components/CheckoutButton';

const stripePromise = loadStripe(process.env.STRIPE_SECRET_KEY);

export default function CheckoutForm() {
    return (
        <div className="container mx-auto">
            <CheckoutButton priceId={'price_1Q8OvxK15NpNFIt8ldu3vvod'}></CheckoutButton>
        </div>
    );
}

