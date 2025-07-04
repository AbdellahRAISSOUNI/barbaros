import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db/mongodb';
import { Admin } from '@/lib/db/models';

export async function PUT(request: NextRequest) {
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

    // Update all barbers' scanner permissions
    const result = await Admin.updateMany(
      { role: 'barber' },
      { scannerEnabled }
    );

    // Get updated barbers
    const updatedBarbers = await Admin.find({ role: 'barber' })
      .select('-passwordHash')
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      message: `Scanner ${scannerEnabled ? 'enabled' : 'disabled'} for all barbers`,
      modifiedCount: result.modifiedCount,
      barbers: updatedBarbers.map(barber => ({
        _id: barber._id,
        name: barber.name,
        scannerEnabled: barber.scannerEnabled,
      })),
    });
  } catch (error) {
    console.error('Error updating all barbers scanner permission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update scanner permissions for all barbers' },
      { status: 500 }
    );
  }
} 