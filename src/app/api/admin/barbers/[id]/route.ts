import { NextRequest, NextResponse } from 'next/server';
import { getBarberById, updateBarber } from '@/lib/db/api/barberApi';
import { Admin } from '@/lib/db/models';
import connectToDatabase from '@/lib/db/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const barber = await getBarberById(id);
    
    if (!barber) {
      return NextResponse.json(
        { error: 'Barber not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      barber,
    });
  } catch (error: any) {
    console.error('Error fetching barber:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch barber' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      email, 
      profilePicture, 
      phoneNumber,
      active 
    } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber?.trim() || undefined;
    if (active !== undefined) updateData.active = active;

    const updatedBarber = await updateBarber(id, updateData);
    
    if (!updatedBarber) {
      return NextResponse.json(
        { error: 'Barber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Barber updated successfully',
      barber: updatedBarber,
    });

  } catch (error: any) {
    console.error('Error updating barber:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update barber' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';
    
    await connectToDatabase();
    
    if (permanent) {
      // Permanently delete the barber from database
      const deletedBarber = await Admin.findOneAndDelete({ 
        _id: id, 
        role: 'barber' 
      });
      
      if (!deletedBarber) {
        return NextResponse.json(
          { error: 'Barber not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Barber permanently deleted from database',
      });
    } else {
      // Deactivate the barber account (soft delete)
      const barber = await Admin.findOneAndUpdate(
        { _id: id, role: 'barber' },
        { active: false },
        { new: true }
      ).select('-passwordHash');
      
      if (!barber) {
        return NextResponse.json(
          { error: 'Barber not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Barber deactivated successfully',
        barber,
      });
    }

  } catch (error: any) {
    console.error('Error processing barber deletion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process barber deletion' },
      { status: 500 }
    );
  }
} 