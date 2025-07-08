import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase, { apiCache } from '@/lib/db/mongodb';
import { Visit, Client } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const period = searchParams.get('period') || 'monthly';

    // Cache key for client retention data
    const cacheKey = `analytics:client-retention:${startDate.toISOString()}:${endDate.toISOString()}:${period}`;
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Calculate retention metrics by period
    const retentionData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let periodStart: Date;
      let periodEnd: Date;
      let dateString: string;

      if (period === 'weekly') {
        periodStart = new Date(currentDate);
        periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + 6);
        dateString = `Week of ${periodStart.toISOString().split('T')[0]}`;
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (period === 'daily') {
        periodStart = new Date(currentDate);
        periodEnd = new Date(currentDate);
        dateString = periodStart.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        // Monthly
        periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Ensure we don't go beyond the end date
      if (periodStart > endDate) break;
      if (periodEnd > endDate) periodEnd = new Date(endDate);

      // Get clients who visited in this period
      const currentPeriodClients = await Visit.distinct('clientId', {
        visitDate: { $gte: periodStart, $lte: periodEnd }
      });

      // Get clients who visited in the previous period (same duration)
      const periodLength = periodEnd.getTime() - periodStart.getTime();
      const prevPeriodStart = new Date(periodStart.getTime() - periodLength);
      const prevPeriodEnd = new Date(periodStart);

      const previousPeriodClients = await Visit.distinct('clientId', {
        visitDate: { $gte: prevPeriodStart, $lte: prevPeriodEnd }
      });

      // Calculate retention (clients who visited in both periods)
      const retainedClients = previousPeriodClients.filter(clientId => 
        currentPeriodClients.includes(clientId)
      );

      const retentionRate = previousPeriodClients.length > 0 ? 
        (retainedClients.length / previousPeriodClients.length) * 100 : 0;

      // Calculate new vs returning clients in current period
      const newClients = currentPeriodClients.filter(clientId => 
        !previousPeriodClients.includes(clientId)
      );

      retentionData.push({
        period: dateString,
        totalClients: currentPeriodClients.length,
        retainedClients: retainedClients.length,
        newClients: newClients.length,
        retentionRate: Math.round(retentionRate * 10) / 10,
        previousPeriodClients: previousPeriodClients.length
      });
    }

    // Calculate overall retention metrics
    const allCurrentClients = await Visit.distinct('clientId', {
      visitDate: { $gte: startDate, $lte: endDate }
    });

    const periodLength = endDate.getTime() - startDate.getTime();
    const overallPrevStart = new Date(startDate.getTime() - periodLength);
    const overallPrevEnd = new Date(startDate);

    const allPreviousClients = await Visit.distinct('clientId', {
      visitDate: { $gte: overallPrevStart, $lte: overallPrevEnd }
    });

    const overallRetained = allPreviousClients.filter(clientId => 
      allCurrentClients.includes(clientId)
    );

    const overallRetentionRate = allPreviousClients.length > 0 ? 
      (overallRetained.length / allPreviousClients.length) * 100 : 0;

    // Client frequency analysis
    const clientVisitCounts = await Visit.aggregate([
      { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$clientId', visitCount: { $sum: 1 } } },
      { $group: { 
          _id: {
            $switch: {
              branches: [
                { case: { $eq: ['$visitCount', 1] }, then: 'one-time' },
                { case: { $lte: ['$visitCount', 3] }, then: 'occasional' },
                { case: { $lte: ['$visitCount', 6] }, then: 'regular' },
              ],
              default: 'frequent'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const frequencyBreakdown = {
      'one-time': 0,
      'occasional': 0,
      'regular': 0,
      'frequent': 0
    };

    clientVisitCounts.forEach(item => {
      frequencyBreakdown[item._id as keyof typeof frequencyBreakdown] = item.count;
    });

    // Loyalty status breakdown
    const loyaltyBreakdown = await Client.aggregate([
      { $group: { _id: '$loyaltyStatus', count: { $sum: 1 } } }
    ]);

    const loyaltyStats = {
      new: 0,
      active: 0,
      milestone_reached: 0,
      inactive: 0
    };

    loyaltyBreakdown.forEach(item => {
      loyaltyStats[item._id as keyof typeof loyaltyStats] = item.count;
    });

    const result = {
      success: true,
      data: {
        retentionByPeriod: retentionData,
        overallMetrics: {
          totalCurrentClients: allCurrentClients.length,
          totalPreviousClients: allPreviousClients.length,
          retainedClients: overallRetained.length,
          newClients: allCurrentClients.length - overallRetained.length,
          overallRetentionRate: Math.round(overallRetentionRate * 10) / 10
        },
        clientFrequency: frequencyBreakdown,
        loyaltyStatusBreakdown: loyaltyStats
      }
    };

    // Cache for 15 minutes
    apiCache.set(cacheKey, result, 900);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching client retention data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch client retention data' },
      { status: 500 }
    );
  }
} 