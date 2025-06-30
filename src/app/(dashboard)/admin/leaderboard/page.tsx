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
  FaCrown
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

type LeaderboardType = 'overall' | 'visits' | 'clients' | 'efficiency' | 'retention' | 'rewards';
type TimePeriod = 'all-time' | 'this-month' | 'this-week';

export default function AdminLeaderboardPage() {
  const [barbers, setBarbers] = useState<BarberLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('overall');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopPerformers, setShowTopPerformers] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, timePeriod]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Leaderboard</h1>
              <p className="text-gray-600">Comprehensive performance analytics and team rankings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportLeaderboard}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={() => setShowTopPerformers(!showTopPerformers)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaFilter className="h-4 w-4" />
                {showTopPerformers ? 'Show All' : 'Show Top 3'}
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Barbers</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Ranking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ranking Metric</label>
              <select
                value={leaderboardType}
                onChange={(e) => setLeaderboardType(e.target.value as LeaderboardType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((barber, index) => (
                <div
                  key={barber._id}
                  className={`${getRankColor(index + 1)} rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 ${
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
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xl font-bold">
                          {barber.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Complete Rankings ({sortedBarbers.length} barbers)
            </h2>
          </div>

          {/* Mobile-Friendly Cards */}
          <div className="block md:hidden">
            {sortedBarbers.map((barber, index) => (
              <div key={barber._id} className="p-4 border-b border-gray-100 last:border-b-0">
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
                          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                            {barber.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{barber.name}</h3>
                        <div className="flex gap-1">
                          {barber.badges.slice(0, 3).map((badge, idx) => (
                            <span key={idx} className="text-sm">{badge}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Podium
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barber
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Clients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retention
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rewards
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {remainingBarbers.map((barber, index) => {
                  const rank = index + 4;
                  return (
                    <tr key={barber._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center h-full">
                          <span className="font-bold text-gray-500 text-lg">#{rank}</span>
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                              {barber.name.charAt(0)}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                            <div className="text-sm text-gray-500">Joined: {new Date(barber.joinDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {barber.totalVisits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {barber.uniqueClients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {barber.monthsWorked} mos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {barber.clientRetentionRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        <div className="flex items-center gap-1.5">
                          <FaAward className="text-indigo-500"/> {barber.earnedRewards}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                        {barber.leaderboardScore.toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {sortedBarbers.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No barbers found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No barber data available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
