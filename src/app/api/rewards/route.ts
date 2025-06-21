import { NextRequest, NextResponse } from 'next/server';
import { createReward, listRewards } from '@/lib/db/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const rewardType = searchParams.get('rewardType') || '';
    const isActive = searchParams.get('isActive');

    // Build filter
    const filter: any = {};
    if (rewardType) {
      filter.rewardType = rewardType;
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const result = await listRewards(page, limit, filter, search);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error in GET /api/rewards:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      visitsRequired, 
      rewardType, 
      discountPercentage,
      applicableServices,
      maxRedemptions,
      validForDays 
    } = body;

    // Validate required fields
    if (!name || !description || !visitsRequired || !rewardType) {
      return NextResponse.json(
        { success: false, message: 'Name, description, visits required, and reward type are required' },
        { status: 400 }
      );
    }

    if (visitsRequired < 1) {
      return NextResponse.json(
        { success: false, message: 'Visits required must be at least 1' },
        { status: 400 }
      );
    }

    // Validate discount rewards
    if (rewardType === 'discount') {
      if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
        return NextResponse.json(
          { success: false, message: 'Discount percentage must be between 1 and 100 for discount rewards' },
          { status: 400 }
        );
      }
    }

    // Validate applicable services
    if (!applicableServices || applicableServices.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one applicable service must be selected' },
        { status: 400 }
      );
    }

    const rewardData: any = {
      name: name.trim(),
      description: description.trim(),
      visitsRequired: parseInt(visitsRequired),
      rewardType,
      applicableServices,
      isActive: true
    };

    if (rewardType === 'discount') {
      rewardData.discountPercentage = parseInt(discountPercentage);
    }

    if (maxRedemptions) {
      rewardData.maxRedemptions = parseInt(maxRedemptions);
    }

    if (validForDays) {
      rewardData.validForDays = parseInt(validForDays);
    }

    const reward = await createReward(rewardData);
    return NextResponse.json({
      success: true,
      message: 'Reward created successfully',
      reward
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/rewards:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 