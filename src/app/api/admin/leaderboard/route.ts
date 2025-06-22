import { NextRequest, NextResponse } from 'next/server';
import { getBarberLeaderboard } from '@/lib/db/api/barberApi';

/**
 * GET /api/admin/leaderboard - Get barber leaderboard for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'overall'; // overall, visits, revenue, clients, efficiency
    const timePeriod = searchParams.get('timePeriod') || 'all-time'; // all-time, this-month, this-week

    const leaderboard = await getBarberLeaderboard(sortBy, timePeriod);

    return NextResponse.json({
      success: true,
      leaderboard
    });
  } catch (error: any) {
    console.error('Error getting admin leaderboard:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 