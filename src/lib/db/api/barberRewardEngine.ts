import connectToDatabase from '../mongodb';
import { BarberReward, BarberRewardRedemption, Admin, BarberStats } from '../models';
import { IBarberReward, IBarberRewardRedemption } from '../models';
import mongoose from 'mongoose';

export interface BarberRewardProgress {
  rewardId: string;
  name: string;
  description: string;
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';
  rewardValue: string;
  requirementType: 'visits' | 'clients' | 'months_worked' | 'client_retention' | 'custom';
  requirementValue: number;
  requirementDescription: string;
  category: string;
  icon: string;
  color: string;
  priority: number;
  currentValue: number;
  isEligible: boolean;
  isEarned: boolean;
  isRedeemed: boolean;
  earnedAt?: Date;
  redeemedAt?: Date;
  progressPercentage: number;
  redemptionId?: string;
  durationProgress?: {
    totalDays: number;
    months: number;
    remainingDays: number;
    displayText: string;
  };
}

// Helper function for enhanced duration calculation
function calculateDurationProgress(joinDate: Date, requirementMonths: number) {
  const now = new Date();
  const join = new Date(joinDate);
  now.setHours(0, 0, 0, 0);
  join.setHours(0, 0, 0, 0);

  // Calculate total days worked
  const totalDaysWorked = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate required days (using exact days per month)
  const requiredDays = Math.floor(requirementMonths * 30.44); // Average days per month for more accuracy

  let months = 0;
  let tempDate = new Date(join);
  while (tempDate < now) {
    tempDate.setMonth(tempDate.getMonth() + 1);
    if (tempDate <= now) {
      months++;
    }
  }

  tempDate = new Date(join);
  tempDate.setMonth(tempDate.getMonth() + months);
  const remainingDays = Math.floor((now.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Create display text with years if applicable
  let displayText = '';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0) {
    displayText = `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      displayText += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    if (remainingDays > 0) {
      displayText += `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  } else if (months > 0) {
    displayText = `${months} month${months > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      displayText += `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  } else {
    displayText = `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  }
  
  // Calculate percentage based on days
  const progressPercentage = Math.min((totalDaysWorked / requiredDays) * 100, 100);
  
  return {
    totalDays: totalDaysWorked,
    months: months,
    remainingDays: remainingDays,
    displayText,
    requiredDays,
    progressPercentage: Math.round(progressPercentage)
  };
}

/**
 * Calculate barber's current progress against a specific requirement type
 */
async function calculateBarberProgress(barberId: string, requirementType: string): Promise<number> {
  const barber = await Admin.findById(barberId);
  const barberStats = await BarberStats.findOne({ barberId });
  
  if (!barber || !barberStats) return 0;

  switch (requirementType) {
    case 'visits':
      return barberStats.totalVisits || 0;
    
    case 'clients':
      return barberStats.uniqueClientsServed?.length || 0;
    
    case 'months_worked':
      const joinDate = new Date(barber.joinDate);
      const now = new Date();
      
      const yearsDiff = now.getFullYear() - joinDate.getFullYear();
      const monthsDiff = now.getMonth() - joinDate.getMonth();
      const daysDiff = now.getDate() - joinDate.getDate();
      
      let totalMonthsWorked = yearsDiff * 12 + monthsDiff;
      if (daysDiff < 0) {
        totalMonthsWorked -= 1;
      }
      
      return Math.max(0, totalMonthsWorked);
    
    case 'client_retention':
      return Math.round(barberStats.clientRetentionRate || 0);
    
    case 'custom':
      return 0;
    
    default:
      return 0;
  }
}

/**
 * Check and update barber reward progress for a specific barber
 */
export async function updateBarberRewardProgress(barberId: string): Promise<void> {
  await connectToDatabase();
  
  const rewards = await BarberReward.find({ isActive: true }).sort({ priority: 1 });
  const existingRedemptions = await BarberRewardRedemption.find({ barberId });
  const redemptionMap = new Map<string, IBarberRewardRedemption>(
    existingRedemptions.map((r: IBarberRewardRedemption) => [r.rewardId.toString(), r])
  );
  
  for (const reward of rewards) {
    try {
      let currentValue = await calculateBarberProgress(barberId, reward.requirementType);
      let isEligible = currentValue >= reward.requirementValue;
      
      // Special handling for months_worked to ensure accurate calculation
      if (reward.requirementType === 'months_worked') {
        const barber = await Admin.findById(barberId);
        if (barber) {
          const durationData = calculateDurationProgress(barber.joinDate, reward.requirementValue);
          currentValue = durationData.months;
          isEligible = durationData.months >= reward.requirementValue;
        }
      }
      const existingRedemption = redemptionMap.get(reward._id.toString());
      
      if (existingRedemption) {
        continue;
      }
      
      if (isEligible && !existingRedemption) {
        const barberStats = await BarberStats.findOne({ barberId });
        const barber = await Admin.findById(barberId);
        
        const progressAtEarning = {
          totalVisits: barberStats?.totalVisits || 0,
          uniqueClients: barberStats?.uniqueClientsServed?.length || 0,
          monthsWorked: barber ? calculateMonthsWorked(barber.joinDate) : 0,
          clientRetentionRate: barberStats?.clientRetentionRate || 0
        };

        await BarberRewardRedemption.create({
          barberId,
          rewardId: reward._id,
          status: 'earned',
          earnedAt: new Date(),
          progressAtEarning
        });
      }
    } catch (error) {
      console.error(`Error updating reward ${reward._id} for barber ${barberId}:`, error);
    }
  }
}

/**
 * Get barber reward progress and status
 */
export async function getBarberRewardProgress(barberId: string): Promise<BarberRewardProgress[]> {
  await connectToDatabase();
  
  const rewards = await BarberReward.find({ isActive: true }).sort({ priority: 1, category: 1 });
  const redemptions = await BarberRewardRedemption.find({ barberId });
  
  const redemptionMap = new Map<string, IBarberRewardRedemption>(
    redemptions.map((r: IBarberRewardRedemption) => [r.rewardId.toString(), r])
  );
  
  const progressList: BarberRewardProgress[] = [];
  
  for (const reward of rewards) {
    let currentValue = await calculateBarberProgress(barberId, reward.requirementType);
    const redemption = redemptionMap.get(reward._id.toString());
    
    let progressPercentage = Math.min(Math.round((currentValue / reward.requirementValue) * 100), 100);
    let isEligible = currentValue >= reward.requirementValue;
    
          // Enhanced duration tracking for months_worked requirements
      let durationProgress;
      if (reward.requirementType === 'months_worked') {
        const barber = await Admin.findById(barberId);
        if (barber) {
          const durationData = calculateDurationProgress(barber.joinDate, reward.requirementValue);
          durationProgress = {
            totalDays: durationData.totalDays,
            months: durationData.months,
            remainingDays: durationData.remainingDays,
            displayText: durationData.displayText
          };
          
          // Override the progress percentage and eligibility to use the duration calculation
          progressPercentage = durationData.progressPercentage;
          currentValue = durationData.months;
          isEligible = durationData.months >= reward.requirementValue;
        }
      }
    
    progressList.push({
      rewardId: reward._id.toString(),
      name: reward.name,
      description: reward.description,
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue,
      requirementType: reward.requirementType,
      requirementValue: reward.requirementValue,
      requirementDescription: reward.requirementDescription,
      category: reward.category,
      icon: reward.icon,
      color: reward.color,
      priority: reward.priority,
      currentValue,
      isEligible: isEligible,
      isEarned: !!redemption,
      isRedeemed: (redemption as IBarberRewardRedemption)?.status === 'redeemed',
      earnedAt: (redemption as IBarberRewardRedemption)?.earnedAt,
      redeemedAt: (redemption as IBarberRewardRedemption)?.redeemedAt,
      progressPercentage,
      redemptionId: (redemption as IBarberRewardRedemption)?._id?.toString(),
      durationProgress
    });
  }
  
  return progressList;
}

/**
 * Mark a reward as redeemed by admin
 */
export async function markRewardAsRedeemed(
  redemptionId: string, 
  adminId: string, 
  notes?: string
): Promise<boolean> {
  await connectToDatabase();
  
  try {
    const result = await BarberRewardRedemption.findByIdAndUpdate(
      redemptionId,
      {
        status: 'redeemed',
        redeemedAt: new Date(),
        redeemedBy: adminId,
        notes: notes || ''
      },
      { new: true }
    );
    
    return !!result;
  } catch (error) {
    console.error('Error marking reward as redeemed:', error);
    return false;
  }
}

/**
 * Get barber leaderboard based on various metrics
 */
export async function getBarberLeaderboard(): Promise<any[]> {
  await connectToDatabase();
  
  const leaderboard = await BarberStats.aggregate([
    {
      $lookup: {
        from: 'admins',
        localField: 'barberId',
        foreignField: '_id',
        as: 'barber'
      }
    },
    {
      $unwind: '$barber'
    },
    {
      $match: { 
        'barber.role': 'barber', 
        'barber.active': true 
      }
    },
    {
      $lookup: {
        from: 'barberrewardredemptions',
        localField: 'barberId',
        foreignField: 'barberId',
        as: 'rewards'
      }
    },
    {
      $addFields: {
        earnedRewards: { 
          $size: { 
            $filter: { 
              input: '$rewards', 
              cond: { $eq: ['$$this.status', 'earned'] } 
            } 
          } 
        },
        redeemedRewards: { 
          $size: { 
            $filter: { 
              input: '$rewards', 
              cond: { $eq: ['$$this.status', 'redeemed'] } 
            } 
          } 
        },
        monthsWorked: {
          $round: [
            {
              $divide: [
                { $subtract: [new Date(), '$barber.joinDate'] },
                1000 * 60 * 60 * 24 * 30
              ]
            },
            1
          ]
        }
      }
    },
    {
      $addFields: {
        leaderboardScore: {
          $add: [
            { $multiply: ['$totalVisits', 1] },
            { $multiply: [{ $size: { $ifNull: ['$uniqueClientsServed', []] } }, 2] },
            { $multiply: ['$monthsWorked', 10] },
            { $multiply: ['$clientRetentionRate', 0.5] },
            { $multiply: ['$earnedRewards', 50] }
          ]
        }
      }
    },
    {
      $sort: { 
        leaderboardScore: -1, 
        totalVisits: -1, 
        monthsWorked: -1 
      }
    },
    {
      $project: {
        _id: '$barber._id',
        name: '$barber.name',
        profilePicture: '$barber.profilePicture',
        joinDate: '$barber.joinDate',
        monthsWorked: 1,
        totalVisits: 1,
        uniqueClients: { $size: { $ifNull: ['$uniqueClientsServed', []] } },
        clientRetentionRate: { $round: ['$clientRetentionRate', 1] },
        earnedRewards: 1,
        redeemedRewards: 1,
        leaderboardScore: { $round: ['$leaderboardScore', 0] },
        averageVisitsPerDay: { $round: ['$averageVisitsPerDay', 1] }
      }
    }
  ]);
  
  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    efficiency: entry.averageVisitsPerDay,
    badges: getBadgesForBarber(entry)
  }));
}

function getBadgesForBarber(barber: any): string[] {
  const badges: string[] = [];
  
  if (barber.monthsWorked >= 12) badges.push('👑');
  else if (barber.monthsWorked >= 6) badges.push('🏆');
  else if (barber.monthsWorked >= 3) badges.push('🥇');
  
  if (barber.totalVisits >= 1000) badges.push('💎');
  else if (barber.totalVisits >= 500) badges.push('🥇');
  else if (barber.totalVisits >= 100) badges.push('🥈');
  
  if (barber.uniqueClients >= 200) badges.push('🌟');
  else if (barber.uniqueClients >= 100) badges.push('🤝');
  
  if (barber.clientRetentionRate >= 80) badges.push('⭐');
  if (barber.earnedRewards >= 5) badges.push('🎖️');
  
  return badges.slice(0, 4);
}

function calculateMonthsWorked(joinDate: Date): number {
  const now = new Date();
  const join = new Date(joinDate);
  return (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
}

export async function getBarberRewardStatistics(): Promise<any> {
  await connectToDatabase();
  
  const [totalRewards, totalRedemptions, pendingRedemptions, activeBarbers] = await Promise.all([
    BarberReward.countDocuments({ isActive: true }),
    BarberRewardRedemption.countDocuments(),
    BarberRewardRedemption.countDocuments({ status: 'earned' }),
    Admin.countDocuments({ role: 'barber', active: true })
  ]);
  
  const rewardsByCategory = await BarberReward.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const redemptionsByType = await BarberRewardRedemption.aggregate([
    {
      $lookup: {
        from: 'barberrewards',
        localField: 'rewardId',
        foreignField: '_id',
        as: 'reward'
      }
    },
    { $unwind: '$reward' },
    { $group: { _id: '$reward.rewardType', count: { $sum: 1 } } }
  ]);
  
  return {
    totalRewards,
    totalRedemptions,
    pendingRedemptions,
    activeBarbers,
    redemptionRate: activeBarbers > 0 ? Math.round((totalRedemptions / activeBarbers) * 100) / 100 : 0,
    categories: rewardsByCategory,
    redemptionsByType
  };
} 