'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaGift, 
  FaStar, 
  FaHistory, 
  FaCalendar, 
  FaTrophy, 
  FaFire, 
  FaCheckCircle, 
  FaClock, 
  FaPercentage, 
  FaMagic,
  FaCrown,
  FaGem,
  FaChevronRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Reward {
  _id: string;
  name: string;
  description?: string;
  visitsRequired: number;
  discountPercentage?: number;
  isActive: boolean;
}

interface RewardHistory {
  _id: string;
  rewardName: string;
  redeemedAt: string;
  redeemedBy: string;
  discountApplied?: number;
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

export default function RewardsPage() {
  const { data: session } = useSession();
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
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

      const loyaltyResponse = await fetch(`/api/loyalty/${session?.user?.id}`);
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        if (loyaltyData.success) {
          setLoyaltyStatus(loyaltyData.loyaltyStatus);
        }
      }

      const rewardsResponse = await fetch(`/api/loyalty/${session?.user?.id}/rewards`);
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        if (rewardsData.success) {
          setAvailableRewards(Array.isArray(rewardsData.rewards) ? rewardsData.rewards : []);
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
        await fetchLoyaltyData();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-amber-200 rounded-full animate-spin border-t-amber-500"></div>
            <div className="w-12 h-12 border-2 border-amber-300 rounded-full animate-spin border-t-amber-600 absolute top-0 left-0" style={{ animationDelay: '-0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="text-red-500 mb-4 text-xl">{error}</div>
          <button
            onClick={fetchLoyaltyData}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <FaGift className="w-16 h-16 text-amber-400" />
          <h2 className="text-2xl font-bold text-gray-900">No Rewards Data</h2>
          <p className="text-gray-600">Unable to load your rewards information.</p>
        </div>
      </div>
    );
  }

  const totalVisits = loyaltyStatus?.totalVisits || 0;
  const currentProgressVisits = loyaltyStatus?.currentProgressVisits || 0;
  const rewardsRedeemed = loyaltyStatus?.rewardsRedeemed || 0;
  const eligibleRewards = loyaltyStatus?.eligibleRewards || [];
  const progressPercentage = loyaltyStatus?.progressPercentage || 0;
  const visitsToNextReward = loyaltyStatus?.visitsToNextReward || 0;
  const selectedReward = loyaltyStatus?.selectedReward;
  const milestoneReached = loyaltyStatus?.milestoneReached || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Mobile-optimized header */}
        <div className="mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaCrown className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Rewards</h1>
              <p className="text-gray-600 text-sm md:text-base">Track progress & unlock benefits</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaHistory className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Visits</p>
                <p className="text-lg font-bold text-gray-900">{totalVisits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaFire className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Current Streak</p>
                <p className="text-lg font-bold text-gray-900">{currentProgressVisits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaGift className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Redeemed</p>
                <p className="text-lg font-bold text-gray-900">{rewardsRedeemed}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaStar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Available</p>
                <p className="text-lg font-bold text-gray-900">{eligibleRewards.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Current Progress Card - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/50 shadow-sm mb-6"
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Current Progress</h2>
              {milestoneReached && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <FaCheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Goal Reached!</span>
                </div>
              )}
            </div>

            {selectedReward ? (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {selectedReward.name || 'Unknown Reward'}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedReward.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                    <span className="text-2xl font-bold text-amber-700">{currentProgressVisits}</span>
                    <span className="text-amber-600">/</span>
                    <span className="text-lg text-amber-600">{selectedReward.visitsRequired || 0}</span>
                    <span className="text-sm text-amber-600 ml-1">visits</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{progressPercentage}% Complete</span>
                    <span>{visitsToNextReward} to go</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </div>

                {/* Visit Stamps */}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: selectedReward.visitsRequired || 0 }).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold ${
                        index < currentProgressVisits
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {index < currentProgressVisits ? (
                        <FaCheckCircle className="w-3 h-3" />
                      ) : (
                        <FaGem className="w-3 h-3" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {loyaltyStatus.canRedeem && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <FaMagic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-900">Ready to Redeem!</h4>
                        <p className="text-sm text-amber-700">Visit us to claim your reward</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaGift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Your Reward</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Select a reward from the available options below to start tracking your progress
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Available Rewards - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/50 shadow-sm"
        >
          <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Available Rewards</h2>
            
            <div className="space-y-3">
              {availableRewards.map((reward, index) => (
                <motion.div
                  key={reward._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                    !selectedReward 
                      ? 'hover:shadow-lg cursor-pointer active:scale-98 transform'
                      : ''
                  } ${
                    selectedReward?._id === reward._id
                      ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50'
                      : 'border-gray-200 hover:border-amber-200'
                  }`}
                  onClick={() => !selectedReward && reward._id && selectReward(reward._id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedReward?._id === reward._id
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                              : 'bg-gray-100'
                          }`}>
                            <FaGift className={`w-4 h-4 ${
                              selectedReward?._id === reward._id
                                ? 'text-white'
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{reward.name}</h3>
                            <p className="text-sm text-gray-600">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700">
                            {reward.visitsRequired} visits required
                          </span>
                          {reward.discountPercentage && (
                            <span className="px-2 py-1 bg-green-100 rounded-lg text-green-700">
                              {reward.discountPercentage}% off
                            </span>
                          )}
                        </div>
                      </div>
                      {!selectedReward && (
                        <div className="flex items-center self-center">
                          <FaChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 