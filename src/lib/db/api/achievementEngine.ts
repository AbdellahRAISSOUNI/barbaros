import connectToDatabase from '../mongodb';
import { Achievement, BarberAchievement, Admin, BarberStats, Visit } from '../models';
import mongoose from 'mongoose';

export interface AchievementProgress {
  achievementId: string;
  title: string;
  description: string;
  category: string;
  tier: string;
  badge: string;
  color: string;
  points: number;
  progress: number;
  requirement: number;
  isCompleted: boolean;
  completedAt?: Date;
  progressPercentage: number;
  reward?: {
    type: string;
    value: string;
    description: string;
  };
}

/**
 * Calculate tenure-based achievements
 */
async function calculateTenureProgress(barberId: string, achievement: any): Promise<number> {
  const barber = await Admin.findById(barberId);
  if (!barber || !barber.joinDate) return 0;

  const now = new Date();
  const joinDate = new Date(barber.joinDate);
  const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (achievement.requirementType) {
    case 'days':
      return Math.min(daysDiff, achievement.requirement);
    case 'milestone':
      // For milestone achievements like "6 months", "1 year", etc.
      const monthsDiff = Math.floor(daysDiff / 30);
      return monthsDiff >= achievement.requirement ? achievement.requirement : monthsDiff;
    default:
      return daysDiff;
  }
}

/**
 * Calculate visit-based achievements
 */
async function calculateVisitProgress(barberId: string, achievement: any): Promise<number> {
  const barberStats = await BarberStats.findOne({ barberId });
  if (!barberStats) return 0;

  const timeframe = achievement.requirementDetails?.timeframe || 'all-time';
  
  switch (timeframe) {
    case 'monthly':
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthStats = barberStats.monthlyStats.find((m: any) => m.month === currentMonth);
      return monthStats?.visitsCount || 0;
    
    case 'weekly':
      // Calculate this week's visits
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekVisits = await Visit.countDocuments({
        barberId: new mongoose.Types.ObjectId(barberId),
        visitDate: { $gte: weekStart }
      });
      return weekVisits;
    
    case 'daily':
      // Calculate today's visits
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayVisits = await Visit.countDocuments({
        barberId: new mongoose.Types.ObjectId(barberId),
        visitDate: { $gte: today, $lt: tomorrow }
      });
      return todayVisits;
    
    default: // all-time
      return barberStats.totalVisits;
  }
}

/**
 * Calculate client-based achievements
 */
async function calculateClientProgress(barberId: string, achievement: any): Promise<number> {
  const barberStats = await BarberStats.findOne({ barberId });
  if (!barberStats) return 0;

  const timeframe = achievement.requirementDetails?.timeframe || 'all-time';
  
  switch (timeframe) {
    case 'monthly':
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthStats = barberStats.monthlyStats.find((m: any) => m.month === currentMonth);
      return monthStats?.uniqueClients || 0;
    
    default: // all-time
      return barberStats.uniqueClientsServed.length;
  }
}

/**
 * Calculate consistency-based achievements (streaks, etc.)
 */
async function calculateConsistencyProgress(barberId: string, achievement: any): Promise<{ progress: number; streak: number }> {
  if (achievement.subcategory === 'daily_visits') {
    // Calculate consecutive days with at least X visits
    const minVisits = achievement.requirementDetails?.minimumValue || 1;
    const daysToCheck = 30; // Check last 30 days
    
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayVisits = await Visit.countDocuments({
        barberId: new mongoose.Types.ObjectId(barberId),
        visitDate: { $gte: checkDate, $lt: nextDay }
      });
      
      if (dayVisits >= minVisits) {
        currentStreak = i === 0 ? currentStreak + 1 : currentStreak;
        maxStreak = Math.max(maxStreak, currentStreak + 1);
      } else {
        if (i === 0) currentStreak = 0;
        break;
      }
    }
    
    return { progress: maxStreak, streak: currentStreak };
  }
  
  if (achievement.subcategory === 'weekly_consistency') {
    // Calculate weeks with consistent performance
    const weeksToCheck = 12; // Check last 12 weeks
    const minVisitsPerWeek = achievement.requirementDetails?.minimumValue || 5;
    
    let consistentWeeks = 0;
    
    for (let i = 0; i < weeksToCheck; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekVisits = await Visit.countDocuments({
        barberId: new mongoose.Types.ObjectId(barberId),
        visitDate: { $gte: weekStart, $lt: weekEnd }
      });
      
      if (weekVisits >= minVisitsPerWeek) {
        consistentWeeks++;
      }
    }
    
    return { progress: consistentWeeks, streak: 0 };
  }
  
  return { progress: 0, streak: 0 };
}

/**
 * Calculate quality-based achievements
 */
async function calculateQualityProgress(barberId: string, achievement: any): Promise<number> {
  if (achievement.subcategory === 'client_retention') {
    const barberStats = await BarberStats.findOne({ barberId });
    if (!barberStats) return 0;
    
    // Return client retention rate as percentage
    return Math.floor(barberStats.clientRetentionRate || 0);
  }
  
  if (achievement.subcategory === 'service_variety') {
    const barberStats = await BarberStats.findOne({ barberId });
    if (!barberStats) return 0;
    
    // Count unique services provided
    return barberStats.serviceStats.length;
  }
  
  return 0;
}

/**
 * Update achievement progress for a specific barber
 */
export async function updateBarberAchievementProgress(barberId: string): Promise<void> {
  await connectToDatabase();
  
  // Get all active achievements
  const achievements = await Achievement.find({ isActive: true });
  
  for (const achievement of achievements) {
    try {
      let progress = 0;
      let streak = 0;
      let metadata: any = {};
      
      // Calculate progress based on achievement category
      switch (achievement.category) {
        case 'tenure':
          progress = await calculateTenureProgress(barberId, achievement);
          break;
          
        case 'visits':
          progress = await calculateVisitProgress(barberId, achievement);
          break;
          
        case 'clients':
          progress = await calculateClientProgress(barberId, achievement);
          break;
          
        case 'consistency':
          const consistencyResult = await calculateConsistencyProgress(barberId, achievement);
          progress = consistencyResult.progress;
          streak = consistencyResult.streak;
          metadata.currentStreak = streak;
          break;
          
        case 'quality':
          progress = await calculateQualityProgress(barberId, achievement);
          break;
          
        default:
          continue; // Skip unknown categories
      }
      
      // Check if achievement is completed
      const isCompleted = progress >= achievement.requirement;
      
      // Find or create barber achievement record
      let barberAchievement = await BarberAchievement.findOne({
        barberId: new mongoose.Types.ObjectId(barberId),
        achievementId: achievement._id
      });
      
      if (!barberAchievement) {
        barberAchievement = new BarberAchievement({
          barberId,
          achievementId: achievement._id,
          progress: 0,
          isCompleted: false,
          completionCount: 0,
          metadata: {}
        });
      }
      
      // Update progress
      const wasCompleted = barberAchievement.isCompleted;
      barberAchievement.progress = progress;
      barberAchievement.lastProgressDate = new Date();
      barberAchievement.metadata = { ...barberAchievement.metadata, ...metadata };
      
      if (streak > 0) {
        barberAchievement.currentStreak = streak;
      }
      
      // Handle completion
      if (isCompleted && !wasCompleted) {
        barberAchievement.isCompleted = true;
        barberAchievement.completedAt = new Date();
        barberAchievement.completionCount += 1;
        
        // Handle repeatable achievements
        if (achievement.isRepeatable) {
          const maxCompletions = achievement.maxCompletions || Infinity;
          if (barberAchievement.completionCount < maxCompletions) {
            barberAchievement.isCompleted = false;
            barberAchievement.progress = 0; // Reset for next completion
          }
        }
      }
      
      await barberAchievement.save();
    } catch (error) {
      console.error(`Error updating achievement ${achievement._id} for barber ${barberId}:`, error);
    }
  }
}

/**
 * Get barber achievement progress
 */
export async function getBarberAchievements(barberId: string): Promise<AchievementProgress[]> {
  await connectToDatabase();
  
  const achievements = await Achievement.find({ isActive: true }).sort({ tier: 1, points: 1 });
  const barberAchievements = await BarberAchievement.find({ 
    barberId: new mongoose.Types.ObjectId(barberId) 
  });
  
  const achievementMap = new Map(barberAchievements.map(ba => [ba.achievementId.toString(), ba]));
  
  return achievements.map(achievement => {
    const barberAchievement = achievementMap.get(achievement._id.toString());
    const progress = barberAchievement?.progress || 0;
    const isCompleted = barberAchievement?.isCompleted || false;
    
    return {
      achievementId: achievement._id.toString(),
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      tier: achievement.tier,
      badge: achievement.badge,
      color: achievement.color,
      points: achievement.points,
      progress,
      requirement: achievement.requirement,
      isCompleted,
      completedAt: barberAchievement?.completedAt,
      progressPercentage: Math.min(Math.round((progress / achievement.requirement) * 100), 100),
      reward: achievement.reward
    };
  });
}

/**
 * Get achievement leaderboard - Optimized aggregation pipeline
 */
export async function getAchievementLeaderboard(): Promise<any[]> {
  await connectToDatabase();
  
  const leaderboard = await BarberAchievement.aggregate([
    {
      $match: { 
        isCompleted: true,
        // Add index hint for better performance
        barberId: { $exists: true }
      }
    },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievementId',
        foreignField: '_id',
        as: 'achievement',
        // Only get necessary fields from achievements
        pipeline: [
          {
            $project: {
              points: 1,
              tier: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$achievement'
    },
    {
      $group: {
        _id: '$barberId',
        totalPoints: { $sum: '$achievement.points' },
        completedAchievements: { $sum: 1 },
        goldAchievements: {
          $sum: { $cond: [{ $eq: ['$achievement.tier', 'gold'] }, 1, 0] }
        },
        platinumAchievements: {
          $sum: { $cond: [{ $eq: ['$achievement.tier', 'platinum'] }, 1, 0] }
        },
        diamondAchievements: {
          $sum: { $cond: [{ $eq: ['$achievement.tier', 'diamond'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'admins',
        localField: '_id',
        foreignField: '_id',
        as: 'barber',
        // Only get necessary fields from admins
        pipeline: [
          {
            $match: { 
              role: 'barber', 
              active: true 
            }
          },
          {
            $project: {
              name: 1,
              profilePicture: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$barber'
    },
    {
      $sort: { totalPoints: -1, completedAchievements: -1 }
    },
    {
      $limit: 50 // Limit results for better performance
    },
    {
      $project: {
        _id: 1,
        name: '$barber.name',
        profilePicture: '$barber.profilePicture',
        totalPoints: 1,
        completedAchievements: 1,
        goldAchievements: 1,
        platinumAchievements: 1,
        diamondAchievements: 1
      }
    }
  ]);
  
  return leaderboard.map((entry: any, index: number) => ({
    ...entry,
    rank: index + 1
  }));
} 