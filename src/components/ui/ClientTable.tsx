'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaQrcode, FaSortUp, FaSortDown, FaSort, FaSync, FaClock } from 'react-icons/fa';
import { useRealTimeData, useRealTimeEvent, realTimeEvents } from '@/lib/hooks/useRealTimeData';

interface Client {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  visitCount: number;
  lastVisit?: Date;
  accountActive: boolean;
}

interface SortConfig {
  key: keyof Client | '';
  direction: 'asc' | 'desc';
}

interface ClientTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewQR: (client: Client) => void;
  onDataUpdate?: (clients: Client[]) => void;
  searchQuery?: string;
  className?: string;
  enableRealTime?: boolean;
}

// PHASE 2 FIX: Memoized table row component for better performance
const ClientTableRow = React.memo(({ 
  client, 
  onView, 
  onEdit, 
  onDelete, 
  onViewQR 
}: {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewQR: (client: Client) => void;
}) => {
  const formatDate = useCallback((date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }, []);

  return (
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
        {formatDate(client.lastVisit)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.accountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {client.accountActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onView(client)}
            className="text-blue-600 hover:text-blue-900"
            aria-label="View client"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onEdit(client)}
            className="text-green-600 hover:text-green-900"
            aria-label="Edit client"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onViewQR(client)}
            className="text-purple-600 hover:text-purple-900"
            aria-label="View QR code"
          >
            <FaQrcode />
          </button>
          <button
            onClick={() => onDelete(client)}
            className="text-red-600 hover:text-red-900"
            aria-label="Delete client"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
});

ClientTableRow.displayName = 'ClientTableRow';

// PHASE 2 FIX: Memoized main component with real-time updates
export const ClientTable = React.memo(({
  clients,
  onView,
  onEdit,
  onDelete,
  onViewQR,
  onDataUpdate,
  searchQuery = '',
  className = '',
  enableRealTime = true,
}: ClientTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const requestSort = useCallback((key: keyof Client) => {
    setSortConfig(prevConfig => {
      let direction: 'asc' | 'desc' = 'asc';
      if (prevConfig.key === key && prevConfig.direction === 'asc') {
        direction = 'desc';
      }
      return { key, direction };
    });
  }, []);

  const getSortIcon = useCallback((key: keyof Client) => {
    if (sortConfig.key !== key) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ml-1 text-black" /> : 
      <FaSortDown className="ml-1 text-black" />;
  }, [sortConfig]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Emit refresh request event
      realTimeEvents.emit('clients:refresh-request', {});
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing clients:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Listen for real-time client updates
  useRealTimeEvent('clients:updated', (updatedClients: Client[]) => {
    if (onDataUpdate) {
      onDataUpdate(updatedClients);
    }
    setLastUpdate(new Date());
  }, [onDataUpdate]);

  // Listen for individual client changes
  useRealTimeEvent('client:created', (newClient: Client) => {
    if (onDataUpdate) {
      const updatedClients = [...clients, newClient];
      onDataUpdate(updatedClients);
    }
    setLastUpdate(new Date());
  }, [clients, onDataUpdate]);

  useRealTimeEvent('client:updated', (updatedClient: Client) => {
    if (onDataUpdate) {
      const updatedClients = clients.map(client => 
        client._id === updatedClient._id ? updatedClient : client
      );
      onDataUpdate(updatedClients);
    }
    setLastUpdate(new Date());
  }, [clients, onDataUpdate]);

  useRealTimeEvent('client:deleted', (deletedClientId: string) => {
    if (onDataUpdate) {
      const updatedClients = clients.filter(client => client._id !== deletedClientId);
      onDataUpdate(updatedClients);
    }
    setLastUpdate(new Date());
  }, [clients, onDataUpdate]);

  // PHASE 2 FIX: Memoized sorted clients for better performance
  const sortedClients = useMemo(() => {
    if (sortConfig.key === '') return clients;
    
    return [...clients].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Client];
      const bValue = b[sortConfig.key as keyof Client];
      
      if (aValue === bValue) return 0;
      
      // Handle undefined values
      if (aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Compare based on direction
      const compareResult = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });
  }, [clients, sortConfig]);

  return (
    <div className={className}>
      {/* Real-time controls header */}
      {enableRealTime && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isRefreshing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <FaSync className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              {lastUpdate && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <FaClock className="h-3 w-3" />
                  <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {sortedClients.length} client{sortedClients.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtered)`}
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('clientId')}
            >
              <div className="flex items-center">
                Client ID
                {getSortIcon('clientId')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('lastName')}
            >
              <div className="flex items-center">
                Name
                {getSortIcon('lastName')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('phoneNumber')}
            >
              <div className="flex items-center">
                Phone
                {getSortIcon('phoneNumber')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('visitCount')}
            >
              <div className="flex items-center">
                Visits
                {getSortIcon('visitCount')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('lastVisit')}
            >
              <div className="flex items-center">
                Last Visit
                {getSortIcon('lastVisit')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('accountActive')}
            >
              <div className="flex items-center">
                Status
                {getSortIcon('accountActive')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedClients.length > 0 ? (
            sortedClients.map((client) => (
              <ClientTableRow
                key={client._id}
                client={client}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewQR={onViewQR}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                No clients found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
});

ClientTable.displayName = 'ClientTable';