'use client';

import { useState, useEffect } from 'react';
import { FaGift, FaTrophy, FaCalendarAlt, FaHistory, FaBullseye, FaUsers, FaCrown, FaFire } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

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

interface RewardHistory {
  visitId: string;
  visitDate: string;
  rewardRedeemed: {
    rewardId: string;
    rewardName: string;
    rewardType: 'free' | 'discount';
    discountPercentage?: number;
    redeemedAt: string;
    redeemedBy: string;
  };
  totalPrice: number;
  services: any[];
}

interface LoyaltyDashboardProps {
  clientId: string;
}

export default function LoyaltyDashboard({ clientId }: LoyaltyDashboardProps) {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRewardSelection, setShowRewardSelection] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch loyalty data - optimized to load critical data first, then details
  const fetchLoyaltyData = async () => {
    try {
      setIsLoading(true);
      
      // First, load just the essential loyalty status for immediate display
      const statusResponse = await fetch(`/api/loyalty/${clientId}`);
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setLoyaltyStatus(statusData.loyaltyStatus);
        setIsLoading(false); // Show basic info immediately
        
        // Then load additional data in background
        const [rewardsRes, historyRes] = await Promise.all([
          fetch(`/api/loyalty/${clientId}/rewards`),
          fetch(`/api/loyalty/${clientId}/history`)
        ]);

        const rewardsData = await rewardsRes.json();
        const historyData = await historyRes.json();

      if (rewardsData.success) {
        setAvailableRewards(rewardsData.rewards);
      }

      if (historyData.success) {
        setRewardHistory(historyData.history);
        }
      } else {
        throw new Error(statusData.message || 'Failed to load loyalty status');
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error('Failed to load loyalty information');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchLoyaltyData();
    }
  }, [clientId]);

  // Select a reward
  const handleSelectReward = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/loyalty/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId })
      });

      const data = await response.json();

      if (data.success) {
        setLoyaltyStatus(data.loyaltyStatus);
        setShowRewardSelection(false);
        toast.success('Reward goal selected successfully!');
      } else {
        toast.error(data.message || 'Failed to select reward');
      }
    } catch (error) {
      console.error('Error selecting reward:', error);
      toast.error('Failed to select reward');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'milestone_reached': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <FaUsers className="w-4 h-4" />;
      case 'active': return <FaFire className="w-4 h-4" />;
      case 'milestone_reached': return <FaCrown className="w-4 h-4" />;
      case 'inactive': return <FaUsers className="w-4 h-4" />;
      default: return <FaUsers className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <FaGift className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loyalty Information Not Available</h3>
            <p className="text-gray-600">Unable to load your loyalty status at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loyalty Status Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <FaTrophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Loyalty Status</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(loyaltyStatus.client.loyaltyStatus)} text-gray-800`}>
                {getStatusIcon(loyaltyStatus.client.loyaltyStatus)}
                <span className="capitalize">{loyaltyStatus.client.loyaltyStatus.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{loyaltyStatus.totalVisits}</div>
            <div className="text-purple-200">Total Visits</div>
          </div>
        </div>
      </div>

      {/* Current Progress */}
      {loyaltyStatus.selectedReward ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                                <FaBullseye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Goal</h3>
              <p className="text-gray-600">Working towards your selected reward</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-800 mb-2">{loyaltyStatus.selectedReward.name}</h4>
            <p className="text-green-600 text-sm mb-3">{loyaltyStatus.selectedReward.description}</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Progress</span>
              <span className="text-sm font-medium text-green-800">
                {loyaltyStatus.currentProgressVisits} / {loyaltyStatus.selectedReward.visitsRequired} visits
              </span>
            </div>
            
            <div className="w-full bg-green-200 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${loyaltyStatus.progressPercentage}%` }}
              ></div>
            </div>

            {loyaltyStatus.canRedeem ? (
              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <FaCrown className="w-4 h-4" />
                  <span className="font-medium">Milestone Reached!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Visit the barbershop to redeem your reward!
                </p>
              </div>
            ) : (
              <p className="text-green-700 text-sm">
                Only {loyaltyStatus.visitsToNextReward} more visit{loyaltyStatus.visitsToNextReward !== 1 ? 's' : ''} to go!
              </p>
            )}
          </div>

          <button
            onClick={() => setShowRewardSelection(true)}
            className="w-full px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
          >
            Change Reward Goal
          </button>
        </div>
      ) : (
        /* No Reward Selected */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
              <FaGift className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Reward Goal</h3>
            <p className="text-gray-600 mb-4">
              Select a reward to start working towards and track your progress
            </p>
            <button
              onClick={() => setShowRewardSelection(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
            >
              Select Reward Goal
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaCalendarAlt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Progress</p>
              <p className="text-2xl font-bold text-gray-900">{loyaltyStatus.currentProgressVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaTrophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rewards Earned</p>
              <p className="text-2xl font-bold text-gray-900">{loyaltyStatus.rewardsRedeemed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaGift className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Rewards</p>
              <p className="text-2xl font-bold text-gray-900">{loyaltyStatus.eligibleRewards.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center justify-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaHistory className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">View Reward History</span>
        </button>

        <button
          onClick={() => setShowRewardSelection(true)}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
        >
          <FaGift className="w-5 h-5" />
          <span className="font-medium">Browse Rewards</span>
        </button>
      </div>

      {/* Reward Selection Modal */}
      {showRewardSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Select Your Reward Goal</h2>
                <p className="text-sm text-gray-600">Choose a reward to work towards</p>
              </div>
              <button
                onClick={() => setShowRewardSelection(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRewards.map((reward) => (
                  <div
                    key={reward._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSelectReward(reward._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        reward.rewardType === 'free' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <FaGift className={`w-5 h-5 ${
                          reward.rewardType === 'free' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{reward.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-600">
                            {reward.visitsRequired} visits required
                          </span>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            reward.rewardType === 'free' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {reward.rewardType === 'free' ? 'Free' : `${reward.discountPercentage}% Off`}
                          </div>
                        </div>
                        {loyaltyStatus.currentProgressVisits >= reward.visitsRequired && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            ✓ You can redeem this reward now!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {availableRewards.length === 0 && (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <FaGift className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Available</h3>
                  <p className="text-gray-600">Check back later for new rewards!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Reward History</h2>
                <p className="text-sm text-gray-600">Your redeemed rewards</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {rewardHistory.length > 0 ? (
                <div className="space-y-4">
                  {rewardHistory.map((history) => (
                    <div key={history.visitId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{history.rewardRedeemed.rewardName}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(history.visitDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Redeemed by: {history.rewardRedeemed.redeemedBy}</span>
                        <span>Visit Total: ${history.totalPrice}</span>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          history.rewardRedeemed.rewardType === 'free' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {history.rewardRedeemed.rewardType === 'free' 
                            ? 'Free Service' 
                            : `${history.rewardRedeemed.discountPercentage}% Discount`
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <FaHistory className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reward History</h3>
                  <p className="text-gray-600">You haven&apos;t redeemed any rewards yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 