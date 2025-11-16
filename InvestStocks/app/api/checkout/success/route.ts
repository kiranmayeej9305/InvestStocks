import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(new URL('/?error=no_session', request.url));
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.redirect(new URL('/?error=invalid_session', request.url));
    }

    // Extract plan and customer info
    const planType = session.metadata?.planType;
    const customerEmail = session.metadata?.customerEmail || session.customer_email;

    console.log('[SUCCESS] Processing payment success:', {
      sessionId,
      planType,
      customerEmail,
      paymentStatus: session.payment_status
    });

    if (session.payment_status === 'paid' && planType && customerEmail) {
      // Update user plan in database
      const { db } = await connectToDatabase();

      const result = await db.collection('users').updateOne(
        { email: customerEmail },
        {
          $set: {
            plan: planType,
            stripeSessionId: sessionId,
            updatedAt: new Date(),
          },
        }
      );

      console.log('[SUCCESS] User plan updated:', {
        customerEmail,
        planType,
        matched: result.matchedCount,
        modified: result.modifiedCount
      });

      if (result.matchedCount === 0) {
        console.error('[SUCCESS] User not found:', customerEmail);
        return NextResponse.redirect(new URL('/?error=user_not_found', request.url));
      }

      // Redirect to dashboard with success message
      return NextResponse.redirect(new URL('/?upgrade=success&plan=' + planType, request.url));
    }

    return NextResponse.redirect(new URL('/?error=payment_failed', request.url));
  } catch (error) {
    console.error('[SUCCESS] Error processing success callback:', error);
    return NextResponse.redirect(new URL('/?error=processing_failed', request.url));
  }
}

