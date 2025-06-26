'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaQrcode, FaEdit, FaTrash, FaUsers, FaPhone, FaEye, FaSearch, FaTimes, FaSpinner, FaTh, FaList, FaUser, FaGift, FaChartLine } from 'react-icons/fa';
import { ClientForm } from '@/components/ui/ClientForm';
import { QRCodeModal } from '@/components/ui/QRCodeModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { AdminModal } from '@/components/ui/AdminModal';
import { debounce } from 'lodash';

interface Client {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  visitCount: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  qrCodeUrl: string;
  accountActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  clients: Client[];
  totalClients: number;
  totalPages: number;
  currentPage: number;
}

export default function ClientsPage() {
  // State for clients data and pagination
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // State for client form modal
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // State for QR code modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeClient, setQRCodeClient] = useState<Client | null>(null);
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for client statistics
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    totalVisits: 0,
    totalRewards: 0,
    averageVisitsPerClient: 0
  });

  // Fetch clients on component mount and when pagination changes
  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setClients(allClients);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query.trim())}&limit=100`);
        const data = await response.json();
        
        if (response.ok) {
          setClients(data.clients || []);
        } else {
          throw new Error(data.error || 'Search failed');
        }
      } catch (error) {
        console.error('Search error:', error);
        setError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [allClients]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      setClients(allClients);
      setIsSearching(false);
    } else {
      debouncedSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setClients(allClients);
    setIsSearching(false);
  };

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/clients?page=${currentPage}&limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const data: PaginatedResponse = await response.json();
      
      setAllClients(data.clients);
      setClients(data.clients);
      setTotalClients(data.totalClients);
      setTotalPages(data.totalPages);

      // Calculate client statistics
      const activeCount = data.clients.filter((c: Client) => c.accountActive).length;
      const totalVisits = data.clients.reduce((sum: number, c: Client) => sum + c.visitCount, 0);
      const totalRewards = data.clients.reduce((sum: number, c: Client) => sum + c.rewardsEarned, 0);
      
      setClientStats({
        totalClients: data.totalClients,
        activeClients: activeCount,
        inactiveClients: data.totalClients - activeCount,
        totalVisits,
        totalRewards,
        averageVisitsPerClient: data.totalClients > 0 ? Math.round((totalVisits / data.totalClients) * 10) / 10 : 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setFormError(null);
    setShowClientForm(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormError(null);
    setShowClientForm(true);
  };

  const handleViewQRCode = (client: Client) => {
    setQRCodeClient(client);
    setShowQRModal(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleClientSubmit = async (clientData: any) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const isEditing = Boolean(selectedClient?._id);
      const url = isEditing 
        ? `/api/clients/${selectedClient?._id}` 
        : '/api/clients';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save client');
      }
      
      // Close the form and refresh the client list
      setShowClientForm(false);
      fetchClients();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/clients/${clientToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      // Close the modal and refresh the client list
      setShowDeleteModal(false);
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const ClientCard = ({ client }: { client: Client }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {client.firstName} {client.lastName}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center">
              <span className="font-medium">ID:</span>
              <span className="ml-1">{client.clientId}</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <FaPhone className="w-3 h-3 mr-2 text-gray-400" />
              {client.phoneNumber}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
          client.accountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {client.accountActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{client.visitCount}</div>
          <div className="text-sm text-blue-600 font-medium">Total Visits</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-700">{client.rewardsEarned}</div>
          <div className="text-sm text-green-600 font-medium">Rewards Earned</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Available: <span className="font-semibold text-green-600">{client.rewardsEarned - client.rewardsRedeemed}</span> rewards
        </div>
        <div className="flex space-x-2">
          <a
            href={`/admin/clients/${client._id}/view`}
            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
            title="View Profile"
          >
            <FaEye className="w-4 h-4" />
          </a>
          <button
            onClick={() => handleEditClient(client)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Client"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewQRCode(client)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            title="View QR Code"
          >
            <FaQrcode className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(client)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Client"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ClientTableRow = ({ client }: { client: Client }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {client.clientId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.firstName} {client.lastName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.phoneNumber}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.visitCount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.rewardsEarned}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          client.accountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {client.accountActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <a
            href={`/admin/clients/${client._id}/view`}
            className="text-purple-600 hover:text-purple-900"
            title="View Profile"
          >
            <FaEye className="w-4 h-4" />
          </a>
          <button
            onClick={() => handleEditClient(client)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit Client"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewQRCode(client)}
            className="text-green-600 hover:text-green-900"
            title="View QR Code"
          >
            <FaQrcode className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(client)}
            className="text-red-600 hover:text-red-900"
            title="Delete Client"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUsers className="mr-3 text-black" />
            Clients Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your barbershop clients and their information
          </p>
        </div>
        <button
          onClick={handleAddClient}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 shadow-lg font-medium"
        >
          <FaPlus size={16} />
          Add New Client
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-blue-900">{clientStats.totalClients}</p>
            </div>
            <FaUsers className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Clients</p>
              <p className="text-2xl font-bold text-green-900">{clientStats.activeClients}</p>
            </div>
            <FaUser className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Inactive Clients</p>
              <p className="text-2xl font-bold text-red-900">{clientStats.inactiveClients}</p>
            </div>
            <FaUser className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-purple-900">{clientStats.totalVisits}</p>
            </div>
            <FaEye className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Total Rewards</p>
              <p className="text-2xl font-bold text-orange-900">{clientStats.totalRewards}</p>
            </div>
            <FaGift className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">Avg Visits</p>
              <p className="text-2xl font-bold text-indigo-900">{clientStats.averageVisitsPerClient}</p>
            </div>
            <FaChartLine className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, phone, or client ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400"
              />
              {(searchQuery || isSearching) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isSearching ? (
                    <FaSpinner className="animate-spin text-gray-400" size={16} />
                  ) : (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                                 <FaTh size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            {isSearching ? (
              'Searching...'
            ) : (
              `Found ${clients.length} client${clients.length !== 1 ? 's' : ''} matching "${searchQuery}"`
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Clients Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {clients.map((client) => (
            <ClientCard key={client._id} client={client} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rewards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <ClientTableRow key={client._id} client={client} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && clients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first client'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddClient}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaPlus size={16} />
              Add First Client
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClientForm(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                          <ClientForm
                client={selectedClient || undefined}
                onSubmit={handleClientSubmit}
                onCancel={() => setShowClientForm(false)}
                isSubmitting={isSubmitting}
                error={formError}
                className="shadow-none rounded-none"
              />
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrCodeClient && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQRModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <QRCodeModal
              clientId={qrCodeClient._id}
              clientName={`${qrCodeClient.firstName} ${qrCodeClient.lastName}`}
              qrCodeUrl={qrCodeClient.qrCodeUrl}
              onClose={() => setShowQRModal(false)}
              className="shadow-none rounded-none"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <DeleteConfirmationModal
          title="Delete Client"
          message={`Are you sure you want to delete ${clientToDelete.firstName} ${clientToDelete.lastName}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}