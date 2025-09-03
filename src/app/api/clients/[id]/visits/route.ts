import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getVisitsByClient } from '@/lib/db/api/visitApi';
import { getClientById, getClientByClientId } from '@/lib/db/api/clientApi';
import Visit from '@/lib/db/models/visit';
import connectToDatabase from '@/lib/db/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id: clientIdentifier } = await params;
    
    if (!clientIdentifier || clientIdentifier === 'undefined') {
      return NextResponse.json(
        { error: 'Valid client ID is required' },
        { status: 400 }
      );
    }

    // First, find the client to get their MongoDB _id
    let client = await getClientById(clientIdentifier);
    if (!client) {
      client = await getClientByClientId(clientIdentifier);
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Use the client's MongoDB _id for the visits query
    const clientId = client._id.toString();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get filtering parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const service = searchParams.get('service');
    const barber = searchParams.get('barber');
    const rewardFilter = searchParams.get('rewardFilter');

    // Build filter object
    await connectToDatabase();
    const filter: any = { clientId };

    // Date range filter
    if (startDate || endDate) {
      filter.visitDate = {};
      if (startDate) filter.visitDate.$gte = new Date(startDate);
      if (endDate) filter.visitDate.$lte = new Date(endDate);
    }

    // Service filter
    if (service) {
      filter['services.name'] = { $regex: service, $options: 'i' };
    }

    // Barber filter
    if (barber) {
      filter.barber = { $regex: barber, $options: 'i' };
    }

    // Reward filter
    if (rewardFilter === 'redeemed') {
      filter.rewardRedeemed = true;
    } else if (rewardFilter === 'regular') {
      filter.rewardRedeemed = { $ne: true };
    }

    // Get visits with filtering
    const skip = (page - 1) * limit;
    
    const visits = await Visit.find(filter)
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await Visit.countDocuments(filter);
    
    const result = {
      success: true,
      visits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching client visits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch client visits' },
      { status: 500 }
    );
  }
} 