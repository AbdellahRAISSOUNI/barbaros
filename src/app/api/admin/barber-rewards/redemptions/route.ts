import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { BarberRewardRedemption } from '@/lib/db/models';
import { markRewardAsRedeemed } from '@/lib/db/api/barberRewardEngine';

/**
 * GET /api/admin/barber-rewards/redemptions - Get all barber reward redemptions
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // earned, redeemed, expired
    const barberId = searchParams.get('barberId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (barberId) filter.barberId = barberId;
    
    const skip = (page - 1) * limit;
    
    const [redemptions, total] = await Promise.all([
      BarberRewardRedemption.find(filter)
        .populate('barberId', 'name profilePicture')
        .populate('rewardId', 'name rewardType rewardValue category icon')
        .populate('redeemedBy', 'name')
        .sort({ earnedAt: -1 })
        .skip(skip)
        .limit(limit),
      BarberRewardRedemption.countDocuments(filter)
    ]);

    // Transform the data to include barber name and image for easier frontend use
    const transformedRedemptions = redemptions.map(redemption => ({
      _id: redemption._id,
      barberId: redemption.barberId._id,
      barberName: redemption.barberId.name,
      barberImage: redemption.barberId.profilePicture,
      rewardId: redemption.rewardId._id,
      rewardName: redemption.rewardId.name,
      rewardType: redemption.rewardId.rewardType,
      rewardValue: redemption.rewardId.rewardValue,
      status: redemption.status,
      earnedAt: redemption.earnedAt,
      redeemedAt: redemption.redeemedAt,
      redeemedBy: redemption.redeemedBy?.name,
      notes: redemption.notes
    }));
    
    // Get summary statistics
    const summaryStats = await BarberRewardRedemption.aggregate([
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
      expired: 0,
      total: 0
    };
    
    summaryStats.forEach(stat => {
      stats[stat._id as keyof typeof stats] = stat.count;
      stats.total += stat.count;
    });
    
    return NextResponse.json({
      success: true,
      redemptions: transformedRedemptions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      },
      statistics: stats
    });
  } catch (error: any) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/barber-rewards/redemptions - Mark reward as redeemed
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { redemptionId, adminId, notes } = body;
    
    if (!redemptionId || !adminId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const success = await markRewardAsRedeemed(redemptionId, adminId, notes);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to mark reward as redeemed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reward marked as redeemed successfully'
    });
  } catch (error: any) {
    console.error('Error marking reward as redeemed:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 