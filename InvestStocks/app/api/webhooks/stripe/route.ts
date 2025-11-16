import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPlanByPriceId } from '@/lib/stripe';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
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
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
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
