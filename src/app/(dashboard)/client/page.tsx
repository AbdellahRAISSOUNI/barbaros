'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaQrcode, 
  FaHistory, 
  FaGift, 
  FaUser, 
  FaCrown, 
  FaStar, 
  FaTrophy, 
  FaCalendarPlus, 
  FaChevronRight,
  FaGem,
  FaFireAlt,
  FaMagic
} from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';

interface LoyaltyStatus {
  client: any;
  selectedReward?: any;
  eligibleRewards: any[];
  visitsToNextReward: number;
  progressPercentage: number;
  canRedeem: boolean;
  totalVisits: number;
  currentProgressVisits: number;
  rewardsRedeemed: number;
  milestoneReached: boolean;
}

export default function ClientDashboardPage() {
  const { data: session, status } = useSession();
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(true);
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get loyalty tier info
  const getLoyaltyTier = (totalVisits: number) => {
    if (totalVisits >= 50) return { name: 'Diamond Elite', color: 'from-cyan-400 to-blue-500', icon: FaGem, bg: 'bg-gradient-to-br from-cyan-50 to-blue-50' };
    if (totalVisits >= 25) return { name: 'Gold Premier', color: 'from-amber-400 to-yellow-500', icon: FaCrown, bg: 'bg-gradient-to-br from-amber-50 to-yellow-50' };
    if (totalVisits >= 10) return { name: 'Silver Plus', color: 'from-slate-400 to-gray-500', icon: FaStar, bg: 'bg-gradient-to-br from-slate-50 to-gray-50' };
    return { name: 'Bronze Member', color: 'from-amber-600 to-orange-600', icon: FaFireAlt, bg: 'bg-gradient-to-br from-amber-50 to-orange-50' };
  };
  
  useEffect(() => {
    // Update time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Fetch loyalty data
    const fetchLoyaltyData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoadingLoyalty(true);
        const response = await fetch(`/api/loyalty/${session.user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setLoyaltyStatus(data.loyaltyStatus);
        }
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      } finally {
        setIsLoadingLoyalty(false);
      }
    };
    
    if (session?.user?.id) {
      fetchLoyaltyData();
    }

    return () => clearInterval(timeInterval);
  }, [session]);
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 to-orange-400/20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-amber-800 font-medium">Loading your premium experience...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200/50">
          <FaCrown className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Access Required</h1>
          <p className="text-amber-700 mb-6">Please sign in to access your premium dashboard.</p>
          <Link 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
          >
            Sign In to Continue
        </Link>
        </div>
      </div>
    );
  }

  const tier = loyaltyStatus ? getLoyaltyTier(loyaltyStatus.totalVisits) : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-6 pb-20 sm:pb-6">
        {/* Mobile-First Header Section */}
        <div className="mb-3 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-900">
                {getGreeting()}, <span className="text-amber-700">{session.user.name}</span>
              </h1>
              <p className="text-amber-600 font-medium text-sm sm:text-base mt-0.5">{currentTime}</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-amber-700">
              <FaMagic className="w-5 h-5" />
              <span className="font-semibold">Premium Member</span>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Loyalty Status Card */}
        <div className="mb-3 sm:mb-8">
          {isLoadingLoyalty ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-3xl p-3 sm:p-8 shadow-xl border border-amber-200/50">
              <div className="animate-pulse space-y-3 sm:space-y-6">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-amber-200 rounded-lg sm:rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 sm:h-6 bg-amber-200 rounded w-28 sm:w-48"></div>
                    <div className="h-3 sm:h-4 bg-amber-200 rounded w-20 sm:w-32"></div>
                  </div>
                </div>
                <div className="h-16 sm:h-24 bg-amber-200 rounded-lg sm:rounded-2xl"></div>
              </div>
            </div>
          ) : loyaltyStatus && tier ? (
            <div className={`relative overflow-hidden rounded-xl sm:rounded-3xl shadow-2xl border border-amber-200/50 ${tier.bg}`}>
              {/* Background Pattern - Adjusted for mobile */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-96 sm:h-96 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-48 sm:translate-x-48"></div>
              
              <div className="relative p-3 sm:p-8">
                {/* Mobile-First Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className={`p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-gradient-to-br ${tier.color} shadow-lg`}>
                      <tier.icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-2xl font-bold text-amber-900">Loyalty Status</h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 sm:mt-1">
                        <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r ${tier.color} text-white shadow-md`}>
                          {tier.name}
                        </span>
                        {loyaltyStatus.canRedeem && (
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md animate-pulse">
                            Reward Ready!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl sm:text-4xl font-bold text-amber-900">{loyaltyStatus.totalVisits}</div>
                    <div className="text-amber-700 font-medium text-xs sm:text-base">Total Visits</div>
                  </div>
                </div>

                {/* Mobile-Optimized Progress Section */}
                {loyaltyStatus.selectedReward ? (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-amber-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="mb-3 sm:mb-0">
                        <h3 className="text-base sm:text-lg font-bold text-amber-900">{loyaltyStatus.selectedReward.name}</h3>
                        <p className="text-amber-700 text-sm sm:text-base">{loyaltyStatus.selectedReward.description}</p>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-amber-900">
                          {loyaltyStatus.currentProgressVisits}/{loyaltyStatus.selectedReward.visitsRequired}
                        </div>
                        <div className="text-amber-700 text-xs sm:text-sm">visits</div>
                      </div>
                    </div>
                    
                    {/* Mobile-Optimized Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-amber-200/50 rounded-full h-3 sm:h-4 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 sm:h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                          style={{ width: `${Math.min(Math.max(0, loyaltyStatus.progressPercentage), 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Updated Progress Text */}
                      <div className="mt-2 text-center">
                        {loyaltyStatus.canRedeem ? (
                          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center space-x-1 animate-pulse shadow-lg">
                            <span>🎉</span>
                            <span>Ready to redeem!</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-amber-900 font-bold text-lg">
                              {loyaltyStatus.visitsToNextReward} {loyaltyStatus.visitsToNextReward === 1 ? 'visit' : 'visits'} to go!
                            </div>
                            <div className="text-amber-700 text-xs mt-0.5">
                              {loyaltyStatus.currentProgressVisits} of {loyaltyStatus.selectedReward.visitsRequired} visits completed
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-200/50 text-center">
                    <FaGift className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-2">Choose Your Next Reward</h3>
                    <p className="text-amber-700 text-sm sm:text-base mb-4">Select a goal and start earning towards your next reward</p>
                    <Link
                      href="/client/rewards"
                      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg text-sm sm:text-base"
                    >
                      Explore Rewards
                      <FaChevronRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200/50 text-center">
              <FaTrophy className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-amber-900 mb-2">Welcome to Your Loyalty Journey</h3>
              <p className="text-amber-700">Start your first visit to begin earning rewards</p>
            </div>
          )}
        </div>

        {/* Mobile-Optimized Stats Grid */}
        {loyaltyStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-emerald-200/50">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg">
                  <FaFireAlt className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-emerald-800 font-semibold text-sm sm:text-base">Current Streak</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-900">{loyaltyStatus.currentProgressVisits}</p>
                  <p className="text-emerald-700 text-xs sm:text-sm">visits this period</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-200/50">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl shadow-lg">
                  <FaTrophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-amber-800 font-semibold text-sm sm:text-base">Rewards Earned</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-900">{loyaltyStatus.rewardsRedeemed}</p>
                  <p className="text-amber-700 text-xs sm:text-sm">lifetime rewards</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-200/50">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                  <FaStar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-800 font-semibold text-sm sm:text-base">Available Rewards</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{loyaltyStatus.eligibleRewards.length}</p>
                  <p className="text-blue-700 text-xs sm:text-sm">ready to claim</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-8">
          <Link href="/client/qrcode" className="group">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-amber-200/50 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-105 transition-transform">
                  <FaQrcode className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-amber-900">My QR Code</h3>
                  <p className="text-xs text-amber-600 hidden sm:block">Show at visits</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/client/reservations/new" className="group">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-amber-200/50 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-105 transition-transform">
                  <FaCalendarPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-amber-900">Book Visit</h3>
                  <p className="text-xs text-amber-600 hidden sm:block">Schedule now</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/client/rewards" className="group">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-amber-200/50 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-105 transition-transform">
                  <FaGift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-amber-900">Rewards</h3>
                  <p className="text-xs text-amber-600 hidden sm:block">View benefits</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/client/history" className="group">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-amber-200/50 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-105 transition-transform">
                  <FaHistory className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-amber-900">History</h3>
                  <p className="text-xs text-amber-600 hidden sm:block">Past visits</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile-Optimized Quick Access History */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl shadow-lg">
                <FaHistory className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-900">Recent Activity</h3>
                <p className="text-amber-700 text-xs sm:text-sm">Your latest visits and rewards</p>
              </div>
          </div>
            <Link 
              href="/client/history"
              className="flex items-center justify-center sm:justify-start text-amber-700 hover:text-amber-900 font-medium transition-colors text-sm sm:text-base"
            >
              View All
              <FaChevronRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
      
          <div className="text-center py-6 sm:py-8">
            <FaMagic className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-amber-700 text-sm sm:text-base">Visit us to start building your reward history!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 