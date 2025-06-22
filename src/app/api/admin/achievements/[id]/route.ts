import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Achievement } from '@/lib/db/models';

/**
 * GET /api/admin/achievements/[id] - Get achievement by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const achievement = await Achievement.findById(id);
    
    if (!achievement) {
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      achievement
    });
  } catch (error: any) {
    console.error('Error fetching achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/achievements/[id] - Update achievement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategory,
      requirement,
      requirementType,
      requirementDetails,
      badge,
      color,
      icon,
      tier,
      points,
      reward,
      prerequisites,
      isRepeatable,
      maxCompletions,
      validFrom,
      validUntil,
      isActive
    } = body;
    
    // Validate required fields
    if (!title || !description || !category || !requirement || !requirementType || !tier || !points) {
      return NextResponse.json(
        { success: false, error: 'Title, description, category, requirement, requirementType, tier, and points are required' },
        { status: 400 }
      );
    }
    
    if (requirement < 1) {
      return NextResponse.json(
        { success: false, error: 'Requirement must be at least 1' },
        { status: 400 }
      );
    }
    
    if (points < 1) {
      return NextResponse.json(
        { success: false, error: 'Points must be at least 1' },
        { status: 400 }
      );
    }
    
    const updateData = {
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory?.trim(),
      requirement: parseInt(requirement),
      requirementType,
      requirementDetails,
      badge: badge || '🎯',
      color: color || 'bg-blue-500',
      icon: icon || 'FaTrophy',
      tier,
      points: parseInt(points),
      reward,
      prerequisites,
      isRepeatable: isRepeatable || false,
      maxCompletions: maxCompletions ? parseInt(maxCompletions) : undefined,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      isActive: isActive !== false
    };
    
    const achievement = await Achievement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!achievement) {
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      achievement,
      message: 'Achievement updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/achievements/[id] - Delete achievement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const achievement = await Achievement.findByIdAndDelete(id);
    
    if (!achievement) {
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 