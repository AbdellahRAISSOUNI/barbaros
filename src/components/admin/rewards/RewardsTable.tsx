'use client';

import { useState } from 'react';
import { FaGift, FaPercentage, FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCalendarAlt, FaRedoAlt } from 'react-icons/fa';
import { Pagination } from '@/components/ui/Pagination';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

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

interface RewardsTableProps {
  rewards: Reward[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => Promise<void>;
  onToggleStatus: (rewardId: string) => Promise<void>;
  onView: (reward: Reward) => void;
  isLoading?: boolean;
}

export default function RewardsTable({
  rewards,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  isLoading = false
}: RewardsTableProps) {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; rewardId: string; rewardName: string }>({
    isOpen: false,
    rewardId: '',
    rewardName: ''
  });
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const handleDelete = (reward: Reward) => {
    setDeleteModal({
      isOpen: true,
      rewardId: reward._id,
      rewardName: reward.name
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.rewardId) return;

    setActionLoading(prev => ({ ...prev, [deleteModal.rewardId]: true }));
    try {
      await onDelete(deleteModal.rewardId);
      setDeleteModal({ isOpen: false, rewardId: '', rewardName: '' });
    } catch (error) {
      console.error('Error deleting reward:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [deleteModal.rewardId]: false }));
    }
  };

  const handleToggleStatus = async (rewardId: string) => {
    setActionLoading(prev => ({ ...prev, [rewardId]: true }));
    try {
      await onToggleStatus(rewardId);
    } catch (error) {
      console.error('Error toggling reward status:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [rewardId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRewardTypeDisplay = (reward: Reward) => {
    if (reward.rewardType === 'free') {
      return (
        <div className="flex items-center gap-2">
          <FaGift className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">Free</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <FaPercentage className="w-4 h-4 text-blue-600" />
          <span className="text-blue-600 font-medium">{reward.discountPercentage}% Off</span>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <FaGift className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Found</h3>
            <p className="text-gray-600">
              No rewards match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Reward</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Visits Required</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Services</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Details</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Created</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rewards.map((reward) => (
              <tr key={reward._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{reward.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {getRewardTypeDisplay(reward)}
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {reward.visitsRequired} visits
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {reward.applicableServices.length} service{reward.applicableServices.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {reward.applicableServices.slice(0, 2).map((service) => (
                        <span
                          key={service._id}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {service.name}
                        </span>
                      ))}
                      {reward.applicableServices.length > 2 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{reward.applicableServices.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {reward.maxRedemptions && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaRedoAlt className="w-3 h-3" />
                        <span>Max {reward.maxRedemptions}</span>
                      </div>
                    )}
                    {reward.validForDays && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>{reward.validForDays} days</span>
                      </div>
                    )}
                    {!reward.maxRedemptions && !reward.validForDays && (
                      <span className="text-xs text-gray-500">No limits</span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(reward._id)}
                    disabled={actionLoading[reward._id]}
                    className="flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {reward.isActive ? (
                      <>
                        <FaToggleOn className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 text-sm font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500 text-sm font-medium">Inactive</span>
                      </>
                    )}
                  </button>
                </td>
                
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {formatDate(reward.createdAt)}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(reward)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(reward)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Reward"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(reward)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Reward"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <DeleteConfirmationModal
          onCancel={() => setDeleteModal({ isOpen: false, rewardId: '', rewardName: '' })}
          onConfirm={confirmDelete}
          title="Delete Reward"
          message={`Are you sure you want to delete "${deleteModal.rewardName}"? This action cannot be undone.`}
          isDeleting={actionLoading[deleteModal.rewardId]}
        />
      )}
    </div>
  );
}