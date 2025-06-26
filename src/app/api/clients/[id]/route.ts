import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getClientById, getClientByClientId, updateClient, deleteClient } from '@/lib/db/api/clientApi';

/**
 * GET /api/clients/[id]
 * Get a client by ID (MongoDB _id) or clientId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Try to get client by MongoDB _id first
    let client = await getClientById(id);
    
    // If not found, try by clientId
    if (!client) {
      client = await getClientByClientId(id);
    }
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      client
    });
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Update a client
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updateData = await request.json();
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.passwordHash;
    delete updateData._id;
    delete updateData.dateCreated;
    
    // Update client
    const client = await updateClient(id, updateData);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete a client
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Delete client
    await deleteClient(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}