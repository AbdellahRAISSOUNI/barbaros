'use strict';

import { connectToDatabase } from '../mongodb';
import Client, { IClient } from '../models/client';
import Reward, { IReward } from '../models/reward';
import Visit from '../models/visit';

export interface LoyaltyStatus {
  client: IClient;
  selectedReward?: IReward;
  eligibleRewards: IReward[];
  visitsToNextReward: number;
  progressPercentage: number;
  canRedeem: boolean;
  totalVisits: number;
  currentProgressVisits: number;
  rewardsRedeemed: number;
  milestoneReached: boolean;
}

export interface RewardRedemption {
  rewardId: string;
  clientId: string;
  visitId?: string;
  redeemedAt: Date;
  redeemedBy: string; // Barber name
  previousVisitCount: number;
  discountApplied?: number;
  servicesFree?: string[];
}

/**
 * Get comprehensive loyalty status for a client
 */
export async function getLoyaltyStatus(clientId: string): Promise<LoyaltyStatus> {
  try {
    await connectToDatabase();
    
    const client = await Client.findById(clientId).populate('selectedReward');
    if (!client) {
      throw new Error('Client not found');
    }

    // Get all active rewards
    const allActiveRewards = await Reward.find({ isActive: true })
      .populate('applicableServices')
      .sort({ visitsRequired: 1 });

    // Find eligible rewards (client has enough visits)
    const eligibleRewards = allActiveRewards.filter(reward => 
      client.currentProgressVisits >= reward.visitsRequired
    );

    // Calculate progress for selected reward
    let visitsToNextReward = 0;
    let progressPercentage = 0;
    let canRedeem = false;
    let milestoneReached = false;

    if (client.selectedReward) {
      const selectedReward = client.selectedReward as IReward;
      visitsToNextReward = Math.max(0, selectedReward.visitsRequired - client.currentProgressVisits);
      progressPercentage = Math.min(100, (client.currentProgressVisits / selectedReward.visitsRequired) * 100);
      canRedeem = client.currentProgressVisits >= selectedReward.visitsRequired;
      milestoneReached = canRedeem;
      
      // Update loyalty status
      if (canRedeem && client.loyaltyStatus !== 'milestone_reached') {
        client.loyaltyStatus = 'milestone_reached';
        await client.save();
      }
    } else if (eligibleRewards.length > 0) {
      // If no reward selected but has eligible rewards
      milestoneReached = true;
    }

    return {
      client,
      selectedReward: client.selectedReward as IReward,
      eligibleRewards,
      visitsToNextReward,
      progressPercentage: Math.round(progressPercentage),
      canRedeem,
      totalVisits: client.totalLifetimeVisits,
      currentProgressVisits: client.currentProgressVisits,
      rewardsRedeemed: client.rewardsRedeemed,
      milestoneReached
    };
  } catch (error: any) {
    console.error('Error getting loyalty status:', error);
    throw new Error(`Failed to get loyalty status: ${error.message}`);
  }
}

/**
 * Select a reward for a client to work towards
 */
export async function selectReward(clientId: string, rewardId: string): Promise<LoyaltyStatus> {
  try {
    await connectToDatabase();
    
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive) {
      throw new Error('Reward not found or inactive');
    }

    // Update client's selected reward
    client.selectedReward = rewardId;
    client.selectedRewardStartVisits = client.totalLifetimeVisits;
    client.loyaltyStatus = 'active';
    
    if (!client.loyaltyJoinDate) {
      client.loyaltyJoinDate = new Date();
    }

    await client.save();

    return await getLoyaltyStatus(clientId);
  } catch (error: any) {
    console.error('Error selecting reward:', error);
    throw new Error(`Failed to select reward: ${error.message}`);
  }
}

/**
 * Record a visit and update loyalty progress
 */
export async function recordVisitForLoyalty(clientId: string, visitId: string): Promise<LoyaltyStatus> {
  try {
    await connectToDatabase();
    
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Increment visit counters
    client.visitCount += 1;
    client.totalLifetimeVisits += 1;
    client.currentProgressVisits += 1;
    client.lastVisit = new Date();
    
    // Update loyalty status
    if (client.loyaltyStatus === 'new') {
      client.loyaltyStatus = 'active';
      if (!client.loyaltyJoinDate) {
        client.loyaltyJoinDate = new Date();
      }
    }

    await client.save();

    // Update the visit's visitNumber to match the new count
    await Visit.findByIdAndUpdate(visitId, {
      visitNumber: client.visitCount
    });

    return await getLoyaltyStatus(clientId);
  } catch (error: any) {
    console.error('Error recording visit for loyalty:', error);
    throw new Error(`Failed to record visit for loyalty: ${error.message}`);
  }
}

/**
 * Redeem a reward (barber-controlled)
 */
export async function redeemReward(
  clientId: string, 
  rewardId: string, 
  redeemedBy: string,
  visitId?: string
): Promise<{ success: boolean; loyaltyStatus: LoyaltyStatus; redemption: RewardRedemption }> {
  try {
    await connectToDatabase();
    
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const reward = await Reward.findById(rewardId).populate('applicableServices');
    if (!reward || !reward.isActive) {
      throw new Error('Reward not found or inactive');
    }

    // Check if client is eligible
    if (client.currentProgressVisits < reward.visitsRequired) {
      throw new Error(`Client needs ${reward.visitsRequired - client.currentProgressVisits} more visits to redeem this reward`);
    }

    // Check max redemptions limit
    if (reward.maxRedemptions) {
      const previousRedemptions = await getClientRewardHistory(clientId, rewardId);
      if (previousRedemptions.length >= reward.maxRedemptions) {
        throw new Error(`Client has already redeemed this reward the maximum number of times (${reward.maxRedemptions})`);
      }
    }

    // Create redemption record
    const redemption: RewardRedemption = {
      rewardId,
      clientId,
      visitId,
      redeemedAt: new Date(),
      redeemedBy,
      previousVisitCount: client.currentProgressVisits,
      ...(reward.rewardType === 'discount' && { discountApplied: reward.discountPercentage }),
      ...(reward.rewardType === 'free' && { servicesFree: reward.applicableServices.map((s: any) => s._id.toString()) })
    };

    // Store redemption in Visit model if visitId provided
    if (visitId) {
      await Visit.findByIdAndUpdate(visitId, {
        rewardRedeemed: {
          rewardId,
          rewardName: reward.name,
          rewardType: reward.rewardType,
          discountPercentage: reward.discountPercentage,
          redeemedAt: new Date(),
          redeemedBy
        }
      });
    }

    // Update client's loyalty status
    client.rewardsRedeemed += 1;
    client.rewardsEarned += 1;
    client.currentProgressVisits = 0; // Reset progress after redemption
    client.selectedReward = undefined; // Clear selected reward
    client.selectedRewardStartVisits = undefined;
    client.loyaltyStatus = 'active';

    await client.save();

    const updatedLoyaltyStatus = await getLoyaltyStatus(clientId);

    return {
      success: true,
      loyaltyStatus: updatedLoyaltyStatus,
      redemption
    };
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    throw new Error(`Failed to redeem reward: ${error.message}`);
  }
}

/**
 * Get client's reward redemption history
 */
export async function getClientRewardHistory(clientId: string, rewardId?: string): Promise<any[]> {
  try {
    await connectToDatabase();
    
    const filter: any = { 'rewardRedeemed.rewardId': { $exists: true } };
    
    // Get visits where rewards were redeemed
    const visits = await Visit.find({
      clientId,
      ...filter,
      ...(rewardId && { 'rewardRedeemed.rewardId': rewardId })
    })
    .populate('rewardRedeemed.rewardId')
    .sort({ visitDate: -1 });

    return visits.map(visit => ({
      visitId: visit._id,
      visitDate: visit.visitDate,
      rewardRedeemed: visit.rewardRedeemed,
      totalPrice: visit.totalPrice,
      services: visit.services
    }));
  } catch (error: any) {
    console.error('Error getting reward history:', error);
    throw new Error(`Failed to get reward history: ${error.message}`);
  }
}

/**
 * Get available rewards for client selection
 */
export async function getAvailableRewards(clientId: string): Promise<IReward[]> {
  try {
    await connectToDatabase();
    
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Get all active rewards
    const rewards = await Reward.find({ isActive: true })
      .populate('applicableServices')
      .sort({ visitsRequired: 1 });

    // Filter out rewards with max redemptions reached
    const availableRewards = [];
    
    for (const reward of rewards) {
      if (reward.maxRedemptions) {
        const redemptionHistory = await getClientRewardHistory(clientId, reward._id.toString());
        if (redemptionHistory.length < reward.maxRedemptions) {
          availableRewards.push(reward);
        }
      } else {
        availableRewards.push(reward);
      }
    }

    return availableRewards;
  } catch (error: any) {
    console.error('Error getting available rewards:', error);
    throw new Error(`Failed to get available rewards: ${error.message}`);
  }
}

/**
 * Get loyalty statistics for admin dashboard
 */
export async function getLoyaltyStatistics(): Promise<any> {
  try {
    await connectToDatabase();
    
    const totalClients = await Client.countDocuments({ accountActive: true });
    const loyaltyMembers = await Client.countDocuments({ loyaltyStatus: { $ne: 'new' } });
    const activeMembers = await Client.countDocuments({ loyaltyStatus: 'active' });
    const milestoneReached = await Client.countDocuments({ loyaltyStatus: 'milestone_reached' });
    
    // Total rewards redeemed
    const totalRedemptions = await Visit.countDocuments({ 'rewardRedeemed.rewardId': { $exists: true } });
    
    // Average visits per member
    const avgVisits = await Client.aggregate([
      { $match: { loyaltyStatus: { $ne: 'new' } } },
      { $group: { _id: null, avgVisits: { $avg: '$totalLifetimeVisits' } } }
    ]);

    // Most popular rewards
    const popularRewards = await Visit.aggregate([
      { $match: { 'rewardRedeemed.rewardId': { $exists: true } } },
      { $group: { _id: '$rewardRedeemed.rewardId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'rewards', localField: '_id', foreignField: '_id', as: 'reward' } },
      { $unwind: '$reward' }
    ]);

    return {
      totalClients,
      loyaltyMembers,
      activeMembers,
      milestoneReached,
      totalRedemptions,
      averageVisits: avgVisits[0]?.avgVisits || 0,
      popularRewards,
      loyaltyParticipationRate: totalClients > 0 ? (loyaltyMembers / totalClients * 100).toFixed(1) : 0
    };
  } catch (error: any) {
    console.error('Error getting loyalty statistics:', error);
    throw new Error(`Failed to get loyalty statistics: ${error.message}`);
  }
}

/**
 * Reset client's loyalty progress (admin function)
 */
export async function resetClientLoyalty(clientId: string): Promise<LoyaltyStatus> {
  try {
    await connectToDatabase();
    
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Reset loyalty fields but keep history
    client.currentProgressVisits = 0;
    client.selectedReward = undefined;
    client.selectedRewardStartVisits = undefined;
    client.loyaltyStatus = 'active';

    await client.save();

    return await getLoyaltyStatus(clientId);
  } catch (error: any) {
    console.error('Error resetting client loyalty:', error);
    throw new Error(`Failed to reset client loyalty: ${error.message}`);
  }
} 