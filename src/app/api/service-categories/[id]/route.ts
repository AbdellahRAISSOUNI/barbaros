import { NextRequest, NextResponse } from 'next/server';
import { 
  getServiceCategoryById, 
  updateServiceCategory, 
  deleteServiceCategory,
  toggleServiceCategoryStatus 
} from '@/lib/db/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getServiceCategoryById(params.id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Service category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error: any) {
    console.error('Error in GET /api/service-categories/[id]:', error);
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
    const { name, description, displayOrder, isActive } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: 400 }
      );
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      displayOrder,
      isActive
    };

    const category = await updateServiceCategory(params.id, updateData);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Service category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service category updated successfully',
      category
    });
  } catch (error: any) {
    console.error('Error in PUT /api/service-categories/[id]:', error);
    
    if (error.message.includes('duplicate key') || error.message.includes('E11000')) {
      return NextResponse.json(
        { success: false, message: 'Category name already exists' },
        { status: 400 }
      );
    }
    
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
    await deleteServiceCategory(params.id);
    return NextResponse.json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/service-categories/[id]:', error);
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
      const category = await toggleServiceCategoryStatus(params.id);
      return NextResponse.json({
        success: true,
        message: 'Category status updated successfully',
        category
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/service-categories/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 