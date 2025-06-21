import { NextRequest, NextResponse } from 'next/server';
import { getClientRewardHistory } from '@/lib/db/api';

/**
 * GET /api/loyalty/[clientId]/history - Get client's reward redemption history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const rewardId = searchParams.get('rewardId');

    const history = await getClientRewardHistory(clientId, rewardId || undefined);

    return NextResponse.json({
      success: true,
      history
    });
  } catch (error: any) {
    console.error('Error getting reward history:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 