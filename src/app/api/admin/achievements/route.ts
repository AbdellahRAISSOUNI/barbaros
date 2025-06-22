import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Achievement } from '@/lib/db/models';

/**
 * GET /api/admin/achievements - Get all achievements
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    
    const filter: any = {};
    if (category) filter.category = category;
    if (isActive !== null) filter.isActive = isActive === 'true';
    
    const achievements = await Achievement.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      achievements
    });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/achievements - Create a new achievement
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
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
    
    const achievement = new Achievement({
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
    });
    
    await achievement.save();
    
    return NextResponse.json({
      success: true,
      achievement,
      message: 'Achievement created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 