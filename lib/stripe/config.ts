import Stripe from 'stripe';

// Initialize Stripe client lazily to avoid errors if key is missing
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Please add it to your .env.local file. ' +
        'Get your API key from https://dashboard.stripe.com/apikeys'
      );
    }
    
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Stripe Price IDs for each plan
// These should be set in your Stripe Dashboard and added to .env.local
export const STRIPE_PRICE_IDS = {
  // Free plan - no price ID needed
  FREE: null,
  
  // Starter plan
  STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
  STARTER_YEARLY: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  
  // Pro plan
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
} as const;

// Helper function to get price ID based on plan and billing period
export function getPriceId(plan: 'starter' | 'pro', billingPeriod: 'monthly' | 'yearly'): string | null {
  if (plan === 'starter') {
    return billingPeriod === 'monthly' 
      ? STRIPE_PRICE_IDS.STARTER_MONTHLY 
      : STRIPE_PRICE_IDS.STARTER_YEARLY;
  }
  
  if (plan === 'pro') {
    return billingPeriod === 'monthly'
      ? STRIPE_PRICE_IDS.PRO_MONTHLY
      : STRIPE_PRICE_IDS.PRO_YEARLY;
  }
  
  return null;
}
