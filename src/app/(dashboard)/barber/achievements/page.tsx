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
  FaUsers
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#A31515] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <FaTrophy className="w-8 h-8 text-amber-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rewards Center</h1>
              <p className="text-red-100">Track your progress and earn rewards for your dedication</p>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.totalRewards}</div>
                <div className="text-sm text-red-100">Total Rewards</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.earnedRewards}</div>
                <div className="text-sm text-red-100">Earned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.redeemedRewards}</div>
                <div className="text-sm text-red-100">Redeemed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.eligibleRewards}</div>
                <div className="text-sm text-red-100">Eligible</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.inProgressRewards}</div>
                <div className="text-sm text-red-100">In Progress</div>
              </div>
            </div>
          )}
        </div>

        {/* Reward Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <FaSpinner className="w-8 h-8 animate-spin text-[#8B0000]" />
            </div>
          ) : (
            <>
              {/* Earned & Eligible Rewards */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-800">Available Rewards</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {rewards
                    .filter(r => r.isEarned || r.isEligible)
                    .map(reward => (
                      <RewardCard key={reward.rewardId} reward={reward} />
                    ))}
                  {rewards.filter(r => r.isEarned || r.isEligible).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No available rewards yet. Keep working!</p>
                  )}
                </div>
              </div>

              {/* In Progress Rewards */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaClock className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-800">In Progress</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {rewards
                    .filter(r => !r.isEarned && !r.isEligible)
                    .map(reward => (
                      <RewardCard key={reward.rewardId} reward={reward} />
                    ))}
                  {rewards.filter(r => !r.isEarned && !r.isEligible).length === 0 && (
                    <p className="text-gray-500 text-center py-4">All rewards earned! Great job!</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
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
    <div className={`bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg p-4 transition-all duration-300 hover:shadow-md ${
      reward.isRedeemed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            reward.isRedeemed ? 'bg-gray-100' : 
            reward.isEarned ? 'bg-[#8B0000]/10' : 'bg-stone-100'
          }`}>
            <span className="text-lg">{reward.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">{reward.name}</h3>
            <p className="text-sm text-stone-600">{reward.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RewardTypeIcon className="w-4 h-4 text-green-600" />
          <CategoryIcon className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-stone-600 mb-1">
          <span>{reward.rewardValue}</span>
          {reward.isRedeemed && <span className="text-gray-500 font-medium">✓ Redeemed</span>}
          {reward.isEarned && !reward.isRedeemed && (
            <span className="text-[#8B0000] font-medium">🎉 Earned! Contact admin</span>
          )}
        </div>
      </div>

      <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full ${progressColor} transition-all duration-500`}
          style={{ width: progressWidth }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs font-medium text-stone-600">
          {formatProgress(reward)}
        </span>
        <span className="text-xs font-medium text-stone-600">
          {reward.progressPercentage}%
        </span>
      </div>

      {reward.isEarned && !reward.isRedeemed && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg text-center">
          <p className="font-semibold text-yellow-800">
            🎉 Reward Earned!
          </p>
          <p className="text-xs text-yellow-700">
            Redemption pending admin approval.
          </p>
        </div>
      )}

      {reward.isRedeemed && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg text-center">
          <p className="font-semibold text-emerald-800">
            ✅ Redeemed on {new Date(reward.redeemedAt!).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
