import { NextRequest, NextResponse } from 'next/server';
import { getRewardById, updateReward, deleteReward, toggleRewardStatus } from '@/lib/db/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reward = await getRewardById(id);
    
    if (!reward) {
      return NextResponse.json(
        { success: false, message: 'Reward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reward
    });
  } catch (error: any) {
    console.error('Error in GET /api/rewards/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updateData: any = {
      name: name.trim(),
      description: description.trim(),
      visitsRequired: parseInt(visitsRequired),
      rewardType,
      applicableServices
    };

    if (rewardType === 'discount') {
      updateData.discountPercentage = parseInt(discountPercentage);
    } else {
      updateData.discountPercentage = undefined;
    }

    if (maxRedemptions) {
      updateData.maxRedemptions = parseInt(maxRedemptions);
    } else {
      updateData.maxRedemptions = null;
    }

    if (validForDays) {
      updateData.validForDays = parseInt(validForDays);
    } else {
      updateData.validForDays = null;
    }

    const reward = await updateReward(id, updateData);
    
    if (!reward) {
      return NextResponse.json(
        { success: false, message: 'Reward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reward updated successfully',
      reward
    });
  } catch (error: any) {
    console.error('Error in PUT /api/rewards/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteReward(id);

    return NextResponse.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/rewards/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'toggle-status') {
      const reward = await toggleRewardStatus(id);
      
      if (!reward) {
        return NextResponse.json(
          { success: false, message: 'Reward not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Reward ${reward.isActive ? 'activated' : 'deactivated'} successfully`,
        reward
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/rewards/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 