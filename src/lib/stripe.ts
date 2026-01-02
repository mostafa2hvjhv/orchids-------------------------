import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export const PRO_PLAN_PRICE_SAR = 9900;
export const PRO_PLAN_PRICE_DISPLAY = '99';
