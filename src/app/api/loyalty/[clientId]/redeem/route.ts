import { NextRequest, NextResponse } from 'next/server';
import { redeemReward } from '@/lib/db/api';

/**
 * POST /api/loyalty/[clientId]/redeem - Redeem a reward for a client (barber-controlled)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { rewardId, redeemedBy, visitId, createSpecialVisit = false } = await request.json();

    if (!rewardId || !redeemedBy) {
      return NextResponse.json(
        { success: false, message: 'Reward ID and redeemed by are required' },
        { status: 400 }
      );
    }

    const result = await redeemReward(clientId, rewardId, redeemedBy, visitId, createSpecialVisit);

    return NextResponse.json({
      success: true,
      loyaltyStatus: result.loyaltyStatus,
      redemption: result.redemption,
      visitId: result.visitId,
      message: `Reward redeemed successfully${createSpecialVisit ? ' - Special visit created' : ''}`
    });
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 