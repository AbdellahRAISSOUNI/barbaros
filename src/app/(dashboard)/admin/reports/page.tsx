'use client';

import { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaDownload, 
  FaFilter, 
  FaUsers, 
  FaCut, 
  FaGift, 
  FaDollarSign, 
  FaClock, 
  FaTrophy,
  FaFileExport,
  FaChartBar,
  FaChartPie,
  FaTable,
  FaEye,
  FaSpinner,
  FaSearch,
  FaCalendarCheck,
  FaUserTie,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

interface ReportFilter {
  startDate: string;
  endDate: string;
  reportType: string;
  barber?: string;
  service?: string;
  client?: string;
  format: 'table' | 'chart' | 'export';
}

interface BusinessMetrics {
  totalRevenue: number;
  totalVisits: number;
  totalClients: number;
  averageVisitValue: number;
  clientRetentionRate: number;
  growthRate: number;
}

interface PerformanceReport {
  period: string;
  revenue: number;
  visits: number;
  clients: number;
  averageValue: number;
  trend: 'up' | 'down' | 'stable';
}

interface ServiceReport {
  serviceId: string;
  serviceName: string;
  category: string;
  totalBookings: number;
  totalRevenue: number;
  averagePrice: number;
  growthRate: number;
  marketShare: number;
}

interface ClientAnalytics {
  clientId: string;
  clientName: string;
  totalVisits: number;
  totalSpent: number;
  averageVisitValue: number;
  lastVisit: string;
  loyaltyStatus: string;
  frequency: 'high' | 'medium' | 'low';
}

interface BarberPerformance {
  barberId: string;
  barberName: string;
  totalVisits: number;
  totalRevenue: number;
  uniqueClients: number;
  averageVisitValue: number;
  efficiency: number;
  rating: number;
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'overview',
    format: 'table'
  });

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceReport[]>([]);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([]);
  const [clientAnalytics, setClientAnalytics] = useState<ClientAnalytics[]>([]);
  const [barberPerformance, setBarberPerformance] = useState<BarberPerformance[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [availableBarbers, setAvailableBarbers] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
    fetchFilterOptions();
  }, [filters.startDate, filters.endDate, filters.reportType]);

  const fetchFilterOptions = async () => {
    try {
      // Fetch barbers
      const barbersResponse = await fetch('/api/admin/barbers');
      const barbersData = await barbersResponse.json();
      if (barbersData.success) {
        setAvailableBarbers(barbersData.barbers || []);
      }

      // Fetch services
      const servicesResponse = await fetch('/api/services');
      const servicesData = await servicesResponse.json();
      if (servicesData.success) {
        setAvailableServices(servicesData.services || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.barber && { barber: filters.barber }),
        ...(filters.service && { service: filters.service }),
        ...(filters.client && { client: filters.client })
      });

      // Fetch different data based on report type
      switch (filters.reportType) {
        case 'overview':
          await fetchOverviewData(params);
          break;
        case 'financial':
          await fetchFinancialData(params);
          break;
        case 'services':
          await fetchServicesData(params);
          break;
        case 'clients':
          await fetchClientsData(params);
          break;
        case 'barbers':
          await fetchBarbersData(params);
          break;
        case 'loyalty':
          await fetchLoyaltyData(params);
          break;
        default:
          await fetchOverviewData(params);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOverviewData = async (params: URLSearchParams) => {
    // Fetch overview analytics
    const overviewResponse = await fetch(`/api/admin/analytics/overview?${params}`);
    const overviewData = await overviewResponse.json();
    
    if (overviewData.success) {
      setBusinessMetrics({
        totalRevenue: overviewData.metrics.totalRevenue,
        totalVisits: overviewData.metrics.totalVisits,
        totalClients: overviewData.metrics.totalClients,
        averageVisitValue: overviewData.metrics.averageVisitValue,
        clientRetentionRate: 85.5, // Mock data
        growthRate: overviewData.metrics.revenueGrowthPercentage
      });
    }

    // Fetch growth data for performance chart
    const growthResponse = await fetch(`/api/admin/analytics/client-growth?${params}&period=weekly`);
    const growthData = await growthResponse.json();
    
    if (growthData.success) {
      const performanceReports = growthData.growthData.map((item: any, index: number) => ({
        period: item.date,
        revenue: item.newClients * 45, // Mock calculation
        visits: item.newClients * 2.3, // Mock calculation
        clients: item.newClients,
        averageValue: 45,
        trend: index > 0 && item.newClients > growthData.growthData[index - 1]?.newClients ? 'up' : 
               index > 0 && item.newClients < growthData.growthData[index - 1]?.newClients ? 'down' : 'stable'
      }));
      setPerformanceData(performanceReports);
    }
  };

  const fetchFinancialData = async (params: URLSearchParams) => {
    try {
      const response = await fetch(`/api/admin/reports/financial?${params}&period=weekly`);
      const data = await response.json();
      
      if (data.success) {
        setPerformanceData(data.data);
      } else {
        console.error('Failed to fetch financial data:', data.message);
        // Fallback to empty data
        setPerformanceData([]);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setPerformanceData([]);
    }
  };

  const fetchServicesData = async (params: URLSearchParams) => {
    const response = await fetch(`/api/admin/analytics/service-popularity?${params}&sortBy=revenue`);
    const data = await response.json();
    
    if (data.success) {
      const serviceReports = data.services.map((service: any) => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        category: service.category || 'General',
        totalBookings: service.totalBookings,
        totalRevenue: service.totalRevenue,
        averagePrice: service.averagePrice,
        growthRate: service.trendPercentage || 0,
        marketShare: service.marketShare || (service.totalBookings / data.summary.totalBookings * 100)
      }));
      setServiceReports(serviceReports);
    }
  };

  const fetchClientsData = async (params: URLSearchParams) => {
    try {
      const response = await fetch(`/api/admin/reports/clients?${params}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        const formattedClientData = data.data.map((client: any) => ({
          ...client,
          lastVisit: client.lastVisit.split('T')[0] // Format date for display
        }));
        setClientAnalytics(formattedClientData);
      } else {
        console.error('Failed to fetch client analytics:', data.message);
        setClientAnalytics([]);
      }
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      setClientAnalytics([]);
    }
  };

  const fetchBarbersData = async (params: URLSearchParams) => {
    try {
      const response = await fetch(`/api/admin/reports/barbers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBarberPerformance(data.data);
      } else {
        console.error('Failed to fetch barber performance:', data.message);
        setBarberPerformance([]);
      }
    } catch (error) {
      console.error('Error fetching barber performance:', error);
      setBarberPerformance([]);
    }
  };

  const fetchLoyaltyData = async (params: URLSearchParams) => {
    // Fetch loyalty statistics
    const response = await fetch(`/api/loyalty/statistics?${params}`);
    const data = await response.json();
    
    if (data.success) {
      // Process loyalty data
      setBusinessMetrics(prev => prev ? {
        ...prev,
        clientRetentionRate: data.statistics.memberRetentionRate
      } : null);
    }
  };

  const handleFilterChange = (field: keyof ReportFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        format,
        reportType: filters.reportType
      });

      const response = await fetch(`/api/admin/reports/export?${params}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barbaros-${filters.reportType}-report-${filters.startDate}-to-${filters.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <FaArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <FaEquals className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const badges = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return badges[frequency as keyof typeof badges] || badges.low;
  };

  const reportTypes = [
    { value: 'overview', label: 'Business Overview', icon: FaChartLine },
    { value: 'financial', label: 'Financial Performance', icon: FaDollarSign },
    { value: 'services', label: 'Service Analytics', icon: FaCut },
    { value: 'clients', label: 'Client Analysis', icon: FaUsers },
    { value: 'barbers', label: 'Barber Performance', icon: FaUserTie },
    { value: 'loyalty', label: 'Loyalty Program', icon: FaGift }
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportReport('pdf')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <FaFileExport className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button
            onClick={() => exportReport('excel')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <FaTable className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Report Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Format</label>
            <select
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="table">Table View</option>
              <option value="chart">Chart View</option>
              <option value="export">Export Only</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        {(filters.reportType === 'services' || filters.reportType === 'barbers') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filters.reportType === 'barbers' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Barber</label>
                <select
                  value={filters.barber || ''}
                  onChange={(e) => handleFilterChange('barber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Barbers</option>
                  {availableBarbers.map(barber => (
                    <option key={barber._id} value={barber._id}>{barber.name}</option>
                  ))}
                </select>
              </div>
            )}

            {filters.reportType === 'services' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Service</label>
                <select
                  value={filters.service || ''}
                  onChange={(e) => handleFilterChange('service', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Services</option>
                  {availableServices.map(service => (
                    <option key={service._id} value={service._id}>{service.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-lg text-gray-600">Loading report data...</span>
        </div>
      )}

      {/* Business Metrics Overview */}
      {!isLoading && businessMetrics && filters.reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(businessMetrics.growthRate > 0 ? 'up' : businessMetrics.growthRate < 0 ? 'down' : 'stable')}
                <span className={`text-sm font-medium ${businessMetrics.growthRate > 0 ? 'text-green-600' : businessMetrics.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {Math.abs(businessMetrics.growthRate).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(businessMetrics.totalRevenue)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{businessMetrics.totalVisits.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Visits</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{businessMetrics.totalClients.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaClock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(businessMetrics.averageVisitValue)}</p>
              <p className="text-sm text-gray-600">Avg Visit Value</p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Overview Metrics */}
      {!isLoading && businessMetrics && filters.reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FaGift className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Client Retention</h3>
                <p className="text-sm text-gray-600">Loyalty program performance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Retention Rate</span>
                <span className="text-lg font-bold text-gray-900">{businessMetrics.clientRetentionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${businessMetrics.clientRetentionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaTrophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
                <p className="text-sm text-gray-600">Key business indicators</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Trend</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(businessMetrics.growthRate > 0 ? 'up' : businessMetrics.growthRate < 0 ? 'down' : 'stable')}
                  <span className={`text-sm font-medium ${businessMetrics.growthRate > 0 ? 'text-green-600' : businessMetrics.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {businessMetrics.growthRate > 0 ? 'Growing' : businessMetrics.growthRate < 0 ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue per Client</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(businessMetrics.totalClients > 0 ? businessMetrics.totalRevenue / businessMetrics.totalClients : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      {!isLoading && performanceData.length > 0 && filters.format !== 'export' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <div className="flex items-center gap-2">
              <FaChartLine className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Period Analysis</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.trend)}
                    <span className="font-medium text-gray-900">{item.period}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{item.visits}</p>
                    <p className="text-xs text-gray-600">Visits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{item.clients}</p>
                    <p className="text-xs text-gray-600">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(item.averageValue)}</p>
                    <p className="text-xs text-gray-600">Avg Value</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Reports */}
      {!isLoading && filters.reportType === 'services' && serviceReports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Service Performance Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceReports.map((service, index) => (
                  <tr key={service.serviceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{service.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.totalBookings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(service.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(service.averagePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(service.growthRate > 0 ? 'up' : service.growthRate < 0 ? 'down' : 'stable')}
                        <span className={`text-sm font-medium ${service.growthRate > 0 ? 'text-green-600' : service.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {Math.abs(service.growthRate).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.marketShare.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client Analytics */}
      {!isLoading && filters.reportType === 'clients' && clientAnalytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Client Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientAnalytics.map((client) => (
                  <tr key={client.clientId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{client.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.totalVisits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(client.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(client.averageVisitValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(client.lastVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        {client.loyaltyStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrequencyBadge(client.frequency)}`}>
                        {client.frequency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barber Performance */}
      {!isLoading && filters.reportType === 'barbers' && barberPerformance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Barber Performance Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barber</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {barberPerformance.map((barber) => (
                  <tr key={barber.barberId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{barber.barberName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {barber.totalVisits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(barber.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {barber.uniqueClients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(barber.averageVisitValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${barber.efficiency}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{barber.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FaTrophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-900">{barber.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (
        (filters.reportType === 'services' && serviceReports.length === 0) ||
        (filters.reportType === 'clients' && clientAnalytics.length === 0) ||
        (filters.reportType === 'barbers' && barberPerformance.length === 0)
      ) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaChartBar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No data found for the selected period and filters. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
} 