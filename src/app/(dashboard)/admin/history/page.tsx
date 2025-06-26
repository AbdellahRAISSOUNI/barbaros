'use client';

import { useState, useEffect } from 'react';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaUser,
  FaCut,
  FaDollarSign,
  FaClock,
  FaDownload,
  FaEye,
  FaGift,
  FaUserTie,
  FaSpinner,
  FaTimes,
  FaChartLine
} from 'react-icons/fa';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import BarberStatsModal from '@/components/admin/barbers/BarberStatsModal';

interface Visit {
  _id: string;
  visitNumber: number;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  visitDate: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    name: string;
    price: number;
    duration: number;
    category?: string;
  }>;
  totalPrice: number;
  barber?: string;
  duration?: number;
  notes?: string;
  rewardRedeemed?: {
    rewardName: string;
    rewardId: string;
  };
  createdAt: string;
}

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  barber: string;
  service: string;
  minAmount: string;
  maxAmount: string;
  rewardFilter: 'all' | 'reward_only' | 'no_reward';
}

interface Barber {
  _id: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  phoneNumber?: string;
  active: boolean;
  joinDate: string;
  createdAt: string;
}

export default function AdminHistoryPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [showBarberStats, setShowBarberStats] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    barber: '',
    service: '',
    minAmount: '',
    maxAmount: '',
    rewardFilter: 'all'
  });

  const [stats, setStats] = useState({
    totalVisits: 0,
    totalRevenue: 0,
    averageValue: 0,
    totalClients: 0
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchVisits();
    fetchFilterOptions();
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [visits, filters]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/visits?page=${currentPage}&limit=${itemsPerPage}&includeClient=true`);
      const data = await response.json();
      
      if (data.success) {
        setVisits(data.visits);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
        
        // Calculate stats
        const totalRevenue = data.visits.reduce((sum: number, visit: Visit) => sum + visit.totalPrice, 0);
        const uniqueClients = new Set(data.visits.map((visit: Visit) => visit.clientId._id)).size;
        
        setStats({
          totalVisits: data.pagination.total,
          totalRevenue,
          averageValue: data.visits.length > 0 ? totalRevenue / data.visits.length : 0,
          totalClients: uniqueClients
        });
      } else {
        toast.error('Failed to fetch visits');
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Error loading visit history');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch available barbers
      const barbersResponse = await fetch('/api/admin/barbers');
      const barbersData = await barbersResponse.json();
      if (barbersData.success) {
        setAvailableBarbers(barbersData.barbers || []);
      }

      // Fetch available services
      const servicesResponse = await fetch('/api/services');
      const servicesData = await servicesResponse.json();
      if (servicesData.success) {
        setAvailableServices(servicesData.services || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...visits];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(visit => 
        `${visit.clientId.firstName} ${visit.clientId.lastName}`.toLowerCase().includes(searchTerm) ||
        visit.clientId.phoneNumber?.includes(searchTerm) ||
        visit.barber?.toLowerCase().includes(searchTerm) ||
        visit.services.some(service => service.serviceName?.toLowerCase().includes(searchTerm) || service.name?.toLowerCase().includes(searchTerm)) ||
        visit.visitNumber.toString().includes(searchTerm)
      );
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(visit => new Date(visit.visitDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(visit => new Date(visit.visitDate) <= new Date(filters.dateTo + 'T23:59:59'));
    }

    // Barber filter
    if (filters.barber) {
      filtered = filtered.filter(visit => visit.barber === filters.barber);
    }

    // Service filter
    if (filters.service) {
      filtered = filtered.filter(visit => 
        visit.services.some(service => service.serviceId === filters.service)
      );
    }

    // Amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(visit => visit.totalPrice >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(visit => visit.totalPrice <= parseFloat(filters.maxAmount));
    }

    // Reward filter
    if (filters.rewardFilter === 'reward_only') {
      filtered = filtered.filter(visit => visit.rewardRedeemed);
    } else if (filters.rewardFilter === 'no_reward') {
      filtered = filtered.filter(visit => !visit.rewardRedeemed);
    }

    setFilteredVisits(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      barber: '',
      service: '',
      minAmount: '',
      maxAmount: '',
      rewardFilter: 'all'
    });
  };

  const exportHistory = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await fetch(`/api/visits/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visit-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Visit history exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export visit history');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleBarberClick = (barberName: string) => {
    const barber = availableBarbers.find(b => b.name === barberName);
    if (barber) {
      setSelectedBarber(barber);
      setShowBarberStats(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visit history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaHistory className="mr-3 text-black" />
            Visit History
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all barbershop visits and services
          </p>
        </div>
        <button
          onClick={exportHistory}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 shadow-lg font-medium"
        >
          <FaDownload size={16} />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalVisits}</p>
            </div>
            <FaHistory className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <FaDollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Average Value</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.averageValue)}</p>
            </div>
            <FaChartLine className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Unique Clients</p>
              <p className="text-2xl font-bold text-orange-900">{stats.totalClients}</p>
            </div>
            <FaUser className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search visits, clients, barbers..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter size={14} />
              Filters
            </button>
            {Object.values(filters).some(value => value && value !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTimes size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barber</label>
              <select
                value={filters.barber}
                onChange={(e) => setFilters(prev => ({ ...prev, barber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">All Barbers</option>
                {availableBarbers.map(barber => (
                  <option key={barber._id} value={barber.name}>{barber.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={filters.service}
                onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">All Services</option>
                {availableServices.map(service => (
                  <option key={service._id} value={service._id}>{service.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="100.00"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rewards</label>
              <select
                value={filters.rewardFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, rewardFilter: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Visits</option>
                <option value="reward_only">With Rewards</option>
                <option value="no_reward">No Rewards</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredVisits.length} of {visits.length} visits
              </p>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisits.map((visit) => (
                    <tr key={visit._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">#{visit.visitNumber}</span>
                          {visit.rewardRedeemed && (
                            <FaGift className="ml-2 h-4 w-4 text-green-500" title="Reward redeemed" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/clients/${visit.clientId._id}/view`}
                          className="flex items-center hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {visit.clientId.firstName} {visit.clientId.lastName}
                            </div>
                            {visit.clientId.phoneNumber && (
                              <div className="text-sm text-gray-500">{visit.clientId.phoneNumber}</div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {visit.barber ? (
                          <button
                            onClick={() => handleBarberClick(visit.barber!)}
                            className="flex items-center text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <FaUserTie className="mr-2 h-4 w-4" />
                            {visit.barber}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {visit.services.map((service, index) => (
                            <div key={index} className="text-sm text-gray-900">
                              {service.serviceName || service.name}
                              {index < visit.services.length - 1 && ', '}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(visit.totalPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(visit.visitDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/clients/${visit.clientId._id}/view?tab=history`}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredVisits.map((visit) => (
                <div key={visit._id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900">#{visit.visitNumber}</span>
                      {visit.rewardRedeemed && (
                        <FaGift className="ml-2 h-4 w-4 text-green-500" title="Reward redeemed" />
                      )}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(visit.totalPrice)}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Link 
                      href={`/admin/clients/${visit.clientId._id}/view`}
                      className="flex items-center text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <FaUser className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="font-medium">{visit.clientId.firstName} {visit.clientId.lastName}</span>
                    </Link>
                    
                    {visit.barber && (
                      <button
                        onClick={() => handleBarberClick(visit.barber!)}
                        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <FaUserTie className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{visit.barber}</span>
                      </button>
                    )}
                    
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{formatDate(visit.visitDate)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {visit.services.map((service, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {service.serviceName || service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                                          <Link
                        href={`/admin/clients/${visit.clientId._id}/view?tab=history`}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm cursor-pointer"
                      >
                      <FaEye className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Barber Stats Modal */}
      {showBarberStats && selectedBarber && (
        <BarberStatsModal
          barber={selectedBarber}
          onClose={() => {
            setShowBarberStats(false);
            setSelectedBarber(null);
          }}
          onEdit={() => {
            setShowBarberStats(false);
            // Navigate to barbers page - you can customize this navigation
            window.location.href = '/admin/barbers';
          }}
        />
      )}
    </div>
  );
} 