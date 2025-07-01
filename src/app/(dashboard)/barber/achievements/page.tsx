'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaTrophy, 
  FaMoneyBillWave,
  FaGift,
  FaCalendarAlt,
  FaSpinner,
  FaCheck,
  FaClock,
  FaHandshake,
  FaStar,
  FaAward,
  FaUsers,
  FaCrown,
  FaFire,
  FaChartLine
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface BarberReward {
  rewardId: string;
  name: string;
  description: string;
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';
  rewardValue: string;
  requirementType: string;
  requirementValue: number;
  requirementDescription: string;
  category: string;
  icon: string;
  currentValue: number;
  isEligible: boolean;
  isEarned: boolean;
  isRedeemed: boolean;
  earnedAt?: Date;
  redeemedAt?: Date;
  progressPercentage: number;
  durationProgress?: {
    totalDays: number;
    months: number;
    remainingDays: number;
    displayText: string;
  };
}

interface RewardStats {
  totalRewards: number;
  earnedRewards: number;
  redeemedRewards: number;
  eligibleRewards: number;
  inProgressRewards: number;
}

export default function BarberRewardsPage() {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<BarberReward[]>([]);
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRewards();
    }
  }, [session]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/barber/rewards?barberId=${session?.user?.id}`);
      const data = await response.json();

      if (data.success) {
        setRewards(data.rewards);
        setStats(data.statistics);
      } else {
        toast.error('Failed to load rewards');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Error loading rewards');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number, isEarned: boolean, isRedeemed: boolean) => {
    if (isRedeemed) return 'bg-gradient-to-r from-gray-600 to-gray-500';
    if (isEarned) return 'bg-gradient-to-r from-[#8B0000] to-[#A31515]';
    if (progress >= 75) return 'bg-gradient-to-r from-amber-600 to-amber-500';
    if (progress >= 50) return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
    return 'bg-gradient-to-r from-stone-600 to-stone-500';
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'monetary': return FaMoneyBillWave;
      case 'gift': return FaGift;
      case 'time_off': return FaCalendarAlt;
      case 'recognition': return FaTrophy;
      default: return FaTrophy;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone': return FaAward;
      case 'performance': return FaStar;
      case 'loyalty': return FaHandshake;
      case 'quality': return FaUsers;
      default: return FaTrophy;
    }
  };

  const formatProgress = (reward: BarberReward) => {
    if (reward.requirementType === 'months_worked' && reward.durationProgress) {
      return `${reward.durationProgress.displayText} / ${reward.requirementValue} months`;
    }
    switch (reward.requirementType) {
      case 'visits':
        return `${reward.currentValue.toLocaleString()} / ${reward.requirementValue.toLocaleString()} visits`;
      case 'clients':
        return `${reward.currentValue.toLocaleString()} / ${reward.requirementValue.toLocaleString()} clients`;
      case 'months_worked':
        return `${reward.currentValue} / ${reward.requirementValue} months`;
      case 'client_retention':
        return `${reward.currentValue}% / ${reward.requirementValue}% retention`;
      default:
        return `${reward.currentValue} / ${reward.requirementValue}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        
        {/* Premium Header Section */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#A31515] rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FaCrown className="w-5 h-5 md:w-6 md:h-6 text-amber-200" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold leading-tight">Achievement Center</h1>
              <p className="text-xs md:text-sm text-red-100">Your dedication deserves recognition</p>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{stats.totalRewards}</div>
                <div className="text-xs md:text-sm text-red-100">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{stats.earnedRewards}</div>
                <div className="text-xs md:text-sm text-red-100">Earned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{stats.redeemedRewards}</div>
                <div className="text-xs md:text-sm text-red-100">Redeemed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{stats.eligibleRewards}</div>
                <div className="text-xs md:text-sm text-red-100">Ready</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{stats.inProgressRewards}</div>
                <div className="text-xs md:text-sm text-red-100">Active</div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8 md:py-12">
            <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-[#8B0000]/20 border-t-[#8B0000] rounded-full animate-spin"></div>
          </div>
        )}

        {/* Reward Categories */}
        {!loading && (
          <div className="space-y-4 md:space-y-6">
            {/* Available Rewards Section */}
            {rewards.filter(r => r.isEarned || r.isEligible).length > 0 && (
              <div>
                <h2 className="text-base md:text-lg font-semibold text-stone-800 mb-3 px-1 flex items-center">
                  <FaFire className="w-4 h-4 mr-2 text-[#8B0000]" />
                  Available Rewards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {rewards
                    .filter(r => r.isEarned || r.isEligible)
                    .map(reward => (
                      <RewardCard key={reward.rewardId} reward={reward} />
                    ))}
                </div>
              </div>
            )}

            {/* In Progress Rewards Section */}
            {rewards.filter(r => !r.isEarned && !r.isEligible).length > 0 && (
              <div>
                <h2 className="text-base md:text-lg font-semibold text-stone-800 mb-3 px-1 flex items-center">
                  <FaChartLine className="w-4 h-4 mr-2 text-emerald-600" />
                  Progress Tracker
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {rewards
                    .filter(r => !r.isEarned && !r.isEligible)
                    .map(reward => (
                      <RewardCard key={reward.rewardId} reward={reward} />
                    ))}
                </div>
              </div>
            )}

            {/* Completed/Redeemed Rewards Section */}
            {rewards.filter(r => r.isRedeemed).length > 0 && (
              <div>
                <h2 className="text-base md:text-lg font-semibold text-stone-800 mb-3 px-1 flex items-center">
                  <FaCheck className="w-4 h-4 mr-2 text-emerald-600" />
                  Completed Achievements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {rewards
                    .filter(r => r.isRedeemed)
                    .map(reward => (
                      <RewardCard key={reward.rewardId} reward={reward} />
                    ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {rewards.length === 0 && !loading && (
              <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 border border-stone-200/60 rounded-xl p-6 md:p-8 text-center">
                <FaTrophy className="w-12 h-12 md:w-16 md:h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-stone-600 mb-2">No achievements yet</h3>
                <p className="text-sm md:text-base text-stone-500">Start working to unlock your first rewards!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const RewardCard = ({ reward }: { reward: BarberReward }) => {
  const progressWidth = `${Math.min(100, reward.progressPercentage)}%`;
  const progressColor = getProgressColor(reward.progressPercentage, reward.isEarned, reward.isRedeemed);
  const RewardTypeIcon = getRewardTypeIcon(reward.rewardType);
  const CategoryIcon = getCategoryIcon(reward.category);

  function getProgressColor(progress: number, isEarned: boolean, isRedeemed: boolean) {
    if (isRedeemed) return 'bg-gradient-to-r from-gray-600 to-gray-500';
    if (isEarned) return 'bg-gradient-to-r from-[#8B0000] to-[#A31515]';
    if (progress >= 75) return 'bg-gradient-to-r from-amber-600 to-amber-500';
    if (progress >= 50) return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
    return 'bg-gradient-to-r from-stone-600 to-stone-500';
  }

  function getRewardTypeIcon(type: string) {
    switch (type) {
      case 'monetary': return FaMoneyBillWave;
      case 'gift': return FaGift;
      case 'time_off': return FaCalendarAlt;
      case 'recognition': return FaTrophy;
      default: return FaTrophy;
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'milestone': return FaAward;
      case 'performance': return FaStar;
      case 'loyalty': return FaHandshake;
      case 'quality': return FaUsers;
      default: return FaTrophy;
    }
  }

  function formatProgress(reward: BarberReward) {
    if (reward.requirementType === 'months_worked' && reward.durationProgress?.displayText) {
      return `${reward.durationProgress.displayText} / ${reward.requirementValue} months`;
    }
    switch (reward.requirementType) {
      case 'visits':
        return `${reward.currentValue.toLocaleString()} / ${reward.requirementValue.toLocaleString()} visits`;
      case 'clients':
        return `${reward.currentValue.toLocaleString()} / ${reward.requirementValue.toLocaleString()} clients`;
      case 'months_worked':
        return `${reward.currentValue} / ${reward.requirementValue} months`;
      case 'client_retention':
        return `${reward.currentValue}% / ${reward.requirementValue}% retention`;
      default:
        return `${reward.currentValue} / ${reward.requirementValue}`;
    }
  }

  return (
    <div className={`bg-gradient-to-br from-stone-50 to-amber-50/50 backdrop-blur-sm border border-stone-200/60 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
      reward.isRedeemed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
            reward.isRedeemed ? 'bg-gray-100' : 
            reward.isEarned ? 'bg-gradient-to-r from-[#8B0000] to-[#A31515]' : 
            reward.progressPercentage >= 75 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
            reward.progressPercentage >= 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
            'bg-gradient-to-r from-stone-600 to-stone-500'
          }`}>
            <span className={`text-sm md:text-base ${reward.isRedeemed ? 'opacity-50' : 'text-white'}`}>
              {reward.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-stone-800 leading-tight truncate">
              {reward.name}
            </h3>
            <p className="text-xs md:text-sm text-stone-600 mt-1 line-clamp-2">
              {reward.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-100 rounded-full flex items-center justify-center">
            <RewardTypeIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-600" />
          </div>
          <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <CategoryIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm font-medium text-stone-700">
            {reward.rewardValue}
          </span>
          {reward.isRedeemed && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Redeemed
            </span>
          )}
          {reward.isEarned && !reward.isRedeemed && (
            <span className="text-xs font-medium text-[#8B0000] bg-red-50 px-2 py-1 rounded-full">
              Ready!
            </span>
          )}
        </div>

        <div className="relative h-1.5 md:h-2 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full ${progressColor} transition-all duration-500 shadow-sm`}
            style={{ width: progressWidth }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-stone-600">
            {formatProgress(reward)}
          </span>
          <span className="text-xs font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
            {reward.progressPercentage}%
          </span>
        </div>
      </div>

      {reward.isEarned && !reward.isRedeemed && (
        <div className="mt-3 p-2 md:p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaTrophy className="w-3 h-3 md:w-4 md:h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-amber-800">
                Achievement Unlocked!
              </p>
              <p className="text-xs text-amber-700">
                Contact admin for redemption
              </p>
            </div>
          </div>
        </div>
      )}

      {reward.isRedeemed && (
        <div className="mt-3 p-2 md:p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaCheck className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-emerald-800">
                Completed
              </p>
              <p className="text-xs text-emerald-700">
                {new Date(reward.redeemedAt!).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
