'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaGift, FaStar, FaHistory, FaCalendar, FaTrophy, FaFire, FaCheckCircle, FaClock, FaPercentage, FaMagic } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface LoyaltyStatus {
  client: any;
  selectedReward?: any;
  eligibleRewards: any[];
  visitsToNextReward: number;
  progressPercentage: number;
  canRedeem: boolean;
  totalVisits: number;
  currentProgressVisits: number;
  rewardsRedeemed: number;
  milestoneReached: boolean;
}

interface RewardHistory {
  _id: string;
  rewardName: string;
  redeemedAt: string;
  redeemedBy: string;
  discountApplied?: number;
}

export default function RewardsPage() {
  const { data: session } = useSession();
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLoyaltyData();
    }
  }, [session]);

  const fetchLoyaltyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch loyalty status
      const loyaltyResponse = await fetch(`/api/loyalty/${session?.user?.id}`);
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        if (loyaltyData.success) {
          setLoyaltyStatus(loyaltyData.loyaltyStatus);
        }
      }

      // Fetch available rewards
      const rewardsResponse = await fetch(`/api/loyalty/${session?.user?.id}/rewards`);
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        if (rewardsData.success) {
          setAvailableRewards(Array.isArray(rewardsData.rewards) ? rewardsData.rewards : []);
        }
      }

      // Fetch reward history
      const historyResponse = await fetch(`/api/loyalty/${session?.user?.id}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setRewardHistory(Array.isArray(historyData.history) ? historyData.history : []);
        }
      }

    } catch (err) {
      console.error('Error fetching loyalty data:', err);
      setError('Failed to load rewards data');
    } finally {
      setIsLoading(false);
    }
  };

  const selectReward = async (rewardId: string) => {
    try {
      setIsSelecting(true);
      const response = await fetch(`/api/loyalty/${session?.user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Reward selected successfully!');
        await fetchLoyaltyData(); // Refresh data
      } else {
        throw new Error(data.message || 'Failed to select reward');
      }
    } catch (err: any) {
      console.error('Error selecting reward:', err);
      toast.error(err.message || 'Failed to select reward');
    } finally {
      setIsSelecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-xl">{error}</div>
          <button
            onClick={fetchLoyaltyData}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaGift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Rewards Data</h2>
          <p className="text-gray-600">Unable to load your rewards information.</p>
        </div>
      </div>
    );
  }

  // Safe access to data with fallbacks
  const totalVisits = loyaltyStatus?.totalVisits || 0;
  const currentProgressVisits = loyaltyStatus?.currentProgressVisits || 0;
  const rewardsRedeemed = loyaltyStatus?.rewardsRedeemed || 0;
  const eligibleRewards = loyaltyStatus?.eligibleRewards || [];
  const progressPercentage = loyaltyStatus?.progressPercentage || 0;
  const visitsToNextReward = loyaltyStatus?.visitsToNextReward || 0;
  const selectedReward = loyaltyStatus?.selectedReward;
  const canRedeem = loyaltyStatus?.canRedeem || false;
  const milestoneReached = loyaltyStatus?.milestoneReached || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4"
          >
            <FaTrophy className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Rewards</h1>
          <p className="text-gray-600 text-lg">Track your loyalty progress and redeem amazing rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <FaHistory className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalVisits}</h3>
            <p className="text-gray-600">Total Visits</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <FaFire className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{currentProgressVisits}</h3>
            <p className="text-gray-600">Progress Visits</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <FaGift className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{rewardsRedeemed}</h3>
            <p className="text-gray-600">Rewards Redeemed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
              <FaStar className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{eligibleRewards.length}</h3>
            <p className="text-gray-600">Available Rewards</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Current Progress */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Current Progress</h2>
                {milestoneReached && (
                  <div className="flex items-center text-green-600">
                    <FaCheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Milestone Reached!</span>
                  </div>
                )}
              </div>

              {selectedReward ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Working towards: {selectedReward.name || 'Unknown Reward'}
                      </h3>
                      <p className="text-gray-600">{selectedReward.description || 'No description'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentProgressVisits}/{selectedReward.visitsRequired || 0}
                      </div>
                      <div className="text-sm text-gray-500">visits</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{progressPercentage}% Complete</span>
                      <span>{visitsToNextReward} visits to go</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
                      >
                        {progressPercentage > 0 && (
                          <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Stamp Visualization */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {Array.from({ length: selectedReward.visitsRequired || 0 }).map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`aspect-square rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                          index < currentProgressVisits
                            ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white border-green-400 shadow-lg'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                      >
                        {index < currentProgressVisits ? (
                          <FaCheckCircle className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {canRedeem && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl"
                    >
                      <div className="flex items-center">
                        <FaMagic className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-semibold text-green-800">Congratulations!</h4>
                          <p className="text-green-700">You've earned your reward! Visit us to redeem it.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaGift className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Reward</h3>
                  <p className="text-gray-600">Select a reward from the available options to start tracking your progress!</p>
                </div>
              )}
            </motion.div>

            {/* Available Rewards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
              
              {availableRewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableRewards.map((reward, index) => (
                    <motion.div
                      key={reward?._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => !selectedReward && reward?._id && selectReward(reward._id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward?.name || 'Unknown Reward'}</h3>
                          <p className="text-gray-600 text-sm mb-3">{reward?.description || 'No description available'}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-blue-600">
                              <FaCalendar className="h-4 w-4 mr-1" />
                              <span>{reward?.visitsRequired || 0} visits</span>
                            </div>
                            
                            {reward?.rewardType === 'discount' && reward?.discountPercentage && (
                              <div className="flex items-center text-green-600">
                                <FaPercentage className="h-4 w-4 mr-1" />
                                <span>{reward.discountPercentage}% off</span>
                              </div>
                            )}
                            
                            {reward?.rewardType === 'free' && (
                              <div className="flex items-center text-purple-600">
                                <FaGift className="h-4 w-4 mr-1" />
                                <span>Free Service</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          {selectedReward?._id === reward?._id ? (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FaCheckCircle className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          ) : eligibleRewards.some(er => er?._id === reward?._id) ? (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaStar className="h-3 w-3 mr-1" />
                              Eligible
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <FaClock className="h-3 w-3 mr-1" />
                              {Math.max(0, (reward?.visitsRequired || 0) - currentProgressVisits)} more
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!selectedReward && reward?._id && (
                        <button
                          disabled={isSelecting}
                          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200 disabled:opacity-50"
                        >
                          {isSelecting ? 'Selecting...' : 'Select This Reward'}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaGift className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rewards Available</h3>
                  <p className="text-gray-600">Check back later for new rewards!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Reward History Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reward History</h2>
            
            {rewardHistory.length > 0 ? (
              <div className="space-y-4">
                {rewardHistory.slice(0, 10).map((reward, index) => (
                  <motion.div
                    key={reward?._id || index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {reward?.rewardName || 'Unknown Reward'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Redeemed {reward?.redeemedAt ? new Date(reward.redeemedAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                      {reward?.discountApplied && (
                        <p className="text-xs text-green-600 mt-1">
                          {reward.discountApplied}% discount applied
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {rewardHistory.length > 10 && (
                  <div className="text-center pt-4">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All History ({rewardHistory.length} total)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaHistory className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No History Yet</h3>
                <p className="text-gray-600 text-sm">Your redeemed rewards will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 