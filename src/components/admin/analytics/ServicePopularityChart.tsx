'use client';

import { useState, useEffect } from 'react';
import { FaCut, FaChartBar, FaDollarSign, FaUsers, FaClock, FaFilter } from 'react-icons/fa';

interface ServicePopularityData {
  serviceId: string;
  serviceName: string;
  category: string;
  totalBookings: number;
  totalRevenue: number;
  averagePrice: number;
  uniqueClients: number;
  averageRating?: number;
  trendPercentage: number;
  lastMonthBookings: number;
  thisMonthBookings: number;
}

interface ServicePopularityChartProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function ServicePopularityChart({ dateRange }: ServicePopularityChartProps) {
  const [popularityData, setPopularityData] = useState<ServicePopularityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'bookings' | 'revenue' | 'clients' | 'trend'>('bookings');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPopularityData();
  }, [dateRange, sortBy, categoryFilter]);

  const fetchPopularityData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        sortBy,
        category: categoryFilter
      });
      
      const response = await fetch(`/api/admin/analytics/service-popularity?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPopularityData(data.services);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching popularity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxValue = (field: keyof ServicePopularityData) => {
    return Math.max(...popularityData.map(item => Number(item[field]) || 0));
  };

  const getBarWidth = (value: number, maxValue: number) => {
    if (maxValue === 0) return '0%';
    return `${(value / maxValue) * 100}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage > 10) return '📈';
    if (percentage > 0) return '⬆️';
    if (percentage < -10) return '📉';
    if (percentage < 0) return '⬇️';
    return '➡️';
  };

  const getServiceColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxBookings = getMaxValue('totalBookings');
  const maxRevenue = getMaxValue('totalRevenue');
  const maxClients = getMaxValue('uniqueClients');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <FaCut className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Popularity Analytics</h3>
            <p className="text-sm text-gray-600">Track service performance and trends</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <FaFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'bookings', label: 'Bookings', icon: FaChartBar },
              { key: 'revenue', label: 'Revenue', icon: FaDollarSign },
              { key: 'clients', label: 'Clients', icon: FaUsers },
              { key: 'trend', label: 'Trend', icon: FaClock }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as any)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  sortBy === key
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaChartBar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Bookings</p>
              <p className="text-lg font-bold text-blue-800">
                {popularityData.reduce((sum, item) => sum + item.totalBookings, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaDollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <p className="text-lg font-bold text-green-800">
                {formatCurrency(popularityData.reduce((sum, item) => sum + item.totalRevenue, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaUsers className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Unique Clients</p>
              <p className="text-lg font-bold text-purple-800">
                {Math.max(...popularityData.map(item => item.uniqueClients))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaCut className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Avg Service Price</p>
              <p className="text-lg font-bold text-yellow-800">
                {popularityData.length > 0
                  ? formatCurrency(popularityData.reduce((sum, item) => sum + item.averagePrice, 0) / popularityData.length)
                  : '$0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service List with Visual Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
          <span>Service Performance Rankings</span>
          <span>Sorted by {sortBy}</span>
        </div>

        {popularityData.length > 0 ? (
          <div className="space-y-3">
            {popularityData.map((service, index) => (
              <div key={service.serviceId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <div className={`w-3 h-3 rounded-full ${getServiceColor(index)}`}></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{service.category}</span>
                        <span className="flex items-center gap-1">
                          {getTrendIcon(service.trendPercentage)}
                          <span className={getTrendColor(service.trendPercentage)}>
                            {service.trendPercentage > 0 ? '+' : ''}{service.trendPercentage.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(service.averagePrice)}</p>
                    <p className="text-sm text-gray-600">per service</p>
                  </div>
                </div>

                {/* Performance Bars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bookings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bookings</span>
                      <span className="font-medium">{service.totalBookings}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: getBarWidth(service.totalBookings, maxBookings) }}
                      ></div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-medium">{formatCurrency(service.totalRevenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: getBarWidth(service.totalRevenue, maxRevenue) }}
                      ></div>
                    </div>
                  </div>

                  {/* Unique Clients */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Unique Clients</span>
                      <span className="font-medium">{service.uniqueClients}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: getBarWidth(service.uniqueClients, maxClients) }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Monthly Comparison */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Last month: {service.lastMonthBookings} bookings</span>
                    <span>This month: {service.thisMonthBookings} bookings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaCut className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Data</h3>
            <p className="text-gray-600">Service popularity analytics will appear here once you have bookings.</p>
          </div>
        )}
      </div>

      {/* Insights */}
      {popularityData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">🎯 Service Insights</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              • Top performing service: {popularityData[0]?.serviceName} ({popularityData[0]?.totalBookings} bookings)
            </p>
            <p>
              • Highest revenue generator: {popularityData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.serviceName} ({formatCurrency(popularityData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.totalRevenue)})
            </p>
            <p>
              • Most trending service: {popularityData.sort((a, b) => b.trendPercentage - a.trendPercentage)[0]?.serviceName} ({popularityData.sort((a, b) => b.trendPercentage - a.trendPercentage)[0]?.trendPercentage.toFixed(1)}% growth)
            </p>
            <p>
              • Average bookings per service: {(popularityData.reduce((sum, item) => sum + item.totalBookings, 0) / popularityData.length).toFixed(1)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 