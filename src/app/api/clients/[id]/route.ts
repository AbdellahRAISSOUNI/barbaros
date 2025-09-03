import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    const session = await getServerSession(authOptions);
    
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
    
    // Try to get client by MongoDB _id first
    let client = await getClientById(id);
    
    // If not found, try by clientId
    if (!client) {
      client = await getClientByClientId(id);
    }
    
    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      client: client
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
    const session = await getServerSession(authOptions);
    
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
    
    // Validate required fields
    if (updateData.firstName && !updateData.firstName.trim()) {
      return NextResponse.json(
        { success: false, message: 'First name cannot be empty' },
        { status: 400 }
      );
    }
    
    if (updateData.lastName && !updateData.lastName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Last name cannot be empty' },
        { status: 400 }
      );
    }
    
    if (updateData.phoneNumber && !updateData.phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, message: 'Phone number cannot be empty' },
        { status: 400 }
      );
    }
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.passwordHash;
    delete updateData._id;
    delete updateData.dateCreated;
    delete updateData.clientId;
    delete updateData.qrCodeId;
    delete updateData.qrCodeUrl;
    
    // Update client
    try {
      const client = await updateClient(id, updateData);
      
      if (!client) {
        return NextResponse.json(
          { success: false, message: 'Client not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        client: client,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      // Check for duplicate phone number error
      if (error.message.includes('duplicate key error') && error.message.includes('phoneNumber')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'This phone number is already registered to another client. Please use a different phone number.',
            field: 'phoneNumber'
          },
          { status: 400 }
        );
      }
      
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update client' },
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
    const session = await getServerSession(authOptions);
    
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
    
    // Delete client
    await deleteClient(id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}