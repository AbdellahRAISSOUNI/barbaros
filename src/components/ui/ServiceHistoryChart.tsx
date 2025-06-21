'use client';

import { useState, useEffect } from 'react';
import { FaChartBar, FaChartPie, FaCut, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

interface ServiceData {
  name: string;
  count: number;
  totalSpent: number;
  averagePrice: number;
  lastUsed: string;
  category?: string;
}

interface MonthlyData {
  month: string;
  visits: number;
  totalSpent: number;
  popularService: string;
}

interface ServiceHistoryChartProps {
  clientId: string;
}

export default function ServiceHistoryChart({ clientId }: ServiceHistoryChartProps) {
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'trends'>('services');

  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/clients/${clientId}/service-history`);
        const data = await response.json();

        if (response.ok && data.success) {
          setServiceData(data.services || []);
          setMonthlyData(data.monthlyTrends || []);
        }
      } catch (error) {
        console.error('Error fetching service history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchServiceHistory();
    }
  }, [clientId]);

  const getBarWidth = (count: number, maxCount: number): string => {
    if (maxCount === 0) return '0%';
    return `${(count / maxCount) * 100}%`;
  };

  const getServiceColor = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!serviceData.length && !monthlyData.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
          <FaChartBar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Service History</h3>
        <p className="text-gray-600">Your service analytics will appear here after your first visit.</p>
      </div>
    );
  }

  // Safe calculations to avoid division by zero
  const maxServiceCount = serviceData.length > 0 ? Math.max(...serviceData.map(s => s.count)) : 0;
  const totalServicesUsed = serviceData.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <FaChartBar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Service Analytics</h2>
            <p className="text-sm text-gray-600">Visual breakdown of your service preferences</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'services'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaChartPie className="w-4 h-4" />
          Service Breakdown
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'trends'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaChartLine className="w-4 h-4" />
          Monthly Trends
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {serviceData.length > 0 ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FaCut className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Services</p>
                      <p className="text-lg font-bold text-blue-800">{totalServicesUsed}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FaChartBar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Service Types</p>
                      <p className="text-lg font-bold text-green-800">{serviceData.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FaChartLine className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Most Popular</p>
                      <p className="text-lg font-bold text-purple-800">{serviceData[0]?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Usage Chart */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Usage Frequency</h3>
                <div className="space-y-4">
                  {serviceData.map((service, index) => (
                    <div key={`${service.name}-${index}`} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getServiceColor(index)}`}></div>
                          <span className="font-medium text-gray-900">{service.name}</span>
                          {service.category && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {service.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{service.count} times</span>
                          <div className="text-xs text-gray-600">${service.totalSpent.toFixed(2)} total</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getServiceColor(index)}`}
                          style={{ width: getBarWidth(service.count, maxServiceCount) }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Avg: ${service.averagePrice.toFixed(2)}</span>
                        <span>Last used: {new Date(service.lastUsed).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Distribution */}
              {totalServicesUsed > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Service Distribution</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visual pie chart representation */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-48 h-48">
                        <div className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden">
                          {serviceData.slice(0, 4).map((service, index) => {
                            const percentage = (service.count / totalServicesUsed) * 100;
                            const rotation = serviceData.slice(0, index).reduce((sum, s) => sum + (s.count / totalServicesUsed) * 360, 0);
                            
                            return (
                              <div
                                key={`pie-${service.name}-${index}`}
                                className={`absolute inset-0 ${getServiceColor(index)} opacity-80`}
                                style={{
                                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((rotation - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((rotation - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((rotation + percentage * 3.6 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((rotation + percentage * 3.6 - 90) * Math.PI / 180)}%)`
                                }}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3">
                      {serviceData.slice(0, 6).map((service, index) => {
                        const percentage = ((service.count / totalServicesUsed) * 100).toFixed(1);
                        return (
                          <div key={`legend-${service.name}-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded ${getServiceColor(index)}`}></div>
                              <span className="text-sm font-medium text-gray-900">{service.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{percentage}%</div>
                              <div className="text-xs text-gray-600">{service.count} visits</div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {serviceData.length > 6 && (
                        <div className="text-sm text-gray-500 pt-2 border-t">
                          And {serviceData.length - 6} more services...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <FaCut className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Data</h3>
              <p className="text-gray-600">Your service breakdown will appear here after you start using services.</p>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Monthly Trends Header */}
          <div className="flex items-center gap-3 mb-4">
            <FaCalendarAlt className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Monthly Visit Patterns</h3>
          </div>

          {/* Monthly Data */}
          {monthlyData.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={`${month.month}-${index}`} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{month.month}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{month.visits} visits</span>
                      <span>${month.totalSpent.toFixed(2)} spent</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Visits</p>
                      <p className="text-lg font-bold text-blue-600">{month.visits}</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Amount Spent</p>
                      <p className="text-lg font-bold text-green-600">${month.totalSpent.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Popular Service</p>
                      <p className="text-sm font-medium text-purple-600">{month.popularService}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Monthly Data</h3>
              <p className="text-gray-600">Visit trends will appear here as you book more appointments.</p>
            </div>
          )}

          {/* Spending Insights */}
          {monthlyData.length > 0 && serviceData.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">💡 Insights</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Your average monthly visits: {(monthlyData.reduce((sum, m) => sum + m.visits, 0) / monthlyData.length).toFixed(1)}</p>
                <p>• Your average monthly spending: ${(monthlyData.reduce((sum, m) => sum + m.totalSpent, 0) / monthlyData.length).toFixed(2)}</p>
                <p>• Most consistent service: {serviceData[0]?.name || 'Not enough data'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}