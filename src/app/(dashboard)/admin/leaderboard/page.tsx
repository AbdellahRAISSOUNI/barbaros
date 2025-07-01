'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartBar, 
  FaDollarSign,
  FaAward,
  FaStar,
  FaFire,
  FaChartLine,
  FaUserTie,
  FaHandshake,
  FaSearch,
  FaFilter,
  FaDownload,
  FaCrown,
  FaMedal,
  FaGem,
  FaBullseye,
  FaRocket,
  FaGift
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface BarberLeaderboard {
  _id: string;
  name: string;
  profilePicture?: string;
  joinDate: string;
  monthsWorked: number;
  totalVisits: number;
  uniqueClients: number;
  clientRetentionRate: number;
  averageVisitsPerDay: number;
  earnedRewards: number;
  redeemedRewards: number;
  leaderboardScore: number;
  rank: number;
  efficiency: number;
  badges: string[];
}

interface BarberAchievementProgress {
  barberId: string;
  barberName: string;
  profilePicture?: string;
  joinDate: string;
  achievements: {
    rewardId: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    progressPercentage: number;
    isEarned: boolean;
    isRedeemed: boolean;
    currentValue: number;
    requirementValue: number;
    requirementType: string;
    durationProgress?: {
      totalDays: number;
      months: number;
      remainingDays: number;
      displayText: string;
    };
  }[];
  overallProgress: {
    totalAchievements: number;
    earnedAchievements: number;
    redeemedAchievements: number;
    overallPercentage: number;
  };
}

type LeaderboardType = 'overall' | 'visits' | 'clients' | 'efficiency' | 'retention' | 'rewards';
type TimePeriod = 'all-time' | 'this-month' | 'this-week';
type ViewType = 'leaderboard' | 'achievements';

export default function AdminLeaderboardPage() {
  const [barbers, setBarbers] = useState<BarberLeaderboard[]>([]);
  const [achievementData, setAchievementData] = useState<BarberAchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('overall');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [viewType, setViewType] = useState<ViewType>('leaderboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopPerformers, setShowTopPerformers] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, timePeriod]);

  useEffect(() => {
    if (viewType === 'achievements') {
      fetchAchievementProgress();
    }
  }, [viewType]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/leaderboard?sortBy=${leaderboardType}&timePeriod=${timePeriod}`);
      const data = await response.json();

      if (data.success) {
        setBarbers(data.leaderboard);
      } else {
        toast.error('Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Error loading leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementProgress = async () => {
    try {
      setAchievementsLoading(true);
      
      // Fetch all active barbers and their reward progress
      const barbersResponse = await fetch('/api/admin/barbers');
      const barbersData = await barbersResponse.json();
      
      if (!barbersData.success) {
        toast.error('Failed to load barbers');
        return;
      }

      const achievementPromises = barbersData.barbers
        .filter((barber: any) => barber.role === 'barber' && barber.active)
        .map(async (barber: any) => {
          try {
            const rewardsResponse = await fetch(`/api/barber/rewards?barberId=${barber._id}`);
            const rewardsData = await rewardsResponse.json();
            
            if (rewardsData.success) {
              const totalAchievements = rewardsData.rewards.length;
              const earnedAchievements = rewardsData.rewards.filter((r: any) => r.isEarned).length;
              const redeemedAchievements = rewardsData.rewards.filter((r: any) => r.isRedeemed).length;
              // Calculate overall progress as average of all individual progress percentages
              const overallPercentage = totalAchievements > 0 
                ? Math.round(rewardsData.rewards.reduce((sum: number, r: any) => sum + r.progressPercentage, 0) / totalAchievements) 
                : 0;

              return {
                barberId: barber._id,
                barberName: barber.name,
                profilePicture: barber.profilePicture,
                joinDate: barber.joinDate,
                achievements: rewardsData.rewards,
                overallProgress: {
                  totalAchievements,
                  earnedAchievements,
                  redeemedAchievements,
                  overallPercentage
                }
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching rewards for barber ${barber._id}:`, error);
            return null;
          }
        });

      const results = await Promise.all(achievementPromises);
      const validResults = results.filter(Boolean) as BarberAchievementProgress[];
      
      // Sort by overall achievement percentage
      validResults.sort((a, b) => b.overallProgress.overallPercentage - a.overallProgress.overallPercentage);
      
      setAchievementData(validResults);
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
      toast.error('Error loading achievement data');
    } finally {
      setAchievementsLoading(false);
    }
  };

  const exportLeaderboard = async () => {
    try {
      toast.success('Exporting leaderboard data...');
      // Implementation for export functionality
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <FaTrophy className="text-yellow-400 text-2xl" />;
      case 2: return <FaTrophy className="text-gray-400 text-xl" />;
      case 3: return <FaTrophy className="text-amber-600 text-lg" />;
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-white';
    }
  };

  const getEfficiencyScore = (barber: BarberLeaderboard) => {
    return barber.efficiency || barber.averageVisitsPerDay || 0;
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (percentage >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-400';
    if (percentage >= 40) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-stone-500 to-stone-400';
  };

  // Format progress text similar to barber achievements page
  const formatProgress = (achievement: any) => {
    if (achievement.requirementType === 'months_worked' && achievement.durationProgress?.displayText) {
      return `${achievement.durationProgress.displayText} / ${achievement.requirementValue} months`;
    }
    switch (achievement.requirementType) {
      case 'visits':
        return `${achievement.currentValue.toLocaleString()} / ${achievement.requirementValue.toLocaleString()} visits`;
      case 'clients':
        return `${achievement.currentValue.toLocaleString()} / ${achievement.requirementValue.toLocaleString()} clients`;
      case 'months_worked':
        return `${achievement.currentValue} / ${achievement.requirementValue} months`;
      case 'client_retention':
        return `${achievement.currentValue}% / ${achievement.requirementValue}% retention`;
      default:
        return `${achievement.currentValue} / ${achievement.requirementValue}`;
    }
  };

  const sortedBarbers = [...barbers]
    .filter(barber => 
      barber.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (leaderboardType) {
        case 'visits':
          return b.totalVisits - a.totalVisits;
        case 'clients':
          return b.uniqueClients - a.uniqueClients;
        case 'efficiency':
          return getEfficiencyScore(b) - getEfficiencyScore(a);
        case 'retention':
          return b.clientRetentionRate - a.clientRetentionRate;
        case 'rewards':
          return b.earnedRewards - a.earnedRewards;
        default:
          return b.leaderboardScore - a.leaderboardScore;
      }
    });

  const filteredAchievementData = achievementData.filter(barber =>
    barber.barberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leaderboardTypes = [
    { id: 'overall', label: 'Overall Performance', icon: FaTrophy, description: 'Combined performance score', color: 'bg-yellow-500' },
    { id: 'visits', label: 'Visit Volume', icon: FaCalendarAlt, description: 'Total client visits', color: 'bg-blue-500' },
    { id: 'clients', label: 'Client Growth', icon: FaUsers, description: 'Unique clients served', color: 'bg-green-500' },
    { id: 'efficiency', label: 'Productivity', icon: FaChartBar, description: 'Visits per day efficiency', color: 'bg-purple-500' },
    { id: 'retention', label: 'Client Retention', icon: FaHandshake, description: 'Client return rate', color: 'bg-pink-500' },
    { id: 'rewards', label: 'Rewards Earned', icon: FaAward, description: 'Earned rewards count', color: 'bg-indigo-500' }
  ];

  const timePeriods = [
    { id: 'all-time', label: 'All Time', icon: FaChartLine },
    { id: 'this-month', label: 'This Month', icon: FaCalendarAlt },
    { id: 'this-week', label: 'This Week', icon: FaFire }
  ];

  const topPerformers = sortedBarbers.slice(0, 3);
  const remainingBarbers = sortedBarbers.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000] mx-auto mb-4"></div>
          <p className="text-stone-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-r from-[#8B0000] to-[#A31515] rounded-xl shadow-lg">
                  <FaCrown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">Team Performance Center</h1>
                  <p className="text-stone-600">Comprehensive performance analytics and achievement tracking</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportLeaderboard}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300"
              >
                <FaDownload className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={() => setShowTopPerformers(!showTopPerformers)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-600 to-stone-500 text-white px-4 py-2 rounded-xl hover:from-stone-700 hover:to-stone-600 transition-all duration-300"
              >
                <FaFilter className="h-4 w-4" />
                {showTopPerformers ? 'Show All' : 'Show Top 3'}
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setViewType('leaderboard')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                  viewType === 'leaderboard'
                    ? 'bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaTrophy className="h-4 w-4" />
                  Leaderboard
                </div>
              </button>
              <button
                onClick={() => setViewType('achievements')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                  viewType === 'achievements'
                    ? 'bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaGem className="h-4 w-4" />
                  Achievement Tracking
                </div>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Leaderboard View */}
        {viewType === 'leaderboard' && (
          <>
            {/* Controls */}
            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ranking Type */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Ranking Metric</label>
                  <select
                    value={leaderboardType}
                    onChange={(e) => setLeaderboardType(e.target.value as LeaderboardType)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  >
                    {leaderboardTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Period */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Time Period</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  >
                    {timePeriods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Top Performers Podium */}
            {showTopPerformers && topPerformers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Top Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topPerformers.map((barber, index) => (
                    <div
                      key={barber._id}
                      className={`${getRankColor(index + 1)} rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg ${
                        index === 0 ? 'md:order-2 md:scale-110' : 
                        index === 1 ? 'md:order-1' : 'md:order-3'
                      }`}
                    >
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden">
                          {barber.profilePicture ? (
                            <img 
                              src={barber.profilePicture} 
                              alt={barber.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center text-white text-xl font-bold">
                              {barber.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                          {getRankIcon(index + 1)}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{barber.name}</h3>
                      <div className="space-y-1 text-sm opacity-90">
                        <div>Visits: {barber.totalVisits}</div>
                        <div>Clients: {barber.uniqueClients}</div>
                        <div>Rewards: {barber.earnedRewards}</div>
                      </div>
                      <div className="flex justify-center gap-1 mt-3">
                        {barber.badges.slice(0, 4).map((badge, idx) => (
                          <span key={idx} className="text-lg">{badge}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-semibold text-stone-800">
                  Complete Rankings ({sortedBarbers.length} team members)
                </h2>
              </div>

              {/* Mobile-Friendly Cards */}
              <div className="block md:hidden">
                {sortedBarbers.map((barber, index) => (
                  <div key={barber._id} className="p-4 border-b border-stone-100 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${getRankColor(index + 1)}`}>
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {barber.profilePicture ? (
                              <img 
                                src={barber.profilePicture} 
                                alt={barber.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center text-white font-bold">
                                {barber.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-stone-900 truncate">{barber.name}</h3>
                            <div className="flex gap-1">
                              {barber.badges.slice(0, 3).map((badge, idx) => (
                                <span key={idx} className="text-sm">{badge}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-stone-600">
                          <div>Visits: <span className="font-medium">{barber.totalVisits}</span></div>
                          <div>Clients: <span className="font-medium">{barber.uniqueClients}</span></div>
                          <div>Efficiency: <span className="font-medium">{getEfficiencyScore(barber)}</span></div>
                          <div>Rewards: <span className="font-medium">{barber.earnedRewards}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider w-16">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Team Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Visits
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Unique Clients
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Retention
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Achievements
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-200">
                    {remainingBarbers.map((barber, index) => {
                      const rank = index + 4;
                      return (
                        <tr key={barber._id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center h-full">
                              <span className="font-bold text-stone-500 text-lg">#{rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {barber.profilePicture ? (
                                <img
                                  src={barber.profilePicture}
                                  alt={barber.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center text-white font-bold text-lg">
                                  {barber.name.charAt(0)}
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-stone-900">{barber.name}</div>
                                <div className="text-sm text-stone-500">Joined: {new Date(barber.joinDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-medium">
                            {barber.totalVisits}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-medium">
                            {barber.uniqueClients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-medium">
                            {barber.monthsWorked} mos
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-medium">
                            {barber.clientRetentionRate.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-medium">
                            <div className="flex items-center gap-1.5">
                              <FaAward className="text-[#8B0000]"/> {barber.earnedRewards}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#8B0000]">
                            {barber.leaderboardScore.toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Achievement Tracking View */}
        {viewType === 'achievements' && (
          <div className="space-y-8">
            {achievementsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000] mx-auto mb-4"></div>
                <p className="text-stone-600">Loading achievement progress...</p>
              </div>
            ) : (
              <>
                {filteredAchievementData.map((barber, index) => (
                  <div key={barber.barberId} className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm">
                    {/* Barber Header */}
                    <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-stone-50 to-amber-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                              {barber.profilePicture ? (
                                <img 
                                  src={barber.profilePicture} 
                                  alt={barber.barberName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center text-white font-bold text-xl">
                                  {barber.barberName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#8B0000] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              #{index + 1}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-stone-800">{barber.barberName}</h3>
                            <p className="text-stone-600">Joined: {new Date(barber.joinDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#8B0000]">{barber.overallProgress.overallPercentage}%</div>
                          <div className="text-sm text-stone-600">Overall Progress</div>
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-stone-800">{barber.overallProgress.earnedAchievements}</div>
                          <div className="text-sm text-stone-600">Earned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-stone-800">{barber.overallProgress.redeemedAchievements}</div>
                          <div className="text-sm text-stone-600">Redeemed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-stone-800">{barber.overallProgress.totalAchievements}</div>
                          <div className="text-sm text-stone-600">Total</div>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Progress */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {barber.achievements.slice(0, 6).map((achievement) => {
                          const CategoryIcon = getCategoryIcon(achievement.category);
                          const progressColor = getProgressColor(achievement.progressPercentage);
                          
                          return (
                            <div key={achievement.rewardId} className="bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-xl p-4 border border-stone-200/40">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${achievement.isEarned ? 'bg-emerald-100' : 'bg-stone-100'}`}>
                                    <span className="text-lg">{achievement.icon}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-stone-800 text-sm truncate">{achievement.name}</h4>
                                    <div className="flex items-center gap-1">
                                      <CategoryIcon className="h-3 w-3 text-stone-500" />
                                      <span className="text-xs text-stone-500 capitalize">{achievement.category}</span>
                                    </div>
                                  </div>
                                </div>
                                {achievement.isEarned && (
                                  <div className="flex-shrink-0">
                                    {achievement.isRedeemed ? (
                                      <FaGift className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                      <FaBullseye className="h-4 w-4 text-amber-600" />
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-stone-600">
                                  <span>{formatProgress(achievement)}</span>
                                  <span>{achievement.progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                                    style={{ width: `${Math.min(achievement.progressPercentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>

                              {achievement.isEarned && (
                                <div className="mt-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    achievement.isRedeemed 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {achievement.isRedeemed ? '✅ Redeemed' : '🎯 Earned'}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {barber.achievements.length > 6 && (
                        <div className="text-center mt-4">
                          <span className="text-stone-600 text-sm">
                            Showing 6 of {barber.achievements.length} achievements
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {((viewType === 'leaderboard' && sortedBarbers.length === 0) || 
          (viewType === 'achievements' && filteredAchievementData.length === 0)) && (
          <div className="text-center py-12">
            <FaUsers className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No data found</h3>
            <p className="text-stone-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No team member data available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
