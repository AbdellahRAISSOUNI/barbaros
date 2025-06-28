'use client';

import { useState, useEffect } from 'react';
import { FaGift, FaPercentage, FaCrown, FaUsers, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingAnimation from './LoadingAnimation';

interface Service {
  _id: string;
  name: string;
  category?: {
    name: string;
  };
  price: number;
}

interface Reward {
  _id: string;
  name: string;
  description: string;
  visitsRequired: number;
  rewardType: 'free' | 'discount';
  discountPercentage?: number;
  applicableServices: Service[];
  maxRedemptions?: number;
  validForDays?: number;
  isActive: boolean;
}

interface LoyaltyStatus {
  client: any;
  selectedReward?: Reward;
  eligibleRewards: Reward[];
  visitsToNextReward: number;
  progressPercentage: number;
  canRedeem: boolean;
  totalVisits: number;
  currentProgressVisits: number;
  rewardsRedeemed: number;
  milestoneReached: boolean;
}

interface RewardRedemptionInterfaceProps {
  clientId: string;
  visitId?: string;
  barberName: string;
  onRedemptionComplete?: (redemption: any) => void;
  onClose?: () => void;
  className?: string;
}

export default function RewardRedemptionInterface({ 
  clientId, 
  visitId, 
  barberName, 
  onRedemptionComplete,
  onClose,
  className = ''
}: RewardRedemptionInterfaceProps) {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedRewardForRedemption, setSelectedRewardForRedemption] = useState<string | null>(null);

  // Fetch loyalty status
  const fetchLoyaltyStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/loyalty/${clientId}`);
      const data = await response.json();

      if (data.success) {
        setLoyaltyStatus(data.loyaltyStatus);
      } else {
        toast.error('Failed to load loyalty status');
      }
    } catch (error) {
      console.error('Error fetching loyalty status:', error);
      toast.error('Failed to load loyalty status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchLoyaltyStatus();
    }
  }, [clientId]);

  // Redeem a reward
  const handleRedeemReward = async (rewardId: string) => {
    try {
      setIsRedeeming(true);
      setSelectedRewardForRedemption(rewardId);

      const response = await fetch(`/api/loyalty/${clientId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId,
          redeemedBy: barberName,
          visitId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward redeemed successfully!');
        setLoyaltyStatus(data.loyaltyStatus);
        
        if (onRedemptionComplete) {
          onRedemptionComplete(data.redemption);
        }
      } else {
        toast.error(data.message || 'Failed to redeem reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    } finally {
      setIsRedeeming(false);
      setSelectedRewardForRedemption(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <LoadingAnimation size="lg" />
      </div>
    );
  }

  if (!loyaltyStatus) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <FaUsers className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loyalty Status Not Available</h3>
            <p className="text-gray-600">Unable to load client&apos;s loyalty information.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasEligibleRewards = loyaltyStatus.eligibleRewards.length > 0;
  const hasSelectedRewardReady = loyaltyStatus.selectedReward && loyaltyStatus.canRedeem;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 lg:p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaGift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">Loyalty Rewards</h2>
              <p className="text-purple-100 text-sm">Manage client reward redemptions</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Loyalty Status Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">{loyaltyStatus.totalVisits}</div>
              <div className="text-sm text-purple-600">Total Visits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">{loyaltyStatus.currentProgressVisits}</div>
              <div className="text-sm text-purple-600">Current Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">{loyaltyStatus.rewardsRedeemed}</div>
              <div className="text-sm text-purple-600">Rewards Redeemed</div>
            </div>
          </div>
        </div>

        {/* Selected Reward Progress */}
        {loyaltyStatus.selectedReward && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FaCrown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Current Goal</h3>
                <p className="text-sm text-green-600">{loyaltyStatus.selectedReward.name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Progress</span>
              <span className="text-sm font-medium text-green-800">
                {loyaltyStatus.currentProgressVisits} / {loyaltyStatus.selectedReward.visitsRequired} visits
              </span>
            </div>
            
            <div className="w-full bg-green-200 rounded-full h-2 mb-3">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${loyaltyStatus.progressPercentage}%` }}
              ></div>
            </div>

            {loyaltyStatus.canRedeem ? (
              <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <FaCheck className="w-4 h-4" />
                      <span>Ready to Redeem!</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      Client has reached the milestone for this reward
                    </p>
                  </div>
                  <button
                    onClick={() => handleRedeemReward(loyaltyStatus.selectedReward!._id)}
                    disabled={isRedeeming && selectedRewardForRedemption === loyaltyStatus.selectedReward!._id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedeeming && selectedRewardForRedemption === loyaltyStatus.selectedReward!._id 
                      ? 'Redeeming...' 
                      : 'Redeem Now'
                    }
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-green-700 text-sm">
                {loyaltyStatus.visitsToNextReward} more visit{loyaltyStatus.visitsToNextReward !== 1 ? 's' : ''} needed
              </p>
            )}
          </div>
        )}

        {/* Eligible Rewards */}
        {hasEligibleRewards && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Rewards</h3>
            <div className="space-y-3">
              {loyaltyStatus.eligibleRewards.map((reward) => {
                // Double check eligibility: client must have enough visits AND visits must be >= required
                const hasEnoughVisits = loyaltyStatus.currentProgressVisits >= reward.visitsRequired;
                const totalVisitsCheck = loyaltyStatus.totalVisits >= reward.visitsRequired;
                const isEligibleForRedemption = hasEnoughVisits && totalVisitsCheck;
                const visitsNeeded = Math.max(0, reward.visitsRequired - loyaltyStatus.currentProgressVisits);
                
                return (
                  <div key={reward._id} className={`border rounded-lg p-4 transition-all ${
                    isEligibleForRedemption 
                      ? 'border-green-200 bg-green-50 hover:shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          reward.rewardType === 'free' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {reward.rewardType === 'free' ? (
                            <FaGift className="w-5 h-5 text-green-600" />
                          ) : (
                            <FaPercentage className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{reward.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              Required: {reward.visitsRequired} visits
                            </span>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              reward.rewardType === 'free' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {reward.rewardType === 'free' ? 'Free Service' : `${reward.discountPercentage}% Off`}
                            </div>
                            {isEligibleForRedemption ? (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Ready to Redeem
                              </div>
                            ) : (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                ⚠️ Not Eligible
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              Applicable to: {reward.applicableServices.map(s => s.name).join(', ')}
                            </p>
                            <div className="text-xs text-gray-500 mt-1 space-y-1">
                              <p>Current Progress: {loyaltyStatus.currentProgressVisits} visits</p>
                              <p>Total Lifetime: {loyaltyStatus.totalVisits} visits</p>
                            </div>
                            {!isEligibleForRedemption && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Need {visitsNeeded} more visit{visitsNeeded !== 1 ? 's' : ''} to unlock
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isEligibleForRedemption ? (
                          <button
                            onClick={() => handleRedeemReward(reward._id)}
                            disabled={isRedeeming && selectedRewardForRedemption === reward._id}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRedeeming && selectedRewardForRedemption === reward._id 
                              ? 'Redeeming...' 
                              : 'Redeem Now'
                            }
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                            Not Available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Rewards Available */}
        {!hasEligibleRewards && !hasSelectedRewardReady && (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
              <FaGift className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Available</h3>
            <p className="text-gray-600">
              Client needs more visits to earn rewards. Current progress: {loyaltyStatus.currentProgressVisits} visits
            </p>
            {loyaltyStatus.selectedReward && (
              <p className="text-sm text-purple-600 mt-2">
                Working towards: {loyaltyStatus.selectedReward.name} 
                ({loyaltyStatus.visitsToNextReward} more visits needed)
              </p>
            )}
          </div>
        )}

        {/* Encourage Loyalty */}
        {!loyaltyStatus.selectedReward && loyaltyStatus.currentProgressVisits > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaCrown className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-800">Encourage Goal Setting</h4>
                <p className="text-yellow-600 text-sm">
                  Client has {loyaltyStatus.currentProgressVisits} visits but no reward goal selected. 
                  Suggest they choose a reward in their app!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 