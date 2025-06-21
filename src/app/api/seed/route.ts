import { NextResponse } from 'next/server';
import { seedDatabase, clearDatabase } from '@/lib/db/seed';

/**
 * API endpoint to seed the database with sample data
 * This endpoint should only be used in development
 */
export async function POST(request: Request) {
  // Always allow in development or when explicitly forced
  // This is useful for initial setup in any environment
  try {
    // Parse the request body
    const body = await request.json().catch(() => ({}));
    const { action, force } = body;
    
    // Only enforce environment check if not forced
    if (!force && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        {
          success: false,
          message: 'This endpoint is only available in development mode unless forced',
        },
        { status: 403 }
      );
    }

    console.log(`Processing seed API request with action: ${action || 'seed'}`);
    
    if (action === 'clear') {
      // Clear the database
      console.log('Clearing database...');
      const result = await clearDatabase();
      return NextResponse.json(result);
    } else {
      // Seed the database
      console.log('Seeding database...');
      const result = await seedDatabase();
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error('Error in seed endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Error in seed endpoint: ${error.message}`,
        error: error.toString(),
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 