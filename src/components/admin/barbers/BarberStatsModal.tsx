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
}

export default function BarberStatsModal({ barber, onClose }: BarberStatsModalProps) {
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
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      red: 'bg-red-100 text-red-600 border-red-200',
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
              {barber.profilePicture ? (
                <img
                  src={barber.profilePicture}
                  alt={barber.name}
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center">
                  <FaUser className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{barber.name}</h2>
              <p className="text-gray-600">Performance Statistics</p>
              <p className="text-sm text-gray-500">Joined {formatDate(barber.joinDate)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {stats && (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={FaCut}
                  title="Total Visits"
                  value={stats.totalVisits}
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
                  value={stats.uniqueClientsServed.length}
                  subtitle={`${stats.clientRetentionRate.toFixed(1)}% retention rate`}
                  color="purple"
                />
                <StatCard
                  icon={FaCalendarAlt}
                  title="Work Period"
                  value={getWorkDurationText(stats.workDaysSinceJoining)}
                  subtitle={`${stats.workDaysSinceJoining} days total`}
                  color="orange"
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Monthly Performance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartLine className="mr-2" />
                    Recent Monthly Performance
                  </h3>
                  <div className="space-y-3">
                    {getRecentMonthlyStats().map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {month.uniqueClients} unique clients
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{month.visitsCount} visits</div>
                          <div className="text-sm text-green-600">{formatCurrency(month.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Services */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTrophy className="mr-2" />
                    Top Services
                  </h3>
                  <div className="space-y-3">
                    {getTopServices().map((service, index) => (
                      <div key={service.serviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{service.serviceName}</div>
                            <div className="text-sm text-gray-500">{service.count} times performed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatCurrency(service.revenue)}</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(service.revenue / Math.max(service.count, 1))} avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={FaClock}
                  title="Avg Service Time"
                  value={`${Math.round(stats.averageServiceTime)} min`}
                  subtitle="Per visit duration"
                  color="blue"
                />
                <StatCard
                  icon={FaUsers}
                  title="Client Retention"
                  value={`${stats.clientRetentionRate.toFixed(1)}%`}
                  subtitle="Repeat customers"
                  color="green"
                />
                <StatCard
                  icon={FaTrophy}
                  title="Peak Hours"
                  value={stats.busyHours.length > 0 ? `${stats.busyHours.length} hours` : 'N/A'}
                  subtitle={stats.busyHours.length > 0 ? `Most active: ${Math.max(...stats.busyHours)}:00` : 'No data yet'}
                  color="purple"
                />
              </div>

              {/* Achievements Section */}
              {stats.totalVisits > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500" />
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.totalVisits >= 100 && (
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <div className="text-center">
                          <div className="text-2xl mb-2">🏆</div>
                          <div className="font-semibold text-gray-900">Century Club</div>
                          <div className="text-sm text-gray-600">100+ visits completed</div>
                        </div>
                      </div>
                    )}
                    
                    {stats.workDaysSinceJoining >= 365 && (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="text-center">
                          <div className="text-2xl mb-2">📅</div>
                          <div className="font-semibold text-gray-900">One Year Strong</div>
                          <div className="text-sm text-gray-600">1+ year with the team</div>
                        </div>
                      </div>
                    )}
                    
                    {stats.clientRetentionRate >= 50 && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="text-center">
                          <div className="text-2xl mb-2">💯</div>
                          <div className="font-semibold text-gray-900">Client Favorite</div>
                          <div className="text-sm text-gray-600">High retention rate</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 