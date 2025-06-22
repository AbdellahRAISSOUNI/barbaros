'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaSave, FaCalculator, FaClipboard, FaClock, FaUser, FaCut, FaGift, FaPercentage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import BarberSelector from './BarberSelector';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
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
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceReceived[]>([]);
  const [eligibleRewards, setEligibleRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [visitDate, setVisitDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [barber, setBarber] = useState<string>('');
  const [barberId, setBarberId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [servicesLoading, setServicesLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load available services and eligible rewards
  useEffect(() => {
    const fetchData = async () => {
      try {
        setServicesLoading(true);
        
        // Fetch services with caching for better performance
        const servicesResponse = await fetch('/api/services?isActive=true&limit=100', {
          headers: {
            'Cache-Control': 'max-age=300' // Cache for 5 minutes
          }
        });
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services || []);

        // Fetch eligible rewards based on client's CURRENT visit count (not +1)
        // Only show rewards they can actually redeem with their current visit count
        try {
          const rewardsResponse = await fetch('/api/rewards?isActive=true&limit=100', {
            headers: {
              'Cache-Control': 'max-age=300' // Cache for 5 minutes  
            }
          });
          if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            // Fix: Only show rewards they can redeem with CURRENT visit count
            const eligible = (rewardsData.rewards || []).filter((reward: Reward) => 
              reward.visitsRequired <= clientInfo.visitCount
            );
            setEligibleRewards(eligible);
          }
        } catch (rewardsError) {
          console.error('Error fetching rewards:', rewardsError);
          // Don't show error for rewards as it's not critical
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    };

    fetchData();
  }, [clientInfo.visitCount]);

  // Calculate total price with reward discounts
  const calculateTotalWithReward = () => {
    let total = 0;
    
    selectedServices.forEach(service => {
      let servicePrice = service.price;
      
      // Apply reward discount if applicable
      if (selectedReward && selectedReward.applicableServices.includes(service.serviceId)) {
        if (selectedReward.rewardType === 'free') {
          servicePrice = 0;
        } else if (selectedReward.rewardType === 'discount' && selectedReward.discountPercentage) {
          servicePrice = servicePrice * (100 - selectedReward.discountPercentage) / 100;
        }
      }
      
      total += servicePrice;
    });
    
    return total;
  };

  const calculatedTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const calculatedTotalWithReward = calculateTotalWithReward();
  const finalTotal = customPrice !== null ? customPrice : calculatedTotalWithReward;
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const rewardSavings = calculatedTotal - calculatedTotalWithReward;

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addService = (service: Service) => {
    const serviceReceived: ServiceReceived = {
      serviceId: service._id,
      name: service.name,
      price: service.price,
      duration: service.durationMinutes,
    };

    setSelectedServices(prev => [...prev, serviceReceived]);
    toast.success(`${service.name} added to visit`);
  };

  const removeService = (index: number) => {
    const serviceName = selectedServices[index].name;
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
    toast.success(`${serviceName} removed from visit`);
  };

  const updateServicePrice = (index: number, newPrice: number) => {
    setSelectedServices(prev =>
      prev.map((service, i) =>
        i === index ? { ...service, price: newPrice } : service
      )
    );
  };

  const handleBarberChange = (newBarberId: string | undefined, newBarberName: string) => {
    setBarberId(newBarberId);
    setBarber(newBarberName);
  };

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
        rewardRedeemed: !!selectedReward,
        redeemedRewardId: selectedReward?._id || null,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-black text-white rounded-xl">
                <FaCut className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Record New Visit</h1>
                <p className="text-gray-600 mt-1">
                  {clientInfo.firstName} {clientInfo.lastName} • Visit #{clientInfo.visitCount + 1}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Service Selection - Takes full width on mobile, 2 cols on lg, 2 cols on xl */}
            <div className="lg:col-span-1 xl:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FaPlus className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Select Services</h2>
                </div>
              
                {/* Service Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all"
                  />
                </div>

                {/* Available Services */}
                <div className="border border-gray-200 rounded-xl max-h-80 lg:max-h-96 overflow-y-auto bg-gray-50">
                {servicesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading services...</p>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No services found matching your search' : 'No active services available'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <div key={service._id} className="p-3 lg:p-4 hover:bg-white transition-all duration-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate pr-2">{service.name}</h3>
                              <span className="text-lg lg:text-xl font-bold text-green-600 shrink-0">
                                ${service.price}
                              </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2 lg:gap-4">
                              <div className="flex items-center">
                                <FaClock className="mr-1" />
                                <span>{service.durationMinutes} min</span>
                              </div>
                              {service.category && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  {service.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addService(service)}
                            className="shrink-0 p-2 lg:p-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <FaPlus className="h-4 w-4 lg:h-5 lg:w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Selected Services, Rewards, etc. */}
            <div className="lg:col-span-1 xl:col-span-1 space-y-4">
              
              {/* Selected Services */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <FaCut className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Selected Services</h3>
                </div>
                {selectedServices.length === 0 ? (
                  <div className="text-center py-6">
                    <FaCut className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No services selected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedServices.map((service, index) => (
                      <div key={index} className="p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{service.name}</h4>
                            <p className="text-xs lg:text-sm text-gray-600 mt-1">{service.duration} minutes</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 hidden sm:inline">$</span>
                              <input
                                type="number"
                                value={service.price}
                                onChange={(e) => updateServicePrice(index, parseFloat(e.target.value) || 0)}
                                className="w-16 lg:w-20 px-2 py-1 text-xs lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-semibold text-center"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg transition-all duration-200"
                            >
                              <FaTimes className="h-3 w-3 lg:h-4 lg:w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rewards Section */}
              {eligibleRewards.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <FaGift className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
                      <p className="text-sm text-purple-600">Client can redeem these now</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {eligibleRewards.map((reward) => {
                      const isSelected = selectedReward?._id === reward._id;
                      const applicableSelectedServices = selectedServices.filter(service => 
                        reward.applicableServices.includes(service.serviceId)
                      );
                      
                      return (
                        <div
                          key={reward._id}
                          className={`p-3 lg:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                          }`}
                          onClick={() => setSelectedReward(isSelected ? null : reward)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 lg:gap-2 mb-2">
                                {reward.rewardType === 'free' ? (
                                  <FaGift className="w-4 h-4 text-green-600 shrink-0" />
                                ) : (
                                  <FaPercentage className="w-4 h-4 text-blue-600 shrink-0" />
                                )}
                                <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{reward.name}</h4>
                                {reward.rewardType === 'discount' && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full shrink-0">
                                    {reward.discountPercentage}% OFF
                                  </span>
                                )}
                                {reward.rewardType === 'free' && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full shrink-0">
                                    FREE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">{reward.description}</p>
                              
                              {applicableSelectedServices.length > 0 ? (
                                <div>
                                  <p className="text-xs text-green-600 font-medium mb-1">
                                    Applies to {applicableSelectedServices.length} service{applicableSelectedServices.length !== 1 ? 's' : ''}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {applicableSelectedServices.slice(0, 2).map((service, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded truncate">
                                        {service.name}
                                      </span>
                                    ))}
                                    {applicableSelectedServices.length > 2 && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        +{applicableSelectedServices.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  No applicable services selected
                                </p>
                              )}
                            </div>
                            
                            <div className="shrink-0">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                isSelected 
                                  ? 'bg-purple-600 border-purple-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedReward && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-800 font-medium">
                        🎉 Reward Selected: <span className="truncate">{selectedReward.name}</span>
                      </p>
                      {rewardSavings > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Saving ${rewardSavings.toFixed(2)}!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section - Price Summary and Visit Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                  <FaCalculator className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Price Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Services Total:</span>
                  <span className="font-medium">${calculatedTotal.toFixed(2)}</span>
                </div>
                {selectedReward && rewardSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="truncate pr-2">Reward Discount:</span>
                    <span className="font-medium">-${rewardSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total Duration:</span>
                  <span className="font-medium">{totalDuration} minutes</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <label htmlFor="customPrice" className="font-medium">
                    Final Total:
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">$</span>
                    <input
                      id="customPrice"
                      type="number"
                      value={customPrice !== null ? customPrice : calculatedTotalWithReward}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value === calculatedTotalWithReward) {
                          setCustomPrice(null);
                        }
                      }}
                      className="w-20 lg:w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-transparent text-right font-semibold text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                {customPrice !== null && customPrice !== calculatedTotalWithReward && (
                  <p className="text-xs text-amber-600">
                    Price adjusted from ${calculatedTotalWithReward.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Visit Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <FaClipboard className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Visit Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaClock className="inline mr-1" />
                    Visit Date & Time
                  </label>
                  <input
                    id="visitDate"
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
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
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaClipboard className="inline mr-1" />
                    Visit Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="Any special notes about this visit..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {selectedServices.length === 0 ? (
                  'Please select at least one service to continue'
                ) : (
                  `Ready to record visit with ${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'}`
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || selectedServices.length === 0}
                  className="px-6 lg:px-8 py-2 lg:py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-medium shadow-lg"
                >
                  <FaSave className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  {isLoading ? 'Recording Visit...' : 'Record Visit'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 