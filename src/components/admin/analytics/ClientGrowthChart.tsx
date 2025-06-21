'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface ClientGrowthData {
  date: string;
  newClients: number;
  totalClients: number;
  activeClients: number;
}

interface ClientGrowthChartProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function ClientGrowthChart({ dateRange }: ClientGrowthChartProps) {
  const [growthData, setGrowthData] = useState<ClientGrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  useEffect(() => {
    fetchGrowthData();
  }, [dateRange, viewMode]);

  const fetchGrowthData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period: viewMode
      });
      
      const response = await fetch(`/api/admin/analytics/client-growth?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setGrowthData(data.growthData);
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxValue = () => {
    return Math.max(...growthData.map(item => Math.max(item.newClients, item.totalClients / 10, item.activeClients)));
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return `${(value / maxValue) * 100}%`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (viewMode) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return dateStr;
    }
  };

  const getTotalGrowth = () => {
    if (growthData.length < 2) return 0;
    const first = growthData[0].totalClients;
    const last = growthData[growthData.length - 1].totalClients;
    return ((last - first) / first) * 100;
  };

  const getNewClientsTotal = () => {
    return growthData.reduce((sum, item) => sum + item.newClients, 0);
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

  const maxValue = getMaxValue();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <FaUsers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Client Growth Analytics</h3>
            <p className="text-sm text-gray-600">Track client acquisition and retention over time</p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaUsers className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">New Clients</p>
              <p className="text-lg font-bold text-blue-800">{getNewClientsTotal()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaChartLine className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Growth Rate</p>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold text-green-800">{getTotalGrowth().toFixed(1)}%</p>
                {getTotalGrowth() >= 0 ? (
                  <FaArrowUp className="w-3 h-3 text-green-600" />
                ) : (
                  <FaArrowDown className="w-3 h-3 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Current Total</p>
              <p className="text-lg font-bold text-purple-800">
                {growthData.length > 0 ? growthData[growthData.length - 1].totalClients : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Client Growth Visualization</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>New Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Active Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Total Clients (÷10)</span>
            </div>
          </div>
        </div>

        {growthData.length > 0 ? (
          <div className="relative h-64 border border-gray-200 rounded-lg p-4">
            <div className="flex items-end justify-between h-full gap-2">
              {growthData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  {/* Bars */}
                  <div className="relative w-full flex items-end justify-center gap-1 h-48">
                    {/* New Clients Bar */}
                    <div className="relative group">
                      <div
                        className="w-4 bg-blue-500 rounded-t"
                        style={{ height: getBarHeight(item.newClients, maxValue) }}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        New: {item.newClients}
                      </div>
                    </div>

                    {/* Active Clients Bar */}
                    <div className="relative group">
                      <div
                        className="w-4 bg-green-500 rounded-t"
                        style={{ height: getBarHeight(item.activeClients, maxValue) }}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Active: {item.activeClients}
                      </div>
                    </div>

                    {/* Total Clients Bar (scaled down) */}
                    <div className="relative group">
                      <div
                        className="w-4 bg-purple-500 rounded-t"
                        style={{ height: getBarHeight(item.totalClients / 10, maxValue) }}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Total: {item.totalClients}
                      </div>
                    </div>
                  </div>

                  {/* Date Label */}
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-left whitespace-nowrap">
                    {formatDate(item.date)}
                  </span>
                </div>
              ))}
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500">
              <span>{Math.round(maxValue)}</span>
              <span>{Math.round(maxValue * 0.75)}</span>
              <span>{Math.round(maxValue * 0.5)}</span>
              <span>{Math.round(maxValue * 0.25)}</span>
              <span>0</span>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaChartLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No growth data available for the selected period</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {growthData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">📈 Growth Insights</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              • Average new clients per {viewMode.slice(0, -2)}: {(getNewClientsTotal() / growthData.length).toFixed(1)}
            </p>
            <p>
              • Best performing period: {growthData.reduce((best, current) => 
                current.newClients > best.newClients ? current : best
              ).date} ({Math.max(...growthData.map(item => item.newClients))} new clients)
            </p>
            <p>
              • Client retention rate: {growthData.length > 0 
                ? ((growthData[growthData.length - 1].activeClients / growthData[growthData.length - 1].totalClients) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 