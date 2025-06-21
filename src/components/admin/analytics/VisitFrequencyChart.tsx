'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaChartLine, FaUsers, FaFilter } from 'react-icons/fa';

interface VisitFrequencyData {
  period: string;
  totalVisits: number;
  uniqueClients: number;
  averageVisitsPerClient: number;
  peakHour: string;
  peakDay: string;
  hourlyDistribution: { hour: number; visits: number }[];
  dailyDistribution: { day: string; visits: number }[];
  weeklyPattern: { week: string; visits: number }[];
}

interface ClientVisitPattern {
  clientId: string;
  clientName: string;
  totalVisits: number;
  averageDaysBetweenVisits: number;
  lastVisit: string;
  frequency: 'high' | 'medium' | 'low';
  pattern: 'regular' | 'irregular' | 'new';
}

interface VisitFrequencyChartProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function VisitFrequencyChart({ dateRange }: VisitFrequencyChartProps) {
  const [frequencyData, setFrequencyData] = useState<VisitFrequencyData | null>(null);
  const [clientPatterns, setClientPatterns] = useState<ClientVisitPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'hourly' | 'daily' | 'clients'>('overview');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchFrequencyData();
  }, [dateRange, frequencyFilter]);

  const fetchFrequencyData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        frequency: frequencyFilter
      });
      
      const response = await fetch(`/api/admin/analytics/visit-frequency?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFrequencyData(data.frequencyData);
        setClientPatterns(data.clientPatterns || []);
      }
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxHourlyVisits = () => {
    if (!frequencyData?.hourlyDistribution) return 0;
    return Math.max(...frequencyData.hourlyDistribution.map(item => item.visits));
  };

  const getMaxDailyVisits = () => {
    if (!frequencyData?.dailyDistribution) return 0;
    return Math.max(...frequencyData.dailyDistribution.map(item => item.visits));
  };

  const getBarHeight = (value: number, maxValue: number) => {
    if (maxValue === 0) return '0%';
    return `${(value / maxValue) * 100}%`;
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'regular': return '🔄';
      case 'irregular': return '🔀';
      case 'new': return '🆕';
      default: return '👤';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!frequencyData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Unable to load visit frequency data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <FaCalendarAlt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visit Frequency Analytics</h3>
            <p className="text-sm text-gray-600">Analyze visit patterns and client behavior</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Frequency Filter */}
          <div className="relative">
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Frequencies</option>
              <option value="high">High Frequency</option>
              <option value="medium">Medium Frequency</option>
              <option value="low">Low Frequency</option>
            </select>
            <FaFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: FaChartLine },
              { key: 'hourly', label: 'Hourly', icon: FaClock },
              { key: 'daily', label: 'Daily', icon: FaCalendarAlt },
              { key: 'clients', label: 'Clients', icon: FaUsers }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === key
                    ? 'bg-white text-green-600 shadow-sm'
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Visits</p>
              <p className="text-lg font-bold text-blue-800">{frequencyData.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaUsers className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Unique Clients</p>
              <p className="text-lg font-bold text-green-800">{frequencyData.uniqueClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaChartLine className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Visits/Client</p>
              <p className="text-lg font-bold text-purple-800">{frequencyData.averageVisitsPerClient.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaClock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Peak Hour</p>
              <p className="text-lg font-bold text-yellow-800">{frequencyData.peakHour}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on View Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Times Summary */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">📊 Peak Patterns</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Busiest Day</span>
                <span className="font-medium">{frequencyData.peakDay}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Busiest Hour</span>
                <span className="font-medium">{frequencyData.peakHour}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Visit Frequency</span>
                <span className="font-medium">Every {(7 / frequencyData.averageVisitsPerClient).toFixed(1)} days</span>
              </div>
            </div>
          </div>

          {/* Quick Pattern Insights */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">🎯 Quick Insights</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• {frequencyData.uniqueClients} clients visited {frequencyData.totalVisits} times</p>
              <p>• Most active day: {frequencyData.peakDay}</p>
              <p>• Most active hour: {frequencyData.peakHour}</p>
              <p>• Average visits per client: {frequencyData.averageVisitsPerClient.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'hourly' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">⏰ Hourly Visit Distribution</h4>
          <div className="relative h-64 border border-gray-200 rounded-lg p-4">
            <div className="flex items-end justify-between h-full gap-1">
              {frequencyData.hourlyDistribution.map((item) => (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative group w-full">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: getBarHeight(item.visits, getMaxHourlyVisits()) }}
                    ></div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.visits} visits
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-left">
                    {formatHour(item.hour)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'daily' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">📅 Daily Visit Distribution</h4>
          <div className="grid grid-cols-7 gap-2">
            {frequencyData.dailyDistribution.map((item) => (
              <div key={item.day} className="text-center">
                <div className="h-32 flex flex-col justify-end mb-2">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: getBarHeight(item.visits, getMaxDailyVisits()) }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.day}</span>
                <p className="text-xs text-gray-600">{item.visits} visits</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">👥 Client Visit Patterns</h4>
            <span className="text-sm text-gray-600">{clientPatterns.length} clients analyzed</span>
          </div>
          
          {clientPatterns.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {clientPatterns.map((client) => (
                <div key={client.clientId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getPatternIcon(client.pattern)}</span>
                      <div>
                        <h5 className="font-medium text-gray-900">{client.clientName}</h5>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getFrequencyColor(client.frequency)}`}>
                            {client.frequency} frequency
                          </span>
                          <span className="text-xs text-gray-500">{client.pattern} pattern</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{client.totalVisits}</p>
                      <p className="text-xs text-gray-600">visits</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Avg Days Between:</span>
                      <span className="ml-1">{client.averageDaysBetweenVisits} days</span>
                    </div>
                    <div>
                      <span className="font-medium">Last Visit:</span>
                      <span className="ml-1">{new Date(client.lastVisit).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No client patterns available for the selected period</p>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">💡 Visit Frequency Insights</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Peak business hours: {frequencyData.peakHour} on {frequencyData.peakDay}s</p>
          <p>• Client retention rate: {((frequencyData.uniqueClients / frequencyData.totalVisits) * 100).toFixed(1)}%</p>
          <p>• Average visit frequency: {frequencyData.averageVisitsPerClient.toFixed(1)} visits per client</p>
          <p>• Most loyal clients visit every {Math.round(30 / frequencyData.averageVisitsPerClient)} days on average</p>
        </div>
      </div>
    </div>
  );
} 