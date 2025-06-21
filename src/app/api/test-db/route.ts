import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';

/**
 * API endpoint to test database connection and retrieve some data
 */
export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Not set');
    
    // Try to connect to the database
    const mongooseInstance = await connectToDatabase();
    
    // Get connection state
    const connectionState = mongooseInstance.connection.readyState;
    let stateText;
    
    switch (connectionState) {
      case 0:
        stateText = 'disconnected';
        break;
      case 1:
        stateText = 'connected';
        break;
      case 2:
        stateText = 'connecting';
        break;
      case 3:
        stateText = 'disconnecting';
        break;
      default:
        stateText = 'unknown';
    }
    
    // Get connection details
    const connectionDetails = {
      host: mongooseInstance.connection.host || 'unknown',
      port: mongooseInstance.connection.port || 'unknown',
      name: mongooseInstance.connection.name || 'unknown',
      db: mongooseInstance.connection.db?.databaseName || 'unknown',
    };
    
    // List collections if connected
    const collections: string[] = [];
    if (connectionState === 1 && mongooseInstance.connection.db) {
      try {
        const collectionList = await mongooseInstance.connection.db.listCollections().toArray();
        collectionList.forEach(col => {
          if (col.name) collections.push(col.name);
        });
      } catch (error) {
        console.error('Error listing collections:', error);
      }
    }
    
    // Get models
    const models = Object.keys(mongooseInstance.models);
    
    return NextResponse.json({
      success: true,
      connectionState,
      stateText,
      connectionDetails,
      collections,
      models,
      mongooseVersion: mongoose.version,
      nodeVersion: process.version,
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
} 