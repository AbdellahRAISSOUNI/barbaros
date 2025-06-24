import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import { Reservation } from '@/lib/db/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const reservation = await Reservation.findById(params.id)
      .populate('clientId', 'firstName lastName email phoneNumber')
      .populate('contactedBy', 'name email');
    
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { status, isRead, adminNotes, action } = body;
    
    const reservation = await Reservation.findById(params.id);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    if (action === 'mark_read') {
      reservation.isRead = true;
    } else if (action === 'mark_unread') {
      reservation.isRead = false;
    } else if (action === 'update_status' && status) {
      const previousStatus = reservation.status;
      reservation.status = status;
      
      // Automatically mark as read when status changes from pending
      // This ensures the notification count updates correctly
      if (previousStatus === 'pending' && status !== 'pending') {
        reservation.isRead = true;
      }
      
      // If marking as contacted, track who contacted and when
      if (status === 'contacted') {
        reservation.contactedAt = new Date();
        reservation.contactedBy = session.user.id;
      }
    } else {
      // General update
      if (status !== undefined) {
        const previousStatus = reservation.status;
        reservation.status = status;
        
        // Automatically mark as read when status changes from pending
        if (previousStatus === 'pending' && status !== 'pending') {
          reservation.isRead = true;
        }
      }
      if (isRead !== undefined) reservation.isRead = isRead;
      if (adminNotes !== undefined) reservation.adminNotes = adminNotes;
    }
    
    await reservation.save();
    
    // Populate for response
    await reservation.populate('clientId', 'firstName lastName email phoneNumber');
    await reservation.populate('contactedBy', 'name email');
    
    return NextResponse.json({
      success: true,
      message: 'Reservation updated successfully',
      reservation
    });
    
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const reservation = await Reservation.findByIdAndDelete(params.id);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    );
  }
} 