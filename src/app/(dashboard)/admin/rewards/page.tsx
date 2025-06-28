'use client';

import { useState, useEffect } from 'react';
import { FaGift, FaPlus, FaSearch, FaFilter, FaChartBar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import RewardForm from '@/components/admin/rewards/RewardForm';
import RewardsTable from '@/components/admin/rewards/RewardsTable';
import RewardDetailsModal from '@/components/admin/rewards/RewardDetailsModal';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

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

  // Fetch rewards
  const fetchRewards = async (page = 1, search = '', rewardType = '', isActive = '') => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

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

  // Handle search
  const handleSearch = () => {
    fetchRewards(1, searchTerm, filterType, filterStatus);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

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

  // Handle toggle status
  const handleToggleStatus = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}?action=toggle-status`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchRewards(pagination.page, searchTerm, filterType, filterStatus);
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to toggle reward status');
      }
    } catch (error) {
      console.error('Error toggling reward status:', error);
      toast.error('Failed to toggle reward status');
    }
  };

  // Handle edit
  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReward(null);
  };

  // Handle view details
  const handleViewDetails = (reward: Reward) => {
    setViewingReward(reward);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <RewardForm
            reward={editingReward || undefined}
            onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
            onCancel={handleCancelForm}
            isLoading={formLoading}
          />
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <FaGift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rewards Management</h1>
                <p className="text-gray-600">Create and manage loyalty rewards for your clients</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
            >
              <FaPlus className="w-4 h-4" />
              Create Reward
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaGift className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaChartBar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.activeRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaGift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Free Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.freeRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaGift className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.discountRewards}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline w-4 h-4 mr-2" />
                Search Rewards
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFilter className="inline w-4 h-4 mr-2" />
                Reward Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="free">Free</option>
                <option value="discount">Discount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatus('');
                fetchRewards(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
            >
              Apply Filters
            </button>
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
          isLoading={isLoading}
        />

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