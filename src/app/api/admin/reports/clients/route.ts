import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit, Client } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const limit = parseInt(searchParams.get('limit') || '50');

    // Aggregate client analytics data
    const clientAnalytics = await Visit.aggregate([
      {
        $match: {
          visitDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$clientId',
          totalVisits: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          lastVisit: { $max: '$visitDate' },
          avgVisitValue: { $avg: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $unwind: '$clientInfo'
      },
      {
        $addFields: {
          clientId: '$_id',
          clientName: {
            $concat: ['$clientInfo.firstName', ' ', '$clientInfo.lastName']
          },
          loyaltyStatus: '$clientInfo.loyaltyStatus',
          frequency: {
            $cond: {
              if: { $gte: ['$totalVisits', 10] },
              then: 'high',
              else: {
                $cond: {
                  if: { $gte: ['$totalVisits', 5] },
                  then: 'medium',
                  else: 'low'
                }
              }
            }
          }
        }
      },
      {
        $project: {
          clientId: 1,
          clientName: 1,
          totalVisits: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          averageVisitValue: { $round: ['$avgVisitValue', 2] },
          lastVisit: 1,
          loyaltyStatus: 1,
          frequency: 1
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Get summary statistics
    const totalClients = await Client.countDocuments();
    const activeClients = clientAnalytics.length;
    const totalRevenue = clientAnalytics.reduce((sum, client) => sum + client.totalSpent, 0);
    const avgSpendingPerClient = activeClients > 0 ? totalRevenue / activeClients : 0;

    return NextResponse.json({
      success: true,
      data: clientAnalytics,
      summary: {
        totalClients,
        activeClients,
        totalRevenue,
        avgSpendingPerClient: Math.round(avgSpendingPerClient * 100) / 100,
        reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
      }
    });

  } catch (error) {
    console.error('Error fetching client analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch client analytics' },
      { status: 500 }
    );
  }
} 