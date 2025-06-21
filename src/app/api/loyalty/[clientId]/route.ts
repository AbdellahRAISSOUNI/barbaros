import { NextRequest, NextResponse } from 'next/server';
import { getLoyaltyStatus, selectReward, getAvailableRewards } from '@/lib/db/api';

/**
 * GET /api/loyalty/[clientId] - Get loyalty status for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    const loyaltyStatus = await getLoyaltyStatus(clientId);

    return NextResponse.json({
      success: true,
      loyaltyStatus
    });
  } catch (error: any) {
    console.error('Error getting loyalty status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/[clientId] - Select a reward for a client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { success: false, message: 'Reward ID is required' },
        { status: 400 }
      );
    }

    const loyaltyStatus = await selectReward(clientId, rewardId);

    return NextResponse.json({
      success: true,
      loyaltyStatus,
      message: 'Reward selected successfully'
    });
  } catch (error: any) {
    console.error('Error selecting reward:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 