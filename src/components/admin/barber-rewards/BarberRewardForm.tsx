'use client';

import { useState, useEffect } from 'react';
import { 
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
  { value: 'monetary', label: 'Monetary', icon: FaMoneyBillWave, color: 'text-green-600' },
  { value: 'gift', label: 'Gift', icon: FaGift, color: 'text-purple-600' },
  { value: 'recognition', label: 'Recognition', icon: FaTrophy, color: 'text-yellow-600' },
  { value: 'time_off', label: 'Time Off', icon: FaCalendarAlt, color: 'text-blue-600' }
];

const requirementTypes = [
  { value: 'visits', label: 'Total Visits', description: 'Based on total client visits', icon: FaUsers },
  { value: 'clients', label: 'Unique Clients', description: 'Based on number of unique clients served', icon: FaHandshake },
  { value: 'months_worked', label: 'Months Worked', description: 'Based on employment duration', icon: FaCalendarAlt },
  { value: 'client_retention', label: 'Client Retention', description: 'Based on client return rate', icon: FaStar },
  { value: 'custom', label: 'Custom Achievement', description: 'Custom metric or achievement', icon: FaAward }
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
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
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rewardType: 'monetary' }))}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                formData.rewardType === 'monetary'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-900 font-medium">Monetary</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rewardType: 'gift' }))}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                formData.rewardType === 'gift'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaGift className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-900 font-medium">Gift</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rewardType: 'recognition' }))}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                formData.rewardType === 'recognition'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaTrophy className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-900 font-medium">Recognition</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rewardType: 'time_off' }))}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                formData.rewardType === 'time_off'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium">Time Off</span>
            </button>
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
              errors.rewardValue ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={
              formData.rewardType === 'monetary' ? '1000 MAD' :
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
              errors.requirementValue ? 'border-red-300' : 'border-gray-300'
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
      </div>

      {/* Optional Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Optional Settings</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid From
            </label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            placeholder="Unlimited if empty"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Saving...' : (reward ? 'Update Reward' : 'Create Reward')}
        </button>
      </div>
    </form>
  );
} 