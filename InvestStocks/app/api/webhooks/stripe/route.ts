import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPlanByPriceId } from '@/lib/stripe';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Read raw body as Buffer first to preserve exact bytes for signature verification
    // This is critical - Stripe signs the exact raw bytes, so any modification breaks verification
    const bodyBuffer = await request.arrayBuffer();
    const body = Buffer.from(bodyBuffer).toString('utf8');
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('[WEBHOOK] Missing stripe signature header');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Get webhook secret - try CLI secret first (for local dev), then production secret
    // For local testing with Stripe CLI, the secret is: whsec_7ab15dab2a6552dc9fe98f0aafc6148c95e012905c492e0c60fefed5069f1a75
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_CLI || process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
      console.error('[WEBHOOK] Available env vars:', {
        hasCliSecret: !!process.env.STRIPE_WEBHOOK_SECRET_CLI,
        hasProdSecret: !!process.env.STRIPE_WEBHOOK_SECRET
      });
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }
    
    console.log('[WEBHOOK] Using webhook secret:', webhookSecret.substring(0, 20) + '...');

    let event;
    let verificationError: any = null;

    try {
      const stripe = getStripe();
      
      // Verify signature with raw body
      // Note: The body must be the exact raw string as received from Stripe
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      
      console.log('[WEBHOOK] ✓ Event verified:', event.type, event.id);
    } catch (err: any) {
      verificationError = err;
      
      // Try the other webhook secret as fallback (useful when switching between CLI and production)
      const alternateSecret = webhookSecret === process.env.STRIPE_WEBHOOK_SECRET_CLI 
        ? process.env.STRIPE_WEBHOOK_SECRET 
        : process.env.STRIPE_WEBHOOK_SECRET_CLI;
      
      if (alternateSecret && alternateSecret !== webhookSecret) {
        console.log('[WEBHOOK] Trying alternate webhook secret...');
        try {
          const stripe = getStripe();
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            alternateSecret
          );
          console.log('[WEBHOOK] ✓ Event verified with alternate secret:', event.type, event.id);
          verificationError = null;
        } catch (altErr: any) {
          console.error('[WEBHOOK] Alternate secret also failed');
        }
      }
      
      if (verificationError) {
        console.error('[WEBHOOK] ✗ Signature verification failed:', verificationError?.message || verificationError);
        console.error('[WEBHOOK] Signature header:', signature?.substring(0, 50) + '...');
        console.error('[WEBHOOK] Body length:', body.length);
        console.error('[WEBHOOK] Body first 200 chars:', body.substring(0, 200));
        console.error('[WEBHOOK] Webhook secret used:', webhookSecret?.substring(0, 20) + '...');
        
        return NextResponse.json(
          { 
            error: 'Invalid signature', 
            details: verificationError?.message || 'Unknown error',
            hint: 'Ensure the raw request body is preserved exactly as received from Stripe. Check webhook secret matches the endpoint.'
          },
          { status: 400 }
        );
      }
    }

    // Ensure event is defined before processing
    if (!event) {
      console.error('[WEBHOOK] Event is undefined after verification');
      return NextResponse.json(
        { error: 'Event verification failed' },
        { status: 400 }
      );
    }

    try {
      switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        console.log('[WEBHOOK] Checkout session completed:', {
          sessionId: session.id,
          mode: session.mode,
          metadata: session.metadata
        });

        // Handle successful checkout
        if (session.mode === 'subscription') {
          const subscription = await getStripe().subscriptions.retrieve(session.subscription);
          const planType = subscription.metadata.planType || session.metadata.planType;
          const customerEmail = subscription.metadata.customerEmail || session.metadata.customerEmail || session.customer_email;

          console.log('[WEBHOOK] Updating plan for subscription:', {
            planType,
            customerEmail,
            subscriptionId: subscription.id
          });

          // Update user plan in your database
          await updateUserPlan(customerEmail, planType, subscription.id);
        } else if (session.mode === 'payment') {
          // Handle one-time payment if needed
          const planType = session.metadata.planType;
          const customerEmail = session.metadata.customerEmail || session.customer_email;

          console.log('[WEBHOOK] Updating plan for payment:', {
            planType,
            customerEmail
          });

          await updateUserPlan(customerEmail, planType, null);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const planType = subscription.metadata.planType;
        const customerEmail = subscription.metadata.customerEmail;

        if (subscription.status === 'active') {
          await updateUserPlan(customerEmail, planType, subscription.id);
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await updateUserPlan(customerEmail, 'free', null);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerEmail = subscription.metadata.customerEmail;

        // Downgrade user to free plan
        await updateUserPlan(customerEmail, 'free', null);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscription = await getStripe().subscriptions.retrieve(invoice.subscription as string);
        const customerEmail = subscription.metadata.customerEmail;

        // Handle failed payment - you might want to send an email notification
        console.log(`Payment failed for ${customerEmail}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('[WEBHOOK] Processing error:', error);
      return NextResponse.json(
        { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[WEBHOOK] Request error:', error);
    return NextResponse.json(
      { error: 'Webhook request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function updateUserPlan(email: string, planType: string, subscriptionId: string | null) {
  try {
    console.log(`[WEBHOOK] Updating user ${email} to plan ${planType}`);
    
    // Direct database update
    const { db } = await connectToDatabase();

    const result = await db.collection('users').updateOne(
      { email },
      {
        $set: {
          plan: planType,
          subscriptionId: subscriptionId || null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      console.error(`[WEBHOOK] User not found: ${email}`);
      throw new Error('User not found');
    }

    console.log(`[WEBHOOK] Successfully updated user ${email} to plan ${planType}`);
    
    // Get the updated user data
    const updatedUser = await db.collection('users').findOne({ email });
    return updatedUser;
  } catch (error) {
    console.error('[WEBHOOK] Error updating user plan:', error);
    throw error;
  }
}
