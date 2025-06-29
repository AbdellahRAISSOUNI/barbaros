'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaCrown, 
  FaChartLine,
  FaSpinner,
  FaLock,
  FaCheck,
  FaFire,
  FaAward,
  FaUsers
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  criteria: {
    type: string;
    value: number;
  };
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  icon?: string;
}

interface AchievementStats {
  totalPoints: number;
  completedCount: number;
  nextMilestone: number;
  rank: string;
  level: number;
}

export default function BarberAchievementsPage() {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAchievements();
    }
  }, [session]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/barber/achievements');
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
        setStats(data.stats);
      } else {
        toast.error('Failed to load achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Error loading achievements');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-gradient-to-r from-[#8B0000] to-[#A31515]';
    if (progress >= 75) return 'bg-gradient-to-r from-amber-600 to-amber-500';
    if (progress >= 50) return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
    return 'bg-gradient-to-r from-stone-600 to-stone-500';
  };

  const getRankIcon = (level: number) => {
    if (level >= 30) return FaCrown;
    if (level >= 20) return FaStar;
    if (level >= 10) return FaMedal;
    return FaTrophy;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Premium Welcome Section */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#A31515] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              {stats && getRankIcon(stats.level)({ className: "w-8 h-8 text-amber-200" })}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Achievement Center</h1>
              <p className="text-red-100">Level {stats?.level || 0} • {stats?.rank || 'Rookie'}</p>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.totalPoints}</div>
                <div className="text-sm text-red-100">Total Points</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.completedCount}</div>
                <div className="text-sm text-red-100">Achievements</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.nextMilestone}</div>
                <div className="text-sm text-red-100">Next Milestone</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{Math.round((stats.completedCount / achievements.length) * 100)}%</div>
                <div className="text-sm text-red-100">Completion</div>
              </div>
            </div>
          )}
        </div>

        {/* Achievement Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <FaSpinner className="w-8 h-8 animate-spin text-[#8B0000]" />
            </div>
          ) : (
            <>
              {/* Service Excellence */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FaAward className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-800">Service Excellence</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {achievements
                    .filter(a => a.type === 'service')
                    .map(achievement => (
                      <AchievementCard key={achievement._id} achievement={achievement} />
                    ))}
                </div>
              </div>

              {/* Client Loyalty */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-800">Client Loyalty</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {achievements
                    .filter(a => a.type === 'client')
                    .map(achievement => (
                      <AchievementCard key={achievement._id} achievement={achievement} />
                    ))}
                </div>
              </div>

              {/* Professional Growth */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#8B0000]/10 rounded-lg">
                      <FaFire className="w-5 h-5 text-[#8B0000]" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-800">Professional Growth</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {achievements
                    .filter(a => a.type === 'professional')
                    .map(achievement => (
                      <AchievementCard key={achievement._id} achievement={achievement} />
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const progressWidth = `${Math.min(100, achievement.progress)}%`;
  const progressColor = achievement.isCompleted 
    ? 'bg-gradient-to-r from-[#8B0000] to-[#A31515]' 
    : achievement.progress >= 75
    ? 'bg-gradient-to-r from-amber-600 to-amber-500'
    : 'bg-gradient-to-r from-emerald-600 to-emerald-500';

  return (
    <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${achievement.isCompleted ? 'bg-[#8B0000]/10' : 'bg-stone-100'}`}>
            {achievement.isCompleted ? (
              <FaCheck className="w-4 h-4 text-[#8B0000]" />
            ) : (
              <FaLock className="w-4 h-4 text-stone-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">{achievement.title}</h3>
            <p className="text-sm text-stone-600">{achievement.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FaTrophy className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-stone-700">{achievement.points}</span>
        </div>
      </div>

      <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full ${progressColor} transition-all duration-500`}
          style={{ width: progressWidth }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs font-medium text-stone-600">{achievement.progress}%</span>
        <span className="text-xs font-medium text-stone-600">
          {achievement.isCompleted ? 'Completed' : `${achievement.criteria.value} required`}
        </span>
      </div>
    </div>
  );
};
