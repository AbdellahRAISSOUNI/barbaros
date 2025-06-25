import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit, BarberStats } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const barberFilter = searchParams.get('barber');

    // Build match stage
    const matchStage: any = {
      visitDate: { $gte: startDate, $lte: endDate },
      barber: { $exists: true, $ne: null }
    };

    if (barberFilter) {
      matchStage.barber = barberFilter;
    }

    // Aggregate barber performance data
    const barberPerformance = await Visit.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: '$barber',
          totalVisits: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          uniqueClients: { $addToSet: '$clientId' },
          avgVisitValue: { $avg: '$totalPrice' },
          totalServiceTime: { $sum: '$duration' }
        }
      },
      {
        $addFields: {
          barberId: '$_id',
          barberName: '$_id',
          uniqueClientsCount: { $size: '$uniqueClients' },
          efficiency: {
            $cond: {
              if: { $eq: ['$totalServiceTime', null] },
              then: 85, // Default efficiency if no duration data
              else: {
                $min: [
                  100,
                  {
                    $multiply: [
                      {
                        $divide: [
                          '$totalVisits',
                          { $divide: ['$totalServiceTime', 30] } // Assuming 30 min standard time
                        ]
                      },
                      100
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'barberstats',
          localField: 'barberId',
          foreignField: 'barberId',
          as: 'stats'
        }
      },
      {
        $addFields: {
          rating: {
            $cond: {
              if: { $gt: [{ $size: '$stats' }, 0] },
              then: { $arrayElemAt: ['$stats.averageRating', 0] },
              else: 4.5 // Default rating
            }
          }
        }
      },
      {
        $project: {
          barberId: 1,
          barberName: 1,
          totalVisits: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          uniqueClients: '$uniqueClientsCount',
          averageVisitValue: { $round: ['$avgVisitValue', 2] },
          efficiency: { $round: ['$efficiency', 0] },
          rating: { $round: ['$rating', 1] }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    // Calculate summary statistics
    const totalVisits = barberPerformance.reduce((sum, barber) => sum + barber.totalVisits, 0);
    const totalRevenue = barberPerformance.reduce((sum, barber) => sum + barber.totalRevenue, 0);
    const avgRevenuePerBarber = barberPerformance.length > 0 ? totalRevenue / barberPerformance.length : 0;
    const avgEfficiency = barberPerformance.length > 0 
      ? barberPerformance.reduce((sum, barber) => sum + barber.efficiency, 0) / barberPerformance.length 
      : 0;

    return NextResponse.json({
      success: true,
      data: barberPerformance,
      summary: {
        totalBarbers: barberPerformance.length,
        totalVisits,
        totalRevenue,
        avgRevenuePerBarber: Math.round(avgRevenuePerBarber * 100) / 100,
        avgEfficiency: Math.round(avgEfficiency),
        reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
      }
    });

  } catch (error) {
    console.error('Error fetching barber performance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch barber performance data' },
      { status: 500 }
    );
  }
} 