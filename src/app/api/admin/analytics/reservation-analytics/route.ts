import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase, { apiCache } from '@/lib/db/mongodb';
import { Reservation, Visit, Client } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());

    // Cache key for reservation analytics
    const cacheKey = `analytics:reservations:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Basic reservation metrics
    const totalReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const reservationsByStatus = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = {
      pending: 0,
      contacted: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    };

    reservationsByStatus.forEach(item => {
      statusBreakdown[item._id as keyof typeof statusBreakdown] = item.count;
    });

    // Conversion rate calculation (confirmed + completed vs total)
    const successfulReservations = statusBreakdown.confirmed + statusBreakdown.completed;
    const conversionRate = totalReservations > 0 ? (successfulReservations / totalReservations) * 100 : 0;

    // Source breakdown (guest vs client account)
    const sourceBreakdown = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const sourceStats = {
      guest: 0,
      client_account: 0
    };

    sourceBreakdown.forEach(item => {
      sourceStats[item._id as keyof typeof sourceStats] = item.count;
    });

    // Daily reservation patterns
    const dailyReservations = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          confirmed: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Preferred time slots analysis
    const timeSlotAnalysis = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$preferredTime',
          count: { $sum: 1 },
          confirmedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Popular days of week for reservations
    const dayOfWeekAnalysis = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: '$preferredDate' }
        }
      },
      {
        $group: {
          _id: '$dayOfWeek',
          count: { $sum: 1 },
          avgConversionRate: {
            $avg: {
              $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyPatterns = dayOfWeekAnalysis.map(item => ({
      day: dayNames[item._id - 1],
      reservations: item.count,
      conversionRate: Math.round(item.avgConversionRate * 100 * 10) / 10
    }));

    // Response time analysis (time from reservation to contact)
    const responseTimeAnalysis = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          contactedAt: { $exists: true }
        }
      },
      {
        $addFields: {
          responseTimeHours: {
            $divide: [
              { $subtract: ['$contactedAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTimeHours' },
          minResponseTime: { $min: '$responseTimeHours' },
          maxResponseTime: { $max: '$responseTimeHours' },
          totalContacted: { $sum: 1 }
        }
      }
    ]);

    const responseTimeStats = responseTimeAnalysis[0] || {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalContacted: 0
    };

    // Lead to visit conversion (reservations that became actual visits)
    const reservationToVisitConversion = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $lookup: {
          from: 'visits',
          let: { clientId: '$clientId', preferredDate: '$preferredDate' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$clientId', '$$clientId'] },
                    {
                      $gte: [
                        '$visitDate',
                        { $subtract: ['$$preferredDate', 24 * 60 * 60 * 1000] }
                      ]
                    },
                    {
                      $lte: [
                        '$visitDate',
                        { $add: ['$$preferredDate', 24 * 60 * 60 * 1000] }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'actualVisit'
        }
      },
      {
        $group: {
          _id: null,
          totalConfirmedReservations: { $sum: 1 },
          reservationsWithVisits: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$actualVisit' }, 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    const leadConversionData = reservationToVisitConversion[0] || {
      totalConfirmedReservations: 0,
      reservationsWithVisits: 0
    };

    const leadToVisitConversionRate = leadConversionData.totalConfirmedReservations > 0 ?
      (leadConversionData.reservationsWithVisits / leadConversionData.totalConfirmedReservations) * 100 : 0;

    // Monthly trends
    const monthlyTrends = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalReservations: { $sum: 1 },
          confirmed: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, 1, 0]
            }
          },
          guests: {
            $sum: { $cond: [{ $eq: ['$source', 'guest'] }, 1, 0] }
          },
          clients: {
            $sum: { $cond: [{ $eq: ['$source', 'client_account'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyData = monthlyTrends.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      total: item.totalReservations,
      confirmed: item.confirmed,
      guests: item.guests,
      clients: item.clients,
      conversionRate: item.totalReservations > 0 ? 
        Math.round((item.confirmed / item.totalReservations) * 100 * 10) / 10 : 0
    }));

    const result = {
      success: true,
      data: {
        overview: {
          totalReservations,
          conversionRate: Math.round(conversionRate * 10) / 10,
          successfulReservations,
          leadToVisitConversionRate: Math.round(leadToVisitConversionRate * 10) / 10
        },
        statusBreakdown,
        sourceBreakdown: sourceStats,
        timeSlots: timeSlotAnalysis.slice(0, 10).map(slot => ({
          time: slot._id,
          reservations: slot.count,
          confirmed: slot.confirmedCount,
          conversionRate: slot.count > 0 ? 
            Math.round((slot.confirmedCount / slot.count) * 100 * 10) / 10 : 0
        })),
        weeklyPatterns,
        dailyTrends: dailyReservations.map(day => ({
          date: day._id,
          reservations: day.count,
          confirmed: day.confirmed,
          conversionRate: day.count > 0 ? 
            Math.round((day.confirmed / day.count) * 100 * 10) / 10 : 0
        })),
        responseTime: {
          average: Math.round(responseTimeStats.avgResponseTime * 10) / 10,
          minimum: Math.round(responseTimeStats.minResponseTime * 10) / 10,
          maximum: Math.round(responseTimeStats.maxResponseTime * 10) / 10,
          totalContacted: responseTimeStats.totalContacted
        },
        monthlyTrends: monthlyData
      }
    };

    // Cache for 15 minutes
    apiCache.set(cacheKey, result, 900);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching reservation analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reservation analytics' },
      { status: 500 }
    );
  }
} 