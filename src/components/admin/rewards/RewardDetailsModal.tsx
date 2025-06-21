'use client';

import { FaGift, FaPercentage, FaTimes, FaCalendarAlt, FaRedoAlt, FaTags, FaClock } from 'react-icons/fa';

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

interface RewardDetailsModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RewardDetailsModal({ reward, isOpen, onClose }: RewardDetailsModalProps) {
  if (!isOpen || !reward) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRewardTypeDisplay = () => {
    if (reward.rewardType === 'free') {
      return (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <div className="p-3 bg-green-100 rounded-full">
            <FaGift className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Free Service</h3>
            <p className="text-green-600">Clients get the service completely free</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaPercentage className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              {reward.discountPercentage}% Discount
            </h3>
            <p className="text-blue-600">Clients get a percentage discount on the service</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <FaGift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reward Details</h2>
              <p className="text-sm text-gray-600">Complete information about this reward</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{reward.name}</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                reward.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {reward.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{reward.description}</p>
          </div>

          {/* Reward Type */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Reward Type</h4>
            {getRewardTypeDisplay()}
          </div>

          {/* Requirements & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Requirements</h4>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaClock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">{reward.visitsRequired} Visits</p>
                  <p className="text-sm text-blue-600">Required to earn this reward</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Limitations</h4>
              
              {reward.maxRedemptions && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FaRedoAlt className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">Max {reward.maxRedemptions} Redemptions</p>
                    <p className="text-sm text-orange-600">Per client lifetime</p>
                  </div>
                </div>
              )}

              {reward.validForDays && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-800">{reward.validForDays} Days</p>
                    <p className="text-sm text-purple-600">Valid after earning</p>
                  </div>
                </div>
              )}

              {!reward.maxRedemptions && !reward.validForDays && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FaTags className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">No Limitations</p>
                    <p className="text-sm text-gray-600">Unlimited redemptions</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Applicable Services */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Applicable Services ({reward.applicableServices.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reward.applicableServices.map((service) => (
                <div
                  key={service._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h5 className="font-medium text-gray-900">{service.name}</h5>
                    <p className="text-sm text-gray-600">{service.category?.name || 'No Category'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${service.price}</p>
                    {reward.rewardType === 'discount' && reward.discountPercentage && (
                      <p className="text-sm text-blue-600">
                        ${(service.price * (100 - reward.discountPercentage) / 100).toFixed(2)} after discount
                      </p>
                    )}
                    {reward.rewardType === 'free' && (
                      <p className="text-sm text-green-600">Free with reward</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
              <p className="text-gray-900">{formatDate(reward.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h4>
              <p className="text-gray-900">{formatDate(reward.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 