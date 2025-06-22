import { NextRequest, NextResponse } from 'next/server';
import { getBarberStats } from '@/lib/db/api/barberApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stats = await getBarberStats(id);
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Barber statistics not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching barber statistics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch barber statistics' },
      { status: 500 }
    );
  }
} 