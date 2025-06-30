import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { BarberReward } from '@/lib/db/models';
import { getBarberRewardStatistics } from '@/lib/db/api/barberRewardEngine';

/**
 * GET /api/admin/barber-rewards - Get all barber rewards with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    
    // Build filter
    const filter: any = {};
    if (category) filter.category = category;
    if (isActive !== null) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [rewards, total, statistics] = await Promise.all([
      BarberReward.find(filter)
        .sort({ priority: 1, category: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BarberReward.countDocuments(filter),
      getBarberRewardStatistics()
    ]);
    
    return NextResponse.json({
      success: true,
      rewards,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      },
      statistics
    });
  } catch (error: any) {
    console.error('Error fetching barber rewards:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/barber-rewards - Create new barber reward
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      name,
      description,
      rewardType,
      rewardValue,
      requirementType,
      requirementValue,
      requirementDescription,
      category,
      priority,
      icon,
      color,
      validFrom,
      validUntil,
      maxRedemptions
    } = body;
    
    // Validation
    if (!name || !description || !rewardType || !rewardValue) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!requirementType || !requirementValue || !requirementDescription) {
      return NextResponse.json(
        { success: false, message: 'Missing requirement fields' },
        { status: 400 }
      );
    }
    
    const reward = new BarberReward({
      name,
      description,
      rewardType,
      rewardValue,
      requirementType,
      requirementValue,
      requirementDescription,
      category: category || 'milestone',
      priority: priority || 0,
      icon: icon || '🏆',
      color: color || 'bg-blue-500',
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      maxRedemptions: maxRedemptions || undefined
    });
    
    await reward.save();
    
    return NextResponse.json({
      success: true,
      message: 'Barber reward created successfully',
      reward
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating barber reward:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 