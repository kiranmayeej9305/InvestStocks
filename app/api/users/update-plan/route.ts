import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, plan, subscriptionId } = await request.json();

    if (!email || !plan) {
      return NextResponse.json(
        { error: 'Email and plan are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update user plan in database
    const result = await db.collection('users').updateOne(
      { email },
      {
        $set: {
          plan,
          subscriptionId: subscriptionId || null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the updated user data
    const updatedUser = await db.collection('users').findOne({ email });

    return NextResponse.json({
      success: true,
      message: `User plan updated to ${plan}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Failed to update user plan' },
      { status: 500 }
    );
  }
}
