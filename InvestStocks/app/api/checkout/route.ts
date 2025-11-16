import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS, validateStripeConfig } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig();

    const { planType, customerEmail, successUrl, cancelUrl } = await request.json();

    // Validate plan type
    if (!PLANS[planType as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // Don't create checkout session for free plan
    if (planType === 'free') {
      return NextResponse.json(
        { error: 'Cannot create checkout session for free plan' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        planType,
        customerEmail,
      },
      subscription_data: {
        metadata: {
          planType,
          customerEmail,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
