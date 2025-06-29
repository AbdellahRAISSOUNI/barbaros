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
    
    // Use lean query for better performance
    const client = await Client.findById(clientId)
      .populate('selectedReward')
      .lean();
      
    if (!client) {
      throw new Error('Client not found');
    }

    // Get all active rewards with lean query
    const allActiveRewards = await Reward.find({ isActive: true })
      .populate('applicableServices')
      .lean()
      .exec();

    // Check if selected reward has expired
    if (client.selectedReward && client.selectedRewardStartVisits !== undefined) {
      const currentSelectedReward = client.selectedReward as unknown as IReward;
      if (currentSelectedReward?.validForDays) {
        const startDate = new Date(client.loyaltyJoinDate || client.dateCreated);
        const expirationDate = new Date(startDate);
        expirationDate.setDate(expirationDate.getDate() + currentSelectedReward.validForDays);
        
        if (new Date() > expirationDate) {
          // Reset selected reward if expired
          await Client.findByIdAndUpdate(clientId, {
            $unset: { selectedReward: 1, selectedRewardStartVisits: 1 },
            loyaltyStatus: 'active'
          });
          client.selectedReward = undefined;
          client.selectedRewardStartVisits = undefined;
          client.loyaltyStatus = 'active';
        }
      }
    }

    // Find eligible rewards (client has enough visits and hasn't exceeded max redemptions)
    const eligibleRewards: IReward[] = [];
    const rewardRedemptionCounts = new Map<string, number>();

    // Batch fetch redemption counts for all rewards
    if (allActiveRewards.length > 0) {
      const redemptionHistory = await getClientRewardHistory(clientId);
      for (const redemption of redemptionHistory) {
        const count = rewardRedemptionCounts.get(redemption.rewardId) || 0;
        rewardRedemptionCounts.set(redemption.rewardId, count + 1);
      }
    }

    for (const reward of allActiveRewards) {
      const rewardDoc = reward as IReward;
      
      const hasEnoughTotalVisits = client.totalLifetimeVisits >= rewardDoc.visitsRequired;
      const hasEnoughProgressVisits = client.currentProgressVisits >= rewardDoc.visitsRequired;
      
      if (hasEnoughTotalVisits && hasEnoughProgressVisits && client.totalLifetimeVisits > 0) {
        if (rewardDoc.maxRedemptions) {
          const previousRedemptions = rewardRedemptionCounts.get(rewardDoc._id.toString()) || 0;
          if (previousRedemptions < rewardDoc.maxRedemptions) {
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
      const selectedReward = client.selectedReward as unknown as IReward;
      
      const actualVisitsForReward = client.currentProgressVisits;
      const visitsNeeded = Math.max(0, selectedReward.visitsRequired - actualVisitsForReward);
      
      visitsToNextReward = visitsNeeded;
      progressPercentage = Math.min(100, (actualVisitsForReward / selectedReward.visitsRequired) * 100);
      
      let isExpired = false;
      if (selectedReward.validForDays) {
        const startDate = new Date(client.loyaltyJoinDate || client.dateCreated);
        const expirationDate = new Date(startDate);
        expirationDate.setDate(expirationDate.getDate() + selectedReward.validForDays);
        isExpired = new Date() > expirationDate;
      }
      
      let hasReachedMaxRedemptions = false;
      if (selectedReward.maxRedemptions) {
        const previousRedemptions = rewardRedemptionCounts.get(selectedReward._id.toString()) || 0;
        hasReachedMaxRedemptions = previousRedemptions >= selectedReward.maxRedemptions;
      }
      
      const hasNonZeroVisits = client.totalLifetimeVisits > 0 && client.currentProgressVisits > 0;
      canRedeem = actualVisitsForReward >= selectedReward.visitsRequired && 
                  hasNonZeroVisits && 
                  !isExpired && 
                  !hasReachedMaxRedemptions;
      
      milestoneReached = canRedeem;
      
      // Update loyalty status if needed
      if ((canRedeem && client.loyaltyStatus !== 'milestone_reached') ||
          (!canRedeem && client.loyaltyStatus === 'milestone_reached')) {
        await Client.findByIdAndUpdate(clientId, {
          loyaltyStatus: canRedeem ? 'milestone_reached' : 'active'
        });
        client.loyaltyStatus = canRedeem ? 'milestone_reached' : 'active';
      }
    } else if (eligibleRewards.length > 0) {
      milestoneReached = true;
    }

    return {
      client,
      selectedReward: client.selectedReward as unknown as IReward | undefined,
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
  visitId?: string,
  createSpecialVisit: boolean = false
): Promise<{ success: boolean; loyaltyStatus: LoyaltyStatus; redemption: RewardRedemption; visitId?: string }> {
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

    // DEBUG: Log the actual data to understand the issue
    console.log('=== LOYALTY REDEMPTION DEBUG ===');
    console.log('Client ID:', clientId);
    console.log('Reward ID:', rewardId);
    console.log('Client currentProgressVisits:', client.currentProgressVisits);
    console.log('Client totalLifetimeVisits:', client.totalLifetimeVisits);
    console.log('Reward visitsRequired:', reward.visitsRequired);
    console.log('Client selectedReward:', client.selectedReward);
    console.log('Client selectedRewardStartVisits:', client.selectedRewardStartVisits);
    console.log('Validation check: currentProgressVisits >= visitsRequired:', client.currentProgressVisits >= reward.visitsRequired);
    console.log('==================================');

    // SIMPLIFIED VALIDATION LOGIC - Complete fix for the bug
    // Allow redemption of ANY reward the client is eligible for, regardless of selection
    
    // Primary validation: Check if client has enough current progress visits
    if (client.currentProgressVisits < reward.visitsRequired) {
      console.log('❌ Validation failed: Insufficient progress visits');
      console.log('   Client has:', client.currentProgressVisits, 'visits');
      console.log('   Reward needs:', reward.visitsRequired, 'visits');
      console.log('   Missing:', reward.visitsRequired - client.currentProgressVisits, 'visits');
      throw new Error(`Client needs ${reward.visitsRequired - client.currentProgressVisits} more visits to redeem this reward. Current progress: ${client.currentProgressVisits}/${reward.visitsRequired}`);
    }

    // Ensure client has enough total visits (backup validation)
    if (client.totalLifetimeVisits < reward.visitsRequired) {
      console.log('❌ Validation failed: Insufficient total visits');
      throw new Error(`Client needs ${reward.visitsRequired - client.totalLifetimeVisits} more total visits to redeem this reward`);
    }

    // Basic sanity check
    if (client.totalLifetimeVisits === 0 || client.currentProgressVisits === 0) {
      console.log('❌ Validation failed: No visits recorded');
      throw new Error('Client must have at least 1 visit to redeem any reward');
    }

    console.log('✅ All validations passed!');
    console.log('   Client has sufficient visits for this reward');
    console.log('   Proceeding with redemption...');

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

    let actualVisitId = visitId;

    // Create special visit for reward redemption if requested
    if (createSpecialVisit && !visitId) {
      const specialVisitData = {
        clientId,
        visitDate: new Date(),
        services: reward.applicableServices.map((service: any) => ({
          serviceId: service._id,
          name: service.name,
          price: reward.rewardType === 'free' ? 0 : service.price * (100 - (reward.discountPercentage || 0)) / 100,
          duration: service.duration || 30
        })),
        totalPrice: reward.rewardType === 'free' ? 0 : reward.applicableServices.reduce((total: number, service: any) => {
          return total + (service.price * (100 - (reward.discountPercentage || 0)) / 100);
        }, 0),
        barber: redeemedBy,
        visitNumber: client.visitCount + 1,
        notes: `🎁 REWARD REDEMPTION: ${reward.name} - ${reward.rewardType === 'free' ? 'Free Service' : `${reward.discountPercentage}% Discount Applied`}`,
        isRewardRedemption: true // Special flag to identify reward visits
      };

      // Create the special visit
      const specialVisit = new Visit(specialVisitData);
      await specialVisit.save();
      actualVisitId = specialVisit._id.toString();

      // Update client visit counters for the special visit
      client.visitCount += 1;
      client.totalLifetimeVisits += 1;
      // Note: We don't increment currentProgressVisits here since this visit is the redemption itself
      client.lastVisit = new Date();
    }

    // Create redemption record
    const redemption: RewardRedemption = {
      rewardId,
      clientId,
      visitId: actualVisitId,
      redeemedAt: new Date(),
      redeemedBy,
      previousVisitCount: client.currentProgressVisits,
      ...(reward.rewardType === 'discount' && { discountApplied: reward.discountPercentage }),
      ...(reward.rewardType === 'free' && { servicesFree: reward.applicableServices.map((s: any) => s._id.toString()) })
    };

    // Store redemption in Visit model
    if (actualVisitId) {
      await Visit.findByIdAndUpdate(actualVisitId, {
        $set: {
          rewardRedeemed: true,
          redeemedRewardId: rewardId,
          rewardRedemption: {
            rewardId,
            rewardName: reward.name,
            rewardType: reward.rewardType,
            discountPercentage: reward.discountPercentage,
            redeemedAt: new Date(),
            redeemedBy
          }
        }
      });
    }

    // Update client's loyalty status - FIXED LOGIC
    client.rewardsRedeemed += 1;
    client.rewardsEarned += 1;
    
    // Reset progress and clear selected reward
    const remainingProgress = Math.max(0, client.currentProgressVisits - reward.visitsRequired);
    console.log('DEBUG: remainingProgress calculation:', client.currentProgressVisits, '-', reward.visitsRequired, '=', remainingProgress);
    client.currentProgressVisits = remainingProgress; // Carry over excess visits
    client.selectedReward = undefined; // Clear selected reward
    client.selectedRewardStartVisits = undefined;
    client.loyaltyStatus = remainingProgress > 0 ? 'active' : 'active';

    await client.save();

    const updatedLoyaltyStatus = await getLoyaltyStatus(clientId);

    return {
      success: true,
      loyaltyStatus: updatedLoyaltyStatus,
      redemption,
      ...(actualVisitId && { visitId: actualVisitId })
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
    
    // Get visits where rewards were redeemed (supporting both old and new structures)
    const filter: any = {
      $or: [
        { 'rewardRedeemed': true },
        { 'rewardRedemption.rewardId': { $exists: true } },
        { 'redeemedRewardId': { $exists: true } }
      ]
    };
    
    const visits = await Visit.find({
      clientId,
      ...filter,
      ...(rewardId && { 
        $or: [
          { 'redeemedRewardId': rewardId },
          { 'rewardRedemption.rewardId': rewardId }
        ]
      })
    })
    .sort({ visitDate: -1 });

    return visits.map(visit => ({
      visitId: visit._id,
      visitDate: visit.visitDate,
      rewardRedeemed: visit.rewardRedemption || visit.rewardRedeemed,
      totalPrice: visit.totalPrice,
      services: visit.services,
      rewardId: visit.redeemedRewardId || visit.rewardRedemption?.rewardId
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
    
    // Total rewards redeemed (supporting both old and new structures)
    const totalRedemptions = await Visit.countDocuments({
      $or: [
        { 'rewardRedeemed': true },
        { 'rewardRedemption.rewardId': { $exists: true } },
        { 'redeemedRewardId': { $exists: true } }
      ]
    });
    
    // Average visits per member
    const avgVisits = await Client.aggregate([
      { $match: { loyaltyStatus: { $ne: 'new' } } },
      { $group: { _id: null, avgVisits: { $avg: '$totalLifetimeVisits' } } }
    ]);

    // Most popular rewards (supporting both old and new structures)
    const popularRewards = await Visit.aggregate([
      { 
        $match: { 
          $or: [
            { 'rewardRedeemed': true },
            { 'rewardRedemption.rewardId': { $exists: true } },
            { 'redeemedRewardId': { $exists: true } }
          ]
        } 
      },
      {
        $addFields: {
          rewardId: {
            $ifNull: ['$redeemedRewardId', '$rewardRedemption.rewardId']
          }
        }
      },
      { $match: { rewardId: { $exists: true } } },
      { $group: { _id: '$rewardId', count: { $sum: 1 } } },
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