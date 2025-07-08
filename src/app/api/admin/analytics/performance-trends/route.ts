import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase, { apiCache } from '@/lib/db/mongodb';
import { Visit, Client, BarberStats, Service } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const period = searchParams.get('period') || 'weekly';

    // Cache key for performance trends
    const cacheKey = `analytics:performance-trends:${startDate.toISOString()}:${endDate.toISOString()}:${period}`;
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Generate time periods for analysis
    interface TimeSeriesData {
      period: string;
      date: string;
      revenue: number;
      visits: number;
      uniqueClients: number;
      averageVisitValue: number;
      busiestHour: number;
      topService: string;
    }

    const timeSeriesData: TimeSeriesData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let periodStart: Date;
      let periodEnd: Date;
      let dateString: string;

      if (period === 'daily') {
        periodStart = new Date(currentDate);
        periodEnd = new Date(currentDate);
        periodEnd.setHours(23, 59, 59, 999);
        dateString = periodStart.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === 'weekly') {
        periodStart = new Date(currentDate);
        periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + 6);
        dateString = `Week of ${periodStart.toISOString().split('T')[0]}`;
        currentDate.setDate(currentDate.getDate() + 7);
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

      // Get visits for this period
      const periodVisits = await Visit.find({
        visitDate: { $gte: periodStart, $lte: periodEnd }
      }).select('totalPrice clientId visitDate services barber');

      // Calculate metrics for this period
      const totalRevenue = periodVisits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);
      const totalVisits = periodVisits.length;
      const uniqueClients = new Set(periodVisits.map(visit => visit.clientId.toString())).size;
      const averageVisitValue = totalVisits > 0 ? totalRevenue / totalVisits : 0;

      // Calculate busy hours (hour of day when most visits occur)
      const hourlyVisits: { [key: number]: number } = {};
      periodVisits.forEach(visit => {
        const hour = new Date(visit.visitDate).getHours();
        hourlyVisits[hour] = (hourlyVisits[hour] || 0) + 1;
      });

      const busiestHour = Object.entries(hourlyVisits).reduce((max, [hour, count]) => 
        count > max.count ? { hour: parseInt(hour), count } : max, 
        { hour: 0, count: 0 }
      );

      // Top services for this period
      const serviceCount: { [key: string]: number } = {};
      periodVisits.forEach(visit => {
        visit.services.forEach((service: any) => {
          serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
        });
      });

      const topService = Object.entries(serviceCount).reduce((max, [service, count]) => 
        count > max.count ? { service, count } : max, 
        { service: 'None', count: 0 }
      );

      timeSeriesData.push({
        period: dateString,
        date: periodStart.toISOString().split('T')[0],
        revenue: Math.round(totalRevenue * 100) / 100,
        visits: totalVisits,
        uniqueClients,
        averageVisitValue: Math.round(averageVisitValue * 100) / 100,
        busiestHour: busiestHour.hour,
        topService: topService.service
      });
    }

    // Calculate growth trends
    interface TimeSeriesWithGrowth extends TimeSeriesData {
      revenueGrowth: number;
      visitGrowth: number;
      clientGrowth: number;
    }

    const trendsWithGrowth: TimeSeriesWithGrowth[] = timeSeriesData.map((current, index) => {
      if (index === 0) {
        return { ...current, revenueGrowth: 0, visitGrowth: 0, clientGrowth: 0 };
      }

      const previous = timeSeriesData[index - 1];
      const revenueGrowth = previous.revenue > 0 ? 
        ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
      const visitGrowth = previous.visits > 0 ? 
        ((current.visits - previous.visits) / previous.visits) * 100 : 0;
      const clientGrowth = previous.uniqueClients > 0 ? 
        ((current.uniqueClients - previous.uniqueClients) / previous.uniqueClients) * 100 : 0;

      return {
        ...current,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        visitGrowth: Math.round(visitGrowth * 10) / 10,
        clientGrowth: Math.round(clientGrowth * 10) / 10
      };
    });

    // Overall trends analysis
    const firstPeriod = trendsWithGrowth[0];
    const lastPeriod = trendsWithGrowth[trendsWithGrowth.length - 1];

    const overallGrowth = {
      revenue: firstPeriod?.revenue > 0 ? 
        ((lastPeriod?.revenue - firstPeriod?.revenue) / firstPeriod?.revenue) * 100 : 0,
      visits: firstPeriod?.visits > 0 ? 
        ((lastPeriod?.visits - firstPeriod?.visits) / firstPeriod?.visits) * 100 : 0,
      clients: firstPeriod?.uniqueClients > 0 ? 
        ((lastPeriod?.uniqueClients - firstPeriod?.uniqueClients) / firstPeriod?.uniqueClients) * 100 : 0
    };

    // Barber performance trends
    const barberPerformance = await Visit.aggregate([
      { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
      { $group: {
          _id: '$barber',
          totalRevenue: { $sum: '$totalPrice' },
          totalVisits: { $sum: 1 },
          uniqueClients: { $addToSet: '$clientId' },
          averageValue: { $avg: '$totalPrice' }
        }
      },
      { $addFields: {
          uniqueClientsCount: { $size: '$uniqueClients' },
          efficiency: { $divide: ['$totalRevenue', '$totalVisits'] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Service performance trends
    const servicePerformance = await Visit.aggregate([
      { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$services' },
      { $group: {
          _id: '$services.name',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$services.price' },
          averagePrice: { $avg: '$services.price' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Peak hours analysis across all periods
    const allVisits = await Visit.find({
      visitDate: { $gte: startDate, $lte: endDate }
    }).select('visitDate');

    const hourlyDistribution: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }

    allVisits.forEach(visit => {
      const hour = new Date(visit.visitDate).getHours();
      hourlyDistribution[hour]++;
    });

    const result = {
      success: true,
      data: {
        timeSeries: trendsWithGrowth,
        overallGrowth: {
          revenue: Math.round(overallGrowth.revenue * 10) / 10,
          visits: Math.round(overallGrowth.visits * 10) / 10,
          clients: Math.round(overallGrowth.clients * 10) / 10
        },
        barberPerformance: barberPerformance.map(barber => ({
          name: barber._id,
          revenue: Math.round(barber.totalRevenue * 100) / 100,
          visits: barber.totalVisits,
          uniqueClients: barber.uniqueClientsCount,
          averageValue: Math.round(barber.averageValue * 100) / 100,
          efficiency: Math.round(barber.efficiency * 100) / 100
        })),
        servicePerformance: servicePerformance.map(service => ({
          name: service._id,
          bookings: service.totalBookings,
          revenue: Math.round(service.totalRevenue * 100) / 100,
          averagePrice: Math.round(service.averagePrice * 100) / 100
        })),
        hourlyDistribution,
        peakHours: Object.entries(hourlyDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([hour, count]) => ({ hour: parseInt(hour), visits: count }))
      }
    };

    // Cache for 15 minutes
    apiCache.set(cacheKey, result, 900);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching performance trends data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch performance trends data' },
      { status: 500 }
    );
  }
} 