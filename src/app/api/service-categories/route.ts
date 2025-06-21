import { NextRequest, NextResponse } from 'next/server';
import { 
  createServiceCategory, 
  listServiceCategories, 
  getActiveServiceCategories 
} from '@/lib/db/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const search = searchParams.get('search') || '';

    if (activeOnly) {
      const categories = await getActiveServiceCategories();
      return NextResponse.json({
        success: true,
        categories
      });
    }

    // Build filter
    let filter: any = {};
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await listServiceCategories(page, limit, filter);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error in GET /api/service-categories:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, displayOrder } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: 400 }
      );
    }

    const categoryData = {
      name: name.trim(),
      description: description.trim(),
      displayOrder: displayOrder || 0,
      isActive: true
    };

    const category = await createServiceCategory(categoryData);
    return NextResponse.json({
      success: true,
      message: 'Service category created successfully',
      category
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/service-categories:', error);
    
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