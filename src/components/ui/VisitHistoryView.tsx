'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCut, FaDollarSign, FaUser, FaClipboard, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaGift, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingAnimation from './LoadingAnimation';

interface ServiceReceived {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

interface Visit {
  _id: string;
  visitDate: string;
  services: ServiceReceived[];
  totalPrice: number;
  barber: string;
  notes?: string;
  visitNumber: number;
  rewardRedeemed?: {
    rewardName: string;
    rewardType: string;
    discountPercentage?: number;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface VisitHistoryViewProps {
  clientId: string;
  clientName: string;
  onBack: () => void;
}

export function VisitHistoryView({
  clientId,
  clientName,
  onBack,
}: VisitHistoryViewProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const fetchVisits = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients/${clientId}/visits?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch visit history');
      }
      
      const data = await response.json();
      setVisits(data.visits || []);
      setPagination(data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      });
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Failed to load visit history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [clientId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchVisits(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shortDate: date.toLocaleDateString(),
    };
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/visits/export?format=csv`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/\s+/g, '-')}-visit-history.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Visit history exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export visit history');
    }
  };

  if (selectedVisit) {
    const { date, time } = formatDate(selectedVisit.visitDate);
    const totalDuration = selectedVisit.services.reduce((sum, service) => sum + service.duration, 0);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl">
                  <FaClipboard className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Visit Details</h1>
                  <p className="text-gray-600 mt-1">
                    {clientName} • Visit #{selectedVisit.visitNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
              >
                <FaChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Visit Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            {/* Visit Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Date and Time */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <FaCalendarAlt className="text-blue-600 mr-3 h-5 w-5" />
                  <h3 className="font-semibold text-blue-900">Date & Time</h3>
                </div>
                <p className="font-medium text-blue-800">{date}</p>
                <p className="text-sm text-blue-700">{time}</p>
              </div>

              {/* Barber */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-2">
                  <FaUser className="text-green-600 mr-3 h-5 w-5" />
                  <h3 className="font-semibold text-green-900">Barber</h3>
                </div>
                <p className="font-medium text-green-800">{selectedVisit.barber}</p>
                <p className="text-sm text-green-700">{totalDuration} minutes total</p>
              </div>
            </div>

            {/* Reward Redeemed */}
            {selectedVisit.rewardRedeemed && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 mb-6">
                <div className="flex items-center mb-2">
                  <FaGift className="text-purple-600 mr-3 h-5 w-5" />
                  <h3 className="font-semibold text-purple-900">Reward Applied</h3>
                </div>
                <p className="font-medium text-purple-800">{selectedVisit.rewardRedeemed.rewardName}</p>
                <p className="text-sm text-purple-700">
                  {selectedVisit.rewardRedeemed.rewardType === 'free' 
                    ? 'Free Service' 
                    : `${selectedVisit.rewardRedeemed.discountPercentage}% Discount`}
                </p>
              </div>
            )}

            {/* Services */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <FaCut className="text-gray-600 mr-3 h-5 w-5" />
                <h3 className="text-lg font-semibold text-gray-900">Services Provided</h3>
              </div>
              <div className="space-y-3">
                {selectedVisit.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.duration} minutes</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">{service.price.toFixed(2)} MAD</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 lg:p-6 border border-yellow-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaDollarSign className="text-orange-600 mr-3 h-6 w-6" />
                  <div>
                    <span className="text-lg font-semibold text-orange-900">Total Amount</span>
                    <p className="text-sm text-orange-700">Final total paid</p>
                  </div>
                </div>
                <span className="text-2xl lg:text-3xl font-bold text-orange-800">
                  {selectedVisit.totalPrice.toFixed(2)} MAD
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedVisit.notes && (
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200">
                <div className="flex items-center mb-3">
                  <FaClipboard className="text-gray-600 mr-3 h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Visit Notes</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{selectedVisit.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl">
                <FaClock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Visit History</h1>
                <p className="text-gray-600 mt-1">{clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {visits.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <FaDownload className="h-4 w-4" />
                  Export
                </button>
              )}
              <button
                onClick={onBack}
                className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
              >
                <FaChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {visits.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <FaCut className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visits.reduce((sum, visit) => sum + visit.totalPrice, 0).toFixed(2)} MAD
                  </p>
                </div>
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <FaDollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Visit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visits.length > 0 ? (visits.reduce((sum, visit) => sum + visit.totalPrice, 0) / visits.length).toFixed(2) : '0.00'} MAD
                  </p>
                </div>
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <FaCalendarAlt className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="w-full flex items-center justify-center min-h-[300px]">
              <LoadingAnimation size="lg" />
            </div>
          ) : visits.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FaCut className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Visits Yet</h3>
              <p className="text-gray-600">This client hasn't visited the barbershop yet.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {visits.map((visit) => {
                  const { date, time, shortDate } = formatDate(visit.visitDate);
                  const totalDuration = visit.services.reduce((sum, service) => sum + service.duration, 0);
                  
                  return (
                    <div
                      key={visit._id}
                      className="p-4 lg:p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl group-hover:from-gray-800 group-hover:to-black transition-all duration-200">
                            <span className="font-bold text-sm">#{visit.visitNumber}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900 text-lg">{shortDate}</p>
                              <span className="hidden sm:inline text-gray-400">•</span>
                              <p className="text-gray-600">{time}</p>
                              <span className="hidden sm:inline text-gray-400">•</span>
                              <p className="text-gray-600 font-medium">{visit.barber}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {visit.services.slice(0, 3).map((service, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {service.name}
                                </span>
                              ))}
                              {visit.services.length > 3 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{visit.services.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            {visit.rewardRedeemed && (
                              <div className="mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <FaGift className="mr-1 h-3 w-3" />
                                  {visit.rewardRedeemed.rewardName}
                                </span>
                              </div>
                            )}
                            
                            {visit.notes && (
                              <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                                {visit.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col items-end sm:items-end gap-2 lg:text-right shrink-0">
                          <div>
                            <p className="text-xl lg:text-2xl font-bold text-green-600">
                              ${visit.totalPrice.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">{totalDuration} minutes</p>
                          </div>
                          <div className="hidden lg:block">
                            <FaChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.page} of {pagination.pages} 
                      <span className="hidden sm:inline"> ({pagination.total} total visits)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="p-2 lg:p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = pageNum === pagination.page;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-black text-white'
                                  : 'text-gray-600 hover:bg-white hover:border-gray-400 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="p-2 lg:p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 