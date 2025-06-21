import { NextRequest, NextResponse } from 'next/server';
import { listVisits, getVisitsByDateRange } from '@/lib/db/api/visitApi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const barber = searchParams.get('barber');

    let filter: any = {};

    // Add barber filter if provided
    if (barber) {
      filter.barber = { $regex: barber, $options: 'i' };
    }

    let result;

    // If date range is provided, use date range function
    if (startDate && endDate) {
      result = await getVisitsByDateRange(
        new Date(startDate),
        new Date(endDate),
        page,
        limit
      );
    } else {
      // Otherwise use general list with filters
      result = await listVisits(page, limit, filter);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch visits' },
      { status: 500 }
    );
  }
} 