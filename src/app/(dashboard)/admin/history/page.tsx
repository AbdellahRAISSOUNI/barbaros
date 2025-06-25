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
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEye,
  FaEdit,
  FaTimes,
  FaGift,
  FaUserTie,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

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

export default function AdminHistoryPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableBarbers, setAvailableBarbers] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  
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
        const barberNames = barbersData.barbers.map((barber: any) => barber.name).filter(Boolean);
        setAvailableBarbers([...new Set(barberNames)]);
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
        ...filters,
        format: 'csv',
        reportType: 'visits'
      });
      
      const response = await fetch(`/api/admin/reports/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visit-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('History exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export history');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Visit History...</h2>
          <p className="text-gray-600">Please wait while we fetch all visit records.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Complete Visit History</h1>
          <p className="text-gray-600 mt-1">View and manage all client visits across your barbershop</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaFilter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={exportHistory}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FaDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVisits.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaHistory className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Visit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageValue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaUser className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Search */}
            <div className="col-span-full md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by client, barber, service, or visit #"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Barber Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barber</label>
              <select
                value={filters.barber}
                onChange={(e) => setFilters(prev => ({ ...prev, barber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Barbers</option>
                {availableBarbers.map(barber => (
                  <option key={barber} value={barber}>{barber}</option>
                ))}
              </select>
            </div>

            {/* Service Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <select
                value={filters.service}
                onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Services</option>
                {availableServices.map(service => (
                  <option key={service._id} value={service._id}>{service.name}</option>
                ))}
              </select>
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                placeholder="$0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                placeholder="No limit"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Reward Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reward Status</label>
              <select
                value={filters.rewardFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, rewardFilter: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Visits</option>
                <option value="reward_only">Reward Visits Only</option>
                <option value="no_reward">Regular Visits Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Visit History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredVisits.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barber</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVisits.map((visit) => {
                    const dateInfo = formatDate(visit.visitDate);
                    return (
                      <tr key={visit._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${visit.rewardRedeemed ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                              {visit.rewardRedeemed ? (
                                <FaGift className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <span className="text-sm font-bold text-gray-600">#{visit.visitNumber}</span>
                              )}
                            </div>
                            {visit.rewardRedeemed && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                REWARD
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <Link 
                              href={`/admin/clients/${visit.clientId._id}/view`}
                              className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {visit.clientId.firstName} {visit.clientId.lastName}
                            </Link>
                            {visit.clientId.phoneNumber && (
                              <p className="text-sm text-gray-500">{visit.clientId.phoneNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{dateInfo.date}</p>
                            <p className="text-sm text-gray-500">{dateInfo.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {visit.services.map((service, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Link
                                  href={`/admin/services`}
                                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  {service.serviceName || service.name}
                                </Link>
                                <span className="text-xs text-gray-500">
                                  ({service.duration}min, {formatCurrency(service.price)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {visit.barber ? (
                            <Link
                              href={`/admin/barbers`}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                            >
                              <FaUserTie className="w-3 h-3" />
                              {visit.barber}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(visit.totalPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedVisit(visit)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredVisits.map((visit) => {
                const dateInfo = formatDate(visit.visitDate);
                return (
                  <div key={visit._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${visit.rewardRedeemed ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                          {visit.rewardRedeemed ? (
                            <FaGift className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <span className="text-sm font-bold text-gray-600">#{visit.visitNumber}</span>
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/admin/clients/${visit.clientId._id}/view`}
                            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {visit.clientId.firstName} {visit.clientId.lastName}
                          </Link>
                          <p className="text-sm text-gray-500">{dateInfo.full}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-3">
                      {visit.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <Link
                            href={`/admin/services`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {service.serviceName || service.name}
                          </Link>
                          <span className="text-gray-500">
                            {service.duration}min • {formatCurrency(service.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {visit.barber ? (
                          <Link
                            href={`/admin/barbers`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          >
                            <FaUserTie className="w-3 h-3" />
                            {visit.barber}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">No barber specified</span>
                        )}
                      </div>
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(visit.totalPrice)}
                      </span>
                    </div>

                    {visit.rewardRedeemed && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          <FaGift className="w-3 h-3 mr-1" />
                          {visit.rewardRedeemed.rewardName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {filteredVisits.length} of {stats.totalVisits} visits
                  {filteredVisits.length !== visits.length && ` (${visits.length} total on this page)`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-sm font-medium"
                  >
                    <FaChevronLeft className="w-3 h-3" />
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-sm font-medium"
                  >
                    Next
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters to see more results'
                : 'No visit history available'
              }
            </p>
          </div>
        )}
      </div>

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              {/* Client Info */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUser className="text-blue-600 mr-3 h-6 w-6" />
                    <div>
                      <Link 
                        href={`/admin/clients/${selectedVisit.clientId._id}/view`}
                        className="text-lg font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                      >
                        {selectedVisit.clientId.firstName} {selectedVisit.clientId.lastName}
                      </Link>
                      {selectedVisit.clientId.phoneNumber && (
                        <p className="text-sm text-blue-700">{selectedVisit.clientId.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/clients/${selectedVisit.clientId._id}/view`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <FaEdit className="w-4 h-4" />
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Services */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <FaCut className="text-gray-600 mr-3 h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Services Provided</h3>
                </div>
                <div className="space-y-3">
                  {selectedVisit.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div>
                        <Link
                          href="/admin/services"
                          className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {service.serviceName || service.name}
                        </Link>
                        {service.category && (
                          <p className="text-sm text-gray-500">{service.category}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(service.price)}</p>
                        <p className="text-sm text-gray-500">{service.duration} minutes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barber Info */}
              {selectedVisit.barber && (
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center">
                    <FaUserTie className="text-indigo-600 mr-3 h-5 w-5" />
                    <div>
                      <span className="text-sm font-medium text-indigo-900">Barber</span>
                      <Link
                        href="/admin/barbers"
                        className="block text-lg font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
                      >
                        {selectedVisit.barber}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Reward Info */}
              {selectedVisit.rewardRedeemed && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center">
                    <FaGift className="text-yellow-600 mr-3 h-6 w-6" />
                    <div>
                      <span className="text-sm font-medium text-yellow-900">Reward Redeemed</span>
                      <p className="text-lg font-semibold text-yellow-900">{selectedVisit.rewardRedeemed.rewardName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaDollarSign className="text-green-600 mr-3 h-6 w-6" />
                    <div>
                      <span className="text-lg font-semibold text-green-900">Total Amount</span>
                      <p className="text-sm text-green-700">Final total paid</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-green-800">
                    {formatCurrency(selectedVisit.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedVisit.notes && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <FaEdit className="text-gray-600 mr-3 h-5 w-5" />
                    <h3 className="font-semibold text-gray-900">Visit Notes</h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
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