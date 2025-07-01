import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { BarberReward, BarberRewardRedemption } from '@/lib/db/models';
import mongoose from 'mongoose';

/**
 * GET /api/admin/barber-rewards/[id] - Get specific barber reward
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const reward = await BarberReward.findById(id);
    
    if (!reward) {
      return NextResponse.json(
        { success: false, message: 'Reward not found' },
        { status: 404 }
      );
    }
    
    // Get redemption statistics for this reward
    const redemptionStats = await BarberRewardRedemption.aggregate([
      { $match: { rewardId: reward._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      earned: 0,
      redeemed: 0,
      expired: 0
    };
    
    redemptionStats.forEach(stat => {
      stats[stat._id as keyof typeof stats] = stat.count;
    });
    
    return NextResponse.json({
      success: true,
      reward,
      redemptionStats: stats
    });
  } catch (error: any) {
    console.error('Error fetching barber reward:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/barber-rewards/[id] - Update barber reward
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
      isActive,
      validFrom,
      validUntil,
      maxRedemptions
    } = body;
    
    const updateData: any = {
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
      color
    };
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    
    if (validFrom) updateData.validFrom = new Date(validFrom);
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (maxRedemptions) updateData.maxRedemptions = maxRedemptions;
    
    const reward = await BarberReward.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
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
    console.error('Error updating barber reward:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/barber-rewards/[id] - Delete barber reward
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reward ID format' },
        { status: 400 }
      );
    }
    
    // Check if reward has any redemptions
    const redemptionCount = await BarberRewardRedemption.countDocuments({
      rewardId: id
    });
    
    if (redemptionCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete reward with existing redemptions. Deactivate it instead.' 
        },
        { status: 400 }
      );
    }
    
    const reward = await BarberReward.findByIdAndDelete(id);
    
    if (!reward) {
      return NextResponse.json(
        { success: false, message: 'Reward not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting barber reward:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 