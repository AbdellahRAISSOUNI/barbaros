import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase, { apiCache } from '@/lib/db/mongodb';
import { Visit, Client, Service, Reward, BarberStats, Reservation } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());

    // PHASE 1 FIX: Add caching for analytics overview
    const cacheKey = `analytics:overview:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate);

    // Enhanced metrics calculations
    const totalClients = await Client.countDocuments();
    const newClientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const previousNewClients = await Client.countDocuments({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    });

    // Active clients calculation (visited in selected period)
    const activeClientIds = await Visit.distinct('clientId', {
      visitDate: { $gte: startDate, $lte: endDate }
    });
    const activeClients = activeClientIds.length;

    // Previous period active clients
    const previousActiveClientIds = await Visit.distinct('clientId', {
      visitDate: { $gte: previousStartDate, $lte: previousEndDate }
    });
    const previousActiveClients = previousActiveClientIds.length;

    // Client retention calculation (clients who visited in both periods)
    const retentionClientIds = await Visit.distinct('clientId', {
      visitDate: { $gte: previousStartDate, $lte: previousEndDate }
    });
    const currentPeriodClients = await Visit.distinct('clientId', {
      visitDate: { $gte: startDate, $lte: endDate }
    });
    const retainedClients = retentionClientIds.filter(clientId => 
      currentPeriodClients.includes(clientId)
    );
    const clientRetentionRate = retentionClientIds.length > 0 ? 
      (retainedClients.length / retentionClientIds.length) * 100 : 0;

    // Visit metrics
    const totalVisits = await Visit.countDocuments();
    const visitsThisMonth = await Visit.countDocuments({
      visitDate: { $gte: startDate, $lte: endDate }
    });
    const previousVisits = await Visit.countDocuments({
      visitDate: { $gte: previousStartDate, $lte: previousEndDate }
    });

    // Revenue calculations with accurate data
    const allVisits = await Visit.find().select('totalPrice');
    const totalRevenue = allVisits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);
    
    const currentPeriodVisits = await Visit.find({
      visitDate: { $gte: startDate, $lte: endDate }
    }).select('totalPrice');
    const revenueThisMonth = currentPeriodVisits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);

    const previousPeriodVisits = await Visit.find({
      visitDate: { $gte: previousStartDate, $lte: previousEndDate }
    }).select('totalPrice');
    const previousRevenue = previousPeriodVisits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);

    // Service metrics
    const totalServices = await Service.countDocuments({ isActive: true });
    
    // Most popular service calculation
    const popularServiceData = await Visit.aggregate([
      { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$services' },
      { $group: { 
          _id: '$services.name', 
          count: { $sum: 1 },
          revenue: { $sum: '$services.price' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const popularService = popularServiceData[0]?.name || 'Classic Haircut';

    // Loyalty program metrics
    const loyaltyMembers = await Client.countDocuments({
      loyaltyStatus: { $ne: 'new' }
    });

    const rewardsRedeemedData = await Visit.aggregate([
      { $match: { 
          visitDate: { $gte: startDate, $lte: endDate },
          rewardRedeemed: true 
        } 
      },
      { $count: "totalRedeemed" }
    ]);
    const rewardsRedeemed = rewardsRedeemedData[0]?.totalRedeemed || 0;

    // Total rewards given out (lifetime)
    const totalRewardsRedeemed = await Visit.countDocuments({ rewardRedeemed: true });

    // Reservation metrics
    const totalReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const pendingReservations = await Reservation.countDocuments({
      status: 'pending',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate growth percentages
    const clientGrowthPercentage = previousNewClients === 0 ? 
      (newClientsThisMonth > 0 ? 100 : 0) : 
      ((newClientsThisMonth - previousNewClients) / previousNewClients) * 100;
    
    const visitGrowthPercentage = previousVisits === 0 ? 
      (visitsThisMonth > 0 ? 100 : 0) : 
      ((visitsThisMonth - previousVisits) / previousVisits) * 100;
    
    const revenueGrowthPercentage = previousRevenue === 0 ? 
      (revenueThisMonth > 0 ? 100 : 0) : 
      ((revenueThisMonth - previousRevenue) / previousRevenue) * 100;

    const activeClientGrowthPercentage = previousActiveClients === 0 ?
      (activeClients > 0 ? 100 : 0) :
      ((activeClients - previousActiveClients) / previousActiveClients) * 100;

    // Calculate derived metrics
    const averageVisitValue = totalVisits > 0 ? totalRevenue / totalVisits : 0;
    const averageVisitsPerClient = totalClients > 0 ? totalVisits / totalClients : 0;
    const loyaltyParticipationRate = totalClients > 0 ? (loyaltyMembers / totalClients) * 100 : 0;

    // Calculate average monthly revenue
    const monthlyRevenueAverage = revenueThisMonth;

    // Customer lifetime value estimation
    const customerLifetimeValue = totalClients > 0 ? totalRevenue / totalClients : 0;

    const metrics = {
      // Core business metrics
      totalClients,
      activeClients,
      newClientsThisMonth,
      clientGrowthPercentage: Math.round(clientGrowthPercentage * 10) / 10,
      activeClientGrowthPercentage: Math.round(activeClientGrowthPercentage * 10) / 10,
      clientRetentionRate: Math.round(clientRetentionRate * 10) / 10,
      
      // Visit metrics
      totalVisits,
      visitsThisMonth,
      visitGrowthPercentage: Math.round(visitGrowthPercentage * 10) / 10,
      averageVisitsPerClient: Math.round(averageVisitsPerClient * 10) / 10,
      
      // Revenue metrics
      totalRevenue,
      revenueThisMonth,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 10) / 10,
      averageVisitValue: Math.round(averageVisitValue * 100) / 100,
      monthlyRevenueAverage: Math.round(monthlyRevenueAverage * 100) / 100,
      customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
      
      // Service metrics
      totalServices,
      popularService,
      
      // Loyalty metrics
      loyaltyMembersCount: loyaltyMembers,
      loyaltyParticipationRate: Math.round(loyaltyParticipationRate * 10) / 10,
      rewardsRedeemed,
      totalRewardsRedeemed,
      
      // Reservation metrics
      totalReservations,
      pendingReservations,
      
      // Comparison periods
      previousPeriod: {
        newClients: previousNewClients,
        visits: previousVisits,
        revenue: Math.round(previousRevenue * 100) / 100,
        activeClients: previousActiveClients
      }
    };

    // PHASE 1 FIX: Cache the result for 10 minutes
    const result = {
      success: true,
      metrics
    };
    
    apiCache.set(cacheKey, result, 600); // 10 minutes cache

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 