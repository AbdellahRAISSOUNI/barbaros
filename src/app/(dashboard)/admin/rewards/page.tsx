'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaGift, FaPlus, FaSearch, FaFilter, FaChartBar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { HiAdjustmentsHorizontal, HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import RewardForm from '@/components/admin/rewards/RewardForm';
import RewardsTable from '@/components/admin/rewards/RewardsTable';
import RewardDetailsModal from '@/components/admin/rewards/RewardDetailsModal';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { AdminModal } from '@/components/ui/AdminModal';

interface Service {
  _id: string;
  name: string;
  category?: {
    name: string;
  };
  price: number;
}

interface Reward {
  _id: string;
  name: string;
  description: string;
  visitsRequired: number;
  rewardType: 'free' | 'discount';
  discountPercentage?: number;
  applicableServices: Service[];
  maxRedemptions?: number;
  validForDays?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RewardStatistics {
  totalRewards: number;
  activeRewards: number;
  inactiveRewards: number;
  freeRewards: number;
  discountRewards: number;
  popularRewards: any[];
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [statistics, setStatistics] = useState<RewardStatistics | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [viewingReward, setViewingReward] = useState<Reward | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounced search function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Fetch rewards with real-time updates
  const fetchRewards = useCallback(async (page = 1, search = '', rewardType = '', isActive = '', isRealTime = false) => {
    try {
      if (!isRealTime) setIsLoading(true);
      else setSearchLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search,
        ...(rewardType && { rewardType }),
        ...(isActive && { isActive })
      });

      const response = await fetch(`/api/rewards?${params}`);
      const data = await response.json();

      if (data.success) {
        setRewards(data.rewards || []);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to fetch rewards');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to fetch rewards');
    } finally {
      if (!isRealTime) setIsLoading(false);
      else setSearchLoading(false);
    }
  }, [pagination.limit]);

  // Debounced search
  const debouncedFetch = useCallback(
    debounce((search: string, type: string, status: string) => {
      fetchRewards(1, search, type, status, true);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300),
    [fetchRewards]
  );

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/rewards/statistics');
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchStatistics();
  }, []);

  // Real-time search effect
  useEffect(() => {
    debouncedFetch(searchTerm, filterType, filterStatus);
  }, [searchTerm, filterType, filterStatus, debouncedFetch]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchRewards(page, searchTerm, filterType, filterStatus);
  };

  // Handle create reward
  const handleCreateReward = async (rewardData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward created successfully!');
        setShowForm(false);
        fetchRewards(pagination.page, searchTerm, filterType, filterStatus);
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to create reward');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      toast.error('Failed to create reward');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update reward
  const handleUpdateReward = async (rewardData: any) => {
    if (!editingReward) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/rewards/${editingReward._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward updated successfully!');
        setEditingReward(null);
        setShowForm(false);
        fetchRewards(pagination.page, searchTerm, filterType, filterStatus);
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to update reward');
      }
    } catch (error) {
      console.error('Error updating reward:', error);
      toast.error('Failed to update reward');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete reward
  const handleDeleteReward = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward deleted successfully!');
        fetchRewards(pagination.page, searchTerm, filterType, filterStatus);
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleToggleStatus = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Reward ${data.reward.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchRewards(pagination.page, searchTerm, filterType, filterStatus);
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to update reward status');
      }
    } catch (error) {
      console.error('Error toggling reward status:', error);
      toast.error('Failed to update reward status');
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingReward(null);
    setShowForm(false);
  };

  const handleViewDetails = (reward: Reward) => {
    setViewingReward(reward);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
  };

  const hasActiveFilters = searchTerm || filterType || filterStatus;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="text-center">
          <LoadingAnimation size="lg" className="mb-4" />
          <p className="text-amber-800 font-medium">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <FaGift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rewards Management</h1>
                <p className="text-gray-600 text-sm sm:text-base">Create and manage loyalty rewards for your clients</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <FaPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Reward</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <FaGift className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.totalRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <FaChartBar className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.activeRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <FaGift className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Free</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.freeRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                  <FaGift className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Discount</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.discountRewards}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar and Filter Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search rewards by name or description..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Toggle Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-all font-medium ${
                    showFilters || hasActiveFilters
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HiAdjustmentsHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[searchTerm, filterType, filterStatus].filter(Boolean).length}
                    </span>
                  )}
                  {showFilters ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <HiXMark className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Collapsible Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reward Type
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">All Types</option>
                          <option value="free">Free Rewards</option>
                          <option value="discount">Discount Rewards</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">All Status</option>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Rewards Table */}
        <RewardsTable
          rewards={rewards}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteReward}
          onToggleStatus={handleToggleStatus}
          onView={handleViewDetails}
          isLoading={false}
        />

        {/* Create/Edit Reward Modal */}
        {showForm && (
          <AdminModal
            isOpen={showForm}
            onClose={handleCancelForm}
            title={editingReward ? 'Edit Reward' : 'Create New Reward'}
            maxWidth="3xl"
          >
            <RewardForm
              reward={editingReward || undefined}
              onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
              onCancel={handleCancelForm}
              isLoading={formLoading}
            />
          </AdminModal>
        )}

        {/* Reward Details Modal */}
        <RewardDetailsModal
          reward={viewingReward}
          isOpen={!!viewingReward}
          onClose={() => setViewingReward(null)}
        />
      </div>
    </div>
  );
}