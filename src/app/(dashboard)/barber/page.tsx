'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCut, FaDollarSign, FaUsers, FaCalendarAlt, FaTrophy, FaChartLine, FaQrcode, FaHistory } from 'react-icons/fa';
import Link from 'next/link';

interface BarberStats {
  totalVisits: number;
  totalRevenue: number;
  uniqueClientsServed: string[];
  workDaysSinceJoining: number;
  averageVisitsPerDay: number;
  monthlyStats: Array<{
    month: string;
    visitsCount: number;
    revenue: number;
    uniqueClients: number;
  }>;
  serviceStats: Array<{
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  clientRetentionRate: number;
  averageServiceTime: number;
  topServices: string[];
}

export default function BarberDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<BarberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBarberStats();
    }
  }, [session]);

  const fetchBarberStats = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/barbers/${session.user.id}/stats`);
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

  const getWorkDurationText = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const getRecentMonth = () => {
    if (!stats?.monthlyStats || stats.monthlyStats.length === 0) return null;
    return stats.monthlyStats
      .sort((a, b) => b.month.localeCompare(a.month))[0];
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', href }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    href?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
    };

    const CardContent = (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    );

    return href ? (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    ) : CardContent;
  };

  const QuickActionCard = ({ icon: Icon, title, description, href, color }: {
    icon: any;
    title: string;
    description: string;
    href: string;
    color: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
    };

    return (
      <Link href={href}>
        <div className={`${colorClasses[color as keyof typeof colorClasses]} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}>
          <div className="flex items-center mb-4">
            <Icon className="h-8 w-8 mr-3" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-blue-100">{description}</p>
        </div>
      </Link>
    );
  };

  const recentMonth = getRecentMonth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Barber'}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Here's your performance overview and quick actions for today.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon={FaQrcode}
            title="Scan Client"
            description="Scan a QR code to record a new visit"
            href="/barber/scanner"
            color="blue"
          />
          <QuickActionCard
            icon={FaCut}
            title="View My Visits"
            description="See all visits you've completed"
            href="/barber/visits"
            color="green"
          />
          <QuickActionCard
            icon={FaHistory}
            title="Work History"
            description="View your detailed work history"
            href="/barber/history"
            color="purple"
          />
        </div>
      </div>

      {/* Statistics Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Performance</h2>
        
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBarberStats}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={FaCut}
                title="Total Visits"
                value={stats.totalVisits}
                subtitle={`${stats.averageVisitsPerDay.toFixed(1)} per day avg`}
                color="blue"
                href="/barber/visits"
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

            {/* Recent Month Performance */}
            {recentMonth && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="mr-2" />
                  This Month's Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{recentMonth.visitsCount}</div>
                    <div className="text-sm text-gray-600">Visits Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(recentMonth.revenue)}</div>
                    <div className="text-sm text-gray-600">Revenue Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{recentMonth.uniqueClients}</div>
                    <div className="text-sm text-gray-600">Unique Clients</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Services */}
            {stats.topServices && stats.topServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTrophy className="mr-2" />
                  Your Top Services
                </h3>
                <div className="space-y-2">
                  {stats.topServices.slice(0, 3).map((service, index) => (
                    <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="ml-3 font-medium text-gray-900">{service}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {stats.totalVisits > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTrophy className="mr-2 text-yellow-500" />
                  Your Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.totalVisits >= 10 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-semibold text-gray-900">Getting Started</div>
                      <div className="text-sm text-gray-600">10+ visits completed</div>
                    </div>
                  )}
                  
                  {stats.totalVisits >= 50 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                      <div className="text-2xl mb-2">⭐</div>
                      <div className="font-semibold text-gray-900">Rising Star</div>
                      <div className="text-sm text-gray-600">50+ visits completed</div>
                    </div>
                  )}
                  
                  {stats.totalVisits >= 100 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-semibold text-gray-900">Century Club</div>
                      <div className="text-sm text-gray-600">100+ visits completed</div>
                    </div>
                  )}
                  
                  {stats.workDaysSinceJoining >= 30 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                      <div className="text-2xl mb-2">📅</div>
                      <div className="font-semibold text-gray-900">First Month</div>
                      <div className="text-sm text-gray-600">30+ days with the team</div>
                    </div>
                  )}
                  
                  {stats.clientRetentionRate >= 30 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                      <div className="text-2xl mb-2">💯</div>
                      <div className="font-semibold text-gray-900">Client Favorite</div>
                      <div className="text-sm text-gray-600">High retention rate</div>
                    </div>
                  )}
                  
                  {stats.workDaysSinceJoining >= 365 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                      <div className="text-2xl mb-2">🎖️</div>
                      <div className="font-semibold text-gray-900">One Year Strong</div>
                      <div className="text-sm text-gray-600">1+ year with the team</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 