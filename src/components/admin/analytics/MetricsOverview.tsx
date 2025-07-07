'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaChartLine, FaCut, FaGift, FaCalendarAlt, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface MetricData {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientGrowthPercentage: number;
  totalVisits: number;
  visitsThisMonth: number;
  visitGrowthPercentage: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueGrowthPercentage: number;
  averageVisitValue: number;
  totalServices: number;
  popularService: string;
  loyaltyMembersCount: number;
  loyaltyParticipationRate: number;
  rewardsRedeemed: number;
  averageVisitsPerClient: number;
}

interface MetricsOverviewProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function MetricsOverview({ dateRange }: MetricsOverviewProps) {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await fetch(`/api/admin/analytics/overview?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <FaArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <FaArrowDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Unable to load metrics data</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Clients */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaUsers className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(metrics.clientGrowthPercentage)}
            <span className={`text-sm font-medium ${getTrendColor(metrics.clientGrowthPercentage)}`}>
              {formatPercentage(metrics.clientGrowthPercentage)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalClients}</p>
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.newClientsThisMonth} new this month
          </p>
        </div>
      </div>

      {/* Active Clients */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaChartLine className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-green-600">
              {((metrics.activeClients / metrics.totalClients) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{metrics.activeClients}</p>
          <p className="text-sm text-gray-600">Active Clients</p>
          <p className="text-xs text-gray-500 mt-1">
            Visited in last 30 days
          </p>
        </div>
      </div>

      {/* Total Visits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FaCalendarAlt className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(metrics.visitGrowthPercentage)}
            <span className={`text-sm font-medium ${getTrendColor(metrics.visitGrowthPercentage)}`}>
              {formatPercentage(metrics.visitGrowthPercentage)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalVisits}</p>
          <p className="text-sm text-gray-600">Total Visits</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.visitsThisMonth} this month
          </p>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <FaDollarSign className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(metrics.revenueGrowthPercentage)}
            <span className={`text-sm font-medium ${getTrendColor(metrics.revenueGrowthPercentage)}`}>
              {formatPercentage(metrics.revenueGrowthPercentage)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(metrics.revenueThisMonth)} this month
          </p>
        </div>
      </div>

      {/* Average Visit Value */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FaCut className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageVisitValue)}</p>
          <p className="text-sm text-gray-600">Avg Visit Value</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.averageVisitsPerClient.toFixed(1)} visits per client
          </p>
        </div>
      </div>

      {/* Popular Service */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-pink-100 rounded-lg">
            <FaCut className="w-6 h-6 text-pink-600" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 truncate">{metrics.popularService}</p>
          <p className="text-sm text-gray-600">Most Popular Service</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.totalServices} total services
          </p>
        </div>
      </div>

      {/* Loyalty Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaGift className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-red-600">
              {metrics.loyaltyParticipationRate.toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{metrics.loyaltyMembersCount}</p>
          <p className="text-sm text-gray-600">Loyalty Members</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.rewardsRedeemed} rewards redeemed
          </p>
        </div>
      </div>

      {/* Business Health Score */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <FaArrowUp className="w-6 h-6 text-teal-600" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(
              (metrics.clientGrowthPercentage + metrics.visitGrowthPercentage + metrics.revenueGrowthPercentage) / 3 + 50
            )}
          </p>
          <p className="text-sm text-gray-600">Health Score</p>
          <p className="text-xs text-gray-500 mt-1">
            Business performance index
          </p>
        </div>
      </div>
    </div>
  );
} 