import { NextRequest, NextResponse } from 'next/server';
import { getUserUsage } from '@/lib/db/usage';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const today = new Date().toISOString().split('T')[0];
    const usage = await getUserUsage(email, today);
    
    return NextResponse.json({
      success: true,
      date: today,
      usage
    });
  } catch (error) {
    console.error('Error getting current usage:', error);
    return NextResponse.json(
      { error: 'Failed to get current usage' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, date } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    const usage = await getUserUsage(email, targetDate);
    
    return NextResponse.json({
      success: true,
      date: targetDate,
      usage
    });
  } catch (error) {
    console.error('Error getting usage for date:', error);
    return NextResponse.json(
      { error: 'Failed to get usage' },
      { status: 500 }
    );
  }
}








