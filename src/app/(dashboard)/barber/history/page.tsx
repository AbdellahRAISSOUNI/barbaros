'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaUser,
  FaCut,
  FaClock,
  FaDownload,
  FaEye,
  FaGift,
  FaSpinner,
  FaTimes,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaPhone,
  FaExclamationCircle,
  FaDollarSign
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Visit {
  _id: string;
  visitDate: string;
  visitNumber?: number;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  services: Array<{
    serviceId: string;
    serviceName?: string;
    name: string;
    price: number;
    duration?: number;
    category?: string;
  }>;
  totalPrice: number;
  notes?: string;
  rewardRedeemed?: boolean;
  redeemedReward?: {
    rewardName: string;
    rewardId: string;
  };
  duration?: number;
}

interface HistoryStats {
  totalVisits: number;
  totalClients: number;
  averageVisitValue: number;
  thisMonth: {
    visits: number;
    clients: number;
  };
  averageVisitsPerDay?: number;
}

interface Filters {
  search: string;
  dateFrom: string;
  dateTo: string;
  service: string;
  rewardFilter: 'all' | 'redeemed' | 'regular';
}

export default function BarberHistoryPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    service: '',
    rewardFilter: 'all'
  });

  const itemsPerPage = 10;

  useEffect(() => {
    if (session?.user?.id) {
      fetchVisitHistory();
    }
  }, [session, currentPage, filters]);

  const fetchVisitHistory = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        barber: session.user.name || '',
        includeClient: 'true',
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { startDate: filters.dateFrom }),
        ...(filters.dateTo && { endDate: filters.dateTo }),
        ...(filters.service && { service: filters.service }),
        ...(filters.rewardFilter !== 'all' && { rewardFilter: filters.rewardFilter })
      });

      const response = await fetch(`/api/visits?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setVisits(data.visits || []);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
        
        // Calculate stats from the data
        const totalVisits = data.pagination.total;
        const uniqueClients = new Set(data.visits.map((visit: Visit) => visit.clientId?._id)).size;
        const totalRevenue = data.visits.reduce((sum: number, visit: Visit) => sum + visit.totalPrice, 0);
        
        // Calculate this month's stats
        const now = new Date();
        const thisMonthVisits = data.visits.filter((visit: Visit) => {
          const visitDate = new Date(visit.visitDate);
          return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
        });
        
        const thisMonthClients = new Set(thisMonthVisits.map((visit: Visit) => visit.clientId?._id)).size;

        setStats({
          totalVisits,
          totalClients: uniqueClients,
          averageVisitValue: totalVisits > 0 ? totalRevenue / totalVisits : 0,
          thisMonth: {
            visits: thisMonthVisits.length,
            clients: thisMonthClients
          },
          averageVisitsPerDay: totalVisits / Math.max(1, Math.ceil((Date.now() - new Date(data.visits[data.visits.length - 1]?.visitDate).getTime()) / (1000 * 60 * 60 * 24)))
        });
      } else {
        toast.error('Failed to fetch visit history');
        setVisits([]);
      }
    } catch (error) {
      console.error('Error fetching visit history:', error);
      toast.error('Error loading visit history');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      service: '',
      rewardFilter: 'all'
    });
    setCurrentPage(1);
    setFiltersOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, gradient }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    gradient: string;
  }) => (
    <div className="bg-gradient-to-br from-stone-50 to-amber-50/50 backdrop-blur-sm border border-stone-200/60 rounded-xl p-3 md:p-4 shadow-sm">
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

  const PaginationControls = () => (
    <div className="flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-stone-700">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, stats?.totalVisits || 0)}</span> of{' '}
            <span className="font-medium">{stats?.totalVisits || 0}</span> visits
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-stone-400 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    pageNumber === currentPage
                      ? 'z-10 bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]'
                      : 'text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-stone-400 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <FaChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FaHistory className="w-4 h-4 md:w-5 md:h-5 text-amber-200" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold leading-tight">Visit History</h1>
                <p className="text-xs md:text-sm text-emerald-100">Your professional journey</p>
              </div>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden bg-white/20 backdrop-blur-sm rounded-lg p-2 hover:bg-white/30 transition-colors"
            >
              <FaFilter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard
              icon={FaCut}
              title="Total Visits"
              value={stats.totalVisits}
              subtitle={`${stats.averageVisitsPerDay?.toFixed(1) || 0}/day avg`}
              gradient="bg-gradient-to-r from-emerald-600 to-emerald-500"
            />
            <StatCard
              icon={FaUsers}
              title="Unique Clients"
              value={stats.totalClients}
              subtitle={`${((stats.thisMonth.clients / stats.totalClients) * 100).toFixed(0)}% active this month`}
              gradient="bg-gradient-to-r from-[#8B0000] to-[#A31515]"
            />
            <StatCard
              icon={FaChartLine}
              title="This Month"
              value={stats.thisMonth.visits}
              subtitle={`${stats.thisMonth.clients} unique clients`}
              gradient="bg-gradient-to-r from-amber-600 to-amber-500"
            />
            <StatCard
              icon={FaDollarSign}
              title="Avg. Visit Value"
              value={`$${stats.averageVisitValue.toFixed(2)}`}
              subtitle="per visit"
              gradient="bg-gradient-to-r from-emerald-700 to-emerald-600"
            />
          </div>
        )}

        {/* Filters - Mobile Collapsible */}
        <div className={`bg-white rounded-xl shadow-sm border border-stone-200 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold text-stone-800 flex items-center">
                <FaFilter className="w-4 h-4 mr-2 text-emerald-600" />
                Filters
              </h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="lg:hidden text-stone-400 hover:text-stone-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Search Client</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Client name or phone..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Service Filter */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Service</label>
                <input
                  type="text"
                  placeholder="Service type..."
                  value={filters.service}
                  onChange={(e) => handleFilterChange('service', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visit List */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold text-stone-800">Recent Visits</h3>
              {loading && (
                <div className="flex items-center space-x-2 text-[#8B0000]">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>

            {loading && visits.length === 0 ? (
              <div className="text-center py-12">
                <FaSpinner className="w-8 h-8 animate-spin text-[#8B0000] mx-auto mb-4" />
                <p className="text-stone-600">Loading visit history...</p>
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-12">
                <FaExclamationCircle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600 mb-2">No visits found</p>
                <p className="text-sm text-stone-400">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit._id}
                    className="bg-gradient-to-r from-stone-50 to-amber-50/50 border border-stone-200/60 rounded-xl p-3 md:p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedVisit(visit)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Client Info - Mobile First */}
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                            <FaUser className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm md:text-base font-semibold text-stone-800 truncate">
                              {visit.clientId ? `${visit.clientId.firstName} ${visit.clientId.lastName}` : 'Unknown Client'}
                            </p>
                            {visit.clientId?.phoneNumber && (
                              <p className="text-xs text-stone-500 flex items-center">
                                <FaPhone className="w-3 h-3 mr-1" />
                                {visit.clientId.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Services - Compact */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {visit.services.slice(0, 3).map((service, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium"
                              >
                                <FaCut className="w-3 h-3 mr-1" />
                                {service.serviceName || service.name}
                              </span>
                            ))}
                            {visit.services.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-medium">
                                +{visit.services.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          {visit.rewardRedeemed && (
                            <div className="flex items-center space-x-1">
                              <FaGift className="w-3 h-3 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-700">Reward Redeemed</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date and Price - Mobile Optimized */}
                      <div className="flex flex-col items-end space-y-1 ml-3">
                        <div className="text-right">
                          <p className="text-xs md:text-sm font-medium text-stone-600">{formatDate(visit.visitDate)}</p>
                          <p className="text-xs text-stone-500">{formatTime(visit.visitDate)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-2 py-1 rounded-lg">
                          <p className="text-xs md:text-sm font-bold">${visit.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {visits.length > 0 && <PaginationControls />}
        </div>

        {/* Visit Detail Modal */}
        {selectedVisit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-800">Visit Details</h3>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-4 h-4 text-stone-600" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Client Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Client</h4>
                  <p className="text-emerald-800 font-medium">
                    {selectedVisit.clientId ? `${selectedVisit.clientId.firstName} ${selectedVisit.clientId.lastName}` : 'Unknown Client'}
                  </p>
                  {selectedVisit.clientId?.phoneNumber && (
                    <p className="text-emerald-700 text-sm flex items-center mt-1">
                      <FaPhone className="w-3 h-3 mr-2" />
                      {selectedVisit.clientId.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Visit Information */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">Visit Details</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-amber-800">
                      <span className="font-medium">Date:</span> {formatDate(selectedVisit.visitDate)} at {formatTime(selectedVisit.visitDate)}
                    </p>
                    <p className="text-amber-800">
                      <span className="font-medium">Total:</span> ${selectedVisit.totalPrice.toFixed(2)}
                    </p>
                    {selectedVisit.duration && (
                      <p className="text-amber-800">
                        <span className="font-medium">Duration:</span> {selectedVisit.duration} minutes
                      </p>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div className="bg-gradient-to-r from-stone-50 to-stone-100/50 rounded-lg p-4 border border-stone-200">
                  <h4 className="font-semibold text-stone-900 mb-3">Services Provided</h4>
                  <div className="space-y-2">
                    {selectedVisit.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-100">
                        <div className="flex items-center space-x-2">
                          <FaCut className="w-4 h-4 text-stone-600" />
                          <span className="text-stone-800 font-medium">{service.serviceName || service.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-stone-800">${service.price.toFixed(2)}</p>
                          {service.duration && (
                            <p className="text-xs text-stone-500">{service.duration} min</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reward Information */}
                {selectedVisit.rewardRedeemed && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                      <FaGift className="w-4 h-4 mr-2" />
                      Reward Redeemed
                    </h4>
                    <p className="text-green-800">
                      {selectedVisit.redeemedReward?.rewardName || 'Loyalty reward applied'}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedVisit.notes && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Notes</h4>
                    <p className="text-blue-800 text-sm">{selectedVisit.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
