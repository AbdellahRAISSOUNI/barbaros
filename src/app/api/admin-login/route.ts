import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Admin } from '@/lib/db/models';

/**
 * API endpoint to test admin login credentials
 */
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }
    
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin not found',
        },
        { status: 404 }
      );
    }
    
    // Check if the password is correct
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid password',
        },
        { status: 401 }
      );
    }
    
    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save();
    
    // Return success with admin info (excluding password)
    const adminInfo = {
      id: admin._id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      email: admin.email,
      active: admin.active,
      lastLogin: admin.lastLogin,
    };
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: adminInfo,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Login failed: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 }
    );
  }
} 