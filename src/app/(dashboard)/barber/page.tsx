'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaCut, 
  FaUsers, 
  FaCalendarAlt, 
  FaTrophy, 
  FaChartLine, 
  FaQrcode, 
  FaHistory, 
  FaCrown, 
  FaAward, 
  FaMedal, 
  FaFire,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaBullseye,
  FaSync,
  FaPercentage,
  FaStar
} from 'react-icons/fa';
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
  earnedRewards?: number;
  redeemedRewards?: number;
  currentStreak?: number;
  serviceVariety?: number;
}

interface BarberRewardProgress {
  rewardId: string;
  name: string;
  description: string;
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';
  rewardValue: string;
  requirementType: 'visits' | 'clients' | 'months_worked' | 'client_retention' | 'custom';
  requirementValue: number;
  requirementDescription: string;
  category: string;
  icon: string;
  color: string;
  priority: number;
  currentValue: number;
  isEligible: boolean;
  isEarned: boolean;
  isRedeemed: boolean;
  earnedAt?: Date;
  redeemedAt?: Date;
  progressPercentage: number;
  redemptionId?: string;
  durationProgress?: {
    totalDays: number;
    months: number;
    remainingDays: number;
    displayText: string;
  };
}

export default function BarberDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<BarberStats | null>(null);
  const [topProgressReward, setTopProgressReward] = useState<BarberRewardProgress | null>(null);
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
      
      // Fetch barber stats and rewards data
      const [statsResponse, rewardsResponse] = await Promise.all([
        fetch(`/api/admin/barbers/${session.user.id}/stats`),
        fetch(`/api/barber/rewards?barberId=${session.user.id}`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          let enhancedStats = statsData.stats;
          
          // Add rewards data if available
          if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            if (rewardsData.success) {
              enhancedStats.earnedRewards = rewardsData.statistics.earnedRewards;
              enhancedStats.redeemedRewards = rewardsData.statistics.redeemedRewards;
              
              // Find the reward with highest progress that's not yet earned
              const inProgressRewards = rewardsData.rewards.filter(
                (r: BarberRewardProgress) => !r.isEarned && r.progressPercentage > 0
              );
              
              if (inProgressRewards.length > 0) {
                const highest = inProgressRewards.reduce((prev: BarberRewardProgress, current: BarberRewardProgress) => 
                  current.progressPercentage > prev.progressPercentage ? current : prev
                );
                setTopProgressReward(highest);
              }
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

  const formatProgress = (reward: BarberRewardProgress) => {
    if (reward.requirementType === 'months_worked' && reward.durationProgress) {
      return `${reward.durationProgress.displayText} / ${reward.requirementValue} months`;
    }
    switch (reward.requirementType) {
      case 'visits':
        return `${reward.currentValue.toLocaleString()} / ${reward.requirementValue.toLocaleString()} visits`;
      case 'clients':
        return `${reward.currentValue.toLocaleString()} / ${reward.requirementValue.toLocaleString()} clients`;
      case 'months_worked':
        return `${reward.currentValue} / ${reward.requirementValue} months`;
      case 'client_retention':
        return `${reward.currentValue}% / ${reward.requirementValue}% retention`;
      default:
        return `${reward.currentValue} / ${reward.requirementValue}`;
    }
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
              title="Rewards"
              description="Track progress"
              href="/barber/achievements"
              gradient="bg-gradient-to-r from-stone-600 to-stone-500"
          />
        </div>
      </div>

        {/* Achievement Progress Section */}
        {topProgressReward && (
          <Link href="/barber/achievements" className="block">
            <div className="bg-gradient-to-r from-[#8B0000] to-[#A31515] rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FaBullseye className="w-5 h-5 md:w-6 md:h-6 text-red-100" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold leading-tight">Achievement Progress</h2>
                    <p className="text-xs md:text-sm text-red-100">Your next milestone awaits</p>
                  </div>
                </div>
                <FaArrowRight className="w-4 h-4 md:w-5 md:h-5 text-red-200 flex-shrink-0" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm md:text-base font-semibold text-white truncate pr-2">
                    {topProgressReward.name}
                  </h3>
                  <span className="text-xs md:text-sm font-bold text-red-100 bg-white/10 px-2 py-1 rounded-full">
                    {topProgressReward.progressPercentage}%
                  </span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-white/20 rounded-full h-2 md:h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-white/90 to-white/70 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${topProgressReward.progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-red-100">
                    {formatProgress(topProgressReward)}
                  </span>
                  <span className="text-red-200 font-medium">
                    {topProgressReward.rewardValue}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

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
                  title="Rewards"
                  value={stats.earnedRewards || 0}
                  subtitle={`${stats.redeemedRewards || 0} redeemed`}
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

              {/* Enhanced Professional Stats */}
              <div className="bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-200/60 rounded-xl p-4 md:p-5 shadow-sm">
                <h3 className="text-sm md:text-base font-semibold text-stone-800 mb-4 flex items-center">
                  <FaStar className="w-4 h-4 mr-2 text-emerald-600" />
                  Professional Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/60 text-center hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FaChartLine className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-sm md:text-base font-semibold text-stone-800 mb-1">Efficiency</div>
                    <div className="text-xs md:text-sm text-stone-600 font-medium">{stats.averageVisitsPerDay?.toFixed(1) || 0}/day</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/60 text-center hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FaClock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-sm md:text-base font-semibold text-stone-800 mb-1">Avg Time</div>
                    <div className="text-xs md:text-sm text-stone-600 font-medium">{Math.round(stats.averageServiceTime || 0)} min</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/60 text-center hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FaSync className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-sm md:text-base font-semibold text-stone-800 mb-1">Retention</div>
                    <div className="text-xs md:text-sm text-stone-600 font-medium">{Math.round(stats.clientRetentionRate || 0)}%</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/60 text-center hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-purple-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FaCut className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-sm md:text-base font-semibold text-stone-800 mb-1">Variety</div>
                    <div className="text-xs md:text-sm text-stone-600 font-medium">{stats.serviceVariety || 0} types</div>
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