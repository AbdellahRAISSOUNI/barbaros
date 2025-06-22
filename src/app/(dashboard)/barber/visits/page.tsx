'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCalendarAlt, FaUser, FaClock, FaDollarSign, FaSearch, FaFilter, FaDownload, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Visit {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  barberId: {
    _id: string;
    name: string;
  };
  services: Array<{
    serviceId: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  loyaltyPointsEarned: number;
  date: string;
  notes?: string;
}

export default function BarberVisitsPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisits, setTotalVisits] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const visitsPerPage = 10;

  useEffect(() => {
    if (session?.user?.id) {
      fetchVisits();
    }
  }, [session?.user?.id, currentPage]);

  useEffect(() => {
    if (session?.user?.id) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        fetchVisits();
      }, 300); // Debounce filter changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  const fetchVisits = async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: visitsPerPage.toString(),
        barberId: session?.user?.id || '',
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount })
      });

      const response = await fetch(`/api/visits?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setVisits(data.visits);
        setTotalPages(data.pagination.totalPages);
        setTotalVisits(data.pagination.total);
      } else {
        toast.error('Failed to load visits');
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Error loading visits');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setCurrentPage(1);
  };

  const exportVisits = async () => {
    try {
      const searchParams = new URLSearchParams({
        barberId: session?.user?.id || '',
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount })
      });

      const response = await fetch(`/api/visits/export?${searchParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `my-visits-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Export downloaded successfully');
      } else {
        toast.error('Failed to export visits');
      }
    } catch (error) {
      console.error('Error exporting visits:', error);
      toast.error('Error exporting visits');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
            <p className="text-gray-600">View and manage your visit history</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFilter size={14} />
              Filters
            </button>
            <button
              onClick={exportVisits}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaDownload size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Visits</p>
                <p className="text-lg font-semibold text-gray-900">{totalVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(visits.reduce((sum, visit) => sum + visit.totalAmount, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUser className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Unique Clients</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Set(visits.map(visit => visit.clientId._id)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaClock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg per Visit</p>
                <p className="text-lg font-semibold text-gray-900">
                  {visits.length > 0 ? formatCurrency(visits.reduce((sum, visit) => sum + visit.totalAmount, 0) / visits.length) : '$0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Client</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Client name or phone..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="$0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="$999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Visits Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                    </td>
                  </tr>
                ) : visits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No visits found
                    </td>
                  </tr>
                ) : (
                  visits.map((visit) => (
                    <tr key={visit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {visit.clientId.name}
                          </div>
                          {visit.clientId.phoneNumber && (
                            <div className="text-sm text-gray-500">
                              {visit.clientId.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {visit.services.map((service, index) => (
                            <div key={index}>
                              {service.serviceId.name} 
                              {service.quantity > 1 && ` (${service.quantity}x)`}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visit.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(visit.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.loyaltyPointsEarned} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            // Handle view details
                            toast('Visit details feature coming soon');
                          }}
                          className="text-black hover:text-gray-700 transition-colors"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * visitsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * visitsPerPage, totalVisits)}
                    </span>{' '}
                    of <span className="font-medium">{totalVisits}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="h-3 w-3" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
