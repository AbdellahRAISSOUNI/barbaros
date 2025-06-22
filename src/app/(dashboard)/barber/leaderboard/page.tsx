'use client';

import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaStar, FaFire, FaUsers, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface BarberLeaderboard {
  _id: string;
  name: string;
  profilePicture?: string;
  joinDate: string;
  workDays: number;
  stats: {
    totalVisits: number;
    uniqueClientsServed: number;
    thisMonth: {
      visits: number;
    };
  };
  rank: number;
  badges: string[];
  achievements: number;
  efficiency: number;
}

type LeaderboardType = 'overall' | 'visits' | 'clients' | 'efficiency';
type TimePeriod = 'all-time' | 'this-month' | 'this-week';

export default function BarberLeaderboardPage() {
  const [barbers, setBarbers] = useState<BarberLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('overall');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, timePeriod]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/barber/leaderboard?sortBy=${leaderboardType}&timePeriod=${timePeriod}`);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const sortedBarbers = [...barbers].sort((a, b) => {
    switch (leaderboardType) {
      case 'visits':
        return timePeriod === 'this-month' 
          ? b.stats.thisMonth.visits - a.stats.thisMonth.visits
          : b.stats.totalVisits - a.stats.totalVisits;
      case 'clients':
        return b.stats.uniqueClientsServed - a.stats.uniqueClientsServed;
      case 'efficiency':
        return b.efficiency - a.efficiency;
      default:
        return a.rank - b.rank;
    }
  });

  const leaderboardTypes = [
    { id: 'overall', label: 'Overall', icon: FaTrophy, description: 'Combined performance score' },
    { id: 'visits', label: 'Most Visits', icon: FaCalendarAlt, description: 'Total client visits' },
    { id: 'clients', label: 'Client Base', icon: FaUsers, description: 'Unique clients served' },
    { id: 'efficiency', label: 'Efficiency', icon: FaChartBar, description: 'Performance per day' }
  ];

  const timePeriods = [
    { id: 'all-time', label: 'All Time' },
    { id: 'this-month', label: 'This Month' },
    { id: 'this-week', label: 'This Week' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Leaderboard</h1>
          <p className="text-gray-600">See how you rank among your colleagues</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaderboard Type */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leaderboardTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setLeaderboardType(type.id as LeaderboardType)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        leaderboardType === type.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                        <div className={`text-xs ${
                          leaderboardType === type.id ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {type.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Period */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Period</h3>
              <div className="flex gap-2">
                {timePeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setTimePeriod(period.id as TimePeriod)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      timePeriod === period.id
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* 2nd Place */}
            {sortedBarbers[1] && (
              <div className="order-1 md:order-1">
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center transform md:translate-y-8">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-gray-100">
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xl font-bold">
                        {sortedBarbers[1].name.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{sortedBarbers[1].name}</h3>
                  <div className="flex justify-center gap-1 mb-3">
                    {sortedBarbers[1].badges.slice(0, 3).map((badge, idx) => (
                      <span key={idx} className="text-lg">{badge}</span>
                    ))}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Visits: {sortedBarbers[1].stats.totalVisits}</div>
                    <div>Clients: {sortedBarbers[1].stats.uniqueClientsServed}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {sortedBarbers[0] && (
              <div className="order-2 md:order-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6 text-center text-white transform scale-105">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-white/20">
                      <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center text-yellow-800 text-2xl font-bold">
                        {sortedBarbers[0].name.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 font-bold">
                      👑
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2">{sortedBarbers[0].name}</h3>
                  <div className="flex justify-center gap-1 mb-3">
                    {sortedBarbers[0].badges.slice(0, 3).map((badge, idx) => (
                      <span key={idx} className="text-xl">{badge}</span>
                    ))}
                  </div>
                  <div className="space-y-1 text-yellow-100">
                    <div>Visits: {sortedBarbers[0].stats.totalVisits}</div>
                    <div>Clients: {sortedBarbers[0].stats.uniqueClientsServed}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {sortedBarbers[2] && (
              <div className="order-3 md:order-3">
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center transform md:translate-y-12">
                  <div className="relative mb-4">
                    <div className="w-18 h-18 rounded-full overflow-hidden mx-auto bg-gray-100">
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold">
                        {sortedBarbers[2].name.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{sortedBarbers[2].name}</h3>
                  <div className="flex justify-center gap-1 mb-3">
                    {sortedBarbers[2].badges.slice(0, 3).map((badge, idx) => (
                      <span key={idx} className="text-lg">{badge}</span>
                    ))}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Visits: {sortedBarbers[2].stats.totalVisits}</div>
                    <div>Clients: {sortedBarbers[2].stats.uniqueClientsServed}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Full Rankings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Achievements
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBarbers.map((barber, index) => {
                  const displayRank = index + 1;
                  return (
                    <tr key={barber._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankColor(displayRank)}`}>
                          {getRankIcon(displayRank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                              {barber.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                            <div className="flex gap-1">
                              {barber.badges.slice(0, 3).map((badge, idx) => (
                                <span key={idx} className="text-sm">{badge}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barber.workDays} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{timePeriod === 'this-month' ? barber.stats.thisMonth.visits : barber.stats.totalVisits}</div>
                        <div className="text-xs text-gray-500">
                          {Math.round((timePeriod === 'this-month' ? barber.stats.thisMonth.visits : barber.stats.totalVisits) / barber.workDays * 30)} /month avg
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barber.stats.uniqueClientsServed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barber.efficiency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <FaTrophy className="h-4 w-4 text-yellow-500" />
                          {barber.achievements}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 