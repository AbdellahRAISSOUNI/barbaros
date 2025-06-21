import { NextRequest, NextResponse } from 'next/server';
import { getAvailableRewards } from '@/lib/db/api';

/**
 * GET /api/loyalty/[clientId]/rewards - Get available rewards for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    const rewards = await getAvailableRewards(clientId);

    return NextResponse.json({
      success: true,
      rewards
    });
  } catch (error: any) {
    console.error('Error getting available rewards:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 