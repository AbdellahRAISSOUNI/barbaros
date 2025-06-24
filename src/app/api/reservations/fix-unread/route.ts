import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import { Reservation } from '@/lib/db/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find reservations that have been processed (status != 'pending') but are still unread
    const unreadProcessedReservations = await Reservation.find({
      status: { $ne: 'pending' },
      isRead: false
    });
    
    console.log(`Found ${unreadProcessedReservations.length} processed reservations that are still marked as unread`);
    
    // Update them to be marked as read
    const updateResult = await Reservation.updateMany(
      {
        status: { $ne: 'pending' },
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${updateResult.modifiedCount} reservations`,
      details: {
        found: unreadProcessedReservations.length,
        updated: updateResult.modifiedCount,
        reservationsFixed: unreadProcessedReservations.map(res => ({
          id: res._id,
          status: res.status,
          displayName: res.displayName || res.guestName,
          createdAt: res.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fixing unread reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fix unread reservations' },
      { status: 500 }
    );
  }
} 