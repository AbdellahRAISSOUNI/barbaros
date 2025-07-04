'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaUserTie, FaSearch, FaFilter, FaEdit, FaChartLine, FaBan, FaTrash, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEye, FaTh, FaList, FaQrcode, FaClock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BarberForm from '@/components/admin/barbers/BarberForm';
import BarberStatsModal from '@/components/admin/barbers/BarberStatsModal';

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
  scannerEnabled: boolean;
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Scanner settings state
  const [globalScannerEnabled, setGlobalScannerEnabled] = useState(false);
  const [autoDisableHours, setAutoDisableHours] = useState(2);
  const [scannerSettingsLoading, setScannerSettingsLoading] = useState(false);
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [viewingStats, setViewingStats] = useState<Barber | null>(null);

  useEffect(() => {
    fetchBarbers();
    fetchScannerSettings();
  }, []);

  useEffect(() => {
    filterBarbers();
  }, [barbers, searchTerm, statusFilter]);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/barbers');
      const data = await response.json();

      if (data.success) {
        setBarbers(data.barbers || []);
      } else {
        toast.error(data.error || 'Failed to fetch barbers');
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Failed to fetch barbers');
    } finally {
      setLoading(false);
    }
  };

  const fetchScannerSettings = async () => {
    try {
      const response = await fetch('/api/admin/scanner-settings');
      const data = await response.json();

      if (data.success) {
        setGlobalScannerEnabled(data.settings.globalScannerEnabled);
        setAutoDisableHours(data.settings.autoDisableHours);
      }
    } catch (error) {
      console.error('Error fetching scanner settings:', error);
    }
  };

  const filterBarbers = () => {
    let filtered = [...barbers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(barber =>
        barber.name.toLowerCase().includes(term) ||
        barber.email.toLowerCase().includes(term) ||
        barber.username.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(barber => 
        statusFilter === 'active' ? barber.active : !barber.active
      );
    }

    setFilteredBarbers(filtered);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchBarbers();
  };

  const handleEditSuccess = () => {
    setEditingBarber(null);
    fetchBarbers();
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
  };

  const handleViewStats = (barber: Barber) => {
    setViewingStats(barber);
  };

  const handleDeactivate = async (barberId: string, barberName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${barberName}? They will no longer be able to access the system.`)) {
      return;
    }

    setDeletingId(barberId);
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });

      if (response.ok) {
        toast.success(`${barberName} has been deactivated`);
        fetchBarbers();
      } else {
        throw new Error('Failed to deactivate barber');
      }
    } catch (error) {
      toast.error('Failed to deactivate barber');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermanentDelete = async (barberId: string, barberName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${barberName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(barberId);
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${barberName} has been permanently deleted`);
        fetchBarbers();
      } else {
        throw new Error('Failed to delete barber');
      }
    } catch (error) {
      toast.error('Failed to delete barber');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleGlobalScanner = async (enabled: boolean) => {
    try {
      setScannerSettingsLoading(true);
      
      // If we have custom state, always disable all first
      const targetState = scannerStats.hasCustom ? false : enabled;
      
      // First update global scanner settings
      const globalResponse = await fetch('/api/admin/scanner-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          globalScannerEnabled: targetState,
          autoDisableHours: autoDisableHours 
        }),
      });

      const globalData = await globalResponse.json();
      if (!globalData.success) {
        throw new Error('Failed to update global scanner settings');
      }

      // Then update all barbers to match the global setting
      const bulkResponse = await fetch('/api/admin/barbers/bulk-scanner-toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannerEnabled: targetState }),
      });

      const bulkData = await bulkResponse.json();
      if (!bulkData.success) {
        throw new Error('Failed to update all barbers scanner permissions');
      }

      // Update local state
      setGlobalScannerEnabled(targetState);
      setBarbers(prevBarbers => 
        prevBarbers.map(barber => ({ ...barber, scannerEnabled: targetState }))
      );
      
      const actionText = scannerStats.hasCustom 
        ? 'disabled for all barbers (was custom)' 
        : `${targetState ? 'enabled' : 'disabled'} globally for all barbers`;
      
      toast.success(`Scanner ${actionText}`);
    } catch (error) {
      console.error('Error updating global scanner:', error);
      toast.error('Failed to update scanner settings');
    } finally {
      setScannerSettingsLoading(false);
    }
  };

  const handleToggleBarberScanner = async (barberId: string, barberName: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}/scanner-toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannerEnabled: enabled }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setBarbers(prevBarbers => 
          prevBarbers.map(barber => 
            barber._id === barberId 
              ? { ...barber, scannerEnabled: enabled }
              : barber
          )
        );
        toast.success(`Scanner ${enabled ? 'enabled' : 'disabled'} for ${barberName}`);
      } else {
        toast.error('Failed to update scanner permission');
      }
    } catch (error) {
      toast.error('Failed to update scanner permission');
    }
  };

  const handleAutoDisableHoursChange = async (hours: number) => {
    if (hours < 1 || hours > 10000) return;
    
    try {
      setScannerSettingsLoading(true);
      const response = await fetch('/api/admin/scanner-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          globalScannerEnabled: globalScannerEnabled,
          autoDisableHours: hours 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAutoDisableHours(hours);
        toast.success('Auto-disable timer updated');
      } else {
        toast.error('Failed to update auto-disable timer');
      }
    } catch (error) {
      toast.error('Failed to update auto-disable timer');
    } finally {
      setScannerSettingsLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalBarbers = barbers.length;
    const activeBarbers = barbers.filter(b => b.active).length;
    const inactiveBarbers = totalBarbers - activeBarbers;

    return { totalBarbers, activeBarbers, inactiveBarbers };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateWorkDays = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const stats = getTotalStats();

  // Calculate scanner permission statistics
  const getScannerStats = () => {
    const enabledCount = barbers.filter(b => b.scannerEnabled).length;
    const disabledCount = barbers.length - enabledCount;
    const hasCustom = enabledCount > 0 && disabledCount > 0;
    
    return { enabledCount, disabledCount, hasCustom };
  };

  const scannerStats = getScannerStats();

  const StatsOverview = () => (
    <div className="grid grid-cols-3 gap-3 mb-6 sm:mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <FaUserTie className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-500/10 px-2 py-1 rounded-full">Total</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.totalBarbers}</h3>
        <p className="text-sm text-gray-600">Total Barbers</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <FaUser className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">Active</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.activeBarbers}</h3>
        <p className="text-sm text-gray-600">Active Barbers</p>
      </div>
      
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <FaBan className="h-5 w-5 text-red-600" />
          </div>
          <span className="text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded-full">Inactive</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.inactiveBarbers}</h3>
        <p className="text-sm text-gray-600">Inactive Barbers</p>
      </div>
    </div>
  );

  const ScannerControls = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          <FaQrcode className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scanner Controls</h3>
          <p className="text-sm text-gray-600">Manage global and individual scanner access</p>
        </div>
      </div>

      {/* Global Scanner Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium text-gray-900">Global Scanner Access</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                scannerStats.hasCustom
                  ? 'bg-amber-100 text-amber-800'
                  : globalScannerEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {scannerStats.hasCustom 
                  ? 'Custom' 
                  : globalScannerEnabled 
                    ? 'Enabled' 
                    : 'Disabled'
                }
              </span>
              {scannerStats.hasCustom && (
                <span className="text-xs text-gray-500">
                  ({scannerStats.enabledCount} enabled, {scannerStats.disabledCount} disabled)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {scannerStats.hasCustom 
                ? 'Some barbers have different scanner permissions. Click to set all to the same state.'
                : 'Control scanner access for all barbers. Individual permissions still apply.'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(globalScannerEnabled && !scannerStats.hasCustom) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaClock className="h-4 w-4" />
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={autoDisableHours}
                  onChange={(e) => handleAutoDisableHoursChange(parseInt(e.target.value) || 2)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  disabled={scannerSettingsLoading}
                />
                <span>hours</span>
              </div>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={scannerStats.hasCustom ? false : globalScannerEnabled}
                onChange={(e) => handleToggleGlobalScanner(e.target.checked)}
                disabled={scannerSettingsLoading}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${
                scannerStats.hasCustom 
                  ? 'bg-amber-200' 
                  : 'bg-gray-200'
              } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                scannerStats.hasCustom 
                  ? 'after:bg-amber-500 after:translate-x-full' 
                  : 'peer-checked:bg-blue-600'
              }`}></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const SearchAndFilters = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search barbers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm text-gray-700"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all"
        >
          <FaPlus size={14} />
          <span className="hidden sm:inline">Add Barber</span>
        </button>
      </div>
    </div>
  );

  const BarberCard = ({ barber }: { barber: Barber }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 hover:-translate-y-1">
      <div className="relative">
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            barber.active 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {barber.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <button
          onClick={() => handleViewStats(barber)}
          className="w-full aspect-square overflow-hidden bg-gray-100 group relative"
        >
          {barber.profilePicture ? (
            <img
              src={barber.profilePicture}
              alt={barber.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <FaUser className="text-gray-400 text-4xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="bg-white/0 group-hover:bg-white/90 p-2 rounded-full transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
              <FaChartLine className="text-gray-700" />
            </div>
          </div>
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={() => handleViewStats(barber)}
          className="text-left group w-full"
        >
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{barber.name}</h3>
          <p className="text-sm text-gray-500 mb-2">@{barber.username}</p>
        </button>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <FaEnvelope className="text-gray-400 mr-2 flex-shrink-0" size={14} />
            <span className="truncate">{barber.email}</span>
          </div>
          {barber.phoneNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <FaPhone className="text-gray-400 mr-2 flex-shrink-0" size={14} />
              <span className="truncate">{barber.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="text-gray-400 mr-2 flex-shrink-0" size={14} />
            <span className="truncate">Joined {formatDate(barber.joinDate)}</span>
          </div>
        </div>

        {/* Scanner Permission Control */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaQrcode className={`h-4 w-4 ${barber.scannerEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900">Scanner Access</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                barber.scannerEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {barber.scannerEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={barber.scannerEnabled}
                onChange={(e) => handleToggleBarberScanner(barber._id, barber.name, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => handleViewStats(barber)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Statistics"
            >
              <FaChartLine size={16} />
            </button>
            <button
              onClick={() => handleEdit(barber)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit Barber"
            >
              <FaEdit size={16} />
            </button>
            {barber.active ? (
              <button
                onClick={() => handleDeactivate(barber._id, barber.name)}
                disabled={deletingId === barber._id}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Deactivate Barber"
              >
                <FaBan size={16} />
              </button>
            ) : (
              <button
                onClick={() => handlePermanentDelete(barber._id, barber.name)}
                disabled={deletingId === barber._id}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete Permanently"
              >
                <FaTrash size={16} />
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">{calculateWorkDays(barber.joinDate)} days</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Barber Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'cards'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaTh size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaList size={16} />
          </button>
        </div>
      </div>

      <StatsOverview />
      <ScannerControls />
      <SearchAndFilters />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : filteredBarbers.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No barbers found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Get started by adding a new barber'}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <FaPlus size={14} />
            Add Barber
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredBarbers.map(barber => (
            <BarberCard key={barber._id} barber={barber} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-sm border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barber</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBarbers.map(barber => (
                <tr key={barber._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleViewStats(barber)}
                        className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        {barber.profilePicture ? (
                          <img
                            src={barber.profilePicture}
                            alt={barber.name}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center">
                            <FaUser className="text-gray-400 text-lg" />
                          </div>
                        )}
                      </button>
                      <div className="ml-4">
                        <button
                          onClick={() => handleViewStats(barber)}
                          className="text-left group"
                        >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{barber.name}</div>
                          <div className="text-sm text-gray-500">@{barber.username}</div>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{barber.email}</div>
                    <div className="text-sm text-gray-500">{barber.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      barber.active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {barber.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(barber.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewStats(barber)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Statistics"
                      >
                        <FaChartLine size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(barber)}
                        className="text-gray-600 hover:text-green-600 transition-colors"
                        title="Edit Barber"
                      >
                        <FaEdit size={16} />
                      </button>
                      {barber.active ? (
                        <button
                          onClick={() => handleDeactivate(barber._id, barber.name)}
                          disabled={deletingId === barber._id}
                          className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Deactivate Barber"
                        >
                          <FaBan size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePermanentDelete(barber._id, barber.name)}
                          disabled={deletingId === barber._id}
                          className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete Permanently"
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <BarberForm
          onSubmit={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingBarber && (
        <BarberForm
          barber={editingBarber}
          isEditing
          onSubmit={handleEditSuccess}
          onCancel={() => setEditingBarber(null)}
        />
      )}

      {viewingStats && (
        <BarberStatsModal
          barber={viewingStats}
          onClose={() => setViewingStats(null)}
          onEdit={() => {
            setEditingBarber(viewingStats);
            setViewingStats(null);
          }}
        />
      )}
    </div>
  );
} 