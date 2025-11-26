import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get the latest user data
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        joinDate: user.joinDate || '',
        plan: user.plan || 'free',
        subscriptionId: user.subscriptionId || null,
      },
    });
  } catch (error) {
    console.error('Error refreshing user session:', error);
    return NextResponse.json(
      { error: 'Failed to refresh user session' },
      { status: 500 }
    );
  }
}





