import { NextRequest, NextResponse } from 'next/server';
import { getUserUsageHistory } from '@/lib/db/usage';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const days = parseInt(searchParams.get('days') || '30');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const history = await getUserUsageHistory(email, days);
    
    return NextResponse.json({
      success: true,
      history,
      days
    });
  } catch (error) {
    console.error('Error getting usage history:', error);
    return NextResponse.json(
      { error: 'Failed to get usage history' },
      { status: 500 }
    );
  }
}








