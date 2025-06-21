import { NextRequest, NextResponse } from 'next/server';
import { createService, listServices } from '@/lib/db/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const isActive = searchParams.get('isActive');

    // Build filter
    let filter: any = {};
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const result = await listServices(page, limit, filter, search);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error in GET /api/services:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, durationMinutes, categoryId, imageData } = body;

    if (!name || !description || !price || !durationMinutes || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (price < 0 || durationMinutes < 1) {
      return NextResponse.json(
        { success: false, message: 'Price must be non-negative and duration must be at least 1 minute' },
        { status: 400 }
      );
    }

    const serviceData: any = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      durationMinutes: parseInt(durationMinutes),
      categoryId,
      isActive: true,
      popularityScore: 0
    };

    // Handle image upload if provided
    if (imageData) {
      try {
        // Store base64 image data directly in MongoDB
        serviceData.imageUrl = imageData;
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        // Continue without image if there's an error
      }
    }

    const service = await createService(serviceData);
    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      service
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/services:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 