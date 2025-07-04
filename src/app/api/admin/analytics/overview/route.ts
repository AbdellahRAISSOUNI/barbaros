import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase, { apiCache } from '@/lib/db/mongodb';
import { Visit, Client, Service } from '@/lib/db/models';

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

    // Get basic counts
    const totalClients = await Client.countDocuments();
    const newClientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const previousNewClients = await Client.countDocuments({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    });

    const totalVisits = await Visit.countDocuments();
    const visitsThisMonth = await Visit.countDocuments({
      visitDate: { $gte: startDate, $lte: endDate }
    });
    const previousVisits = await Visit.countDocuments({
      visitDate: { $gte: previousStartDate, $lte: previousEndDate }
    });

    // Get active clients (visited in last 30 days)
    const activeClientIds = await Visit.distinct('clientId', {
      visitDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const activeClients = activeClientIds.length;

    // Calculate simple revenue totals
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

    // Get total services count
    const totalServices = await Service.countDocuments({ isActive: true });

    // Calculate basic loyalty stats
    const loyaltyMembers = await Client.countDocuments({
      loyaltyStatus: { $ne: 'new' }
    });

    const rewardsRedeemed = await Client.aggregate([
      { $group: { _id: null, total: { $sum: '$rewardsRedeemed' } } }
    ]);

    // Calculate growth percentages
    const clientGrowthPercentage = previousNewClients === 0 ? 100 : 
      ((newClientsThisMonth - previousNewClients) / previousNewClients) * 100;
    
    const visitGrowthPercentage = previousVisits === 0 ? 100 : 
      ((visitsThisMonth - previousVisits) / previousVisits) * 100;
    
    const revenueGrowthPercentage = previousRevenue === 0 ? 100 : 
      ((revenueThisMonth - previousRevenue) / previousRevenue) * 100;

    // Calculate derived metrics
    const averageVisitValue = totalVisits > 0 ? totalRevenue / totalVisits : 0;
    const averageVisitsPerClient = totalClients > 0 ? totalVisits / totalClients : 0;
    const loyaltyParticipationRate = totalClients > 0 ? (loyaltyMembers / totalClients) * 100 : 0;

    const metrics = {
      totalClients,
      activeClients,
      newClientsThisMonth,
      clientGrowthPercentage: Math.round(clientGrowthPercentage * 10) / 10,
      totalVisits,
      visitsThisMonth,
      visitGrowthPercentage: Math.round(visitGrowthPercentage * 10) / 10,
      totalRevenue,
      revenueThisMonth,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 10) / 10,
      averageVisitValue: Math.round(averageVisitValue * 100) / 100,
      totalServices,
      popularService: 'Classic Haircut', // Placeholder
      loyaltyMembersCount: loyaltyMembers,
      loyaltyParticipationRate: Math.round(loyaltyParticipationRate * 10) / 10,
      rewardsRedeemed: rewardsRedeemed[0]?.total || 0,
      averageVisitsPerClient: Math.round(averageVisitsPerClient * 10) / 10
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