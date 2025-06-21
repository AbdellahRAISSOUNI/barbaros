'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaCrown, FaGift, FaTrophy, FaChartLine, FaFire } from 'react-icons/fa';

interface LoyaltyStatistics {
  totalClients: number;
  loyaltyMembers: number;
  activeMembers: number;
  milestoneReached: number;
  totalRedemptions: number;
  averageVisits: number;
  popularRewards: Array<{
    _id: string;
    count: number;
    reward: {
      _id: string;
      name: string;
      rewardType: 'free' | 'discount';
      discountPercentage?: number;
    };
  }>;
  loyaltyParticipationRate: string;
}

export default function LoyaltyStatistics() {
  const [statistics, setStatistics] = useState<LoyaltyStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/loyalty/statistics');
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching loyalty statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    
    // Refresh statistics every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <FaChartLine className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics Not Available</h3>
            <p className="text-gray-600">Unable to load loyalty statistics at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <FaChartLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Loyalty Program Statistics</h2>
            <p className="text-sm text-gray-600">Overview of your client loyalty program performance</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalClients}</p>
            </div>
          </div>
        </div>

        {/* Loyalty Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaCrown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loyalty Members</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.loyaltyMembers}</p>
              <p className="text-xs text-purple-600 font-medium">
                {statistics.loyaltyParticipationRate}% participation
              </p>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaFire className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.activeMembers}</p>
            </div>
          </div>
        </div>

        {/* Milestone Reached */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaTrophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready to Redeem</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.milestoneReached}</p>
            </div>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaGift className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalRedemptions}</p>
            </div>
          </div>
        </div>

        {/* Average Visits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaChartLine className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Visits per Member</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(statistics.averageVisits)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Rewards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <FaTrophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Most Popular Rewards</h3>
            <p className="text-sm text-gray-600">Top rewards by redemption count</p>
          </div>
        </div>

        {statistics.popularRewards.length > 0 ? (
          <div className="space-y-4">
            {statistics.popularRewards.map((item, index) => (
              <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.reward.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        item.reward.rewardType === 'free' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.reward.rewardType === 'free' ? 'Free Service' : `${item.reward.discountPercentage}% Off`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500">redemptions</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaGift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No reward redemptions yet</p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <FaChartLine className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loyalty Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Participation Rate</h4>
            <p className="text-sm text-gray-700">
              {statistics.loyaltyParticipationRate}% of your clients are actively participating in the loyalty program.
              {parseFloat(statistics.loyaltyParticipationRate) > 75 ? 
                ' Excellent engagement!' : 
                ' Consider promoting the program to increase participation.'
              }
            </p>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ready to Redeem</h4>
            <p className="text-sm text-gray-700">
              {statistics.milestoneReached} client{statistics.milestoneReached !== 1 ? 's have' : ' has'} reached 
              reward milestones and can redeem rewards during their next visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 