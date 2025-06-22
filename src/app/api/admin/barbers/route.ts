import { NextRequest, NextResponse } from 'next/server';
import { getAllBarbers, createBarber } from '@/lib/db/api/barberApi';

export async function GET(request: NextRequest) {
  try {
    const barbers = await getAllBarbers();
    
    return NextResponse.json({
      success: true,
      barbers,
    });
  } catch (error: any) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch barbers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      username, 
      password, 
      profilePicture, 
      phoneNumber 
    } = body;

    // Validate required fields
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: 'Name, email, username, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Prepare barber data (password will be hashed by the model's pre-save middleware)
    const barberData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      passwordHash: password, // Will be hashed by model middleware
      profilePicture: profilePicture || undefined,
      phoneNumber: phoneNumber?.trim() || undefined,
    };

    const newBarber = await createBarber(barberData);
    
    // Remove sensitive data from response
    const { passwordHash: _, ...barberResponse } = newBarber.toObject();

    return NextResponse.json({
      success: true,
      message: 'Barber created successfully',
      barber: barberResponse,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating barber:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create barber' },
      { status: 500 }
    );
  }
} 