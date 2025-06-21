import { NextRequest, NextResponse } from 'next/server';
import { getRewardStatistics } from '@/lib/db/api';

export async function GET(request: NextRequest) {
  try {
    const statistics = await getRewardStatistics();
    
    return NextResponse.json({
      success: true,
      statistics
    });
  } catch (error: any) {
    console.error('Error in GET /api/rewards/statistics:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 