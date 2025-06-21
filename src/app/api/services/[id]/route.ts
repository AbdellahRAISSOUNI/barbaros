import { NextRequest, NextResponse } from 'next/server';
import { 
  getServiceById, 
  updateService, 
  deleteService,
  toggleServiceStatus 
} from '@/lib/db/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await getServiceById(params.id);
    
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service
    });
  } catch (error: any) {
    console.error('Error in GET /api/services/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, price, durationMinutes, categoryId, imageData, isActive } = body;

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

    const updateData: any = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      durationMinutes: parseInt(durationMinutes),
      categoryId,
      isActive: isActive !== undefined ? isActive : true
    };

    // Handle image upload if provided
    if (imageData) {
      updateData.imageUrl = imageData;
    }

    const service = await updateService(params.id, updateData);
    
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error: any) {
    console.error('Error in PUT /api/services/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteService(params.id);
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/services/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'toggle-status') {
      const service = await toggleServiceStatus(params.id);
      return NextResponse.json({
        success: true,
        message: 'Service status updated successfully',
        service
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/services/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 