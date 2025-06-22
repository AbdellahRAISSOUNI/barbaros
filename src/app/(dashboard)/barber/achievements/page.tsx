'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTrophy, FaMedal, FaStar, FaFire, FaUsers, FaCalendarAlt, FaCrown, FaLock, FaClock, FaGraduationCap, FaPalette, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface AchievementProgress {
  achievementId: string;
  title: string;
  description: string;
  category: string;
  tier: string;
  badge: string;
  color: string;
  points: number;
  progress: number;
  requirement: number;
  isCompleted: boolean;
  completedAt?: Date;
  progressPercentage: number;
  reward?: {
    type: string;
    value: string;
    description: string;
  };
}

interface BarberStats {
  totalPoints: number;
  completedAchievements: number;
  bronzeAchievements: number;
  silverAchievements: number;
  goldAchievements: number;
  platinumAchievements: number;
  diamondAchievements: number;
}

export default function BarberAchievementsPage() {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Achievements', icon: '🏆', color: 'bg-gray-500' },
    { value: 'tenure', label: 'Tenure & Loyalty', icon: '🕒', color: 'bg-blue-500' },
    { value: 'visits', label: 'Performance', icon: '📊', color: 'bg-green-500' },
    { value: 'clients', label: 'Client Relations', icon: '👥', color: 'bg-purple-500' },
    { value: 'consistency', label: 'Consistency', icon: '🔥', color: 'bg-orange-500' },
    { value: 'quality', label: 'Quality & Craft', icon: '⭐', color: 'bg-yellow-500' },
    { value: 'learning', label: 'Growth & Learning', icon: '📚', color: 'bg-indigo-500' },
    { value: 'milestone', label: 'Major Milestones', icon: '🏆', color: 'bg-red-500' }
  ];

  const tiers = [
    { value: 'all', label: 'All Tiers', color: 'bg-gray-500', textColor: 'text-gray-100' },
    { value: 'bronze', label: 'Bronze', color: 'bg-amber-600', textColor: 'text-amber-100' },
    { value: 'silver', label: 'Silver', color: 'bg-gray-400', textColor: 'text-gray-100' },
    { value: 'gold', label: 'Gold', color: 'bg-yellow-500', textColor: 'text-yellow-100' },
    { value: 'platinum', label: 'Platinum', color: 'bg-blue-400', textColor: 'text-blue-100' },
    { value: 'diamond', label: 'Diamond', color: 'bg-purple-600', textColor: 'text-purple-100' }
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchAchievements();
    }
  }, [session]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/barber/achievements?barberId=${session?.user?.id}`);
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
      } else {
        toast.error('Failed to load achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Error loading achievements');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    return achievements.filter(achievement => {
      const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
      const tierMatch = selectedTier === 'all' || achievement.tier === selectedTier;
      return categoryMatch && tierMatch;
    });
  };

  const getBarberStats = (): BarberStats => {
    const totalPoints = achievements
      .filter(a => a.isCompleted)
      .reduce((sum, a) => sum + a.points, 0);
    
    const completedAchievements = achievements.filter(a => a.isCompleted).length;
    
    const tierCounts = achievements
      .filter(a => a.isCompleted)
      .reduce((counts, a) => {
        counts[a.tier] = (counts[a.tier] || 0) + 1;
        return counts;
      }, {} as any);

    return {
      totalPoints,
      completedAchievements,
      bronzeAchievements: tierCounts.bronze || 0,
      silverAchievements: tierCounts.silver || 0,
      goldAchievements: tierCounts.gold || 0,
      platinumAchievements: tierCounts.platinum || 0,
      diamondAchievements: tierCounts.diamond || 0
    };
  };

  const getCategoryProgress = () => {
    return categories.slice(1).map(category => {
      const categoryAchievements = achievements.filter(a => a.category === category.value);
      const completed = categoryAchievements.filter(a => a.isCompleted).length;
      const total = categoryAchievements.length;
      return {
        ...category,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  const stats = getBarberStats();
  const filteredAchievements = getFilteredAchievements();
  const categoryProgress = getCategoryProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaTrophy className="mr-3 text-yellow-500" />
            Your Career Achievements
          </h1>
          <p className="text-gray-600 mt-2">
            Track your professional growth and earn rewards for your dedication
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <FaChartLine className="text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <div className="text-sm opacity-90">Total Points</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <FaTrophy className="text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.completedAchievements}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <FaMedal className="text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.bronzeAchievements}</div>
              <div className="text-sm opacity-90">Bronze</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-4 text-white">
            <div className="text-center">
              <FaMedal className="text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.silverAchievements}</div>
              <div className="text-sm opacity-90">Silver</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <FaCrown className="text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.goldAchievements}</div>
              <div className="text-sm opacity-90">Gold</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <FaCrown className="text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.platinumAchievements + stats.diamondAchievements}</div>
              <div className="text-sm opacity-90">Elite</div>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryProgress.map((category) => (
              <div key={category.value} className="text-center">
                <div className={`${category.color} rounded-lg p-4 text-white mb-2`}>
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium">{category.label}</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {category.completed}/{category.total}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {tiers.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div 
              key={achievement.achievementId} 
              className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
                achievement.isCompleted ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {/* Achievement Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{achievement.badge}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tiers.find(t => t.value === achievement.tier)?.color
                      } ${tiers.find(t => t.value === achievement.tier)?.textColor}`}>
                        {achievement.tier.toUpperCase()}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`p-2 rounded-full ${achievement.isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {achievement.isCompleted ? (
                    <FaTrophy className="text-green-600" />
                  ) : (
                    <FaLock className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.requirement}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      achievement.isCompleted 
                        ? 'bg-green-500' 
                        : achievement.progressPercentage > 0 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300'
                    }`}
                    style={{ width: `${Math.min(achievement.progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {achievement.progressPercentage}% Complete
                </div>
              </div>

              {/* Reward */}
              {achievement.reward && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-yellow-800">
                        Reward: {achievement.reward.value}
                      </div>
                      <div className="text-xs text-yellow-600">
                        {achievement.reward.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Status */}
              {achievement.isCompleted && achievement.completedAt && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                    <FaTrophy className="mr-1" />
                    Completed {new Date(achievement.completedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or start working towards your first achievement!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
