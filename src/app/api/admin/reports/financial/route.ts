import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const period = searchParams.get('period') || 'weekly'; // weekly, daily, monthly

    // Get period breakdown
    let groupBy: any;
    let sortBy: any = { '_id': 1 };

    switch (period) {
      case 'daily':
        groupBy = {
          $dateToString: { format: '%Y-%m-%d', date: '$visitDate' }
        };
        break;
      case 'monthly':
        groupBy = {
          $dateToString: { format: '%Y-%m', date: '$visitDate' }
        };
        break;
      default: // weekly
        groupBy = {
          year: { $year: '$visitDate' },
          week: { $week: '$visitDate' }
        };
        break;
    }

    // Aggregate financial data by period
    const financialData = await Visit.aggregate([
      {
        $match: {
          visitDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          visits: { $sum: 1 },
          uniqueClients: { $addToSet: '$clientId' },
          averageValue: { $avg: '$totalPrice' }
        }
      },
      {
        $addFields: {
          period: {
            $cond: {
              if: { $eq: [period, 'weekly'] },
              then: {
                $concat: [
                  { $toString: '$_id.year' },
                  '-W',
                  { $toString: '$_id.week' }
                ]
              },
              else: '$_id'
            }
          },
          clients: { $size: '$uniqueClients' }
        }
      },
      {
        $project: {
          period: 1,
          revenue: { $round: ['$revenue', 2] },
          visits: 1,
          clients: 1,
          averageValue: { $round: ['$averageValue', 2] }
        }
      },
      { $sort: sortBy }
    ]);

    // Calculate trends for each period
    const performanceData = financialData.map((item, index) => {
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (index > 0) {
        const currentRevenue = item.revenue;
        const previousRevenue = financialData[index - 1].revenue;
        
        if (currentRevenue > previousRevenue * 1.05) {
          trend = 'up';
        } else if (currentRevenue < previousRevenue * 0.95) {
          trend = 'down';
        }
      }

      return {
        period: item.period,
        revenue: item.revenue,
        visits: item.visits,
        clients: item.clients,
        averageValue: item.averageValue,
        trend
      };
    });

    // Calculate summary statistics for the entire period
    const totalRevenue = financialData.reduce((sum, item) => sum + item.revenue, 0);
    const totalVisits = financialData.reduce((sum, item) => sum + item.visits, 0);
    const avgPeriodRevenue = financialData.length > 0 ? totalRevenue / financialData.length : 0;
    const avgVisitValue = totalVisits > 0 ? totalRevenue / totalVisits : 0;

    // Calculate period-over-period growth
    let revenueGrowth = 0;
    if (financialData.length >= 2) {
      const latestRevenue = financialData[financialData.length - 1].revenue;
      const previousRevenue = financialData[financialData.length - 2].revenue;
      revenueGrowth = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    }

    return NextResponse.json({
      success: true,
      data: performanceData,
      summary: {
        period,
        totalRevenue,
        totalVisits,
        avgPeriodRevenue: Math.round(avgPeriodRevenue * 100) / 100,
        avgVisitValue: Math.round(avgVisitValue * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
      }
    });

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
} 