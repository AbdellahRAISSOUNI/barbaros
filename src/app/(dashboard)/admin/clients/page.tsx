'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaQrcode, 
  FaEdit, 
  FaTrash, 
  FaUsers, 
  FaPhone, 
  FaEye, 
  FaSearch, 
  FaTimes, 
  FaSpinner, 
  FaTh, 
  FaList, 
  FaUser, 
  FaGift, 
  FaChartLine,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCog,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaColumns,
  FaKey,
  FaLock,
  FaEyeSlash
} from 'react-icons/fa';
import { ClientForm } from '@/components/ui/ClientForm';
import { QRCodeModal } from '@/components/ui/QRCodeModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { AdminModal } from '@/components/ui/AdminModal';
import { debounce } from 'lodash';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Client {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  visitCount: number;
  totalLifetimeVisits: number;
  currentProgressVisits: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  qrCodeUrl: string;
  accountActive: boolean;
  loyaltyStatus: 'new' | 'active' | 'milestone_reached' | 'inactive';
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
  totalSpent?: number;
  averageVisitValue?: number;
  daysSinceLastVisit?: number;
}

interface PaginatedResponse {
  clients: Client[];
  totalClients: number;
  totalPages: number;
  currentPage: number;
}

interface SortConfig {
  field: keyof Client | '';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status: 'all' | 'active' | 'inactive';
  loyaltyStatus: 'all' | 'new' | 'active' | 'milestone_reached' | 'inactive';
  visitRange: 'all' | '0-5' | '6-15' | '16-30' | '30+';
  dateRange: 'all' | '7days' | '30days' | '90days' | '1year';
}

type ColumnKey = 'clientId' | 'name' | 'phone' | 'visits' | 'totalSpent' | 'lastVisit' | 'loyaltyStatus' | 'status' | 'rewards' | 'avgValue' | 'daysSince' | 'progress';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  sortable: boolean;
}

export default function ClientsPage() {
  // State for clients data and pagination
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'lastName', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({
    status: 'all',
    loyaltyStatus: 'all',
    visitRange: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // State for column configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'clientId', label: 'Client ID', visible: true, sortable: true },
    { key: 'name', label: 'Name', visible: true, sortable: true },
    { key: 'phone', label: 'Phone', visible: true, sortable: true },
    { key: 'visits', label: 'Visits', visible: true, sortable: true },
    { key: 'loyaltyStatus', label: 'Loyalty', visible: true, sortable: true },
    { key: 'status', label: 'Status', visible: true, sortable: true },
    { key: 'totalSpent', label: 'Total Spent', visible: false, sortable: true },
    { key: 'lastVisit', label: 'Last Visit', visible: false, sortable: true },
    { key: 'rewards', label: 'Rewards', visible: false, sortable: true },
    { key: 'avgValue', label: 'Avg Value', visible: false, sortable: true },
    { key: 'daysSince', label: 'Days Since', visible: false, sortable: true },
    { key: 'progress', label: 'Reward Progress', visible: false, sortable: true }
  ]);
  
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

  // State for password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChangeClient, setPasswordChangeClient] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // State for client statistics
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    newClients: 0,
    loyaltyMembers: 0,
    totalVisits: 0,
    totalRewards: 0,
    totalSpent: 0,
    averageVisitsPerClient: 0,
    averageSpentPerClient: 0
  });

  // Add state for sorted clients
  const [sortedClients, setSortedClients] = useState<Client[]>([]);

  // Fetch clients on component mount and when filters/pagination changes (but not sortConfig)
  useEffect(() => {
    fetchClients();
  }, [currentPage, pageSize, filters]);

  // Sort clients locally for immediate feedback
  useEffect(() => {
    if (!sortConfig.field) {
      setSortedClients(clients);
      return;
    }

    const sorted = [...clients].sort((a, b) => {
      const aValue = a[sortConfig.field as keyof Client];
      const bValue = b[sortConfig.field as keyof Client];
      
      if (aValue === bValue) return 0;
      
      // Handle undefined values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Special handling for different field types
      let compareResult = 0;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        compareResult = aValue < bValue ? -1 : 1;
      } else if (sortConfig.field === 'lastVisit' || sortConfig.field === 'createdAt' || sortConfig.field === 'updatedAt') {
        // Handle date string comparison
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        compareResult = aDate.getTime() < bDate.getTime() ? -1 : 1;
      } else if (sortConfig.field === 'accountActive') {
        // Handle boolean sorting (active first when ascending)
        const aBool = Boolean(aValue);
        const bBool = Boolean(bValue);
        compareResult = aBool === bBool ? 0 : (aBool ? -1 : 1);
      } else if (sortConfig.field === 'rewardsEarned' || sortConfig.field === 'rewardsRedeemed' || 
                 sortConfig.field === 'visitCount' || sortConfig.field === 'totalLifetimeVisits' ||
                 sortConfig.field === 'currentProgressVisits' || sortConfig.field === 'totalSpent' ||
                 sortConfig.field === 'averageVisitValue') {
        // Handle numeric fields that might be undefined
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        compareResult = aNum < bNum ? -1 : 1;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        compareResult = aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
      } else {
        // Convert to strings for comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        compareResult = aStr < bStr ? -1 : 1;
      }
      
      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });

    setSortedClients(sorted);
  }, [clients, sortConfig]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        fetchClients();
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          page: '1',
          limit: pageSize.toString(),
          sortBy: sortConfig.field || 'lastName',
          sortOrder: sortConfig.direction,
          ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== 'all'))
        });

        const response = await fetch(`/api/clients/search?${params}`);
        const data = await response.json();
        
        if (response.ok) {
          setClients(data.clients || []);
          setTotalClients(data.totalClients || 0);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(1);
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
    [pageSize, sortConfig, filters]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      fetchClients();
      setIsSearching(false);
    } else {
      debouncedSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchClients();
    setIsSearching(false);
  };

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortConfig.field || 'lastName',
        sortOrder: sortConfig.direction,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== 'all'))
      });

      const response = await fetch(`/api/clients?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const data: PaginatedResponse = await response.json();
      
      setClients(data.clients);
      setTotalClients(data.totalClients);
      setTotalPages(data.totalPages);

      // Calculate enhanced client statistics from current page data
      const activeCount = data.clients.filter((c: Client) => c.accountActive).length;
      const newCount = data.clients.filter((c: Client) => c.loyaltyStatus === 'new').length;
      const loyaltyCount = data.clients.filter((c: Client) => c.loyaltyStatus === 'active' || c.loyaltyStatus === 'milestone_reached').length;
      const totalVisits = data.clients.reduce((sum: number, c: Client) => sum + (c.totalLifetimeVisits || c.visitCount), 0);
      const totalRewards = data.clients.reduce((sum: number, c: Client) => sum + c.rewardsEarned, 0);
      const totalSpent = data.clients.reduce((sum: number, c: Client) => sum + (c.totalSpent || 0), 0);
      
      setClientStats({
        totalClients: data.totalClients,
        activeClients: activeCount,
        inactiveClients: data.clients.length - activeCount, // Use current page for visible stats
        newClients: newCount,
        loyaltyMembers: loyaltyCount,
        totalVisits,
        totalRewards,
        totalSpent,
        averageVisitsPerClient: data.clients.length > 0 ? Math.round((totalVisits / data.clients.length) * 10) / 10 : 0,
        averageSpentPerClient: data.clients.length > 0 ? Math.round((totalSpent / data.clients.length) * 100) / 100 : 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Client | ColumnKey) => {
    // Map column keys to actual client fields for sorting
    const fieldMap: Record<ColumnKey, keyof Client> = {
      clientId: 'clientId',
      name: 'lastName', // Sort by last name for name column
      phone: 'phoneNumber',
      visits: 'totalLifetimeVisits',
      totalSpent: 'totalSpent',
      lastVisit: 'lastVisit',
      loyaltyStatus: 'loyaltyStatus',
      status: 'accountActive',
      rewards: 'rewardsEarned',
      avgValue: 'averageVisitValue',
      daysSince: 'lastVisit', // Will calculate days in sorting
      progress: 'currentProgressVisits'
    };

    const actualField = fieldMap[field as ColumnKey] || field as keyof Client;
    
    setSortConfig(prev => ({
      field: actualField,
      direction: prev.field === actualField && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType: keyof FilterConfig, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      loyaltyStatus: 'all',
      visitRange: 'all',
      dateRange: 'all'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleColumnToggle = (columnKey: ColumnKey) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = columns.filter(col => col.visible).slice(0, 6); // Maximum 6 columns

  // Component handlers (existing ones)
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

  const handlePasswordChangeClick = (client: Client) => {
    setPasswordChangeClient(client);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async () => {
    if (!passwordChangeClient) return;
    
    setPasswordError(null);
    
    // Validate passwords
    if (!newPassword.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch(`/api/admin/clients/${passwordChangeClient._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowPasswordModal(false);
        setPasswordChangeClient(null);
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Client password changed successfully!');
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordError(err.message || 'Failed to change password');
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordChangeClient(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handleClientSubmit = async (clientData: any) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const isEditing = Boolean(selectedClient?._id);
      const url = isEditing 
        ? `/api/clients/${selectedClient?._id}` 
        : '/api/clients';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Close the form and show success message
        setShowClientForm(false);
        toast.success(data.message || (isEditing ? 'Client updated successfully!' : 'Client created successfully!'));
        
        // Reset form state
        setSelectedClient(null);
        setFormError(null);
        
        // Refresh the client list
        await fetchClients();
      } else {
        throw new Error(data.error || 'Failed to save client');
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      setFormError(err.message || 'Failed to save client');
      toast.error(err.message || 'Failed to save client');
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
      
      setShowDeleteModal(false);
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceLastVisit = (lastVisit?: string) => {
    if (!lastVisit) return 'Never';
    const days = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const getLoyaltyStatusBadge = (status: string) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      milestone_reached: 'bg-purple-100 text-purple-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.new;
  };

  const renderCellContent = (client: Client, columnKey: ColumnKey) => {
    switch (columnKey) {
      case 'clientId':
        return (
          <div className="text-sm font-mono text-gray-900">
            {client.clientId}
          </div>
        );
      case 'name':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {client.firstName} {client.lastName}
            </div>
          </div>
        );
      case 'phone':
        return (
          <div className="text-sm text-gray-900">
            {client.phoneNumber}
          </div>
        );
      case 'visits':
        return (
          <div className="text-sm text-gray-900">
            <span className="font-medium">{client.totalLifetimeVisits || client.visitCount}</span>
            {client.currentProgressVisits !== undefined && client.currentProgressVisits > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                (+{client.currentProgressVisits})
              </span>
            )}
          </div>
        );
      case 'totalSpent':
        return (
          <div className="text-sm text-gray-900">
            {formatCurrency(client.totalSpent || 0)}
          </div>
        );
      case 'lastVisit':
        return (
          <div className="text-sm text-gray-900">
            {client.lastVisit ? formatDate(client.lastVisit) : 'Never'}
          </div>
        );
      case 'loyaltyStatus':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoyaltyStatusBadge(client.loyaltyStatus)}`}>
            {client.loyaltyStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        );
      case 'status':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            client.accountActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {client.accountActive ? (
              <>
                <FaCheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <FaTimesCircle className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </span>
        );
      case 'rewards':
        return (
          <div className="text-sm text-gray-900">
            <span className="font-medium">{client.rewardsEarned}</span>
            <span className="text-xs text-gray-500 ml-1">
              (used: {client.rewardsRedeemed})
            </span>
          </div>
        );
      case 'avgValue':
        return (
          <div className="text-sm text-gray-900">
            {formatCurrency(client.averageVisitValue || 0)}
          </div>
        );
      case 'daysSince':
        return (
          <div className="text-sm text-gray-900">
            {getDaysSinceLastVisit(client.lastVisit)}
          </div>
        );
      case 'progress':
        return (
          <div className="text-sm text-gray-900">
            <span className="font-medium">{client.currentProgressVisits || 0}</span>
            <span className="text-xs text-gray-500 ml-1">
              visits
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const getSortIcon = (columnKey: string) => {
    // Map column keys to actual client fields for icon display
    const fieldMap: Record<ColumnKey, keyof Client> = {
      clientId: 'clientId',
      name: 'lastName', 
      phone: 'phoneNumber',
      visits: 'totalLifetimeVisits',
      totalSpent: 'totalSpent',
      lastVisit: 'lastVisit',
      loyaltyStatus: 'loyaltyStatus',
      status: 'accountActive',
      rewards: 'rewardsEarned',
      avgValue: 'averageVisitValue',
      daysSince: 'lastVisit',
      progress: 'currentProgressVisits'
    };

    const actualField = fieldMap[columnKey as ColumnKey] || columnKey;
    
    if (sortConfig.field !== actualField) return <FaSort className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-gray-600" />
      : <FaSortDown className="w-3 h-3 text-gray-600" />;
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Show loading state while checking session
  if (isLoading && clients.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-blue-900">{clientStats.totalClients}</p>
            </div>
            <FaUsers className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Clients</p>
              <p className="text-2xl font-bold text-green-900">{clientStats.activeClients}</p>
            </div>
            <FaCheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-purple-900">{clientStats.totalVisits}</p>
            </div>
            <FaEye className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Loyalty Members</p>
              <p className="text-2xl font-bold text-orange-900">{clientStats.loyaltyMembers}</p>
            </div>
            <FaGift className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, phone, or client ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 placeholder:text-black"
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

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters || Object.values(filters).some(v => v !== 'all')
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter size={14} />
              Filters
            </button>
            
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaColumns size={14} />
              Columns
            </button>

            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Status</label>
                <select
                  value={filters.loyaltyStatus}
                  onChange={(e) => handleFilterChange('loyaltyStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="all">All Loyalty</option>
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="milestone_reached">Milestone Reached</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Range</label>
                <select
                  value={filters.visitRange}
                  onChange={(e) => handleFilterChange('visitRange', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="all">All Visits</option>
                  <option value="0-5">0-5 visits</option>
                  <option value="6-15">6-15 visits</option>
                  <option value="16-30">16-30 visits</option>
                  <option value="30+">30+ visits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="1year">Last year</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
              {Object.values(filters).some(v => v !== 'all') && (
                <span className="text-sm text-gray-500">
                  {Object.values(filters).filter(v => v !== 'all').length} filter(s) applied
                </span>
              )}
            </div>
          </div>
        )}

        {/* Column Selector Panel */}
        {showColumnSelector && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Select Columns (max 6)</h4>
              <span className="text-xs text-gray-500">
                {visibleColumns.length}/6 selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.map((column) => (
                <label key={column.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => handleColumnToggle(column.key)}
                    disabled={!column.visible && visibleColumns.length >= 6}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className={column.visible ? 'text-gray-900' : 'text-gray-500'}>
                    {column.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            {isSearching ? (
              'Searching...'
            ) : (
              `Found ${totalClients} client${totalClients !== 1 ? 's' : ''} matching "${searchQuery}"`
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

      {/* Enhanced Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {renderCellContent(client, column.key)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/clients/${client._id}/view`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Profile"
                      >
                        <FaEye size={16} />
                      </Link>
                      <button
                        onClick={() => handleViewQRCode(client)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="View QR Code"
                      >
                        <FaQrcode size={16} />
                      </button>
                      <button
                        onClick={() => handlePasswordChangeClick(client)}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Change Password"
                      >
                        <FaKey size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                        title="Edit Client"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(client)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Client"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && sortedClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || Object.values(filters).some(v => v !== 'all') ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || Object.values(filters).some(v => v !== 'all')
              ? 'Try adjusting your search terms or filters'
              : 'Get started by adding your first client'
            }
          </p>
          {!searchQuery && !Object.values(filters).some(v => v !== 'all') && (
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

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalClients)} of {totalClients} clients
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft size={12} />
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  disabled={pageNum === '...'}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pageNum === currentPage
                      ? 'bg-black text-white'
                      : pageNum === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronRight size={12} />
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showClientForm && (
        <AdminModal
          isOpen={showClientForm}
          onClose={() => setShowClientForm(false)}
          title={selectedClient ? 'Edit Client' : 'Add New Client'}
        >
          <ClientForm
            client={selectedClient || undefined}
            onSubmit={handleClientSubmit}
            onCancel={() => setShowClientForm(false)}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </AdminModal>
      )}

      {showQRModal && qrCodeClient && (
        <QRCodeModal
          clientId={qrCodeClient.clientId}
          clientName={`${qrCodeClient.firstName} ${qrCodeClient.lastName}`}
          qrCodeUrl={qrCodeClient.qrCodeUrl}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {showDeleteModal && clientToDelete && (
        <DeleteConfirmationModal
          title="Delete Client"
          message={`Are you sure you want to delete ${clientToDelete.firstName} ${clientToDelete.lastName}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}

      {showPasswordModal && passwordChangeClient && (
        <AdminModal
          isOpen={showPasswordModal}
          onClose={handlePasswordModalClose}
          title="Change Client Password"
        >
          <div className="space-y-6">
            <div className="text-center">
              <FaLock className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Change Password for {passwordChangeClient.firstName} {passwordChangeClient.lastName}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                As an admin, you can change this client's password without knowing their current password.
              </p>
            </div>
            
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{passwordError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isChangingPassword}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isChangingPassword}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handlePasswordModalClose}
                disabled={isChangingPassword}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChangingPassword ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2 inline" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <FaKey className="h-4 w-4 mr-2 inline" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}