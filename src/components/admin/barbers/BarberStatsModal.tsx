'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaCut, FaDollarSign, FaUsers, FaClock, FaTrophy, FaChartLine } from 'react-icons/fa';

interface Barber {
  _id: string;
  name: string;
  profilePicture?: string;
  joinDate: string;
}

interface MonthlyStats {
  month: string;
  visitsCount: number;
  revenue: number;
  uniqueClients: number;
}

interface ServiceStats {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

interface BarberStats {
  barberId: string;
  totalVisits: number;
  totalRevenue: number;
  uniqueClientsServed: string[];
  workDaysSinceJoining: number;
  averageVisitsPerDay: number;
  monthlyStats: MonthlyStats[];
  serviceStats: ServiceStats[];
  clientRetentionRate: number;
  averageServiceTime: number;
  topServices: string[];
  busyHours: number[];
}

interface BarberStatsModalProps {
  barber: Barber;
  onClose: () => void;
  onEdit?: () => void;
}

export default function BarberStatsModal({ barber, onClose, onEdit }: BarberStatsModalProps) {
  const [stats, setStats] = useState<BarberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBarberStats();
  }, [barber._id]);

  const fetchBarberStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/barbers/${barber._id}/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Error fetching barber stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWorkDurationText = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const getRecentMonthlyStats = () => {
    if (!stats?.monthlyStats) return [];
    return stats.monthlyStats
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  };

  const getTopServices = () => {
    if (!stats?.serviceStats) return [];
    return stats.serviceStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200',
      green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200',
      purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border-orange-200',
      red: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-red-200',
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className={`p-2 sm:p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200">
              {barber.profilePicture ? (
                <img
                  src={barber.profilePicture}
                  alt={barber.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <FaUser className="text-gray-400 text-lg sm:text-2xl" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{barber.name}</h2>
              <p className="text-sm sm:text-base text-gray-600">Performance Statistics</p>
              <p className="text-xs sm:text-sm text-gray-500">Joined {formatDate(barber.joinDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <FaUser size={14} />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)]">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchBarberStats}
                  className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {stats && (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                  icon={FaCut}
                  title="Total Visits"
                  value={stats.totalVisits.toLocaleString()}
                  subtitle={`${stats.averageVisitsPerDay.toFixed(1)} per day avg`}
                  color="blue"
                />
                <StatCard
                  icon={FaDollarSign}
                  title="Total Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  subtitle={`${formatCurrency(stats.totalRevenue / Math.max(stats.totalVisits, 1))} per visit`}
                  color="green"
                />
                <StatCard
                  icon={FaUsers}
                  title="Unique Clients"
                  value={stats.uniqueClientsServed.length.toLocaleString()}
                  subtitle={`${stats.clientRetentionRate.toFixed(1)}% retention`}
                  color="purple"
                />
                <StatCard
                  icon={FaClock}
                  title="Avg Service Time"
                  value={`${Math.round(stats.averageServiceTime)} min`}
                  subtitle="per visit"
                  color="orange"
                />
              </div>

              {/* Monthly Performance */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Monthly Performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRecentMonthlyStats().map((month, index) => (
                    <div
                      key={month.month}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{month.month}</span>
                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                          {index === 0 ? 'Current' : `${index + 1} months ago`}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Visits</span>
                          <span className="text-sm font-medium text-gray-900">{month.visitsCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Revenue</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Clients</span>
                          <span className="text-sm font-medium text-gray-900">{month.uniqueClients}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Services */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Top Services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTopServices().map((service, index) => (
                    <div
                      key={service.serviceId}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <FaTrophy className={index < 3 ? 'h-4 w-4' : 'h-3 w-3'} />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900 line-clamp-1">{service.serviceName}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Times Provided</span>
                          <span className="text-sm font-medium text-gray-900">{service.count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Revenue</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(service.revenue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg Revenue</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(service.revenue / service.count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Busy Hours */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Peak Hours</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Last 30 days
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-2">
                  {stats.busyHours.map((count, hour) => {
                    const maxCount = Math.max(...stats.busyHours);
                    const height = Math.max((count / maxCount) * 100, 10);
                    const isHighTraffic = count > maxCount * 0.7;
                    const isMediumTraffic = count > maxCount * 0.4;

                    return (
                      <div key={hour} className="flex flex-col items-center">
                        <div className="w-full h-24 sm:h-32 flex items-end mb-1">
                          <div
                            className={`w-full rounded-t-lg transition-all ${
                              isHighTraffic
                                ? 'bg-blue-500'
                                : isMediumTraffic
                                ? 'bg-blue-400'
                                : 'bg-blue-300'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 