'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCut, FaUsers, FaCalendarAlt, FaTrophy, FaChartLine, FaQrcode, FaHistory, FaCrown, FaAward, FaMedal, FaFire } from 'react-icons/fa';
import Link from 'next/link';

interface BarberStats {
  totalVisits: number;
  uniqueClientsServed: string[];
  workDaysSinceJoining: number;
  averageVisitsPerDay: number;
  monthlyStats: Array<{
    month: string;
    visitsCount: number;
    uniqueClients: number;
  }>;
  serviceStats: Array<{
    serviceName: string;
    count: number;
  }>;
  clientRetentionRate: number;
  averageServiceTime: number;
  topServices: string[];
  achievementPoints?: number;
  completedAchievements?: number;
  currentStreak?: number;
  serviceVariety?: number;
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
      
      // Parallel requests for faster loading
      const [statsResponse, achievementsResponse] = await Promise.all([
        fetch(`/api/admin/barbers/${session.user.id}/stats`),
        fetch(`/api/barber/achievements?barberId=${session.user.id}`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          let enhancedStats = statsData.stats;
          
          // Add achievement data if available
          if (achievementsResponse.ok) {
            const achievementsData = await achievementsResponse.json();
            if (achievementsData.success) {
              const completedAchievements = achievementsData.achievements.filter((a: any) => a.isCompleted);
              enhancedStats.achievementPoints = completedAchievements.reduce((sum: number, a: any) => sum + a.points, 0);
              enhancedStats.completedAchievements = completedAchievements.length;
            }
          }
          
          // Calculate service variety
          enhancedStats.serviceVariety = enhancedStats.serviceStats?.length || 0;
          
          setStats(enhancedStats);
        } else {
          setError(statsData.error || 'Failed to load statistics');
        }
      } else {
        setError('Failed to load statistics');
      }
    } catch (error) {
      console.error('Error fetching barber stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
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

  const MetricCard = ({ icon: Icon, title, value, subtitle, gradient }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    gradient: string;
  }) => (
    <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 backdrop-blur-sm border border-stone-200/60 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-stone-600 truncate">{title}</p>
          <p className="text-lg md:text-xl font-bold text-stone-800 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, title, description, href, gradient }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    href: string;
    gradient: string;
  }) => (
    <Link href={href} className="block">
      <div className={`${gradient} text-white rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}>
        <div className="flex items-start space-x-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex-shrink-0">
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold leading-tight">{title}</h3>
            <p className="text-xs md:text-sm text-white/80 mt-1 leading-tight">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  const recentMonth = getRecentMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        
        {/* Premium Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <FaCrown className="w-4 h-4 md:w-5 md:h-5 text-amber-200" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold leading-tight">
                Welcome, {session?.user?.name?.split(' ')[0] || 'Barber'}
              </h1>
              <p className="text-xs md:text-sm text-emerald-100">Your premium workspace awaits</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile First */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-stone-800 mb-3 px-1">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <ActionButton
              icon={FaQrcode}
              title="Scan Client"
              description="Record new visit"
              href="/barber/scanner"
              gradient="bg-gradient-to-r from-emerald-600 to-emerald-500"
            />
            <ActionButton
              icon={FaHistory}
              title="History"
              description="View work history"
              href="/barber/history"
              gradient="bg-gradient-to-r from-amber-600 to-amber-500"
            />
            <ActionButton
              icon={FaTrophy}
              title="Achievements"
              description="Track progress"
              href="/barber/achievements"
              gradient="bg-gradient-to-r from-stone-600 to-stone-500"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-stone-800 mb-3 px-1">Performance</h2>
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={fetchBarberStats}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {stats && (
            <div className="space-y-4 md:space-y-5">
              {/* Main Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <MetricCard
                  icon={FaCut}
                  title="Total Visits"
                  value={stats.totalVisits}
                  subtitle={`${stats.averageVisitsPerDay?.toFixed(1) || 0}/day avg`}
                  gradient="bg-gradient-to-r from-emerald-600 to-emerald-500"
                />
                <MetricCard
                  icon={FaUsers}
                  title="Clients"
                  value={stats.uniqueClientsServed?.length || 0}
                  subtitle={`${stats.clientRetentionRate?.toFixed(1) || 0}% retention`}
                  gradient="bg-gradient-to-r from-amber-600 to-amber-500"
                />
                <MetricCard
                  icon={FaMedal}
                  title="Achievement Points"
                  value={stats.achievementPoints || 0}
                  subtitle={`${stats.completedAchievements || 0} achievements`}
                  gradient="bg-gradient-to-r from-stone-600 to-stone-500"
                />
                <MetricCard
                  icon={FaCalendarAlt}
                  title="Experience"
                  value={getWorkDurationText(stats.workDaysSinceJoining)}
                  subtitle={`${stats.workDaysSinceJoining} days`}
                  gradient="bg-gradient-to-r from-emerald-700 to-emerald-600"
                />
              </div>

              {/* Monthly Performance */}
              {recentMonth && (
                <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 border border-stone-200/60 rounded-xl p-4 md:p-5 shadow-sm">
                  <h3 className="text-sm md:text-base font-semibold text-stone-800 mb-3 flex items-center">
                    <FaChartLine className="w-4 h-4 mr-2 text-emerald-600" />
                    This Month
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-emerald-700">{recentMonth.visitsCount}</div>
                      <div className="text-xs md:text-sm text-stone-600 font-medium">Visits</div>
                    </div>
                    <div className="text-center border-l border-stone-200 pl-3">
                      <div className="text-xl md:text-2xl font-bold text-amber-700">{recentMonth.uniqueClients}</div>
                      <div className="text-xs md:text-sm text-stone-600 font-medium">Clients</div>
                    </div>
                    <div className="text-center border-l border-stone-200 pl-3">
                      <div className="text-xl md:text-2xl font-bold text-stone-700">{stats.serviceVariety || 0}</div>
                      <div className="text-xs md:text-sm text-stone-600 font-medium">Services</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Services - Compact */}
              {stats.topServices && stats.topServices.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/60 rounded-xl p-4 md:p-5 shadow-sm">
                  <h3 className="text-sm md:text-base font-semibold text-stone-800 mb-3 flex items-center">
                    <FaAward className="w-4 h-4 mr-2 text-amber-600" />
                    Top Services
                  </h3>
                  <div className="space-y-2">
                    {stats.topServices.slice(0, 3).map((service, index) => (
                      <div key={service} className="flex items-center space-x-3 p-2 md:p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40">
                        <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                          index === 0 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
                          index === 1 ? 'bg-gradient-to-r from-stone-400 to-stone-300' : 
                          'bg-gradient-to-r from-amber-600 to-amber-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm md:text-base font-medium text-stone-800 flex-1">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Insights */}
              <div className="bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-200/60 rounded-xl p-4 md:p-5 shadow-sm">
                <h3 className="text-sm md:text-base font-semibold text-stone-800 mb-3 flex items-center">
                  <FaFire className="w-4 h-4 mr-2 text-emerald-600" />
                  Professional Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/60 text-center">
                    <div className="text-lg mb-1">📊</div>
                    <div className="text-xs md:text-sm font-semibold text-stone-800">Efficiency</div>
                    <div className="text-xs text-stone-600">{stats.averageVisitsPerDay?.toFixed(1) || 0}/day</div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/60 text-center">
                    <div className="text-lg mb-1">⏱️</div>
                    <div className="text-xs md:text-sm font-semibold text-stone-800">Avg Time</div>
                    <div className="text-xs text-stone-600">{stats.averageServiceTime || 0} min</div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/60 text-center">
                    <div className="text-lg mb-1">🎯</div>
                    <div className="text-xs md:text-sm font-semibold text-stone-800">Retention</div>
                    <div className="text-xs text-stone-600">{stats.clientRetentionRate?.toFixed(0) || 0}%</div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/60 text-center">
                    <div className="text-lg mb-1">🏅</div>
                    <div className="text-xs md:text-sm font-semibold text-stone-800">Variety</div>
                    <div className="text-xs text-stone-600">{stats.serviceVariety || 0} types</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 