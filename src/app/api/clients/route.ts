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
    
    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // PHASE 2 FIX: Add caching for client listings (short cache for frequently changing data)
    const cacheKey = `clients:list:${page}:${limit}`;
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }
    
    // Get clients with pagination
    const result = await listClients(page, limit);
    
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