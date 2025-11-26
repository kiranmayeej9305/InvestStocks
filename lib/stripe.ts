import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Create stripe instance only if secret key is available
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  if (stripeSecretKey.length < 100) {
    console.warn('⚠️  STRIPE_SECRET_KEY appears to be incomplete (length: ' + stripeSecretKey.length + ')');
  } else {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil',
    });
  }
} else if (typeof window === 'undefined') {
  // Only warn on server-side (not during client-side rendering)
  console.warn('⚠️  STRIPE_SECRET_KEY environment variable is missing');
}

// Export stripe instance with runtime check
export { stripe };

// Helper function to get stripe instance with error handling
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please check your STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}

// Define your subscription plans
export const PLANS = {
  free: {
    name: 'Starter',
    price: 0,
    priceId: null,
    description: 'Perfect for individual investors and students',
    features: [
      '5 AI conversations per day',
      'Basic stock charts (1 symbol)',
      'Stock price tracking (3 stocks)',
      'Market overview (basic view)',
      'Stock news (5 articles)',
      'Basic user profile',
      'Email support',
      'Mobile responsive'
    ],
    limitations: [
      'No stock screener',
      'No market heatmaps',
      'No ETF analysis',
      'No comparison charts',
      'No financial data',
      'No trending stocks'
    ]
  },
  pro: {
    name: 'Investor',
    price: 19,
    priceId: process.env.STRIPE_PRICE_PRO,
    description: 'For active investors and day traders',
    features: [
      'Unlimited AI conversations',
      'Advanced stock charts (5 symbols)',
      'Unlimited stock tracking',
      'Full market overview',
      'Complete stock screener',
      'Market heatmaps (stocks & ETFs)',
      'Trending stocks analysis',
      'Stock financials with metrics',
      'Stock news (unlimited)',
      'Priority email support',
      'Advanced user profile',
      'Dark/Light theme'
    ],
    limitations: []
  },
  enterprise: {
    name: 'Professional',
    price: 49,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    description: 'For financial institutions and professionals',
    features: [
      'Everything in Pro Plan',
      'Unlimited symbol comparisons',
      'Advanced stock screener',
      'Dedicated support (phone + email)',
      'Priority feature requests',
      'Custom integrations (on request)',
      'Advanced analytics (AI-powered)'
    ],
    limitations: []
  }
};

// Helper function to get plan by ID
export function getPlanById(planId: string) {
  return PLANS[planId as keyof typeof PLANS];
}

// Helper function to get plan by Stripe price ID
export function getPlanByPriceId(priceId: string) {
  return Object.values(PLANS).find(plan => plan.priceId === priceId);
}

// Validate environment variables
export function validateStripeConfig() {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_ENTERPRISE'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missingVars.join(', ')}`);
  }
}
