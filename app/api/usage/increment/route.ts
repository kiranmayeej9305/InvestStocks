import { NextRequest, NextResponse } from 'next/server';
import { incrementUsage } from '@/lib/db/usage';

export async function POST(request: NextRequest) {
  try {
    const { email, feature, userId } = await request.json();
    
    if (!email || !feature) {
      return NextResponse.json(
        { error: 'Email and feature are required' },
        { status: 400 }
      );
    }
    
    const validFeatures = [
      'conversations',
      'stockCharts', 
      'stockTracking',
      'screeners',
      'heatmaps',
      'analytics'
    ];
    
    if (!validFeatures.includes(feature)) {
      return NextResponse.json(
        { error: 'Invalid feature type' },
        { status: 400 }
      );
    }
    
    const success = await incrementUsage(email, feature, userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to increment usage' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `${feature} usage incremented for ${email}`
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    );
  }
}








