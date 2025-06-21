'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaQrcode, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

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
  className?: string;
}

export function ClientTable({
  clients,
  onView,
  onEdit,
  onDelete,
  onViewQR,
  className = '',
}: ClientTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const requestSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Client) => {
    if (sortConfig.key !== key) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ml-1 text-black" /> : 
      <FaSortDown className="ml-1 text-black" />;
  };

  // Apply sorting to the client list
  const sortedClients = [...clients].sort((a, b) => {
    if (sortConfig.key === '') return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === bValue) return 0;
    
    // Handle undefined values
    if (aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
    
    // Compare based on direction
    const compareResult = aValue < bValue ? -1 : 1;
    return sortConfig.direction === 'asc' ? compareResult : -compareResult;
  });

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
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
              <tr key={client._id} className="hover:bg-gray-50">
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
  );
}