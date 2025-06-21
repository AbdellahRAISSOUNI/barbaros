import { NextRequest, NextResponse } from 'next/server';
import { getVisitsByClient } from '@/lib/db/api/visitApi';
import { getClientById, getClientByClientId } from '@/lib/db/api/clientApi';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const result = await getVisitsByClient(clientId, page, limit);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching client visits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch client visits' },
      { status: 500 }
    );
  }
} 