import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VisitModel from '@/lib/db/models/visit';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Build query
    const query: any = {};
    
    if (barberId) {
      query.barberId = barberId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) {
        query.totalAmount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.totalAmount.$lte = parseFloat(maxAmount);
      }
    }

    // Fetch visits with populated data
    let visitsQuery = VisitModel.find(query)
      .populate('clientId', 'name phoneNumber email')
      .populate('barberId', 'name')
      .populate('services.serviceId', 'name price')
      .sort({ date: -1 });

    // Apply search filter after population
    const visits = await visitsQuery.exec();
    
    let filteredVisits = visits;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVisits = visits.filter(visit => 
        visit.clientId?.name?.toLowerCase().includes(searchLower) ||
        visit.clientId?.phoneNumber?.includes(search) ||
        visit.clientId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Generate CSV content
    const csvHeaders = [
      'Date',
      'Client Name',
      'Client Phone',
      'Client Email',
      'Barber',
      'Services',
      'Total Amount',
      'Loyalty Points',
      'Notes'
    ];

    const csvRows = filteredVisits.map((visit: any) => {
      const services = visit.services.map((s: any) => 
        `${s.serviceId?.name}${s.quantity > 1 ? ` (${s.quantity}x)` : ''}`
      ).join('; ');

      return [
        new Date(visit.date).toLocaleDateString(),
        visit.clientId?.name || 'N/A',
        visit.clientId?.phoneNumber || 'N/A',
        visit.clientId?.email || 'N/A',
        visit.barberId?.name || 'N/A',
        services || 'N/A',
        visit.totalAmount.toFixed(2),
        visit.loyaltyPointsEarned || 0,
        visit.notes || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="visits-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export visits error:', error);
    return NextResponse.json({ 
      error: 'Failed to export visits'
    }, { status: 500 });
  }
} 