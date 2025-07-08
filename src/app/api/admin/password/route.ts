import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Admin from '@/lib/db/models/admin';
import bcrypt from 'bcrypt';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both current and new passwords are required' }, { status: 400 });
    }

    const admin = await Admin.findById(session.user.id);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = hashedPassword;
    await admin.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating admin password:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 