import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Missing Stripe publishable key. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file');
}

// Initialize Stripe - only if we have a key
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
