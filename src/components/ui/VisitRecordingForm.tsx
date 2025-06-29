'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaPlus, FaTimes, FaSave, FaCalculator, FaClipboard, FaClock, FaUser, FaCut, FaGift, FaPercentage, FaSearch, FaSpinner, FaTrash, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import BarberSelector from './BarberSelector';
import { debounce } from 'lodash';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  category?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
}

interface ServiceReceived {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

interface Reward {
  _id: string;
  name: string;
  description: string;
  visitsRequired: number;
  rewardType: 'free' | 'discount';
  discountPercentage?: number;
  applicableServices: string[];
  maxRedemptions?: number;
  validForDays?: number;
  isActive: boolean;
}

interface ClientInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  visitCount: number;
  phone?: string;
}

interface VisitRecordingFormProps {
  clientInfo: ClientInfo;
  onVisitCreated: () => void;
  onCancel: () => void;
}

export function VisitRecordingForm({
  clientInfo,
  onVisitCreated,
  onCancel,
}: VisitRecordingFormProps) {
  const [selectedServices, setSelectedServices] = useState<ServiceReceived[]>([]);
  const [barber, setBarber] = useState<string>('');
  const [barberId, setBarberId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [visitDate, setVisitDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Service-related states
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Optimized data loading with better caching and parallel requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setServicesLoading(true);
        
        // Parallel data fetching for better performance
        const [servicesResponse, rewardsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/services?isActive=true&limit=200', {
            headers: { 'Cache-Control': 'max-age=600' } // Cache for 10 minutes
          }),
          fetch('/api/rewards?isActive=true&limit=100', {
            headers: { 'Cache-Control': 'max-age=600' }
          }),
          fetch('/api/service-categories?isActive=true', {
            headers: { 'Cache-Control': 'max-age=1800' } // Cache categories for 30 minutes
          })
        ]);

        // Process services
        if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setAvailableServices(servicesData.services || []);
        } else {
          throw new Error('Failed to fetch services');
        }

        // Process rewards
          if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            const eligible = (rewardsData.rewards || []).filter((reward: Reward) => 
              reward.visitsRequired <= clientInfo.visitCount
            );
            // setEligibleRewards(eligible);
          }

        // Process categories
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setServiceCategories(categoriesData.categories || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    };

    fetchData();
  }, [clientInfo.visitCount]);

  // Debounced search for real-time filtering
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // PHASE 2 FIX: Memoized calculations for better performance
  const calculatedTotal = useMemo(() => 
    selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices]
  );

  const totalDuration = useMemo(() => 
    selectedServices.reduce((sum, service) => sum + service.duration, 0),
    [selectedServices]
  );

  const calculatedTotalWithReward = useMemo(() => {
    let total = 0;
    
    selectedServices.forEach(service => {
      let servicePrice = service.price;
      
      // Apply reward discount if applicable
      // if (selectedReward && selectedReward.applicableServices.includes(service.serviceId)) {
      //   if (selectedReward.rewardType === 'free') {
      //     servicePrice = 0;
      //   } else if (selectedReward.rewardType === 'discount' && selectedReward.discountPercentage) {
      //     servicePrice = servicePrice * (100 - selectedReward.discountPercentage) / 100;
      //   }
      // }
      
      total += servicePrice;
    });
    
    return total;
  }, [selectedServices]);

  const finalTotal = calculatedTotalWithReward;
  const rewardSavings = calculatedTotal - calculatedTotalWithReward;

  // Enhanced service filtering with category support
  const filteredServices = useMemo(() => {
    let filtered = availableServices;
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category?._id === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category?.name.toLowerCase().includes(term)
      );
    }
    
    // Sort by popularity/name for better UX
    return filtered.sort((a, b) => {
      // First by category, then by name
      const categoryA = a.category?.name || '';
      const categoryB = b.category?.name || '';
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      return a.name.localeCompare(b.name);
    });
  }, [availableServices, searchTerm, selectedCategory]);

  // PHASE 2 FIX: Memoized callbacks for better performance
  const addService = useCallback((service: Service) => {
    const serviceReceived: ServiceReceived = {
      serviceId: service._id,
      name: service.name,
      price: service.price,
      duration: service.durationMinutes,
    };

    setSelectedServices(prev => [...prev, serviceReceived]);
    toast.success(`${service.name} added to visit`);
  }, []);

  const removeService = useCallback((index: number) => {
    setSelectedServices(prev => {
      const serviceName = prev[index].name;
    toast.success(`${serviceName} removed from visit`);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateServicePrice = useCallback((index: number, newPrice: number) => {
    setSelectedServices(prev =>
      prev.map((service, i) =>
        i === index ? { ...service, price: newPrice } : service
      )
    );
  }, []);

  const handleBarberChange = useCallback((newBarberId: string | undefined, newBarberName: string) => {
    setBarberId(newBarberId);
    setBarber(newBarberName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    if (!barber.trim()) {
      toast.error('Please select or enter the barber name');
      return;
    }

    if (!clientInfo._id) {
      toast.error('Invalid client information');
      return;
    }

    try {
      setIsLoading(true);

      const visitData = {
        visitDate: new Date(visitDate).toISOString(),
        services: selectedServices,
        totalPrice: finalTotal,
        barber: barber.trim(),
        barberId: barberId || undefined,
        notes: notes.trim(),
      };

      const response = await fetch(`/api/clients/${clientInfo._id}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create visit');
      }

      toast.success('Visit recorded successfully!');
      onVisitCreated();
    } catch (error: any) {
      console.error('Error creating visit:', error);
      toast.error(error.message || 'Failed to record visit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-3 sm:p-4 rounded-lg shadow-md mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaCut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold">Record Visit</h1>
                <p className="text-xs text-emerald-100">
                  {clientInfo.firstName} {clientInfo.lastName} • Visit #{clientInfo.visitCount + 1}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg inline-flex">
                  <FaPlus className="h-4 w-4 text-emerald-700" />
                </div>
                <span>Select Services</span>
              </h2>
            </div>
            <div>
              {/* Enhanced Search and Filter Controls */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm placeholder-stone-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearching ? (
                        <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
                      ) : (
                        <FaSearch className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="sm:w-48">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm text-black"
                    >
                      <option value="">All Categories</option>
                      {serviceCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Results Count and Quick Actions */}
                {!servicesLoading && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                      {searchTerm && ` for "${searchTerm}"`}
                      {selectedCategory && serviceCategories.find(c => c._id === selectedCategory) && 
                        ` in ${serviceCategories.find(c => c._id === selectedCategory)?.name}`}
                    </div>
                    {(searchTerm || selectedCategory) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('');
                          searchInputRef.current?.focus();
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Available Services - Mobile Grid */}
              <div className="max-h-[24rem] overflow-y-auto pr-1">
                {servicesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mx-auto mb-4"></div>
                    <p className="text-stone-600">Loading services...</p>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="p-4 text-center text-stone-500">
                    <FaCut className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm">{searchTerm ? 'No services found matching your search' : 'No active services available'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredServices.map((service) => (
                      <div key={service._id} className="bg-white rounded-xl border border-stone-200/80 shadow-sm hover:border-emerald-400/50 hover:shadow-md transition-all duration-300 p-3">
                        <div className="flex items-center gap-4">
                          {/* Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                            {service.imageUrl ? (
                              <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                <FaCut className="h-8 w-8 text-stone-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-stone-800 text-base truncate pr-2">{service.name}</h3>
                              <p className="text-base font-bold text-emerald-600 flex-shrink-0">${service.price}</p>
                            </div>
                            <p className="text-sm text-stone-500 mb-2 truncate">{service.description}</p>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center text-stone-500">
                                <FaClock className="mr-1.5 h-3.5 w-3.5" />
                                <span>{service.durationMinutes}min</span>
                              </div>
                              {service.category && (
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-xs">
                                  {service.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Add Button */}
                          <button
                            type="button"
                            onClick={() => addService(service)}
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            aria-label={`Add ${service.name} to visit`}
                          >
                            <FaPlus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Services Section */}
          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg inline-flex">
                  <FaCut className="h-4 w-4 text-amber-700" />
                </div>
                <span>Selected Services</span>
              </h2>
            </div>
            <div>
                {selectedServices.length === 0 ? (
                  <div className="text-center py-8 bg-white/60 rounded-lg border border-dashed border-stone-300">
                    <FaCut className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm">No services selected</p>
                    <p className="text-xs text-stone-400 mt-1">Choose services from above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedServices.map((service, index) => (
                      <div key={index} className="bg-gradient-to-r from-stone-50 to-amber-50/50 rounded-lg border border-stone-200/60 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-stone-900 text-sm truncate">{service.name}</h4>
                            <p className="text-xs text-stone-600 mt-1">{service.duration} minutes</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-stone-500">$</span>
                              <input
                                type="number"
                                value={service.price}
                                onChange={(e) => updateServicePrice(index, parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold text-center placeholder-black"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg transition-all duration-200"
                            >
                              <FaTimes className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>

          {/* Bottom Section - Price Summary and Visit Info */}
          <div className="space-y-6">
            
            {/* Price Summary */}
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-lg inline-flex">
                    <FaCalculator className="h-4 w-4 text-amber-700" />
                  </div>
                  <span>Price Summary</span>
                </h2>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200/60">
              <div className="space-y-3 text-sm text-black">
                <div className="flex justify-between">
                  <span className="text-stone-600">Services Total:</span>
                  <span className="font-medium text-black">${calculatedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Total Duration:</span>
                  <span className="font-medium text-black">{totalDuration} minutes</span>
                </div>
                <hr className="my-2 border-stone-200" />
                <div className="flex justify-between items-center">
                  <label htmlFor="customPrice" className="font-medium text-black">
                    Final Total:
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">$</span>
                    <input
                      id="customPrice"
                      type="number"
                      value={finalTotal}
                      onChange={(e) => {
                        // Handle price change
                      }}
                      className="w-20 px-2 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right font-semibold text-sm placeholder-black"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
                </div>
            </div>

            {/* Visit Information */}
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg inline-flex">
                    <FaClipboard className="h-4 w-4 text-emerald-700" />
                  </div>
                  <span>Visit Information</span>
                </h2>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200/60">
              <div className="space-y-4">
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-stone-700 mb-1">
                    <FaClock className="inline mr-1" />
                    Visit Date & Time
                  </label>
                  <input
                    id="visitDate"
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                <BarberSelector
                  selectedBarberId={barberId}
                  selectedBarberName={barber}
                  onBarberChange={handleBarberChange}
                  disabled={isLoading}
                />

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-stone-700 mb-1">
                    <FaClipboard className="inline mr-1" />
                    Visit Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-black"
                    placeholder="Any special notes about this visit..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-lg shadow-md border border-stone-200/60 p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              <div className="text-center text-sm text-stone-600">
                {selectedServices.length === 0 ? (
                  '⚠️ Please select at least one service to continue'
                ) : (
                  `✅ Ready to record visit with ${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'}`
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-all duration-200 font-medium text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || selectedServices.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold shadow-md"
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {isLoading ? 'Recording...' : 'Record Visit'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 