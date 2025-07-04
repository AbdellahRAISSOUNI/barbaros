import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db/mongodb';
import { Admin } from '@/lib/db/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { scannerEnabled } = await request.json();
    
    if (typeof scannerEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'scannerEnabled must be a boolean' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Await params before using its properties
    const { id } = await params;

    const barber = await Admin.findOneAndUpdate(
      { _id: id, role: 'barber' },
      { scannerEnabled },
      { new: true }
    ).select('-passwordHash');

    if (!barber) {
      return NextResponse.json(
        { success: false, message: 'Barber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      barber: {
        _id: barber._id,
        name: barber.name,
        scannerEnabled: barber.scannerEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating barber scanner permission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update scanner permission' },
      { status: 500 }
    );
  }
} 