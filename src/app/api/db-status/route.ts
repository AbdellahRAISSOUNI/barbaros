import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';

/**
 * API endpoint to check database connection status
 */
export async function GET() {
  try {
    // Connect to the database
    const mongoose = await connectToDatabase();
    
    // Check connection state
    const status = mongoose.connection.readyState;
    let statusText = 'unknown';
    let connected = false;
    
    switch (status) {
      case 0:
        statusText = 'disconnected';
        connected = false;
        break;
      case 1:
        statusText = 'connected';
        connected = true;
        break;
      case 2:
        statusText = 'connecting';
        connected = false;
        break;
      case 3:
        statusText = 'disconnecting';
        connected = false;
        break;
    }
    
    // Get database name if connected
    const databaseName = connected ? mongoose.connection.db?.databaseName || 'unknown' : 'none';
    
    return NextResponse.json({
      success: true,
      connected,
      data: {
        status,
        statusText,
        databaseName
      }
    });
  } catch (error: any) {
    console.error('Database status check error:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        message: `Failed to check database status: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 }
    );
  }
} 