'use client';

import { useState, useEffect } from 'react';
import { FaGift, FaPercentage, FaTags, FaCalendarAlt, FaRedoAlt } from 'react-icons/fa';
import { HiMagnifyingGlass, HiAdjustmentsHorizontal } from 'react-icons/hi2';

interface Service {
  _id: string;
  name: string;
  category?: {
    _id: string;
    name: string;
  };
  price: number;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface Reward {
  _id?: string;
  name: string;
  description: string;
  visitsRequired: number;
  rewardType: 'free' | 'discount';
  discountPercentage?: number;
  applicableServices: string[] | Service[];
  maxRedemptions?: number;
  validForDays?: number;
  isActive: boolean;
}

interface RewardFormProps {
  reward?: Reward;
  onSubmit: (rewardData: Partial<Reward>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function RewardForm({ reward, onSubmit, onCancel, isLoading }: RewardFormProps) {
  const [formData, setFormData] = useState<Partial<Reward>>({
    name: '',
    description: '',
    visitsRequired: 1,
    rewardType: 'free',
    discountPercentage: undefined,
    applicableServices: [],
    maxRedemptions: undefined,
    validForDays: undefined,
    isActive: true
  });
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [servicesLoading, setServicesLoading] = useState(true);

  // Initialize form data when editing
  useEffect(() => {
    if (reward) {
      // Convert applicableServices to string array if it contains objects
      const serviceIds = Array.isArray(reward.applicableServices) 
        ? reward.applicableServices.map(s => typeof s === 'string' ? s : (s as Service)._id)
        : [];

      setFormData({
        name: reward.name,
        description: reward.description,
        visitsRequired: reward.visitsRequired,
        rewardType: reward.rewardType,
        discountPercentage: reward.discountPercentage,
        applicableServices: serviceIds,
        maxRedemptions: reward.maxRedemptions,
        validForDays: reward.validForDays,
        isActive: reward.isActive
      });
    }
  }, [reward]);

  // Fetch services and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setServicesLoading(true);
        
        // Fetch services and categories in parallel
        const [servicesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/services?isActive=true&limit=100'),
          fetch('/api/service-categories?isActive=true')
        ]);

        const [servicesData, categoriesData] = await Promise.all([
          servicesResponse.json(),
          categoriesResponse.json()
        ]);

        if (servicesData.success) {
          setServices(servicesData.services || []);
          
          // If editing, populate selected services
          if (reward && reward.applicableServices) {
            const serviceIds = Array.isArray(reward.applicableServices) 
              ? reward.applicableServices.map(s => typeof s === 'string' ? s : (s as Service)._id)
              : [];
              
            const selected = servicesData.services.filter((service: Service) => 
              serviceIds.includes(service._id)
            );
            setSelectedServices(selected);
          }
        }

        if (categoriesData.success) {
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchData();
  }, [reward]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset discount percentage when switching to free reward
    if (name === 'rewardType' && value === 'free') {
      setFormData(prev => ({ ...prev, discountPercentage: undefined }));
    }
  };

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s._id === service._id);
    
    if (isSelected) {
      const newSelected = selectedServices.filter(s => s._id !== service._id);
      setSelectedServices(newSelected);
      setFormData(prev => ({
        ...prev,
        applicableServices: newSelected.map(s => s._id)
      }));
    } else {
      const newSelected = [...selectedServices, service];
      setSelectedServices(newSelected);
      setFormData(prev => ({
        ...prev,
        applicableServices: newSelected.map(s => s._id)
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Reward name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.visitsRequired || formData.visitsRequired < 1) {
      newErrors.visitsRequired = 'Visits required must be at least 1';
    }

    if (formData.rewardType === 'discount') {
      if (!formData.discountPercentage || formData.discountPercentage < 1 || formData.discountPercentage > 100) {
        newErrors.discountPercentage = 'Discount percentage must be between 1 and 100';
      }
    }

    if (!formData.applicableServices?.length) {
      newErrors.applicableServices = 'At least one service must be selected';
    }

    if (formData.maxRedemptions && formData.maxRedemptions < 1) {
      newErrors.maxRedemptions = 'Max redemptions must be at least 1';
    }

    if (formData.validForDays && formData.validForDays < 1) {
      newErrors.validForDays = 'Valid for days must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (service.category?.name && service.category.name.toLowerCase().includes(serviceSearch.toLowerCase()));
    
    const matchesCategory = !selectedCategory || service.category?._id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Free Haircut After 10 Visits"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visits Required *
            </label>
            <input
              type="number"
              name="visitsRequired"
              value={formData.visitsRequired || ''}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                errors.visitsRequired ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="10"
            />
            {errors.visitsRequired && <p className="text-red-500 text-sm mt-1">{errors.visitsRequired}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the reward and how it works..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Reward Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.rewardType === 'free'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, rewardType: 'free' }))}
            >
              <div className="flex items-center gap-3">
                <FaGift className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Free Service</h3>
                  <p className="text-sm text-gray-600">Service is completely free</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.rewardType === 'discount'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, rewardType: 'discount' }))}
            >
              <div className="flex items-center gap-3">
                <FaPercentage className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Discount</h3>
                  <p className="text-sm text-gray-600">Percentage discount on service</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Percentage */}
        {formData.rewardType === 'discount' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage *
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage || ''}
              onChange={handleInputChange}
              min="1"
              max="100"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                errors.discountPercentage ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="25"
            />
            {errors.discountPercentage && <p className="text-red-500 text-sm mt-1">{errors.discountPercentage}</p>}
          </div>
        )}

        {/* Optional Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaRedoAlt className="inline w-4 h-4 mr-1" />
              Max Redemptions per Client
            </label>
            <input
              type="number"
              name="maxRedemptions"
              value={formData.maxRedemptions || ''}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                errors.maxRedemptions ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Leave blank for unlimited"
            />
            {errors.maxRedemptions && <p className="text-red-500 text-sm mt-1">{errors.maxRedemptions}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline w-4 h-4 mr-1" />
              Valid for (Days)
            </label>
            <input
              type="number"
              name="validForDays"
              value={formData.validForDays || ''}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                errors.validForDays ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Leave blank for no expiration"
            />
            {errors.validForDays && <p className="text-red-500 text-sm mt-1">{errors.validForDays}</p>}
          </div>
        </div>

        {/* Applicable Services */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FaTags className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Applicable Services *
            </label>
          </div>

          {/* Service Search and Category Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="relative">
              <HiAdjustmentsHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.applicableServices && (
            <p className="text-red-500 text-sm mb-3">{errors.applicableServices}</p>
          )}

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900 mb-2">
                Selected Services ({selectedServices.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map(service => (
                  <span
                    key={service._id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm"
                  >
                    {service.name}
                    <button
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Services */}
          <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
            {servicesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading services...</p>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredServices.map(service => {
                  const isSelected = selectedServices.some(s => s._id === service._id);
                  return (
                    <label
                      key={service._id}
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-purple-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleServiceToggle(service)}
                        className="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        {service.category && (
                          <div className="text-sm text-gray-500">{service.category.name}</div>
                        )}
                        <div className="text-sm text-gray-600">{service.price} MAD</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {serviceSearch || selectedCategory ? 'No services found matching your criteria' : 'No services available'}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : reward ? 'Update Reward' : 'Create Reward'}
          </button>
        </div>
      </form>
    </div>
  );
}