'use client';

import { useState } from 'react';
import { FaCalendarAlt, FaDownload, FaExpandArrowsAlt, FaCog } from 'react-icons/fa';

// Import individual analytics components
import MetricsOverview from './MetricsOverview';
import ClientGrowthChart from './ClientGrowthChart';
import ServicePopularityChart from './ServicePopularityChart';
import VisitFrequencyChart from './VisitFrequencyChart';

interface DashboardWidgetsProps {
  initialDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export default function DashboardWidgets({ initialDateRange }: DashboardWidgetsProps) {
  const [dateRange, setDateRange] = useState(
    initialDateRange || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  );

  const [activeWidgets, setActiveWidgets] = useState({
    overview: true,
    clientGrowth: true,
    servicePopularity: true,
    visitFrequency: true
  });

  const [layout, setLayout] = useState<'grid' | 'vertical'>('grid');
  const [isExporting, setIsExporting] = useState(false);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleWidget = (widget: keyof typeof activeWidgets) => {
    setActiveWidgets(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  const exportAnalytics = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/admin/analytics/export?${new URLSearchParams(dateRange)}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getQuickDateRanges = () => [
    {
      label: 'Last 7 days',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      label: 'Last 30 days',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      label: 'Last 90 days',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      label: 'This year',
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
              <FaCalendarAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-sm text-gray-600">Comprehensive business insights and analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Layout Toggle */}
            <button
              onClick={() => setLayout(layout === 'grid' ? 'vertical' : 'grid')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title={`Switch to ${layout === 'grid' ? 'vertical' : 'grid'} layout`}
            >
              <FaExpandArrowsAlt className="w-4 h-4" />
              {layout === 'grid' ? 'Vertical' : 'Grid'}
            </button>

            {/* Export Button */}
            <button
              onClick={exportAnalytics}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaDownload className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Custom Date Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Custom Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Date Ranges */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Quick Select</label>
            <div className="grid grid-cols-2 gap-2">
              {getQuickDateRanges().map((range, index) => (
                <button
                  key={index}
                  onClick={() => setDateRange({ startDate: range.startDate, endDate: range.endDate })}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Widget Controls */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Active Widgets</label>
            <div className="flex items-center gap-2">
              <FaCog className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Customize dashboard</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {Object.entries(activeWidgets).map(([key, isActive]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleWidget(key as keyof typeof activeWidgets)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className={`${layout === 'grid' ? 'space-y-6' : 'space-y-8'}`}>
        {activeWidgets.overview && (
          <div className="transition-all duration-300 hover:transform hover:-translate-y-1">
            <MetricsOverview dateRange={dateRange} />
          </div>
        )}

        <div className={layout === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : 'space-y-6'}>
          {activeWidgets.clientGrowth && (
            <div className="transition-all duration-300 hover:transform hover:-translate-y-1">
              <ClientGrowthChart dateRange={dateRange} />
            </div>
          )}

          {activeWidgets.servicePopularity && (
            <div className="transition-all duration-300 hover:transform hover:-translate-y-1">
              <ServicePopularityChart dateRange={dateRange} />
            </div>
          )}
        </div>

        {activeWidgets.visitFrequency && (
          <div className="transition-all duration-300 hover:transform hover:-translate-y-1">
            <VisitFrequencyChart dateRange={dateRange} />
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Analytics Summary</h3>
          <p className="text-sm text-gray-600 mb-4">
            Showing data from {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="bg-white rounded-lg p-3">
              <span className="font-medium">🎯 Key Focus:</span>
              <p>Monitor client growth and service performance</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="font-medium">📈 Trending:</span>
              <p>Track loyalty program effectiveness</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="font-medium">💡 Insights:</span>
              <p>Optimize business operations and client retention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 