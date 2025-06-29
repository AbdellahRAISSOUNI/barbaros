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
  FaChevronRight,
  FaChartLine,
  FaStamp
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

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
  const [showAllRewards, setShowAllRewards] = useState(true);
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLoyaltyData();
    }
  }, [session]);

  const fetchLoyaltyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [loyaltyResponse, rewardsResponse, historyResponse] = await Promise.all([
        fetch(`/api/loyalty/${session?.user?.id}`),
        fetch(`/api/loyalty/${session?.user?.id}/rewards`),
        fetch(`/api/loyalty/${session?.user?.id}/history`)
      ]);

      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        if (loyaltyData.success) {
          setLoyaltyStatus(loyaltyData.loyaltyStatus);
        }
      }

      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        if (rewardsData.success) {
          setAvailableRewards(Array.isArray(rewardsData.rewards) ? rewardsData.rewards : []);
        }
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setRewardHistory(historyData.history || []);
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

  // Helper function to determine if a reward is eligible
  const isRewardEligible = (reward: Reward) => {
    return loyaltyStatus?.eligibleRewards.some(r => r._id === reward._id) || false;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="text-center">
          <LoadingAnimation size="lg" className="mb-4" />
          <p className="text-amber-800 font-medium">Loading your rewards...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Premium Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-amber-500/20">
              <FaCrown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Rewards</h1>
              <p className="text-gray-600">Unlock exclusive benefits</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100/50 hover:border-amber-200/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <FaHistory className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-xl font-bold text-gray-900">{totalVisits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100/50 hover:border-amber-200/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <FaFire className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-xl font-bold text-gray-900">{currentProgressVisits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100/50 hover:border-amber-200/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <FaGift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Redeemed</p>
                <p className="text-xl font-bold text-gray-900">{rewardsRedeemed}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100/50 hover:border-amber-200/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <FaStar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-xl font-bold text-gray-900">{eligibleRewards.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Current Progress Card - Enhanced Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-amber-100/50 shadow-xl mb-8 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span>Current Progress</span>
                {milestoneReached && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-md"
                  >
                    <FaCheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">Goal Reached!</span>
                  </motion.div>
                )}
              </h2>
            </div>

            {selectedReward ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-amber-500/20">
                        <FaGift className="w-6 md:w-7 h-6 md:h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          {selectedReward.name || 'Unknown Reward'}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600">{selectedReward.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl border border-amber-200/50 shadow-lg p-3 md:px-6 md:py-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 bg-clip-text text-transparent">{currentProgressVisits}</span>
                        <span className="text-amber-600 font-medium">/</span>
                        <span className="text-xl md:text-2xl text-amber-600 font-semibold">{selectedReward.visitsRequired || 0}</span>
                      </div>
                      <div className="text-xs md:text-sm text-amber-600 font-medium mt-0.5">visits completed</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2 md:mb-3">
                    <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                        <FaChartLine className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      </div>
                      <span className="text-xs md:text-sm">{progressPercentage}% Complete</span>
                    </span>
                    <span className="font-semibold text-amber-600 flex items-center gap-1.5 text-xs md:text-sm">
                      <FaHistory className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      {visitsToNextReward} visits to go
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-full blur opacity-30"></div>
                    <div className="relative w-full h-4 md:h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-amber-100/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-full relative group"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full border-4 border-orange-600 shadow-lg transform transition-transform group-hover:scale-110"></div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Visit Stamps */}
                <div className="relative mt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-orange-100/50 to-yellow-100/50 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-lg p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FaStamp className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                        Visit Progress
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full border border-amber-200/50">
                          <FaCheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                          <span className="text-xs md:text-sm font-medium text-amber-700">{currentProgressVisits} stamps collected</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3">
                      {Array.from({ length: selectedReward.visitsRequired || 0 }).map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ 
                            scale: 1, 
                            rotate: 0,
                            transition: {
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: index * 0.05
                            }
                          }}
                          className={`aspect-square rounded-xl md:rounded-2xl flex items-center justify-center relative group ${
                            index < currentProgressVisits
                              ? 'transform hover:scale-105 transition-transform'
                              : ''
                          }`}
                        >
                          <div className={`absolute inset-0 rounded-xl md:rounded-2xl ${
                            index < currentProgressVisits
                              ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 animate-pulse'
                              : 'bg-gray-100'
                          }`}></div>
                          <div className={`absolute inset-0 rounded-xl md:rounded-2xl ${
                            index < currentProgressVisits
                              ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-lg ring-2 ring-amber-500/20'
                              : 'bg-gray-50 border-2 border-gray-200'
                          }`}></div>
                          {index < currentProgressVisits ? (
                            <div className="relative transform transition-transform group-hover:scale-110">
                              <FaCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow" />
                              <div className="absolute inset-0 blur-sm bg-white opacity-20"></div>
                            </div>
                          ) : (
                            <div className="relative opacity-40">
                              <FaGem className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute -bottom-4 md:-bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] md:text-xs font-medium text-gray-500 whitespace-nowrap">
                            {index + 1}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {loyaltyStatus.canRedeem && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 md:mt-8 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl"></div>
                    <div className="relative p-4 md:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl md:rounded-2xl border border-amber-200/50 shadow-xl">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg md:rounded-xl blur-md"></div>
                          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg ring-4 ring-amber-500/30">
                            <FaMagic className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            <div className="absolute inset-0 bg-white/20 rounded-lg md:rounded-xl animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg md:text-xl font-bold text-amber-900 truncate">Ready to Redeem!</h4>
                          <p className="text-sm md:text-base text-amber-700 font-medium">Visit us to claim your reward</p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                            <FaChevronRight className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 md:py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-5"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl md:rounded-2xl blur-lg"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-amber-500/30">
                    <FaGift className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl md:rounded-2xl animate-pulse"></div>
                  </div>
                </motion.div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Choose Your Reward</h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Select a reward from the options below to start tracking your progress
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
          className="bg-white rounded-3xl border border-amber-100/50 shadow-xl"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {showAllRewards ? 'All Available Rewards' : 'Eligible Rewards'}
              </h2>
              <button
                onClick={() => setShowAllRewards(!showAllRewards)}
                className="px-4 py-2 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 rounded-xl border border-amber-200/50 hover:border-amber-300/50 transition-all text-sm font-medium shadow-sm"
              >
                {showAllRewards ? 'Show Eligible' : 'Show All'}
              </button>
            </div>
            
            <div className="space-y-4">
              {(showAllRewards ? availableRewards : eligibleRewards).map((reward, index) => (
                <motion.div
                  key={reward._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    !selectedReward 
                      ? 'hover:shadow-lg cursor-pointer active:scale-[0.98] transform'
                      : ''
                  } ${
                    selectedReward?._id === reward._id
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-lg'
                      : 'border-gray-200 hover:border-amber-200 shadow-md'
                  }`}
                  onClick={() => !selectedReward && reward._id && selectReward(reward._id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                            selectedReward?._id === reward._id
                              ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 ring-2 ring-amber-500/20'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200'
                          }`}>
                            <FaGift className={`w-6 h-6 ${
                              selectedReward?._id === reward._id
                                ? 'text-white'
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{reward.name}</h3>
                            <p className="text-gray-600">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-gray-700 font-medium shadow-sm border border-gray-200/50">
                            {reward.visitsRequired} visits required
                          </span>
                          {reward.discountPercentage && (
                            <span className="px-3 py-1.5 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg text-emerald-700 font-medium shadow-sm border border-green-200/50">
                              {reward.discountPercentage}% off
                            </span>
                          )}
                        </div>
                      </div>
                      {!selectedReward && (
                        <div className="flex items-center self-center">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <FaChevronRight className="w-4 h-4 text-amber-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reward History */}
        {rewardHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-3xl border border-amber-100/50 shadow-xl"
          >
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Reward History</h2>
              <div className="space-y-4">
                {rewardHistory.map((history) => (
                  <motion.div
                    key={history._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-md border border-gray-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{history.rewardName}</h3>
                        <p className="text-sm text-gray-600">
                          Redeemed on {formatDate(history.redeemedAt)}
                        </p>
                      </div>
                      {history.discountApplied && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg text-emerald-700 shadow-sm border border-green-200/50">
                          <FaPercentage className="w-4 h-4" />
                          <span className="font-medium">{history.discountApplied}% off</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 