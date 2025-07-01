'use client';

import { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaMoneyBillWave, 
  FaGift, 
  FaCalendarAlt, 
  FaTrophy,
  FaUsers,
  FaHandshake,
  FaStar,
  FaAward,
  FaTag,
  FaHashtag,
  FaCalendar,
  FaClock
} from 'react-icons/fa';

interface BarberRewardFormProps {
  reward?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const rewardTypes = [
  { value: 'monetary', label: 'Money', icon: FaMoneyBillWave, color: 'text-green-600' },
  { value: 'gift', label: 'Gift', icon: FaGift, color: 'text-purple-600' },
  { value: 'time_off', label: 'Time Off', icon: FaCalendarAlt, color: 'text-blue-600' },
  { value: 'recognition', label: 'Recognition', icon: FaTrophy, color: 'text-yellow-600' }
];

const requirementTypes = [
  { value: 'visits', label: 'Total Visits', description: 'Total number of visits completed' },
  { value: 'clients', label: 'Unique Clients', description: 'Number of different clients served' },
  { value: 'months_worked', label: 'Months Worked', description: 'Months of employment' },
  { value: 'client_retention', label: 'Client Retention Rate', description: 'Percentage of returning clients' },
  { value: 'custom', label: 'Custom Metric', description: 'Custom requirement (admin managed)' }
];

const categories = [
  { value: 'milestone', label: 'Milestone', icon: FaAward, color: 'text-red-600' },
  { value: 'performance', label: 'Performance', icon: FaStar, color: 'text-yellow-600' },
  { value: 'loyalty', label: 'Loyalty', icon: FaHandshake, color: 'text-blue-600' },
  { value: 'quality', label: 'Quality', icon: FaUsers, color: 'text-green-600' }
];

export default function BarberRewardForm({ reward, onSubmit, onCancel, isLoading }: BarberRewardFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rewardType: 'monetary',
    rewardValue: '',
    requirementType: 'visits',
    requirementValue: '',
    requirementDescription: '',
    category: 'milestone',
    priority: 0,
    icon: '🏆',
    color: 'bg-blue-500',
    validFrom: '',
    validUntil: '',
    maxRedemptions: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name || '',
        description: reward.description || '',
        rewardType: reward.rewardType || 'monetary',
        rewardValue: reward.rewardValue || '',
        requirementType: reward.requirementType || 'visits',
        requirementValue: reward.requirementValue?.toString() || '',
        requirementDescription: reward.requirementDescription || '',
        category: reward.category || 'milestone',
        priority: reward.priority || 0,
        icon: reward.icon || '🏆',
        color: reward.color || 'bg-blue-500',
        validFrom: reward.validFrom ? new Date(reward.validFrom).toISOString().split('T')[0] : '',
        validUntil: reward.validUntil ? new Date(reward.validUntil).toISOString().split('T')[0] : '',
        maxRedemptions: reward.maxRedemptions?.toString() || ''
      });
    }
  }, [reward]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.rewardValue.trim()) newErrors.rewardValue = 'Reward value is required';
    if (!formData.requirementValue || parseInt(formData.requirementValue) <= 0) {
      newErrors.requirementValue = 'Requirement value must be greater than 0';
    }
    if (!formData.requirementDescription.trim()) {
      newErrors.requirementDescription = 'Requirement description is required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const submitData = {
        ...formData,
        requirementValue: parseInt(formData.requirementValue),
        priority: parseInt(formData.priority.toString()) || 0,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
        maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : undefined
      };
      onSubmit(submitData);
    }
  };

  const generateRequirementDescription = () => {
    const type = requirementTypes.find(t => t.value === formData.requirementType);
    const value = formData.requirementValue;
    
    if (!type || !value) return '';
    
    switch (formData.requirementType) {
      case 'visits':
        return `Complete ${value} total visits`;
      case 'clients':
        return `Serve ${value} unique clients`;
      case 'months_worked':
        return `Work for ${value} months`;
      case 'client_retention':
        return `Maintain ${value}% client retention rate`;
      case 'custom':
        return `Achieve custom metric value of ${value}`;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (formData.requirementType && formData.requirementValue) {
      setFormData(prev => ({
        ...prev,
        requirementDescription: generateRequirementDescription()
      }));
    }
  }, [formData.requirementType, formData.requirementValue]);

  return (
    <div className="p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-900 to-black rounded-xl flex items-center justify-center">
              <FaTag className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Reward Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter reward name (e.g., 6 Month Veteran Bonus)"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 font-medium">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the reward and what it's for..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-2 font-medium">{errors.description}</p>}
          </div>
        </div>

        {/* Reward Type & Value */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <FaGift className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Reward Details</h3>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Reward Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewardTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rewardType: type.value }))}
                    className={`p-4 border-2 rounded-xl flex items-center space-x-4 transition-all duration-200 hover:shadow-md ${
                      formData.rewardType === type.value
                        ? 'border-black bg-gray-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${type.color}`} />
                    <span className="font-semibold text-gray-900">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Reward Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.rewardValue}
              onChange={(e) => setFormData(prev => ({ ...prev, rewardValue: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400 ${
                errors.rewardValue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={
                formData.rewardType === 'monetary' ? '$100' :
                formData.rewardType === 'gift' ? 'Premium shaver set' :
                formData.rewardType === 'time_off' ? '1 day paid leave' :
                'Employee of the month recognition'
              }
            />
            {errors.rewardValue && <p className="text-red-500 text-sm mt-2 font-medium">{errors.rewardValue}</p>}
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaStar className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Requirements</h3>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Requirement Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.requirementType}
              onChange={(e) => setFormData(prev => ({ ...prev, requirementType: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black bg-white hover:border-gray-400"
            >
              {requirementTypes.map((type) => (
                <option key={type.value} value={type.value} className="text-black">
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Required Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaHashtag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.requirementValue}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementValue: e.target.value }))}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400 ${
                  errors.requirementValue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={
                  formData.requirementType === 'visits' ? '1000' :
                  formData.requirementType === 'clients' ? '500' :
                  formData.requirementType === 'months_worked' ? '6' :
                  formData.requirementType === 'client_retention' ? '85' : '100'
                }
              />
            </div>
            {errors.requirementValue && <p className="text-red-500 text-sm mt-2 font-medium">{errors.requirementValue}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Requirement Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.requirementDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, requirementDescription: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400 ${
                errors.requirementDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Auto-generated based on requirement type"
            />
            {errors.requirementDescription && <p className="text-red-500 text-sm mt-2 font-medium">{errors.requirementDescription}</p>}
          </div>
        </div>

        {/* Category & Styling */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <FaAward className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Category & Display</h3>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    className={`p-4 border-2 rounded-xl flex items-center space-x-4 transition-all duration-200 hover:shadow-md ${
                      formData.category === category.value
                        ? 'border-black bg-gray-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${category.color}`} />
                    <span className="font-semibold text-gray-900">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400"
                placeholder="🏆"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Priority
              </label>
              <input
                type="number"
                min="0"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Optional Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <FaClock className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Optional Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Valid From
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaCalendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black bg-white hover:border-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Valid Until
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaCalendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black bg-white hover:border-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Max Redemptions per Barber
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaHashtag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.maxRedemptions}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-black placeholder:text-black bg-white hover:border-gray-400"
                placeholder="Unlimited if empty"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-black hover:to-gray-800 transition-all duration-200 disabled:opacity-50 font-semibold hover:shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              reward ? 'Update Reward' : 'Create Reward'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 