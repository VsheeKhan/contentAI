import { authFetch } from '@/app/utils/authFetch';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
      setLoading(true);
      console.log("Price Id : ", priceId);
    const res = await authFetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });
    const { sessionId } = await res.json();

    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Subscribe'}
    </button>
  );
}
