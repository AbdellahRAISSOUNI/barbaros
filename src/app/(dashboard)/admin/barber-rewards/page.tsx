'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaGift, FaDollarSign, FaClock, FaAward, FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BarberRewardForm from '@/components/admin/barber-rewards/BarberRewardForm';
import { AdminModal } from '@/components/ui/AdminModal';
import BarberRewardsSearch from '@/components/admin/barber-rewards/BarberRewardsSearch';

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

  if (!isOpen || !redemption) return null;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="Confirm Reward Redemption">
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Redeem for {redemption.barberName}?
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            You are about to mark the reward <span className="font-semibold">"{redemption.rewardName}"</span> as redeemed.
          </p>
        </div>
        <div className="mt-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Redemption Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            placeholder="e.g., Handed gift card to barber."
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(notes)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirm Redemption
          </button>
        </div>
      </div>
    </AdminModal>
  );
}

export default function BarberRewardsPage() {
  const [rewards, setRewards] = useState<BarberReward[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<PendingRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<BarberReward | null>(null);
  const [redemptionToConfirm, setRedemptionToConfirm] = useState<PendingRedemption | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');

  useEffect(() => {
    fetchRewards();
    fetchPendingRedemptions();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/admin/barber-rewards');
      const data = await response.json();
      
      if (data.success) {
        setRewards(data.rewards || []);
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
      const response = await fetch('/api/admin/barber-rewards/redemptions');
      const data = await response.json();
      
      if (data.success) {
        setPendingRedemptions(data.redemptions || []);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  };

  const handleSaveReward = async (rewardData: any) => {
    try {
      const url = editingReward 
        ? `/api/admin/barber-rewards/${editingReward._id}`
        : '/api/admin/barber-rewards';
      
      const method = editingReward ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingReward ? 'Reward updated!' : 'Reward created!');
        fetchRewards();
        setShowForm(false);
        setEditingReward(null);
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving reward');
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await fetch(`/api/admin/barber-rewards/${rewardId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward deleted!');
        fetchRewards();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('Error deleting reward');
    }
  };

  const handleToggleActive = async (rewardId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/barber-rewards/${rewardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Reward ${!currentActive ? 'activated' : 'deactivated'}!`);
        fetchRewards();
      } else {
        toast.error(data.error || 'Toggle failed');
      }
    } catch (error) {
      toast.error('Error updating reward');
    }
  };

  const handleMarkRedeemed = async (notes: string) => {
    if (!redemptionToConfirm) return;

    try {
      const response = await fetch('/api/admin/barber-rewards/redemptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redemptionId: redemptionToConfirm._id,
          status: 'redeemed',
          notes: notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reward marked as redeemed!');
        fetchPendingRedemptions();
        setRedemptionToConfirm(null);
      } else {
        toast.error(data.error || 'Failed to mark as redeemed');
      }
    } catch (error) {
      toast.error('Error marking reward as redeemed');
    }
  };

  // Add filtered rewards computation
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || reward.category === filterCategory;
    const matchesType = filterType === 'all' || reward.rewardType === filterType;
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.rewardType.localeCompare(b.rewardType);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
      default:
        return b.priority - a.priority;
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

  const getRewardTypeDescription = (type: string) => {
    switch (type) {
      case 'monetary': return 'Monetary Reward';
      case 'gift': return 'Gift Reward';
      case 'time_off': return 'Time Off Reward';
      case 'recognition': return 'Recognition Reward';
      default: return 'Unknown Reward Type';
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

  const formatRequirement = (type: string, value: number) => {
    switch (type) {
      case 'visits': return `${value} visits`;
      case 'clients': return `${value} clients`;
      case 'months_worked': return `${value} months worked`;
      case 'client_retention': return `${value}% client retention`;
      case 'custom': return type;
      default: return 'Unknown Requirement';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Barber Rewards</h1>
              <p className="text-gray-600 mt-1">Manage rewards and redemptions for your barber team</p>
            </div>
            <button
              onClick={() => {
                setEditingReward(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              <span>New Reward</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <BarberRewardsSearch
          onSearch={setSearchTerm}
          onCategoryChange={setFilterCategory}
          onTypeChange={setFilterType}
          onSortChange={setSortBy}
        />

        {/* Pending Redemptions Section */}
        {pendingRedemptions.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-yellow-800 mb-1">
                  🎉 Pending Redemptions ({pendingRedemptions.length})
                </h3>
                <p className="text-yellow-700">
                  Barbers have earned rewards that need your approval for redemption.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRedemptions.map((redemption) => (
                <div
                  key={redemption._id}
                  className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {redemption.barberName}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {redemption.rewardName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Earned: {new Date(redemption.earnedAt).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={() => setRedemptionToConfirm(redemption)}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark Redeemed
                  </button>
                </div>
              ))}
            </div>
            
            {pendingRedemptions.length > 6 && (
              <div className="text-center mt-4">
                <span className="text-yellow-700 text-sm">
                  Showing first 6 of {pendingRedemptions.length} pending redemptions
                </span>
              </div>
            )}
          </div>
        )}

        {/* Rewards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const IconComponent = getRewardIcon(reward.rewardType);
            return (
              <div
                key={reward._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${getRewardTypeColor(reward.rewardType)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{reward.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleActive(reward._id, !reward.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          reward.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {reward.isActive ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Reward Value</div>
                      <div className="text-gray-900">{reward.rewardValue}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Requirement</div>
                      <div className="text-gray-900">
                        {formatRequirement(reward.requirementType, reward.requirementValue)}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      reward.rewardType === 'monetary' ? 'bg-green-50 text-green-700' :
                      reward.rewardType === 'gift' ? 'bg-purple-50 text-purple-700' :
                      reward.rewardType === 'time_off' ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {reward.rewardType.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryColor(reward.category)}`}>
                      {reward.category}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      Priority {reward.priority}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingReward(reward);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRewards.length === 0 && !loading && (
          <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-100">
            <FaGift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Found</h3>
            <p className="text-gray-500">
              {rewards.length === 0
                ? "Create your first barber reward to get started."
                : "No rewards match your current filters."}
            </p>
          </div>
        )}

        {/* Form Modal */}
        <AdminModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingReward(null);
          }}
          title={editingReward ? 'Edit Reward' : 'Create New Reward'}
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