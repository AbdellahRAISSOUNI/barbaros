import { NextRequest, NextResponse } from 'next/server';
import { getLoyaltyStatistics } from '@/lib/db/api';

/**
 * GET /api/loyalty/statistics - Get loyalty program statistics
 */
export async function GET(request: NextRequest) {
  try {
    const statistics = await getLoyaltyStatistics();

    return NextResponse.json({
      success: true,
      statistics
    });
  } catch (error: any) {
    console.error('Error getting loyalty statistics:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 