import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { BarberStats } from '@/lib/db/models';

/**
 * GET /api/barber/leaderboard - Get barber leaderboard for barber dashboard (excluding revenue)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'overall';
    const timePeriod = searchParams.get('timePeriod') || 'all-time';

    await connectToDatabase();
    
    let sortCriteria: any = { totalVisits: -1 };
    
    switch (sortBy) {
      case 'visits':
        sortCriteria = { totalVisits: -1 };
        break;
      case 'clients':
        sortCriteria = { uniqueClientsServed: -1 };
        break;
      case 'efficiency':
        sortCriteria = { averageVisitsPerDay: -1 };
        break;
      default: // overall
        sortCriteria = { totalVisits: -1 };
    }
    
    const barbersWithStats = await BarberStats.find()
      .populate('barberId', 'name profilePicture joinDate')
      .select('barberId totalVisits uniqueClientsServed averageVisitsPerDay monthlyStats workDaysSinceJoining')
      .lean() // Convert to plain objects for better performance
      .sort(sortCriteria)
      .limit(20);
    
    const processedStats = barbersWithStats.map((stats: any, index: number) => {
      const barber = stats.barberId;
      
      if (!barber) return null;
      
      const workDays = stats.workDaysSinceJoining || 1;
      const visitsPerDay = stats.totalVisits / workDays;
      const efficiency = Math.round(visitsPerDay * 10) / 10;
      
      let visits = stats.totalVisits;
      let uniqueClients = stats.uniqueClientsServed?.length || 0;
      
      if (timePeriod === 'this-month') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthStats = stats.monthlyStats?.find((m: any) => m.month === currentMonth);
        if (monthStats) {
          visits = monthStats.visitsCount;
          uniqueClients = monthStats.uniqueClients;
        }
      }
      
      return {
        _id: barber._id,
        name: barber.name,
        profilePicture: barber.profilePicture,
        joinDate: barber.joinDate,
        workDays: stats.workDaysSinceJoining,
        stats: {
          totalVisits: visits,
          uniqueClientsServed: uniqueClients,
          thisMonth: {
            visits: stats.monthlyStats?.find((m: any) => m.month === new Date().toISOString().slice(0, 7))?.visitsCount || 0
          }
        },
        rank: index + 1,
        efficiency,
        achievements: Math.min(Math.floor(stats.totalVisits / 10), 10),
        badges: stats.totalVisits > 100 ? ['👑', '🏆', '💎'] : 
                stats.totalVisits > 50 ? ['🥈', '⭐', '🔥'] : 
                stats.totalVisits > 20 ? ['🥉', '🎯', '💪'] : ['🚀', '⚡']
      };
    }).filter(Boolean);
    
    // Re-sort if efficiency is the criteria
    if (sortBy === 'efficiency') {
      processedStats.sort((a: any, b: any) => b.efficiency - a.efficiency);
      processedStats.forEach((item: any, index: number) => {
        item.rank = index + 1;
      });
    }

    return NextResponse.json({
      success: true,
      leaderboard: processedStats
    });
  } catch (error: any) {
    console.error('Error getting barber leaderboard:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 