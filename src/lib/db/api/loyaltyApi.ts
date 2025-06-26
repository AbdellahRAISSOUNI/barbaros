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
      .sort({ visitsRequired: 1 })
      .exec();

    // Check if selected reward has expired
    if (client.selectedReward && client.selectedRewardStartVisits !== undefined) {
      const currentSelectedReward = await Reward.findById(client.selectedReward).lean() as IReward | null;
      if (currentSelectedReward?.validForDays) {
        const startDate = new Date(client.loyaltyJoinDate || client.dateCreated);
        const expirationDate = new Date(startDate);
        expirationDate.setDate(expirationDate.getDate() + currentSelectedReward.validForDays);
        
        if (new Date() > expirationDate) {
          // Reset selected reward if expired
          client.selectedReward = undefined;
          client.selectedRewardStartVisits = undefined;
          client.loyaltyStatus = 'active';
          await client.save();
        }
      }
    }

    // Find eligible rewards (client has enough visits and hasn't exceeded max redemptions)
    const eligibleRewards: IReward[] = [];
    for (const reward of allActiveRewards) {
      const rewardDoc = reward as unknown as IReward;
      
      // CRITICAL FIX: Client must have BOTH enough total visits AND current progress visits
      const hasEnoughTotalVisits = client.totalLifetimeVisits >= rewardDoc.visitsRequired;
      const hasEnoughProgressVisits = client.currentProgressVisits >= rewardDoc.visitsRequired;
      
      // Only show as eligible if client truly has enough visits
      if (hasEnoughTotalVisits && hasEnoughProgressVisits && client.totalLifetimeVisits > 0) {
        // Check max redemptions if applicable
        if (rewardDoc.maxRedemptions) {
          const previousRedemptions = await getClientRewardHistory(clientId, rewardDoc._id.toString());
          if (previousRedemptions.length < rewardDoc.maxRedemptions) {
            eligibleRewards.push(rewardDoc);
          }
        } else {
          eligibleRewards.push(rewardDoc);
        }
      }
    }

    // Calculate progress for selected reward
    let visitsToNextReward = 0;
    let progressPercentage = 0;
    let canRedeem = false;
    let milestoneReached = false;

    if (client.selectedReward) {
      const selectedReward = await Reward.findById(client.selectedReward).lean() as IReward | null;
      if (!selectedReward) {
        throw new Error('Selected reward not found');
      }
      
      // CRITICAL FIX: Check if client has earned enough new visits since selecting the reward
      const visitsEarnedSinceSelection = client.currentProgressVisits - (client.selectedRewardStartVisits || 0);
      const hasEarnedEnoughVisits = visitsEarnedSinceSelection >= selectedReward.visitsRequired;
      
      // ADDITIONAL VALIDATION: Ensure client has minimum total visits and current progress
      const hasMinimumTotalVisits = client.totalLifetimeVisits >= selectedReward.visitsRequired;
      const hasMinimumCurrentProgress = client.currentProgressVisits >= selectedReward.visitsRequired;
      const hasNonZeroVisits = client.totalLifetimeVisits > 0 && client.currentProgressVisits > 0;
      
      // FIXED CALCULATION: Use current progress visits directly since they reset after each reward redemption
      const actualVisitsForReward = client.currentProgressVisits;
      const visitsNeeded = Math.max(0, selectedReward.visitsRequired - actualVisitsForReward);
      
      visitsToNextReward = visitsNeeded;
      progressPercentage = Math.min(100, (actualVisitsForReward / selectedReward.visitsRequired) * 100);
      
      // Check if reward has expired
      let isExpired = false;
      if (selectedReward.validForDays) {
        const startDate = new Date(client.loyaltyJoinDate || client.dateCreated);
        const expirationDate = new Date(startDate);
        expirationDate.setDate(expirationDate.getDate() + selectedReward.validForDays);
        isExpired = new Date() > expirationDate;
      }
      
      // Check max redemptions
      let hasReachedMaxRedemptions = false;
      if (selectedReward.maxRedemptions) {
        const previousRedemptions = await getClientRewardHistory(clientId, selectedReward._id.toString());
        hasReachedMaxRedemptions = previousRedemptions.length >= selectedReward.maxRedemptions;
      }
      
      // SIMPLIFIED VALIDATION: Focus on actual progress visits
      canRedeem = actualVisitsForReward >= selectedReward.visitsRequired && 
                  hasNonZeroVisits && 
                  !isExpired && 
                  !hasReachedMaxRedemptions;
      
      milestoneReached = canRedeem;
      
      // Update loyalty status
      if (canRedeem && client.loyaltyStatus !== 'milestone_reached') {
        client.loyaltyStatus = 'milestone_reached';
        await client.save();
      } else if (!canRedeem && client.loyaltyStatus === 'milestone_reached') {
        // Reset status if no longer eligible
        client.loyaltyStatus = 'active';
        await client.save();
      }
    } else if (eligibleRewards.length > 0) {
      // If no reward selected but has eligible rewards
      milestoneReached = true;
    }

    const currentSelectedReward = client.selectedReward ? 
      await Reward.findById(client.selectedReward).lean() as IReward | null : 
      undefined;

    return {
      client,
      selectedReward: currentSelectedReward || undefined,
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

    // Update client's selected reward - Reset progress when selecting new reward
    client.selectedReward = reward._id;
    client.selectedRewardStartVisits = client.currentProgressVisits; // Track where they started
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

    // Check if client has selected this reward
    if (!client.selectedReward || client.selectedReward.toString() !== rewardId) {
      throw new Error('Client must select this reward before redeeming it');
    }

    // CRITICAL VALIDATION: Multiple checks to prevent abuse
    if (client.totalLifetimeVisits === 0 || client.currentProgressVisits === 0) {
      throw new Error('Client must have at least 1 visit to redeem any reward');
    }

    // Check if client has earned enough new visits since selecting the reward
    const visitsEarnedSinceSelection = client.currentProgressVisits - (client.selectedRewardStartVisits || 0);
    if (visitsEarnedSinceSelection < reward.visitsRequired) {
      throw new Error(`Client needs ${reward.visitsRequired - visitsEarnedSinceSelection} more visits since selecting this reward`);
    }

    // Ensure client has enough total visits
    if (client.totalLifetimeVisits < reward.visitsRequired) {
      throw new Error(`Client needs ${reward.visitsRequired - client.totalLifetimeVisits} more total visits to redeem this reward`);
    }

    // Ensure client has enough current progress visits
    if (client.currentProgressVisits < reward.visitsRequired) {
      throw new Error(`Client needs ${reward.visitsRequired - client.currentProgressVisits} more progress visits to redeem this reward`);
    }

    // Check if reward has expired
    if (reward.validForDays) {
      const startDate = new Date(client.loyaltyJoinDate || client.dateCreated);
      const expirationDate = new Date(startDate);
      expirationDate.setDate(expirationDate.getDate() + reward.validForDays);
      
      if (new Date() > expirationDate) {
        throw new Error('This reward has expired. Please select a new reward.');
      }
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
      .sort({ visitsRequired: 1 })
      .lean() as IReward[];

    // Filter out rewards with max redemptions reached
    const availableRewards: IReward[] = [];
    
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