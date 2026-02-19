import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  stripeInstance = new Stripe(secretKey, { apiVersion: '2026-01-28.clover' });
  return stripeInstance;
}

// Subscription tiers
export const PLANS = {
  free: { name: 'Free', priceId: null, scansPerDay: 10, features: ['Basic scan', 'Single chain'] },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    scansPerDay: 500,
    features: ['Multi-chain', 'AI analysis', 'Telegram alerts', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? '',
    scansPerDay: -1, // unlimited
    features: ['Unlimited scans', 'Priority support', 'Custom integrations', 'SLA'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Create a Stripe checkout session for a subscription
export async function createCheckoutSession(
  userId: string,
  plan: 'pro' | 'enterprise',
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const stripe = getStripe();
  const priceId = PLANS[plan].priceId;

  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: { userId, plan },
  });

  return session.url ?? '';
}

// Create a customer portal session (manage subscription)
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
