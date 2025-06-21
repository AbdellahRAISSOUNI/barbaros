'use client';

import { useState, useEffect } from 'react';
import { FaHistory, FaCut, FaCalendarAlt, FaDownload, FaFilter, FaEye, FaSearch, FaChartLine, FaGift, FaUser, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Service {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

interface Visit {
  _id: string;
  visitDate: string;
  services: Service[];
  totalPrice: number;
  barber: string;
  notes?: string;
  visitNumber: number;
  rewardRedeemed?: {
    rewardId: string;
    rewardName: string;
    rewardType: 'free' | 'discount';
    discountPercentage?: number;
    redeemedAt: string;
    redeemedBy: string;
  };
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
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [serviceFilter, setServiceFilter] = useState('');
  const [barberFilter, setBarberFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

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
        ...(barberFilter && { barber: barberFilter })
      });

      const response = await fetch(`/api/clients/${clientId}/visits?${queryParams}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVisits(data.visits);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
        setCurrentPage(page);
        
        // Calculate stats if first page
        if (page === 1) {
          calculateStats(data.visits);
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

  // Calculate statistics
  const calculateStats = (visitsData: Visit[]) => {
    if (!visitsData.length) {
      setStats(null);
      return;
    }

    const totalSpent = visitsData.reduce((sum, visit) => sum + visit.totalPrice, 0);
    const serviceCount: { [key: string]: number } = {};
    const barberCount: { [key: string]: number } = {};
    let rewardsRedeemed = 0;

    visitsData.forEach(visit => {
      if (visit.rewardRedeemed) rewardsRedeemed++;
      
      if (visit.barber) {
        barberCount[visit.barber] = (barberCount[visit.barber] || 0) + 1;
      }
      
      visit.services.forEach(service => {
        serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
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
      rewardsRedeemed
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

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FaHistory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Visit History</h2>
              <p className="text-sm text-gray-600 mt-1">Your complete barbershop visit records</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaFilter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <div className="relative group">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FaDownload className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => exportData('csv')}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg text-sm"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Visits</p>
                  <p className="text-xl lg:text-2xl font-bold text-blue-800">{stats.totalVisits}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <FaChartLine className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Spent</p>
                  <p className="text-xl lg:text-2xl font-bold text-green-800">${stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <FaCut className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg per Visit</p>
                  <p className="text-xl lg:text-2xl font-bold text-purple-800">${stats.averageSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-3">
                <FaGift className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Rewards Used</p>
                  <p className="text-xl lg:text-2xl font-bold text-yellow-800">{stats.rewardsRedeemed}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCut className="w-4 h-4 text-gray-600" />
                Favorite Services
              </h3>
              <div className="space-y-3">
                {stats.favoriteServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate flex-1 mr-2">{service.name}</span>
                    <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-lg">{service.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="w-4 h-4 text-gray-600" />
                Most Frequent Barber
              </h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-lg font-bold text-blue-600">{stats.mostFrequentBarber}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <input
                type="text"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                placeholder="Search services..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barber</label>
              <input
                type="text"
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                placeholder="Search barbers..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
            <button
              onClick={applyFilters}
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Visit List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {visits.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {visits.map((visit) => (
              <div key={visit._id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg">
                          <span className="font-bold text-xs">#{visit.visitNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {new Date(visit.visitDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {visit.rewardRedeemed && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs rounded-full font-medium">
                          <FaGift className="w-3 h-3" />
                          Reward Used
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        {visit.barber}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCut className="w-3 h-3" />
                        {visit.services.length} service{visit.services.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-lg text-green-600">${visit.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {visit.services.slice(0, 3).map((service, index) => (
                        <div key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          <FaCut className="w-3 h-3" />
                          <span className="truncate max-w-24 sm:max-w-none">{service.name}</span>
                        </div>
                      ))}
                      {visit.services.length > 3 && (
                        <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{visit.services.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedVisit(visit)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                  >
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm font-medium">View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 lg:p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FaHistory className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Visits Found</h3>
            <p className="text-gray-600">
              {Object.values({ dateRange, serviceFilter, barberFilter }).some(v => v) 
                ? 'No visits match your current filters.' 
                : 'Your visit history will appear here after your first visit.'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl gap-4">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchVisitHistory(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchVisitHistory(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl">
                  <FaEye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Visit Details</h2>
                  <p className="text-sm text-gray-600">Visit #{selectedVisit.visitNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 lg:p-6 space-y-6">
              {/* Visit Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-1">Date & Time</p>
                  <p className="text-blue-800 font-semibold">{new Date(selectedVisit.visitDate).toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-1">Barber</p>
                  <p className="text-green-800 font-semibold">{selectedVisit.barber}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-1">Total Price</p>
                  <p className="text-xl font-bold text-purple-800">${selectedVisit.totalPrice.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-600 font-medium mb-1">Visit Number</p>
                  <p className="text-yellow-800 font-semibold">#{selectedVisit.visitNumber}</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCut className="w-5 h-5 text-gray-600" />
                  Services Received
                </h3>
                <div className="space-y-3">
                  {selectedVisit.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FaCut className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.duration} minutes</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600 text-lg ml-4">${service.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reward Information */}
              {selectedVisit.rewardRedeemed && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 lg:p-6">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <FaGift className="w-5 h-5" />
                    Reward Redeemed
                  </h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Reward:</span>
                      <span>{selectedVisit.rewardRedeemed.rewardName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{selectedVisit.rewardRedeemed.rewardType === 'free' ? 'Free Service' : `${selectedVisit.rewardRedeemed.discountPercentage}% Discount`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Redeemed by:</span>
                      <span>{selectedVisit.rewardRedeemed.redeemedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{new Date(selectedVisit.rewardRedeemed.redeemedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedVisit.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaEye className="w-5 h-5 text-gray-600" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{selectedVisit.notes}</p>
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