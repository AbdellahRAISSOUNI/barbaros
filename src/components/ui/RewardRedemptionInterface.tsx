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
  const handleRedeemReward = async (rewardId: string, createSpecialVisit: boolean = false) => {
    try {
      setIsRedeeming(true);
      setSelectedRewardForRedemption(rewardId);

      const response = await fetch(`/api/loyalty/${clientId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId,
          redeemedBy: barberName,
          visitId,
          createSpecialVisit
        })
      });

      const data = await response.json();

      if (data.success) {
        const message = createSpecialVisit 
          ? `Reward redeemed successfully! Special visit created.` 
          : 'Reward redeemed successfully!';
        toast.success(message);
        setLoyaltyStatus(data.loyaltyStatus);
        
        if (onRedemptionComplete) {
          onRedemptionComplete({
            ...data.redemption,
            visitId: data.visitId,
            isSpecialVisit: createSpecialVisit
          });
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
    <div className={`bg-white rounded-xl shadow-md border border-stone-200/60 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white p-3 sm:p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FaGift className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Loyalty Rewards</h2>
              <p className="text-xs text-white/80">Manage client rewards</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {/* Selected Reward Progress - Moved to top */}
        {loyaltyStatus.selectedReward && (
          <div className="bg-gradient-to-br from-emerald-50 to-stone-50/50 rounded-lg border border-emerald-200/60 overflow-hidden">
            <div className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FaCrown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800">Current Goal</h3>
                  <p className="text-sm text-stone-600">{loyaltyStatus.selectedReward.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">Progress</span>
                <span className="text-sm font-medium text-stone-800">
                  {loyaltyStatus.currentProgressVisits} / {loyaltyStatus.selectedReward.visitsRequired} visits
                </span>
              </div>
              
              <div className="w-full bg-emerald-100 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${loyaltyStatus.progressPercentage}%` }}
                ></div>
              </div>

              {loyaltyStatus.canRedeem ? (
                <div className="bg-emerald-50 border border-emerald-200/60 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-800 font-medium">
                        <FaCheck className="w-4 h-4 text-emerald-600" />
                        <span>Ready to Redeem!</span>
                      </div>
                      <p className="text-sm text-emerald-600 mt-1">
                        Client has reached the milestone
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRedeemReward(loyaltyStatus.selectedReward!._id, false)}
                        disabled={isRedeeming && selectedRewardForRedemption === loyaltyStatus.selectedReward!._id}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isRedeeming && selectedRewardForRedemption === loyaltyStatus.selectedReward!._id 
                          ? 'Processing...' 
                          : 'Apply to Visit'
                        }
                      </button>
                      <button
                        onClick={() => handleRedeemReward(loyaltyStatus.selectedReward!._id, true)}
                        disabled={isRedeeming && selectedRewardForRedemption === loyaltyStatus.selectedReward!._id}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white rounded-lg hover:from-[#7A0000] hover:to-[#920000] transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isRedeeming && selectedRewardForRedemption === loyaltyStatus.selectedReward!._id 
                          ? 'Creating...' 
                          : 'Create Visit'
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-stone-600">
                  {loyaltyStatus.visitsToNextReward} more visit{loyaltyStatus.visitsToNextReward !== 1 ? 's' : ''} needed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loyalty Status Summary */}
        <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg border border-stone-200/60 p-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-stone-800">{loyaltyStatus.totalVisits}</div>
              <div className="text-xs sm:text-sm text-stone-600">Total Visits</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-stone-800">{loyaltyStatus.currentProgressVisits}</div>
              <div className="text-xs sm:text-sm text-stone-600">Current Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-stone-800">{loyaltyStatus.rewardsRedeemed}</div>
              <div className="text-xs sm:text-sm text-stone-600">Rewards Redeemed</div>
            </div>
          </div>
        </div>

        {/* Eligible Rewards */}
        {hasEligibleRewards && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-base font-semibold text-stone-800">Available Rewards</h3>
              <div className="text-xs bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg px-3 py-2 border border-stone-200/60">
                <div className="font-medium text-stone-700 mb-1">Redemption Options:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-stone-600">Apply to Visit: Use with current visit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#8B0000] rounded-full"></span>
                    <span className="text-stone-600">Create Visit: Make special reward visit</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {loyaltyStatus.eligibleRewards.map((reward) => {
                const hasEnoughVisits = loyaltyStatus.currentProgressVisits >= reward.visitsRequired;
                const totalVisitsCheck = loyaltyStatus.totalVisits >= reward.visitsRequired;
                const isEligibleForRedemption = hasEnoughVisits && totalVisitsCheck;
                const visitsNeeded = Math.max(0, reward.visitsRequired - loyaltyStatus.currentProgressVisits);
                
                return (
                  <div 
                    key={reward._id} 
                    className={`bg-gradient-to-br rounded-lg border transition-all ${
                      isEligibleForRedemption 
                        ? 'from-emerald-50 to-stone-50/50 border-emerald-200/60 hover:shadow-md' 
                        : 'from-stone-50 to-amber-50/30 border-stone-200/60'
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            reward.rewardType === 'free' 
                              ? 'bg-emerald-600' 
                              : 'bg-gradient-to-r from-[#8B0000] to-[#A31515]'
                          }`}>
                            {reward.rewardType === 'free' ? (
                              <FaGift className="w-4 h-4 text-white" />
                            ) : (
                              <FaPercentage className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-stone-800 truncate">{reward.name}</h4>
                            <p className="text-sm text-stone-600 mb-2 line-clamp-2">{reward.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="text-stone-600 bg-white/60 px-2 py-1 rounded-md border border-stone-200/60">
                                Required: {reward.visitsRequired} visits
                              </span>
                              <span className={`px-2 py-1 rounded-md font-medium ${
                                reward.rewardType === 'free' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {reward.rewardType === 'free' ? 'Free Service' : `${reward.discountPercentage}% Off`}
                              </span>
                              {isEligibleForRedemption ? (
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">
                                  ✓ Ready to Redeem
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-medium">
                                  ⚠️ Not Eligible
                                </span>
                              )}
                            </div>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-stone-600">
                                Applicable to: {reward.applicableServices.map(s => s.name).join(', ')}
                              </p>
                              <div className="text-xs text-stone-600 flex gap-3">
                                <span>Current: {loyaltyStatus.currentProgressVisits} visits</span>
                                <span>Total: {loyaltyStatus.totalVisits} visits</span>
                              </div>
                              {!isEligibleForRedemption && (
                                <p className="text-xs font-medium text-amber-600">
                                  ⚠️ Need {visitsNeeded} more visit{visitsNeeded !== 1 ? 's' : ''} to unlock
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:w-auto w-full">
                          {isEligibleForRedemption ? (
                            <>
                              <button
                                onClick={() => handleRedeemReward(reward._id, false)}
                                disabled={isRedeeming && selectedRewardForRedemption === reward._id}
                                className="flex-1 sm:w-[120px] px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                              >
                                {isRedeeming && selectedRewardForRedemption === reward._id 
                                  ? 'Processing...' 
                                  : 'Apply to Visit'
                                }
                              </button>
                              <button
                                onClick={() => handleRedeemReward(reward._id, true)}
                                disabled={isRedeeming && selectedRewardForRedemption === reward._id}
                                className="flex-1 sm:w-[120px] px-3 py-2 bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white rounded-lg hover:from-[#7A0000] hover:to-[#920000] transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                              >
                                {isRedeeming && selectedRewardForRedemption === reward._id 
                                  ? 'Creating...' 
                                  : 'Create Visit'
                                }
                              </button>
                            </>
                          ) : (
                            <div className="w-full sm:w-[120px] px-3 py-2 bg-stone-100 text-stone-500 rounded-lg text-center text-sm font-medium cursor-not-allowed">
                              Not Available
                            </div>
                          )}
                        </div>
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
          <div className="text-center py-6 bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg border border-stone-200/60">
            <div className="w-12 h-12 bg-white/60 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FaGift className="w-6 h-6 text-stone-400" />
            </div>
            <h3 className="text-base font-medium text-stone-800 mb-1">No Rewards Available</h3>
            <p className="text-sm text-stone-600">
              Client needs more visits to earn rewards. Current progress: {loyaltyStatus.currentProgressVisits} visits
            </p>
            {loyaltyStatus.selectedReward && (
              <p className="text-sm text-emerald-600 mt-2 font-medium">
                Working towards: {loyaltyStatus.selectedReward.name} 
                ({loyaltyStatus.visitsToNextReward} more visits needed)
              </p>
            )}
          </div>
        )}

        {/* Encourage Loyalty */}
        {!loyaltyStatus.selectedReward && loyaltyStatus.currentProgressVisits > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-stone-50/50 rounded-lg border border-amber-200/60 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <FaCrown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-stone-800">Encourage Goal Setting</h4>
                <p className="text-sm text-stone-600">
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