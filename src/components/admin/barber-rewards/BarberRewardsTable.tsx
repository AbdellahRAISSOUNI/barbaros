'use client';

import { useState } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaMoneyBillWave,
  FaGift,
  FaCalendarAlt,
  FaTrophy,
  FaUsers,
  FaHandshake,
  FaStar,
  FaAward
} from 'react-icons/fa';

interface BarberReward {
  _id: string;
  name: string;
  description: string;
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';
  rewardValue: string;
  requirementType: string;
  requirementValue: number;
  requirementDescription: string;
  category: string;
  isActive: boolean;
  icon: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface BarberRewardsTableProps {
  rewards: BarberReward[];
  onEdit: (reward: BarberReward) => void;
  onDelete: (rewardId: string) => void;
  onToggleStatus: (rewardId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

const rewardTypeIcons = {
  monetary: { icon: FaMoneyBillWave, color: 'text-green-600', bg: 'bg-green-100' },
  gift: { icon: FaGift, color: 'text-purple-600', bg: 'bg-purple-100' },
  time_off: { icon: FaCalendarAlt, color: 'text-blue-600', bg: 'bg-blue-100' },
  recognition: { icon: FaTrophy, color: 'text-yellow-600', bg: 'bg-yellow-100' }
};

const categoryIcons = {
  milestone: { icon: FaAward, color: 'text-red-600' },
  performance: { icon: FaStar, color: 'text-yellow-600' },
  loyalty: { icon: FaHandshake, color: 'text-blue-600' },
  quality: { icon: FaUsers, color: 'text-green-600' }
};

export default function BarberRewardsTable({ 
  rewards, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isLoading 
}: BarberRewardsTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (rewardId: string) => {
    if (deleteConfirm === rewardId) {
      onDelete(rewardId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(rewardId);
    }
  };

  const formatRequirement = (type: string, value: number) => {
    switch (type) {
      case 'visits':
        return `${value.toLocaleString()} visits`;
      case 'clients':
        return `${value.toLocaleString()} clients`;
      case 'months_worked':
        return `${value} months`;
      case 'client_retention':
        return `${value}% retention`;
      case 'custom':
        return `Custom: ${value}`;
      default:
        return `${value}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B0000] mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <FaTrophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Yet</h3>
          <p className="text-gray-500">Create your first barber reward to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requirement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rewards.map((reward) => {
              const typeInfo = rewardTypeIcons[reward.rewardType];
              const categoryInfo = categoryIcons[reward.category as keyof typeof categoryIcons];
              const TypeIcon = typeInfo?.icon;
              const CategoryIcon = categoryInfo?.icon;

              return (
                <tr key={reward._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${typeInfo?.bg} flex items-center justify-center mr-3`}>
                        <span className="text-lg">{reward.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reward.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {reward.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {TypeIcon && (
                        <div className={`p-1.5 rounded ${typeInfo.bg} mr-2`}>
                          <TypeIcon className={`w-3 h-3 ${typeInfo.color}`} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reward.rewardType.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">{reward.rewardValue}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatRequirement(reward.requirementType, reward.requirementValue)}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {reward.requirementDescription}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {CategoryIcon && (
                        <CategoryIcon className={`w-4 h-4 ${categoryInfo.color} mr-2`} />
                      )}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {reward.category}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(reward._id, !reward.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        reward.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {reward.isActive ? (
                        <>
                          <FaToggleOn className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(reward)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit reward"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reward._id)}
                        className={`transition-colors ${
                          deleteConfirm === reward._id
                            ? 'text-red-800 font-bold'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={deleteConfirm === reward._id ? 'Click again to confirm' : 'Delete reward'}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {rewards.length} reward{rewards.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
} 