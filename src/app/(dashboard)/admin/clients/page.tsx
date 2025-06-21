'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaQrcode, FaEdit, FaTrash, FaUsers, FaPhone } from 'react-icons/fa';
import { ClientSearch } from '@/components/ui/ClientSearch';
import { Pagination } from '@/components/ui/Pagination';
import { ClientForm } from '@/components/ui/ClientForm';
import { QRCodeModal } from '@/components/ui/QRCodeModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

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
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch clients on component mount and when pagination or search changes
  useEffect(() => {
    fetchClients();
  }, [currentPage, searchQuery]);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = searchQuery
        ? `/api/clients/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${pageSize}`
        : `/api/clients?page=${currentPage}&limit=${pageSize}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const data: PaginatedResponse = await response.json();
      
      setClients(data.clients);
      setTotalClients(data.totalClients);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {client.firstName} {client.lastName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: {client.clientId}</p>
        </div>
        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
          client.accountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {client.accountActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaPhone className="w-4 h-4 mr-2" />
          <span>{client.phoneNumber}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">{client.visitCount}</div>
            <div className="text-xs text-gray-500">Visits</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">{client.rewardsEarned}</div>
            <div className="text-xs text-gray-500">Rewards</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => handleEditClient(client)}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          title="Edit Client"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleViewQRCode(client)}
          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
          title="View QR Code"
        >
          <FaQrcode className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteClick(client)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
          title="Delete Client"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const ClientTableRow = ({ client }: { client: Client }) => (
    <tr className="hover:bg-gray-50">
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <FaUsers className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage client accounts, view statistics, and handle customer information
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </button>
            <button
              onClick={handleAddClient}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalClients}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Clients</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter(c => c.accountActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Clients</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter(c => !c.accountActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <ClientSearch onSearch={handleSearch} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Clients List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating a new client.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <button
                  onClick={handleAddClient}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add Client
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rewards
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <ClientCard key={client._id} client={client} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <ClientForm
              client={selectedClient}
              onSubmit={handleClientSubmit}
              onCancel={() => setShowClientForm(false)}
              isSubmitting={isSubmitting}
              error={formError}
            />
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrCodeClient && (
        <QRCodeModal
          client={qrCodeClient}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Client"
          message={`Are you sure you want to delete ${clientToDelete.firstName} ${clientToDelete.lastName}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}