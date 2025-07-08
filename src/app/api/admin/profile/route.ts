import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Admin from '@/lib/db/models/admin';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      session.user.id,
      { email },
      { new: true, select: '-passwordHash' }
    );

    if (!updatedAdmin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin email:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 