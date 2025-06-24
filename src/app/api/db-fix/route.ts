import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get the clients collection
    const clientsCollection = mongoose.connection.collection('clients');
    
    // Drop the email index
    await clientsCollection.dropIndex('email_1');
    
    return NextResponse.json({
      success: true,
      message: 'Successfully dropped email index',
    });
  } catch (error: any) {
    console.error('Error fixing database:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
} 