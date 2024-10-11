 // CheckoutForm.js
// import { loadStripe } from '@stripe/stripe-js';
import CheckoutCard from './components/CheckoutCard';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// const stripePromise = loadStripe(process.env.STRIPE_SECRET_KEY);
const sampleCard = {
    title: "Lesson 1",
    teacher: "Teacher 1",
    price: "$10",
    description: "This is the first lesson",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    priceId:'price_1Q8OvxK15NpNFIt8ldu3vvod'
  }

export default function CheckoutForm() {
    return (
        <div className="container mx-auto">
            <Header />
                <CheckoutCard {...sampleCard} />
            <Footer />
        </div>
    );
}

