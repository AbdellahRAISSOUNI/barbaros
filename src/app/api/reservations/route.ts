import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import { Reservation } from '@/lib/db/models';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isRead = searchParams.get('isRead');
    const source = searchParams.get('source');
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build query
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (isRead !== null && isRead !== 'all') query.isRead = isRead === 'true';
    if (source && source !== 'all') query.source = source;
    if (clientId) query.clientId = clientId; // Client-specific query
    
    // Get reservations with pagination
    const skip = (page - 1) * limit;
    const reservations = await Reservation.find(query)
      .populate('clientId', 'firstName lastName email phoneNumber')
      .populate('contactedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Reservation.countDocuments(query);
    const unreadCount = await Reservation.countDocuments({ isRead: false });
    const pendingCount = await Reservation.countDocuments({ status: 'pending' });
    
    return NextResponse.json({
      reservations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      },
      statistics: {
        total: totalCount,
        unread: unreadCount,
        pending: pendingCount
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { clientId, guestName, guestPhone, preferredDate, preferredTime, notes } = body;
    
    // Validation
    if (!preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Preferred date and time are required' },
        { status: 400 }
      );
    }
    
    // Check if it's a guest reservation or client reservation
    if (!clientId && (!guestName || !guestPhone)) {
      return NextResponse.json(
        { error: 'Guest name and phone number are required for guest reservations' },
        { status: 400 }
      );
    }
    
    // Validate date is in the future
    const reservationDate = new Date(preferredDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (reservationDate < now) {
      return NextResponse.json(
        { error: 'Reservation date must be in the future' },
        { status: 400 }
      );
    }
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(preferredTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      );
    }
    
    // Get request metadata
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Create reservation
    const reservationData: any = {
      preferredDate: reservationDate,
      preferredTime,
      notes: notes?.trim(),
      ipAddress,
      userAgent
    };
    
    if (clientId) {
      reservationData.clientId = clientId;
      reservationData.source = 'client_account';
    } else {
      reservationData.guestName = guestName.trim();
      reservationData.guestPhone = guestPhone.trim();
      reservationData.source = 'guest';
    }
    
    const reservation = new Reservation(reservationData);
    await reservation.save();
    
    // Populate the reservation for response
    await reservation.populate('clientId', 'firstName lastName email phoneNumber');
    
    return NextResponse.json({
      success: true,
      message: 'Reservation created successfully',
      reservation: {
        id: reservation._id,
        displayName: reservation.displayName,
        contactInfo: reservation.contactInfo,
        formattedDateTime: reservation.formattedDateTime,
        status: reservation.status,
        source: reservation.source,
        createdAt: reservation.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
} 