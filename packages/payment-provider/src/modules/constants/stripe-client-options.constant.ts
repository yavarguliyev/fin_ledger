import Stripe from 'stripe';

export const STRIPE_CLIENT_OPTIONS: Stripe.StripeConfig = {
  apiVersion: '2026-08-26.dahlia',
  timeout: 20_000,
  maxNetworkRetries: 2
};
