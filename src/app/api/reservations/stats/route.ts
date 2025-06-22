import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Reservation } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get basic counts
    const totalCount = await Reservation.countDocuments();
    const unreadCount = await Reservation.countDocuments({ isRead: false });
    const pendingCount = await Reservation.countDocuments({ status: 'pending' });
    const contactedCount = await Reservation.countDocuments({ status: 'contacted' });
    const confirmedCount = await Reservation.countDocuments({ status: 'confirmed' });
    const cancelledCount = await Reservation.countDocuments({ status: 'cancelled' });
    const completedCount = await Reservation.countDocuments({ status: 'completed' });
    
    // Get today's reservations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await Reservation.countDocuments({
      preferredDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get upcoming reservations (next 7 days)
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    const upcomingCount = await Reservation.countDocuments({
      preferredDate: {
        $gte: today,
        $lt: weekFromNow
      },
      status: { $in: ['pending', 'contacted', 'confirmed'] }
    });
    
    // Get source breakdown
    const guestCount = await Reservation.countDocuments({ source: 'guest' });
    const clientAccountCount = await Reservation.countDocuments({ source: 'client_account' });
    
    // Get recent activity (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const recentCount = await Reservation.countDocuments({
      createdAt: { $gte: last24Hours }
    });
    
    // Get status distribution
    const statusStats = await Reservation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get daily reservations for the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dailyStats = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    return NextResponse.json({
      overview: {
        total: totalCount,
        unread: unreadCount,
        pending: pendingCount,
        contacted: contactedCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
        completed: completedCount,
        today: todayCount,
        upcoming: upcomingCount,
        recent24h: recentCount
      },
      sourceBreakdown: {
        guest: guestCount,
        clientAccount: clientAccountCount
      },
      statusDistribution: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      dailyActivity: dailyStats.map(stat => ({
        date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
        count: stat.count
      }))
    });
    
  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation statistics' },
      { status: 500 }
    );
  }
} 