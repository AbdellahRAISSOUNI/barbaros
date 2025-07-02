import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import Client from '@/lib/db/models/client';
import bcrypt from 'bcrypt';

/**
 * PUT /api/admin/clients/[id]/password - Admin change client password
 * Allows admin to change client password without requiring current password
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has admin privileges
    if (!session?.user?.role || 
        (session.user.role !== 'admin' && 
         session.user.role !== 'owner' && 
         session.user.role !== 'receptionist')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: clientId } = await params;
    const { newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password (admin can change without current password)
    client.passwordHash = hashedNewPassword;
    await client.save();

    return NextResponse.json({
      success: true,
      message: 'Client password changed successfully'
    });
  } catch (error: any) {
    console.error('Error changing client password (admin):', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    );
  }
} 