import { NextRequest, NextResponse } from 'next/server';
import { listVisits, getVisitsByDateRange } from '@/lib/db/api/visitApi';
import connectToDatabase from '@/lib/db/mongodb';
import Visit from '@/lib/db/models/visit';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const barber = searchParams.get('barber');
    const search = searchParams.get('search');
    const service = searchParams.get('service');
    const rewardFilter = searchParams.get('rewardFilter');
    const includeClient = searchParams.get('includeClient') === 'true';

    // Build filter object
    let filter: any = {};

    // Add barber filter if provided
    if (barber) {
      filter.barber = { $regex: barber, $options: 'i' };
    }

    // Add search filter (client name or phone)
    if (search) {
      // We'll handle this after population if includeClient is true
      // For now, store it to apply later
    }

    // Add service filter
    if (service) {
      filter['services.name'] = { $regex: service, $options: 'i' };
    }

    // Add reward filter
    if (rewardFilter === 'redeemed') {
      filter.rewardRedeemed = true;
    } else if (rewardFilter === 'regular') {
      filter.rewardRedeemed = { $ne: true };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.visitDate = {};
      if (startDate) filter.visitDate.$gte = new Date(startDate);
      if (endDate) filter.visitDate.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build query
    let query = Visit.find(filter)
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

    // Include client information if requested
    if (includeClient) {
      query = query.populate('clientId', 'firstName lastName phoneNumber email');
    }

    const visits = await query.lean();
    
    // Apply search filter after population if needed
    let filteredVisits = visits;
    if (search && includeClient) {
      const searchTerm = search.toLowerCase();
      filteredVisits = visits.filter((visit: any) => {
        if (visit.clientId) {
          const fullName = `${visit.clientId.firstName} ${visit.clientId.lastName}`.toLowerCase();
          const phone = visit.clientId.phoneNumber || '';
          return fullName.includes(searchTerm) || phone.includes(searchTerm);
        }
        return false;
      });
    }

    // Get total count for pagination (with filters)
    const totalFilter = { ...filter };
    const total = await Visit.countDocuments(totalFilter);
    
    const result = {
      success: true,
      visits: filteredVisits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch visits' },
      { status: 500 }
    );
  }
} 