import { Reward, IReward, Service } from '../models';
import connectToDatabase from '../mongodb';

/**
 * Create a new reward
 */
export async function createReward(rewardData: Partial<IReward>) {
  try {
    await connectToDatabase();
    
    // Validate applicable services exist
    if (rewardData.applicableServices && rewardData.applicableServices.length > 0) {
      const services = await Service.find({ 
        _id: { $in: rewardData.applicableServices } 
      });
      
      if (services.length !== rewardData.applicableServices.length) {
        throw new Error('One or more selected services do not exist');
      }
    }
    
    const reward = new Reward(rewardData);
    await reward.save();
    
    // Populate services for response
    await reward.populate('applicableServices');
    
    return reward;
  } catch (error: any) {
    console.error('Error creating reward:', error);
    throw new Error(`Failed to create reward: ${error.message}`);
  }
}

/**
 * Get reward by ID
 */
export async function getRewardById(id: string) {
  try {
    await connectToDatabase();
    const reward = await Reward.findById(id).populate('applicableServices');
    return reward;
  } catch (error: any) {
    console.error('Error getting reward:', error);
    throw new Error(`Failed to get reward: ${error.message}`);
  }
}

/**
 * Update reward
 */
export async function updateReward(id: string, updateData: Partial<IReward>) {
  try {
    await connectToDatabase();
    
    // Validate applicable services exist if being updated
    if (updateData.applicableServices && updateData.applicableServices.length > 0) {
      const services = await Service.find({ 
        _id: { $in: updateData.applicableServices } 
      });
      
      if (services.length !== updateData.applicableServices.length) {
        throw new Error('One or more selected services do not exist');
      }
    }
    
    const reward = await Reward.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('applicableServices');
    
    return reward;
  } catch (error: any) {
    console.error('Error updating reward:', error);
    throw new Error(`Failed to update reward: ${error.message}`);
  }
}

/**
 * Delete reward
 */
export async function deleteReward(id: string) {
  try {
    await connectToDatabase();
    await Reward.findByIdAndDelete(id);
    return true;
  } catch (error: any) {
    console.error('Error deleting reward:', error);
    throw new Error(`Failed to delete reward: ${error.message}`);
  }
}

/**
 * List all rewards with pagination and filtering
 */
export async function listRewards(page = 1, limit = 10, filter: any = {}, search = '') {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Combine filters
    const finalFilter = { ...filter, ...searchFilter };
    
    const rewards = await Reward.find(finalFilter)
      .populate('applicableServices')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Reward.countDocuments(finalFilter);
    
    return {
      rewards,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error listing rewards:', error);
    throw new Error(`Failed to list rewards: ${error.message}`);
  }
}

/**
 * Toggle reward status
 */
export async function toggleRewardStatus(id: string) {
  try {
    await connectToDatabase();
    const reward = await Reward.findById(id);
    
    if (!reward) {
      throw new Error('Reward not found');
    }
    
    reward.isActive = !reward.isActive;
    await reward.save();
    
    return reward;
  } catch (error: any) {
    console.error('Error toggling reward status:', error);
    throw new Error(`Failed to toggle reward status: ${error.message}`);
  }
}

/**
 * Get active rewards
 */
export async function getActiveRewards() {
  try {
    await connectToDatabase();
    const rewards = await Reward.find({ isActive: true })
      .populate('applicableServices')
      .sort({ visitsRequired: 1 });
      
    return rewards;
  } catch (error: any) {
    console.error('Error getting active rewards:', error);
    throw new Error(`Failed to get active rewards: ${error.message}`);
  }
}

/**
 * Get rewards applicable for a client based on visit count
 */
export async function getClientEligibleRewards(visitCount: number) {
  try {
    await connectToDatabase();
    const rewards = await Reward.find({ 
      isActive: true,
      visitsRequired: { $lte: visitCount }
    })
    .populate('applicableServices')
    .sort({ visitsRequired: -1 });
      
    return rewards;
  } catch (error: any) {
    console.error('Error getting client eligible rewards:', error);
    throw new Error(`Failed to get client eligible rewards: ${error.message}`);
  }
}

/**
 * Check if a service is eligible for reward discount
 */
export async function checkServiceRewardEligibility(serviceId: string, visitCount: number) {
  try {
    await connectToDatabase();
    const eligibleRewards = await Reward.find({
      isActive: true,
      visitsRequired: { $lte: visitCount },
      applicableServices: serviceId
    }).sort({ visitsRequired: -1 });
    
    return eligibleRewards;
  } catch (error: any) {
    console.error('Error checking service reward eligibility:', error);
    throw new Error(`Failed to check service reward eligibility: ${error.message}`);
  }
}

/**
 * Get reward statistics
 */
export async function getRewardStatistics() {
  try {
    await connectToDatabase();
    
    const totalRewards = await Reward.countDocuments();
    const activeRewards = await Reward.countDocuments({ isActive: true });
    const freeRewards = await Reward.countDocuments({ rewardType: 'free' });
    const discountRewards = await Reward.countDocuments({ rewardType: 'discount' });
    
    // Get most popular rewards (by applicable services count)
    const popularRewards = await Reward.aggregate([
      { $match: { isActive: true } },
      { $addFields: { serviceCount: { $size: '$applicableServices' } } },
      { $sort: { serviceCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'services', localField: 'applicableServices', foreignField: '_id', as: 'services' } }
    ]);
    
    return {
      totalRewards,
      activeRewards,
      inactiveRewards: totalRewards - activeRewards,
      freeRewards,
      discountRewards,
      popularRewards
    };
  } catch (error: any) {
    console.error('Error getting reward statistics:', error);
    throw new Error(`Failed to get reward statistics: ${error.message}`);
  }
} 