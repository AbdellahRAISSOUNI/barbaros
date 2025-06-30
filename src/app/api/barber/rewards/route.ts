import { NextRequest, NextResponse } from 'next/server';
import { getBarberRewardProgress, updateBarberRewardProgress } from '@/lib/db/api/barberRewardEngine';

/**
 * GET /api/barber/rewards - Get barber's reward progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    
    if (!barberId) {
      return NextResponse.json(
        { success: false, error: 'Barber ID is required' },
        { status: 400 }
      );
    }
    
    // Update progress first to ensure data is current
    await updateBarberRewardProgress(barberId);
    
    // Get current progress
    const rewards = await getBarberRewardProgress(barberId);
    
    // Calculate summary statistics
    const stats = {
      totalRewards: rewards.length,
      earnedRewards: rewards.filter(r => r.isEarned).length,
      redeemedRewards: rewards.filter(r => r.isRedeemed).length,
      eligibleRewards: rewards.filter(r => r.isEligible && !r.isEarned).length,
      inProgressRewards: rewards.filter(r => !r.isEligible && !r.isEarned).length
    };
    
    return NextResponse.json({
      success: true,
      rewards,
      statistics: stats
    });
  } catch (error: any) {
    console.error('Error fetching barber rewards:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 