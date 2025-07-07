'use client';

import { FaGift, FaPercentage, FaTimes, FaCalendarAlt, FaRedoAlt, FaTags, FaClock } from 'react-icons/fa';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

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
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
    if (reward?.rewardType === 'free') {
      return (
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg">
          <div className="p-2 sm:p-3 bg-green-100 rounded-full">
            <FaGift className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-green-800">Free Service</h3>
            <p className="text-sm text-green-600">Clients get the service completely free</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
            <FaPercentage className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-blue-800">
              {reward?.discountPercentage}% Discount
            </h3>
            <p className="text-sm text-blue-600">Clients get a percentage discount on the service</p>
          </div>
        </div>
      );
    }
  };

  if (!reward) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <FaGift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reward Details</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Complete information about this reward</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Basic Information */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{reward.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                    reward.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{reward.description}</p>
              </div>

              {/* Reward Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Reward Type</h4>
                {getRewardTypeDisplay()}
              </div>

              {/* Requirements & Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {reward.applicableServices.map((service) => (
                    <div
                      key={service._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base">{service.name}</h5>
                        <p className="text-xs sm:text-sm text-gray-600">{service.category?.name || 'No Category'}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-green-600 text-sm sm:text-base">{service.price} MAD</p>
                        {reward.rewardType === 'discount' && reward.discountPercentage && (
                          <p className="text-xs sm:text-sm text-blue-600">
                            {(service.price * (100 - reward.discountPercentage) / 100).toFixed(2)} MAD after discount
                          </p>
                        )}
                        {reward.rewardType === 'free' && (
                          <p className="text-xs sm:text-sm text-green-600">Free with reward</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Created</h4>
                  <p className="text-gray-900 text-sm sm:text-base">{formatDate(reward.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Last Updated</h4>
                  <p className="text-gray-900 text-sm sm:text-base">{formatDate(reward.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 