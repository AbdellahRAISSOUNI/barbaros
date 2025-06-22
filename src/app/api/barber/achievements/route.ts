import { NextRequest, NextResponse } from 'next/server';
import { getBarberAchievements } from '@/lib/db/api/achievementEngine';

/**
 * GET /api/barber/achievements - Get achievements for a specific barber
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    
    if (!barberId) {
      return NextResponse.json(
        { success: false, error: 'Barber ID is required' },
        { status: 400 }
      );
    }
    
    const achievements = await getBarberAchievements(barberId);
    
    return NextResponse.json({
      success: true,
      achievements
    });
  } catch (error: any) {
    console.error('Error fetching barber achievements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 