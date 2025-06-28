import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient, getClientById, listClients, updateClient, deleteClient } from '@/lib/db/api/clientApi';
import { apiCache } from '@/lib/db/mongodb';

/**
 * GET /api/clients
 * Get a list of clients with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get pagination and filtering parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'lastName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const status = searchParams.get('status');
    const loyaltyStatus = searchParams.get('loyaltyStatus');
    const visitRange = searchParams.get('visitRange');
    const dateRange = searchParams.get('dateRange');
    
    // Build filter object
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.accountActive = status === 'active';
    }
    
    if (loyaltyStatus && loyaltyStatus !== 'all') {
      filter.loyaltyStatus = loyaltyStatus;
    }
    
    if (visitRange && visitRange !== 'all') {
      switch (visitRange) {
        case '0-5':
          filter.totalLifetimeVisits = { $gte: 0, $lte: 5 };
          break;
        case '6-15':
          filter.totalLifetimeVisits = { $gte: 6, $lte: 15 };
          break;
        case '16-30':
          filter.totalLifetimeVisits = { $gte: 16, $lte: 30 };
          break;
        case '30+':
          filter.totalLifetimeVisits = { $gt: 30 };
          break;
      }
    }
    
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filter.createdAt = { $gte: startDate };
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // PHASE 2 FIX: Add caching for client listings (short cache for frequently changing data)
    const cacheKey = `clients:list:${page}:${limit}:${JSON.stringify(filter)}:${JSON.stringify(sort)}`;
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }
    
    // Get clients with pagination, filtering, and sorting
    const result = await listClients(page, limit, filter, sort);
    
    const response = {
      clients: result.clients,
      totalClients: result.pagination.total,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
    };
    
    // Cache for 2 minutes (shorter cache for dynamic data)
    apiCache.set(cacheKey, response, 120);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const clientData = await request.json();
    
    // Validate required fields
    if (!clientData.firstName || !clientData.lastName || !clientData.phoneNumber) {
      return NextResponse.json(
        { error: 'First name, last name, and phone number are required' },
        { status: 400 }
      );
    }
    
    // Create client
    const client = await createClient(clientData);
    
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
}