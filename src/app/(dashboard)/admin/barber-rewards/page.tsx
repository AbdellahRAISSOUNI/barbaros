'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaDollarSign, 
  FaGift, 
  FaClock, 
  FaAward, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaUsers,
  FaChartLine,
  FaBullseye,
  FaMedal,
  FaChartBar,
  FaCalendarAlt,
  FaPercentage,
  FaMoneyBillWave,
  FaHandshake,
  FaRocket,
  FaFire,
  FaStar,
  FaGem
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AdminModal } from '@/components/ui/AdminModal';
import BarberRewardForm from '@/components/admin/barber-rewards/BarberRewardForm';

interface BarberReward {
  _id: string;
  name: string;
  description: string;
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';
  rewardValue: string;
  requirementType: 'visits' | 'clients' | 'months_worked' | 'client_retention' | 'custom';
  requirementValue: number;
  requirementDescription: string;
  category: 'milestone' | 'performance' | 'loyalty' | 'quality';
  priority: number;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PendingRedemption {
  _id: string;
  barberId: string;
  barberName: string;
  barberImage?: string;
  rewardId: string;
  rewardName: string;
  earnedAt: string;
  status: 'earned';
}

function RedemptionModal({
  isOpen,
  onClose,
  onConfirm,
  redemption,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  redemption: PendingRedemption | null;
}) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(notes);
    setLoading(false);
    setNotes('');
  };

  if (!isOpen || !redemption) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Redemption</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              {redemption.barberImage ? (
                <img 
                  src={redemption.barberImage} 
                  alt={redemption.barberName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                  {redemption.barberName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{redemption.barberName}</h4>
              <p className="text-sm text-gray-600">{redemption.rewardName}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Add any notes about this redemption..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : null}
            Mark as Redeemed
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BarberRewardsPage() {
  const [rewards, setRewards] = useState<BarberReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<BarberReward | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [pendingRedemptions, setPendingRedemptions] = useState<PendingRedemption[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [redemptionToConfirm, setRedemptionToConfirm] = useState<PendingRedemption | null>(null);

  useEffect(() => {
    fetchRewards();
    fetchPendingRedemptions();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/barber-rewards');
      const data = await response.json();

      if (data.success) {
        setRewards(data.rewards);
        setStatistics(data.statistics);
      } else {
        toast.error('Failed to load rewards');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Error loading rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRedemptions = async () => {
    try {
      const response = await fetch('/api/admin/barber-rewards/redemptions?status=earned&limit=12');
      const data = await response.json();

      if (data.success) {
        setPendingRedemptions(data.redemptions);
      }
    } catch (error) {
      console.error('Error fetching pending redemptions:', error);
    }
  };

  const handleSaveReward = async (rewardData: any) => {
    try {
      const method = editingReward ? 'PUT' : 'POST';
      const url = editingReward 
        ? `/api/admin/barber-rewards/${editingReward._id}`
        : '/api/admin/barber-rewards';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rewardData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Reward ${editingReward ? 'updated' : 'created'} successfully`);
        setShowForm(false);
        setEditingReward(null);
        fetchRewards();
      } else {
        toast.error(data.message || 'Failed to save reward');
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error('Error saving reward');
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/barber-rewards/${rewardId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward deleted successfully');
        fetchRewards();
      } else {
        toast.error(data.message || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Error deleting reward');
    }
  };

  const handleToggleActive = async (rewardId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/barber-rewards/${rewardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Reward ${!currentActive ? 'activated' : 'deactivated'} successfully`);
        fetchRewards();
      } else {
        toast.error(data.message || 'Failed to update reward status');
      }
    } catch (error) {
      console.error('Error toggling reward status:', error);
      toast.error('Error updating reward status');
    }
  };

  const handleMarkRedeemed = async (notes: string) => {
    if (!redemptionToConfirm) return;

    try {
      const response = await fetch(`/api/admin/barber-rewards/${redemptionToConfirm.rewardId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          redemptionId: redemptionToConfirm._id,
          notes 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward marked as redeemed successfully');
        setRedemptionToConfirm(null);
        fetchPendingRedemptions();
      } else {
        toast.error(data.message || 'Failed to mark reward as redeemed');
      }
    } catch (error) {
      console.error('Error marking reward as redeemed:', error);
      toast.error('Error processing redemption');
    }
  };

  // Filter and sort rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || reward.category === filterCategory;
    const matchesType = filterType === 'all' || reward.rewardType === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedRewards = [...filteredRewards].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'type':
        return a.rewardType.localeCompare(b.rewardType);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: // category
        return a.category.localeCompare(b.category);
    }
  });

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'monetary': return FaDollarSign;
      case 'gift': return FaGift;
      case 'time_off': return FaClock;
      case 'recognition': return FaAward;
      default: return FaGift;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'monetary': return 'bg-green-100 text-green-800 border-green-200';
      case 'gift': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'time_off': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recognition': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'bg-indigo-100 text-indigo-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'loyalty': return 'bg-pink-100 text-pink-800';
      case 'quality': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000] mx-auto mb-4"></div>
          <p className="text-stone-600">Loading rewards system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-r from-[#8B0000] to-[#A31515] rounded-xl shadow-lg">
                  <FaGem className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">Barber Rewards System</h1>
                  <p className="text-stone-600 mt-1">Advanced incentive management and team motivation platform</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white px-6 py-3 rounded-xl hover:from-[#7A0000] hover:to-[#920000] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <FaPlus className="h-4 w-4" />
              Create Premium Reward
            </button>
          </div>
        </div>

        {/* Premium Statistics Dashboard */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-xl shadow-lg">
                  <FaRocket className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-stone-800">{statistics.totalRewards}</div>
                  <div className="text-sm font-medium text-stone-600">Active Rewards</div>
                </div>
              </div>
              <div className="text-xs text-stone-500">Total incentive programs</div>
            </div>

            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl shadow-lg">
                  <FaChartLine className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-stone-800">{statistics.totalRedemptions}</div>
                  <div className="text-sm font-medium text-stone-600">Total Claims</div>
                </div>
              </div>
              <div className="text-xs text-stone-500">Lifetime redemptions</div>
            </div>

            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl shadow-lg">
                  <FaFire className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-stone-800">{statistics.pendingRedemptions}</div>
                  <div className="text-sm font-medium text-stone-600">Pending</div>
                </div>
              </div>
              <div className="text-xs text-stone-500">Awaiting approval</div>
            </div>

            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-xl shadow-lg">
                  <FaUsers className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-stone-800">{statistics.activeBarbers}</div>
                  <div className="text-sm font-medium text-stone-600">Active Barbers</div>
                </div>
              </div>
              <div className="text-xs text-stone-500">Participating members</div>
            </div>
          </div>
        )}

        {/* Engagement Analytics */}
        {statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-lg">
                  <FaChartBar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800">Reward Categories</h3>
              </div>
              <div className="space-y-4">
                {statistics.categories?.map((category: any) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getCategoryColor(category._id)}`}>
                        {category._id}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-stone-800">{category.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg">
                  <FaMedal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800">Redemption Performance</h3>
              </div>
              <div className="space-y-4">
                {statistics.redemptionsByType?.map((type: any) => (
                  <div key={type._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRewardTypeColor(type._id)}`}>
                        {type._id}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-stone-800">{type.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Redemptions Section */}
        {pendingRedemptions.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg">
                    <FaBullseye className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-800">
                    Outstanding Achievements ({pendingRedemptions.length})
                  </h3>
                </div>
                <p className="text-amber-700">
                  Team members have earned these rewards and are awaiting your recognition.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRedemptions.slice(0, 6).map((redemption) => (
                <div
                  key={redemption._id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200/40 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 flex-shrink-0 shadow-inner">
                      {redemption.barberImage ? (
                        <img 
                          src={redemption.barberImage} 
                          alt={redemption.barberName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center text-white font-bold text-lg">
                          {redemption.barberName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-stone-900 truncate text-lg">
                        {redemption.barberName}
                      </h4>
                      <p className="text-sm text-stone-600 truncate">
                        {redemption.rewardName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-amber-600 mb-4 font-medium">
                    🏆 Achieved: {new Date(redemption.earnedAt).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={() => setRedemptionToConfirm(redemption)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    Process Redemption
                  </button>
                </div>
              ))}
            </div>
            
            {pendingRedemptions.length > 6 && (
              <div className="text-center mt-6">
                <span className="text-amber-700 text-sm font-medium">
                  Showing first 6 of {pendingRedemptions.length} pending redemptions
                </span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Filters and Search */}
        <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">Search Rewards</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
              >
                <option value="all">All Categories</option>
                <option value="milestone">Milestone</option>
                <option value="performance">Performance</option>
                <option value="loyalty">Loyalty</option>
                <option value="quality">Quality</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Reward Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
              >
                <option value="all">All Types</option>
                <option value="monetary">Monetary</option>
                <option value="gift">Gift</option>
                <option value="time_off">Time Off</option>
                <option value="recognition">Recognition</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
              >
                <option value="category">Category</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="created">Recently Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Premium Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRewards.map((reward) => {
            const RewardIcon = getRewardIcon(reward.rewardType);
            return (
              <div
                key={reward._id}
                className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-xl shadow-lg">
                      <span className="text-lg">{reward.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 text-lg">{reward.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(reward.category)}`}>
                          {reward.category}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRewardTypeColor(reward.rewardType)}`}>
                          {reward.rewardType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(reward._id, reward.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        reward.isActive 
                          ? 'text-emerald-600 hover:bg-emerald-50' 
                          : 'text-stone-400 hover:bg-stone-50'
                      }`}
                      title={reward.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {reward.isActive ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                  {reward.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700">Reward Value</span>
                    <span className="text-lg font-bold text-emerald-600">{reward.rewardValue}</span>
                  </div>
                  
                  <div className="bg-stone-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-stone-600 mb-1">Requirement</div>
                    <div className="text-sm text-stone-800">{reward.requirementDescription}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingReward(reward);
                      setShowForm(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-stone-600 to-stone-500 text-white px-4 py-2 rounded-xl hover:from-stone-700 hover:to-stone-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaEdit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward._id)}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedRewards.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-to-r from-stone-100 to-stone-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaAward className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">No rewards found</h3>
            <p className="text-stone-600 mb-6">
              {searchTerm || filterCategory !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your search criteria.' 
                : 'Create your first reward to motivate your team.'}
            </p>
            {!searchTerm && filterCategory === 'all' && filterType === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B0000] to-[#A31515] text-white px-6 py-3 rounded-xl hover:from-[#7A0000] hover:to-[#920000] transition-all duration-300"
              >
                <FaPlus className="h-4 w-4" />
                Create First Reward
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        <AdminModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingReward(null);
          }}
          title={editingReward ? 'Edit Reward' : 'Create New Reward'}
          maxWidth="2xl"
        >
          <BarberRewardForm
            reward={editingReward}
            onSubmit={handleSaveReward}
            onCancel={() => {
              setShowForm(false);
              setEditingReward(null);
            }}
          />
        </AdminModal>

        <RedemptionModal
          isOpen={!!redemptionToConfirm}
          onClose={() => setRedemptionToConfirm(null)}
          onConfirm={handleMarkRedeemed}
          redemption={redemptionToConfirm}
        />
      </div>
    </div>
  );
} 