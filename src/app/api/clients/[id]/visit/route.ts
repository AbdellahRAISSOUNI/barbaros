import { NextRequest, NextResponse } from 'next/server';
import { createVisit, recordVisitForLoyalty } from '@/lib/db/api';
import { getClientById, getClientByClientId } from '@/lib/db/api/clientApi';
import { IVisit } from '@/lib/db/models/visit';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientIdentifier } = await params;
    const body = await request.json();

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

    // Use the client's MongoDB _id for the visit
    const clientId = client._id.toString();

    // Prepare visit data
    const visitData: Partial<IVisit> = {
      clientId: new mongoose.Types.ObjectId(clientId),
      visitDate: body.visitDate ? new Date(body.visitDate) : new Date(),
      services: body.services || [],
      totalPrice: body.totalPrice || 0,
      barber: body.barber || '',
      notes: body.notes || '',
      rewardRedeemed: body.rewardRedeemed || false,
      redeemedRewardId: body.redeemedRewardId || null,
    };

    // Validate required fields
    if (!visitData.services || visitData.services.length === 0) {
      return NextResponse.json(
        { error: 'At least one service is required' },
        { status: 400 }
      );
    }

    if (!visitData.barber) {
      return NextResponse.json(
        { error: 'Barber name is required' },
        { status: 400 }
      );
    }

    const visit = await createVisit(visitData);

    // Update loyalty progress
    try {
      const loyaltyStatus = await recordVisitForLoyalty(clientId, visit._id.toString());
      return NextResponse.json({ 
        visit, 
        loyaltyStatus,
        success: true 
      }, { status: 201 });
    } catch (loyaltyError) {
      console.error('Error updating loyalty status:', loyaltyError);
      // Return visit even if loyalty update fails
      return NextResponse.json({ 
        visit, 
        success: true,
        warning: 'Visit recorded but loyalty status update failed'
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating visit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create visit' },
      { status: 500 }
    );
  }
} 