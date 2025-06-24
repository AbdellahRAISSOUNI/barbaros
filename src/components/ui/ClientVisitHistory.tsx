'use client';

import { useState, useEffect } from 'react';
import { 
  FaHistory, 
  FaCut, 
  FaCalendarAlt, 
  FaDownload, 
  FaFilter, 
  FaEye, 
  FaSearch, 
  FaChartLine, 
  FaGift, 
  FaUser, 
  FaTimes, 
  FaClock,
  FaStar,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Service {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  category?: string;
}

interface RewardRedemption {
  rewardId: string;
  rewardName: string;
  rewardType: 'free' | 'discount';
  discountPercentage?: number;
  discountAmount?: number;
  redeemedAt: string;
  redeemedBy: string;
}

interface Visit {
  _id: string;
  visitDate: string;
  services: Service[];
  totalPrice: number;
  barber: string;
  notes?: string;
  visitNumber: number;
  rewardRedeemed?: boolean;
  redeemedReward?: RewardRedemption;
}

interface VisitHistoryStats {
  totalVisits: number;
  totalSpent: number;
  averageSpent: number;
  favoriteServices: Array<{
    name: string;
    count: number;
  }>;
  mostFrequentBarber: string;
  rewardsRedeemed: number;
  lastVisit?: string;
  totalServiceTime: number;
}

interface ClientVisitHistoryProps {
  clientId: string;
}

export default function ClientVisitHistory({ clientId }: ClientVisitHistoryProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitHistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  
  // Filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [serviceFilter, setServiceFilter] = useState('');
  const [barberFilter, setBarberFilter] = useState('');
  const [rewardFilter, setRewardFilter] = useState<'all' | 'redeemed' | 'regular'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Store all visits for accurate stats calculation
  const [allVisits, setAllVisits] = useState<Visit[]>([]);

  // Fetch visit history
  const fetchVisitHistory = async (page = 1) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(serviceFilter && { service: serviceFilter }),
        ...(barberFilter && { barber: barberFilter }),
        ...(rewardFilter !== 'all' && { rewardFilter })
      });

      const response = await fetch(`/api/clients/${clientId}/visits?${queryParams}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVisits(data.visits);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
        setCurrentPage(page);
        
        // Fetch all visits for accurate stats calculation if first page
        if (page === 1) {
          fetchAllVisitsForStats();
        }
      } else {
        toast.error('Failed to load visit history');
      }
    } catch (error) {
      console.error('Error fetching visit history:', error);
      toast.error('Failed to load visit history');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all visits for stats calculation
  const fetchAllVisitsForStats = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000', // Get a large number to ensure we get all visits
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(serviceFilter && { service: serviceFilter }),
        ...(barberFilter && { barber: barberFilter }),
        ...(rewardFilter !== 'all' && { rewardFilter })
      });

      const response = await fetch(`/api/clients/${clientId}/visits?${queryParams}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setAllVisits(data.visits);
        calculateStats(data.visits);
      }
    } catch (error) {
      console.error('Error fetching all visits for stats:', error);
    }
  };

  // Calculate comprehensive statistics
  const calculateStats = (visitsData: Visit[]) => {
    if (!visitsData.length) {
      setStats(null);
      return;
    }

    const totalSpent = visitsData.reduce((sum, visit) => sum + visit.totalPrice, 0);
    const serviceCount: { [key: string]: number } = {};
    const barberCount: { [key: string]: number } = {};
    let rewardsRedeemed = 0;
    let totalServiceTime = 0;

    visitsData.forEach(visit => {
      if (visit.rewardRedeemed) rewardsRedeemed++;
      
      if (visit.barber) {
        barberCount[visit.barber] = (barberCount[visit.barber] || 0) + 1;
      }
      
      visit.services.forEach(service => {
        serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
        totalServiceTime += service.duration;
      });
    });

    const favoriteServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const mostFrequentBarber = Object.entries(barberCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    setStats({
      totalVisits: visitsData.length,
      totalSpent,
      averageSpent: totalSpent / visitsData.length,
      favoriteServices,
      mostFrequentBarber,
      rewardsRedeemed,
      lastVisit: visitsData[0]?.visitDate,
      totalServiceTime
    });
  };

  useEffect(() => {
    if (clientId) {
      fetchVisitHistory();
    }
  }, [clientId]);

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchVisitHistory(1);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setServiceFilter('');
    setBarberFilter('');
    setRewardFilter('all');
    setCurrentPage(1);
    fetchVisitHistory(1);
    setShowFilters(false);
  };

  // Export data
  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/clients/${clientId}/visits/export?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visit-history-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Visit history exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      short: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      }),
      time: date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      relative: getRelativeTime(date)
    };
  };

  // Get relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  // Render loading state
  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-none md:rounded-2xl shadow-lg p-4 md:p-6 text-white -mx-4 md:mx-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl">
              <FaHistory className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Visit History</h1>
              <p className="text-blue-100 text-sm md:text-lg">Your complete barbershop journey</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 md:px-4 py-2 rounded-md transition-all duration-200 text-xs md:text-sm font-medium ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 md:px-4 py-2 rounded-md transition-all duration-200 text-xs md:text-sm font-medium ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-gray-900' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Timeline
              </button>
            </div>

            {/* Mobile View Mode Toggle */}
            <div className="flex md:hidden bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <FaHistory className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-gray-900' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <FaClock className="w-3 h-3" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <FaFilter className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium hidden sm:inline">Filters</span>
            </button>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                <FaFileExport className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-2 py-2 w-32 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => exportData('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-none md:rounded-2xl shadow-sm border-t border-gray-200 md:border md:border-gray-200 p-4 md:p-6 -mx-4 md:mx-0">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Filter Visits</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-y-0 mb-4 md:mb-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Service</label>
              <input
                type="text"
                placeholder="Service name..."
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Barber</label>
              <input
                type="text"
                placeholder="Barber name..."
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Visit Type</label>
            <select
              value={rewardFilter}
              onChange={(e) => setRewardFilter(e.target.value as 'all' | 'redeemed' | 'regular')}
              className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="all">All Visits</option>
              <option value="redeemed">Reward Redemptions</option>
              <option value="regular">Regular Visits</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={applyFilters}
              className="flex-1 sm:flex-none px-6 py-3 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 sm:flex-none px-6 py-3 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-blue-500 rounded-lg md:rounded-xl">
                <FaCalendarAlt className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm font-medium text-blue-600">Total Visits</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-800">{stats.totalVisits}</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-blue-600">
              Last visit: {stats.lastVisit ? formatDate(stats.lastVisit).relative : 'N/A'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-purple-500 rounded-lg md:rounded-xl">
                <FaGift className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm font-medium text-purple-600">Rewards Used</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-800">{stats.rewardsRedeemed}</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-purple-600">
              {stats.rewardsRedeemed > 0 ? `${((stats.rewardsRedeemed / stats.totalVisits) * 100).toFixed(1)}% of visits` : 'No rewards used yet'}
            </p>
          </div>
        </div>
      )}

      {/* Visits Display */}
      <div className="bg-white rounded-none md:rounded-2xl shadow-sm border-0 md:border border-gray-200 -mx-4 md:mx-0">
        {visits.length > 0 ? (
          <>
            {viewMode === 'cards' ? (
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {visits.map((visit) => {
                    const dateInfo = formatDate(visit.visitDate);
                    const isRewardVisit = visit.rewardRedeemed;
                    
                    return (
                      <div
                        key={visit._id}
                        className={`group relative overflow-hidden rounded-xl md:rounded-2xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer active:scale-98 md:active:scale-100 ${
                          isRewardVisit 
                            ? 'border-gradient-to-r from-yellow-400 to-amber-500 bg-gradient-to-br from-yellow-50 to-amber-50' 
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedVisit(visit)}
                      >
                        {/* Reward Badge */}
                        {isRewardVisit && (
                          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                            <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                              <FaGift className="w-3 h-3" />
                              <span className="hidden sm:inline">REWARD</span>
                            </div>
                          </div>
                        )}

                        <div className="p-3 md:p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${
                                isRewardVisit 
                                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white' 
                                  : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                              }`}>
                          <span className="font-bold text-xs">#{visit.visitNumber}</span>
                        </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{dateInfo.short}</p>
                                <p className="text-xs text-gray-500">{dateInfo.relative}</p>
                              </div>
                            </div>
                          </div>

                          {/* Barber Info */}
                          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                            <div className="p-1 bg-blue-100 rounded">
                              <FaCut className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Barber</p>
                              <p className="font-medium text-gray-900 text-sm">{visit.barber}</p>
                            </div>
                          </div>

                          {/* Services */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Services</p>
                            <div className="space-y-1">
                              {visit.services.slice(0, 2).map((service, index) => (
                                <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded">
                                  <div className="flex items-center gap-1">
                                    <FaCut className="w-2 h-2 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-900">{service.name}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-900">${service.price.toFixed(2)}</span>
                                </div>
                              ))}
                              {visit.services.length > 2 && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                  +{visit.services.length - 2} more services
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Total and Notes */}
                          <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">${visit.totalPrice.toFixed(2)}</span>
                              {isRewardVisit && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  Discounted
                          </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-blue-600">
                              <FaEye className="w-3 h-3" />
                              <span className="text-xs font-medium">Details</span>
                            </div>
                          </div>

                          {visit.notes && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Notes</p>
                              <p className="text-xs text-blue-800">{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                        </div>
            ) : (
              /* Timeline View */
              <div className="p-4 md:p-6">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-purple-400"></div>
                  
                  <div className="space-y-8">
                    {visits.map((visit, index) => {
                      const dateInfo = formatDate(visit.visitDate);
                      const isRewardVisit = visit.rewardRedeemed;
                      
                      return (
                        <div key={visit._id} className="relative flex items-start gap-4 md:gap-6">
                          {/* Timeline Dot */}
                          <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                            isRewardVisit 
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600'
                          }`}>
                            {isRewardVisit ? (
                              <FaGift className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            ) : (
                              <FaCut className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      )}
                    </div>
                    
                          {/* Visit Card */}
                          <div 
                            className={`flex-1 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-98 md:active:scale-100 ${
                              isRewardVisit 
                                ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50' 
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                            onClick={() => setSelectedVisit(visit)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg font-bold text-gray-900">Visit #{visit.visitNumber}</span>
                                  {isRewardVisit && (
                                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                                      REWARD
                      </span>
                                  )}
                                </div>
                                <p className="text-gray-600">{dateInfo.full} at {dateInfo.time}</p>
                                <p className="text-sm text-gray-500">{dateInfo.relative}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">${visit.totalPrice.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">by {visit.barber}</p>
                              </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                              {visit.services.map((service, serviceIndex) => (
                                <span 
                                  key={serviceIndex}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                >
                                  {service.name}
                                </span>
                              ))}
                            </div>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-none md:rounded-b-2xl gap-4">
            <div className="text-xs md:text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchVisitHistory(currentPage - 1)}
                disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-xs md:text-sm font-medium"
              >
                    <FaChevronLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={() => fetchVisitHistory(currentPage + 1)}
                disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-xs md:text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <FaHistory className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Visits Found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values({ dateRange, serviceFilter, barberFilter, rewardFilter }).some(v => v && v !== 'all') 
                ? 'No visits match your current filters. Try adjusting your search criteria.' 
                : 'Your visit history will appear here after your first barbershop visit.'
              }
            </p>
            {Object.values({ dateRange, serviceFilter, barberFilter, rewardFilter }).some(v => v && v !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${
              selectedVisit.rewardRedeemed 
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50' 
                : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${
                  selectedVisit.rewardRedeemed 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white' 
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                }`}>
                  {selectedVisit.rewardRedeemed ? (
                    <FaGift className="w-6 h-6" />
                  ) : (
                    <FaEye className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Visit #{selectedVisit.visitNumber}</h2>
                    {selectedVisit.rewardRedeemed && (
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
                        REWARD VISIT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{formatDate(selectedVisit.visitDate).full}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Visit Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Date & Time</span>
                  </div>
                  <p className="text-blue-800 font-semibold">{formatDate(selectedVisit.visitDate).full}</p>
                  <p className="text-sm text-blue-600">{formatDate(selectedVisit.visitDate).time}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCut className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Barber</span>
                  </div>
                  <p className="text-green-800 font-semibold">{selectedVisit.barber}</p>
                </div>

                <div className={`rounded-xl p-4 border ${
                  selectedVisit.rewardRedeemed 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FaDollarSign className={`w-5 h-5 ${
                      selectedVisit.rewardRedeemed ? 'text-yellow-600' : 'text-purple-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedVisit.rewardRedeemed ? 'text-yellow-600' : 'text-purple-600'
                    }`}>
                      Total {selectedVisit.rewardRedeemed ? '(After Discount)' : 'Price'}
                    </span>
                </div>
                  <p className={`text-2xl font-bold ${
                    selectedVisit.rewardRedeemed ? 'text-yellow-800' : 'text-purple-800'
                  }`}>
                    ${selectedVisit.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Reward Information */}
              {selectedVisit.rewardRedeemed && selectedVisit.redeemedReward && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl">
                      <FaGift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-800">Reward Redeemed</h3>
                      <p className="text-yellow-600">Special discount applied to this visit</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-yellow-600 mb-1">Reward Name</p>
                      <p className="text-yellow-800 font-semibold">{selectedVisit.redeemedReward.rewardName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-600 mb-1">Discount</p>
                      <p className="text-yellow-800 font-semibold">
                        {selectedVisit.redeemedReward.rewardType === 'discount' 
                          ? `${selectedVisit.redeemedReward.discountPercentage}% off`
                          : 'Free service'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Breakdown */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCut className="w-5 h-5 text-gray-600" />
                  Services Received
                </h3>
                <div className="space-y-3">
                  {selectedVisit.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaCut className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.duration} minutes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${service.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaClock className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Total Service Time</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {selectedVisit.services.reduce((sum, service) => sum + service.duration, 0)} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedVisit.notes && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUser className="w-5 h-5 text-gray-600" />
                    Visit Notes
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-blue-800 leading-relaxed">{selectedVisit.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 