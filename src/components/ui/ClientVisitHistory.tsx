'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaHistory, 
  FaCut, 
  FaCalendarAlt, 
  FaFilter, 
  FaEye, 
  FaGift, 
  FaUser, 
  FaTimes, 
  FaClock,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaCheck
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
  isRewardRedemption?: boolean;
}

interface VisitHistoryStats {
  totalVisits: number;
  favoriteServices: Array<{
    name: string;
    count: number;
  }>;
  mostFrequentBarber: string;
  rewardsRedeemed: number;
  lastVisit?: string;
}

interface ClientVisitHistoryProps {
  clientId: string;
}

// Add interfaces for dropdown options
interface ServiceOption {
  _id: string;
  name: string;
  categoryId?: string;
  isActive: boolean;
}

interface BarberOption {
  _id: string;
  name: string;
  active: boolean;
}

export default function ClientVisitHistory({ clientId }: ClientVisitHistoryProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitHistoryStats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
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

  // New states for dropdown options and controls
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<BarberOption[]>([]);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [barberDropdownOpen, setBarberDropdownOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([]);
  
  // Refs for dropdown management
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const barberDropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounced filter values
  const [debouncedServiceFilter, setDebouncedServiceFilter] = useState('');
  const [debouncedBarberFilter, setDebouncedBarberFilter] = useState('');

  // Add debounce function at the top of the component
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Add useEffect for real-time filtering
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      setCurrentPage(1);
      fetchVisitHistory(1, false);
    }, 300);

    if (serviceFilter !== debouncedServiceFilter || barberFilter !== debouncedBarberFilter) {
      debouncedFetch();
      setDebouncedServiceFilter(serviceFilter);
      setDebouncedBarberFilter(barberFilter);
    }
  }, [serviceFilter, barberFilter]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedVisit && !(event.target as Element).closest('[data-modal]')) {
        setSelectedVisit(null);
      }
      
      // Close service dropdown
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
      
      // Close barber dropdown
      if (barberDropdownRef.current && !barberDropdownRef.current.contains(event.target as Node)) {
        setBarberDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedVisit]);

  // Fetch available services and barbers for dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch services
        const servicesResponse = await fetch('/api/services?limit=1000');
        const servicesData = await servicesResponse.json();
        if (servicesData.success) {
          setAvailableServices(servicesData.services || []);
        }

        // Fetch barbers
        const barbersResponse = await fetch('/api/admin/barbers');
        const barbersData = await barbersResponse.json();
        if (barbersData.success) {
          setAvailableBarbers(barbersData.barbers || []);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch visit history
  const fetchVisitHistory = async (page = 1, isInitialFetch = false) => {
    try {
      if (isInitialFetch) {
        setIsInitialLoading(true);
      } else {
        setIsFilterLoading(true);
      }
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(selectedServices.length > 0 && { services: selectedServices.join(',') }),
        ...(selectedBarbers.length > 0 && { barbers: selectedBarbers.join(',') }),
        ...(rewardFilter !== 'all' && { rewardFilter })
      });

      const response = await fetch(`/api/clients/${clientId}/visits?${queryParams}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const sortedVisits = data.visits.sort((a: Visit, b: Visit) => 
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        );
        setVisits(sortedVisits);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
        setCurrentPage(page);
        
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
      if (isInitialFetch) {
        setIsInitialLoading(false);
      } else {
        setIsFilterLoading(false);
      }
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

    const serviceCount: { [key: string]: number } = {};
    const barberCount: { [key: string]: number } = {};

    visitsData.forEach(visit => {
      if (visit.barber) {
        barberCount[visit.barber] = (barberCount[visit.barber] || 0) + 1;
      }
      
      visit.services.forEach(service => {
        serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
      });
    });

    const favoriteServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const mostFrequentBarber = Object.entries(barberCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Fetch the correct redeemed rewards count from loyalty status
    fetchRewardsRedeemedCount(visitsData.length, favoriteServices, mostFrequentBarber, visitsData[0]?.visitDate);
  };

  // Fetch correct redeemed rewards count from loyalty status
  const fetchRewardsRedeemedCount = async (totalVisits: number, favoriteServices: any[], mostFrequentBarber: string, lastVisit?: string) => {
    try {
      const response = await fetch(`/api/loyalty/${clientId}`);
      if (response.ok) {
        const loyaltyData = await response.json();
        if (loyaltyData.success && loyaltyData.loyaltyStatus) {
          setStats({
            totalVisits,
            favoriteServices,
            mostFrequentBarber,
            rewardsRedeemed: loyaltyData.loyaltyStatus.rewardsRedeemed || 0,
            lastVisit
          });
        } else {
          // Fallback to 0 if loyalty data is not available
          setStats({
            totalVisits,
            favoriteServices,
            mostFrequentBarber,
            rewardsRedeemed: 0,
            lastVisit
          });
        }
      } else {
        // Fallback to 0 if API call fails
        setStats({
          totalVisits,
          favoriteServices,
          mostFrequentBarber,
          rewardsRedeemed: 0,
          lastVisit
        });
      }
    } catch (error) {
      console.error('Error fetching loyalty status for redeemed rewards count:', error);
      // Fallback to 0 if there's an error
      setStats({
        totalVisits,
        favoriteServices,
        mostFrequentBarber,
        rewardsRedeemed: 0,
        lastVisit
      });
    }
  };

  // Update the useEffect for initial load
  useEffect(() => {
    if (clientId) {
      fetchVisitHistory(1, true);
    }
  }, [clientId]);

  // Modify the input fields to remove them from the Apply Filters action
  const applyFilters = () => {
    setCurrentPage(1);
    fetchVisitHistory(1);
    setShowFilters(false);
  };

  // Modify the clear filters function
  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setServiceFilter('');
    setBarberFilter('');
    setSelectedServices([]);
    setSelectedBarbers([]);
    setRewardFilter('all');
    setDebouncedServiceFilter('');
    setDebouncedBarberFilter('');
    setCurrentPage(1);
    fetchVisitHistory(1);
    setShowFilters(false);
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
  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-sm border border-amber-200 p-4 animate-pulse">
          <div className="h-6 bg-gradient-to-r from-amber-200 to-yellow-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section - Fixed border radius for mobile */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 text-white -mx-2 md:mx-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaHistory className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1">Visit History</h1>
              <p className="text-amber-100 text-sm">Your barbershop journey</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-gray-900' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Timeline
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <FaFilter className="w-3 h-3" />
              <span className="text-xs font-medium hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Panel with Animation - Mobile Responsive */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        showFilters 
          ? 'max-h-screen opacity-100 transform translate-y-0' 
          : 'max-h-0 opacity-0 transform -translate-y-4'
      }`}>
        <div className="bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg border border-amber-200/50 p-3 sm:p-4 -mx-2 md:mx-0 mt-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <FaFilter className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
              Filter Visits
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 lg:gap-4 sm:space-y-0 mb-3 sm:mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm text-gray-900 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm text-gray-900 transition-all duration-200"
              />
            </div>

            {/* Enhanced Service Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Services</label>
              <div className="relative" ref={serviceDropdownRef}>
                <button
                  onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm text-gray-900 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center justify-between"
                >
                  <span className="truncate text-left">
                    {selectedServices.length === 0 
                      ? 'Select services...' 
                      : selectedServices.length === 1
                      ? availableServices.find(s => s._id === selectedServices[0])?.name || 'Unknown service'
                      : `${selectedServices.length} services selected`
                    }
                  </span>
                  <FaChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-1 ${
                    serviceDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {serviceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-40 sm:max-h-48 overflow-y-auto">
                    <div className="p-1.5 sm:p-2">
                      {/* Select All Option */}
                      <button
                        onClick={() => {
                          if (selectedServices.length === availableServices.length) {
                            setSelectedServices([]);
                          } else {
                            setSelectedServices(availableServices.map(s => s._id));
                          }
                        }}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-amber-50 rounded-md transition-colors duration-150 flex items-center gap-2"
                      >
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 border-2 border-amber-500 rounded flex items-center justify-center flex-shrink-0 ${
                          selectedServices.length === availableServices.length ? 'bg-amber-500' : ''
                        }`}>
                          {selectedServices.length === availableServices.length && (
                            <FaCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-amber-600 truncate">
                          {selectedServices.length === availableServices.length ? 'Deselect All' : 'Select All'}
                        </span>
                      </button>
                      
                      {/* Service Options */}
                      {availableServices.map((service) => (
                        <button
                          key={service._id}
                          onClick={() => {
                            setSelectedServices(prev => 
                              prev.includes(service._id)
                                ? prev.filter(id => id !== service._id)
                                : [...prev, service._id]
                            );
                          }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 rounded-md transition-colors duration-150 flex items-center gap-2"
                        >
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 rounded flex items-center justify-center flex-shrink-0 ${
                            selectedServices.includes(service._id) ? 'bg-amber-500 border-amber-500' : ''
                          }`}>
                            {selectedServices.includes(service._id) && (
                              <FaCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                            )}
                          </div>
                          <span className="text-gray-700 truncate">{service.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Barber Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Barbers</label>
              <div className="relative" ref={barberDropdownRef}>
                <button
                  onClick={() => setBarberDropdownOpen(!barberDropdownOpen)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm text-gray-900 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center justify-between"
                >
                  <span className="truncate text-left">
                    {selectedBarbers.length === 0 
                      ? 'Select barbers...' 
                      : selectedBarbers.length === 1
                      ? availableBarbers.find(b => b._id === selectedBarbers[0])?.name || 'Unknown barber'
                      : `${selectedBarbers.length} barbers selected`
                    }
                  </span>
                  <FaChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-1 ${
                    barberDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {barberDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-40 sm:max-h-48 overflow-y-auto">
                    <div className="p-1.5 sm:p-2">
                      {/* Select All Option */}
                      <button
                        onClick={() => {
                          if (selectedBarbers.length === availableBarbers.length) {
                            setSelectedBarbers([]);
                          } else {
                            setSelectedBarbers(availableBarbers.map(b => b._id));
                          }
                        }}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-amber-50 rounded-md transition-colors duration-150 flex items-center gap-2"
                      >
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 border-2 border-amber-500 rounded flex items-center justify-center flex-shrink-0 ${
                          selectedBarbers.length === availableBarbers.length ? 'bg-amber-500' : ''
                        }`}>
                          {selectedBarbers.length === availableBarbers.length && (
                            <FaCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-amber-600 truncate">
                          {selectedBarbers.length === availableBarbers.length ? 'Deselect All' : 'Select All'}
                        </span>
                      </button>
                      
                      {/* Barber Options */}
                      {availableBarbers.map((barber) => (
                        <button
                          key={barber._id}
                          onClick={() => {
                            setSelectedBarbers(prev => 
                              prev.includes(barber._id)
                                ? prev.filter(id => id !== barber._id)
                                : [...prev, barber._id]
                            );
                          }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 rounded-md transition-colors duration-150 flex items-center gap-2"
                        >
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 rounded flex items-center justify-center flex-shrink-0 ${
                            selectedBarbers.includes(barber._id) ? 'bg-amber-500 border-amber-500' : ''
                          }`}>
                            {selectedBarbers.includes(barber._id) && (
                              <FaCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                            )}
                          </div>
                          <span className="text-gray-700 truncate">{barber.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visit Type Filter */}
          <div className="mb-3 sm:mb-4 sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Visit Type</label>
            <select
              value={rewardFilter}
              onChange={(e) => setRewardFilter(e.target.value as 'all' | 'redeemed' | 'regular')}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm text-gray-900 transition-all duration-200"
            >
              <option value="all" className="text-gray-900">All Visits</option>
              <option value="redeemed" className="text-gray-900">Reward Redemptions</option>
              <option value="regular" className="text-gray-900">Regular Visits</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-4">
            <button
              onClick={applyFilters}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 font-medium text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 sm:hover:scale-105"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-xs sm:text-sm hover:border-gray-400 active:scale-95"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <FaCalendarAlt className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600">Total Visits</p>
                <p className="text-lg font-bold text-emerald-800">{stats.totalVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-500 rounded-lg">
                <FaGift className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-600">Redeemed Rewards</p>
                <p className="text-lg font-bold text-amber-800">{stats.rewardsRedeemed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visits Display */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-sm border border-amber-200 -mx-2 md:mx-0">
        {visits.length > 0 ? (
          <>
            {viewMode === 'cards' ? (
              <div className={`p-3 md:p-4 relative ${isFilterLoading ? 'opacity-60' : ''}`}>
                {isFilterLoading && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visits.map((visit) => {
                    const dateInfo = formatDate(visit.visitDate);
                    const isRewardVisit = visit.rewardRedeemed === true || visit.redeemedReward || visit.isRewardRedemption;
                    
                    return (
                      <div
                        key={visit._id}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl cursor-pointer active:scale-95 transform ${
                          isRewardVisit 
                            ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-amber-200 ring-2 ring-amber-200 ring-opacity-50' 
                            : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg'
                        }`}
                        onClick={() => setSelectedVisit(visit)}
                      >
                        {/* Enhanced Reward Badge */}
                        {isRewardVisit && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <FaGift className="w-3 h-3" />
                              <span>Reward Visit</span>
                            </div>
                          </div>
                        )}

                        {/* Enhanced glow effect for reward visits */}
                        {isRewardVisit && (
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-xl"></div>
                        )}

                        <div className="relative p-3">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                isRewardVisit 
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' 
                                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                              }`}>
                                #{visit.visitNumber}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{dateInfo.short}</p>
                                <p className="text-xs text-gray-500">{dateInfo.relative}</p>
                              </div>
                            </div>
                          </div>

                          {/* Barber Info */}
                          <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
                            isRewardVisit ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                          }`}>
                            <FaCut className={`w-3 h-3 ${isRewardVisit ? 'text-amber-600' : 'text-gray-600'}`} />
                            <span className="font-medium text-gray-900 text-sm">{visit.barber}</span>
                          </div>

                          {/* Services */}
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {visit.services.slice(0, 2).map((service, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isRewardVisit 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {service.name}
                                </span>
                              ))}
                            </div>
                            {visit.services.length > 2 && (
                              <p className="text-xs text-gray-500 text-center">
                                +{visit.services.length - 2} more
                              </p>
                            )}
                          </div>

                          {/* View Details */}
                          <div className={`flex items-center justify-center pt-2 border-t ${
                            isRewardVisit ? 'border-amber-200' : 'border-gray-200'
                          }`}>
                            <div className={`flex items-center gap-1 ${
                              isRewardVisit ? 'text-amber-600' : 'text-amber-600'
                            }`}>
                              <FaEye className="w-3 h-3" />
                              <span className="text-xs font-medium">View Details</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={`relative ${isFilterLoading ? 'opacity-60' : ''}`}>
                {isFilterLoading && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                  </div>
                )}
                <div className="p-3 md:p-4">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-yellow-400"></div>
                    
                    <div className="space-y-4">
                      {visits.map((visit, index) => {
                        const dateInfo = formatDate(visit.visitDate);
                        const isRewardVisit = visit.rewardRedeemed === true || visit.redeemedReward || visit.isRewardRedemption;
                        
                        return (
                          <div key={visit._id} className="relative flex items-start gap-3">
                            {/* Enhanced Timeline Dot */}
                            <div className={`relative z-10 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                              isRewardVisit 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 ring-2 ring-amber-300 ring-opacity-50' 
                                : 'bg-gradient-to-r from-emerald-500 to-green-600'
                            }`}>
                              {isRewardVisit ? (
                                <FaGift className="w-3 h-3 text-white animate-pulse" />
                              ) : (
                                <FaCut className="w-3 h-3 text-white" />
                              )}
                            </div>
                            
                            {/* Enhanced Visit Card */}
                            <div 
                              className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-95 transform ${
                                isRewardVisit 
                                  ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-amber-200 ring-1 ring-amber-200 ring-opacity-30' 
                                  : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg'
                              }`}
                              onClick={() => setSelectedVisit(visit)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-gray-900">Visit #{visit.visitNumber}</span>
                                    {isRewardVisit && (
                                      <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                                        🎁 {visit.isRewardRedemption ? 'Special Reward Visit' : 'REWARD'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{dateInfo.short} • {dateInfo.relative}</p>
                                </div>
                                <p className="text-sm text-gray-500">by {visit.barber}</p>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {visit.services.map((service, serviceIndex) => (
                                  <span 
                                    key={serviceIndex}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isRewardVisit 
                                        ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
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
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 md:px-4 py-3 border-t border-amber-200 bg-amber-50 rounded-none md:rounded-b-2xl">
                <div className="text-xs text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchVisitHistory(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-xs font-medium"
                  >
                    <FaChevronLeft className="w-3 h-3" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    onClick={() => fetchVisitHistory(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-xs font-medium"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FaHistory className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Visits Found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {Object.values({ dateRange, serviceFilter, barberFilter, rewardFilter }).some(v => v && v !== 'all') 
                ? 'No visits match your current filters. Try adjusting your search criteria.' 
                : 'Your visit history will appear here after your first barbershop visit.'
              }
            </p>
            {Object.values({ dateRange, serviceFilter, barberFilter, rewardFilter }).some(v => v && v !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-colors font-medium text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Visit Detail Modal with click-outside-to-close */}
      {selectedVisit && (
        <div 
          id="visit-modal"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50"
        >
          <div 
            id="visit-modal-content"
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${
              (selectedVisit.rewardRedeemed === true || selectedVisit.redeemedReward || selectedVisit.isRewardRedemption)
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50' 
                : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  (selectedVisit.rewardRedeemed === true || selectedVisit.redeemedReward || selectedVisit.isRewardRedemption)
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                }`}>
                  {(selectedVisit.rewardRedeemed === true || selectedVisit.redeemedReward || selectedVisit.isRewardRedemption) ? (
                    <FaGift className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Visit #{selectedVisit.visitNumber}</h2>
                    {(selectedVisit.rewardRedeemed === true || selectedVisit.redeemedReward || selectedVisit.isRewardRedemption) && (
                      <span className="px-2 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                        🎁 {selectedVisit.isRewardRedemption ? 'Special Reward Visit' : 'REWARD'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{formatDate(selectedVisit.visitDate).full}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Visit Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600">Date</span>
                  </div>
                  <p className="text-emerald-800 font-semibold text-sm">{formatDate(selectedVisit.visitDate).short}</p>
                  <p className="text-xs text-emerald-600">{formatDate(selectedVisit.visitDate).time}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCut className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">Barber</span>
                  </div>
                  <p className="text-blue-800 font-semibold text-sm">{selectedVisit.barber}</p>
                </div>
              </div>

              {/* Reward Information */}
              {(selectedVisit.rewardRedeemed === true || selectedVisit.redeemedReward) && selectedVisit.redeemedReward && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg">
                      <FaGift className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-800">🎁 Reward Redeemed</h3>
                      <p className="text-xs text-amber-600">{selectedVisit.redeemedReward.rewardName}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-amber-700">
                      {selectedVisit.redeemedReward.rewardType === 'discount' 
                        ? `${selectedVisit.redeemedReward.discountPercentage}% discount applied`
                        : 'Free service applied'
                      }
                    </p>
                    {(selectedVisit.isRewardRedemption || selectedVisit.notes?.includes('🎁 REWARD REDEMPTION:') || selectedVisit.totalPrice === 0) && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                        <span>✨</span>
                        <span>Special Reward Visit</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services Breakdown */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FaCut className="w-3 h-3 text-gray-600" />
                  Services
                </h3>
                <div className="space-y-2">
                  {selectedVisit.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.duration} min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">${service.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">${selectedVisit.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedVisit.notes && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaUser className="w-3 h-3 text-gray-600" />
                    Notes
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-blue-800 text-sm leading-relaxed">{selectedVisit.notes}</p>
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