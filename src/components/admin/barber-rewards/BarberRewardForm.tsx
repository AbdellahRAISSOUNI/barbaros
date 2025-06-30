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
  FaAward
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {reward ? 'Edit Barber Reward' : 'Create Barber Reward'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 6 Month Veteran Bonus"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the reward and what it's for..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Reward Type & Value */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reward Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {rewardTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rewardType: type.value }))}
                      className={`p-3 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        formData.rewardType === type.value
                          ? 'border-[#8B0000] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${type.color}`} />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Value *
              </label>
              <input
                type="text"
                value={formData.rewardValue}
                onChange={(e) => setFormData(prev => ({ ...prev, rewardValue: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent ${
                  errors.rewardValue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={
                  formData.rewardType === 'monetary' ? '$100' :
                  formData.rewardType === 'gift' ? 'Premium shaver set' :
                  formData.rewardType === 'time_off' ? '1 day paid leave' :
                  'Employee of the month recognition'
                }
              />
              {errors.rewardValue && <p className="text-red-500 text-sm mt-1">{errors.rewardValue}</p>}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirement Type *
              </label>
              <select
                value={formData.requirementType}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
              >
                {requirementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Value *
              </label>
              <input
                type="number"
                min="1"
                value={formData.requirementValue}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementValue: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent ${
                  errors.requirementValue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={
                  formData.requirementType === 'visits' ? '1000' :
                  formData.requirementType === 'clients' ? '500' :
                  formData.requirementType === 'months_worked' ? '6' :
                  formData.requirementType === 'client_retention' ? '85' : '100'
                }
              />
              {errors.requirementValue && <p className="text-red-500 text-sm mt-1">{errors.requirementValue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirement Description *
              </label>
              <input
                type="text"
                value={formData.requirementDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementDescription: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent ${
                  errors.requirementDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Auto-generated based on requirement type"
              />
              {errors.requirementDescription && <p className="text-red-500 text-sm mt-1">{errors.requirementDescription}</p>}
            </div>
          </div>

          {/* Category & Styling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Category & Display</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        formData.category === category.value
                          ? 'border-[#8B0000] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${category.color}`} />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  placeholder="🏆"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Optional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Optional Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Redemptions per Barber
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxRedemptions}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Unlimited if empty"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#A31515] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (reward ? 'Update Reward' : 'Create Reward')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 