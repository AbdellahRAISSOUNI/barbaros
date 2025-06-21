import { NextRequest, NextResponse } from 'next/server';
import { getLoyaltyStatus, getClientRewardHistory } from '@/lib/db/api/loyaltyApi';

/**
 * GET /api/loyalty/[clientId]/export - Export client loyalty data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    // Get loyalty status and reward history
    const [loyaltyStatus, rewardHistory] = await Promise.all([
      getLoyaltyStatus(clientId),
      getClientRewardHistory(clientId)
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      clientId,
      loyaltyStatus: {
        currentProgressVisits: loyaltyStatus.currentProgressVisits,
        totalVisits: loyaltyStatus.totalVisits,
        rewardsRedeemed: loyaltyStatus.rewardsRedeemed,
        loyaltyLevel: loyaltyStatus.client.loyaltyStatus,
        joinDate: loyaltyStatus.client.loyaltyJoinDate,
        canRedeem: loyaltyStatus.canRedeem,
        progressPercentage: loyaltyStatus.progressPercentage,
        visitsToNextReward: loyaltyStatus.visitsToNextReward,
        milestoneReached: loyaltyStatus.milestoneReached,
        selectedReward: loyaltyStatus.selectedReward ? {
          id: loyaltyStatus.selectedReward._id,
          name: loyaltyStatus.selectedReward.name,
          visitsRequired: loyaltyStatus.selectedReward.visitsRequired,
          rewardType: loyaltyStatus.selectedReward.rewardType
        } : null,
        eligibleRewards: loyaltyStatus.eligibleRewards.map(reward => ({
          id: reward._id,
          name: reward.name,
          visitsRequired: reward.visitsRequired,
          rewardType: reward.rewardType
        }))
      },
      rewardHistory: rewardHistory.map(item => ({
        visitId: item.visitId,
        visitDate: item.visitDate,
        rewardName: item.rewardRedeemed?.rewardName,
        rewardType: item.rewardRedeemed?.rewardType,
        discountPercentage: item.rewardRedeemed?.discountPercentage,
        redeemedAt: item.rewardRedeemed?.redeemedAt,
        redeemedBy: item.rewardRedeemed?.redeemedBy,
        totalPrice: item.totalPrice,
        servicesReceived: item.services?.length || 0
      })),
      summary: {
        totalRewardsRedeemed: rewardHistory.length,
        currentLoyaltyLevel: loyaltyStatus.client.loyaltyStatus,
        totalLifetimeVisits: loyaltyStatus.totalVisits,
        currentProgressVisits: loyaltyStatus.currentProgressVisits,
        joinDate: loyaltyStatus.client.loyaltyJoinDate,
        membershipDuration: loyaltyStatus.client.loyaltyJoinDate 
          ? Math.floor((new Date().getTime() - new Date(loyaltyStatus.client.loyaltyJoinDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error: any) {
    console.error('Error exporting loyalty data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to export loyalty data' },
      { status: 500 }
    );
  }
} 