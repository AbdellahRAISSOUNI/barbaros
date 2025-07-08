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
  FaEquals,
  FaPercentage,
  FaStopwatch,
  FaMapMarkerAlt,
  FaBookmark,
  FaStar,
  FaHistory,
  FaHandshake,
  FaCoins,
  FaBolt,
  FaHeart,
  FaSync,
  FaExpand,
  FaCompress,
  FaChartArea,
  FaBusinessTime,
  FaMoneyCheckAlt,
  FaUserCheck,
  FaCalendarWeek,
  FaLayerGroup,
  FaCrown
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { format, subDays, subMonths, subWeeks } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReportFilter {
  startDate: string;
  endDate: string;
  reportType: string;
  barber?: string;
  service?: string;
  client?: string;
  format: 'dashboard' | 'chart' | 'table';
  period: 'daily' | 'weekly' | 'monthly';
  comparison: boolean;
}

interface AnalyticsData {
  overview: any;
  retention: any;
  performance: any;
  reservations: any;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  description: string;
}

export default function AdvancedReportsPage() {
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reportType: 'overview',
    format: 'dashboard',
    period: 'daily',
    comparison: true
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: null,
    retention: null,
    performance: null,
    reservations: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [availableBarbers, setAvailableBarbers] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [expandedView, setExpandedView] = useState<string | null>(null);

  // Quick date presets
  const datePresets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last year', days: 365 }
  ];

  useEffect(() => {
    fetchAllData();
    fetchFilterOptions();
  }, [filters.startDate, filters.endDate, filters.period]);

  const fetchFilterOptions = async () => {
    try {
      const [barbersResponse, servicesResponse] = await Promise.all([
        fetch('/api/admin/barbers'),
        fetch('/api/services')
      ]);

      const [barbersData, servicesData] = await Promise.all([
        barbersResponse.json(),
        servicesResponse.json()
      ]);

      if (barbersData.success) setAvailableBarbers(barbersData.barbers || []);
      if (servicesData.success) setAvailableServices(servicesData.services || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period
      });

      const [overviewResponse, retentionResponse, performanceResponse, reservationsResponse] = await Promise.all([
        fetch(`/api/admin/analytics/overview?${params}`),
        fetch(`/api/admin/analytics/client-retention?${params}`),
        fetch(`/api/admin/analytics/performance-trends?${params}`),
        fetch(`/api/admin/analytics/reservation-analytics?${params}`)
      ]);

      const [overview, retention, performance, reservations] = await Promise.all([
        overviewResponse.json(),
        retentionResponse.json(),
        performanceResponse.json(),
        reservationsResponse.json()
      ]);

      setAnalyticsData({
        overview: overview.success ? overview.metrics : null,
        retention: retention.success ? retention.data : null,
        performance: performance.success ? performance.data : null,
        reservations: reservations.success ? reservations.data : null
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: keyof ReportFilter, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDatePreset = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    setFilters(prev => ({
      ...prev,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }));
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        reportType: filters.reportType,
        format,
        period: filters.period,
        comparison: filters.comparison.toString(),
        ...(filters.barber && { barber: filters.barber }),
        ...(filters.service && { service: filters.service }),
        ...(filters.client && { client: filters.client })
      });

      const response = await fetch(`/api/admin/reports/export?${params}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barbaros-${filters.reportType}-report-${filters.startDate}-to-${filters.endDate}.${format === 'excel' ? 'xlsx' : format}`;
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
    return new Intl.NumberFormat('en-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <FaArrowUp className="w-3 h-3 text-green-600" />;
    if (change < 0) return <FaArrowDown className="w-3 h-3 text-red-600" />;
    return <FaEquals className="w-3 h-3 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMetricCards = (): MetricCard[] => {
    if (!analyticsData.overview) return [];

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(analyticsData.overview.totalRevenue || 0),
        change: analyticsData.overview.revenueGrowthPercentage || 0,
        icon: FaMoneyCheckAlt,
        color: 'bg-emerald-500',
        description: 'Total revenue for the period'
      },
      {
        title: 'Total Visits',
        value: (analyticsData.overview.totalVisits || 0).toLocaleString(),
        change: analyticsData.overview.visitGrowthPercentage || 0,
        icon: FaCalendarCheck,
        color: 'bg-blue-500',
        description: 'Total visits in the period'
      },
      {
        title: 'Active Clients',
        value: (analyticsData.overview.activeClients || 0).toLocaleString(),
        change: analyticsData.overview.activeClientGrowthPercentage || 0,
        icon: FaUserCheck,
        color: 'bg-purple-500',
        description: 'Clients who visited in this period'
      },
      {
        title: 'Client Loyalty',
        value: `${analyticsData.overview.clientRetentionRate || 0}%`,
        change: 0, // Would need historical data for comparison
        icon: FaHeart,
        color: 'bg-pink-500',
        description: 'Percentage of returning clients'
      },
      {
        title: 'Average Visit Value',
        value: formatCurrency(analyticsData.overview.averageVisitValue || 0),
        change: 0,
        icon: FaCoins,
        color: 'bg-amber-500',
        description: 'Average amount spent per visit'
      },
      {
        title: 'New Clients',
        value: (analyticsData.overview.newClientsThisMonth || 0).toLocaleString(),
        change: analyticsData.overview.clientGrowthPercentage || 0,
        icon: FaUserTie,
        color: 'bg-indigo-500',
        description: 'New clients acquired'
      },
      {
        title: 'Loyalty Members',
        value: `${analyticsData.overview.loyaltyMembersCount || 0}`,
        change: 0,
        icon: FaCrown,
        color: 'bg-orange-500',
        description: 'Active loyalty program members'
      },
      {
        title: 'Rewards Redeemed',
        value: (analyticsData.overview.rewardsRedeemed || 0).toLocaleString(),
        change: 0,
        icon: FaGift,
        color: 'bg-red-500',
        description: 'Rewards redeemed in period'
      }
    ];
  };

  const getRevenueChartData = () => {
    if (!analyticsData.performance?.timeSeries) return null;

    return {
      labels: analyticsData.performance.timeSeries.map((item: any) => 
        format(new Date(item.date), 'MMM dd')
      ),
      datasets: [
        {
          label: 'Revenue (MAD)',
          data: analyticsData.performance.timeSeries.map((item: any) => item.revenue),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }
      ]
    };
  };

  const getServiceDistributionData = () => {
    if (!analyticsData.performance?.servicePerformance) return null;

    const topServices = analyticsData.performance.servicePerformance.slice(0, 6);
    return {
      labels: topServices.map((item: any) => item.name),
      datasets: [{
        data: topServices.map((item: any) => item.bookings),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    };
  };

  const getServicePerformanceData = () => {
    if (!analyticsData.performance?.servicePerformance) return null;

    return {
      labels: analyticsData.performance.servicePerformance.slice(0, 8).map((item: any) => item.name),
      datasets: [{
        label: 'Revenue (MAD)',
        data: analyticsData.performance.servicePerformance.slice(0, 8).map((item: any) => item.revenue),
        backgroundColor: 'rgba(124, 58, 237, 0.8)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(124, 58, 237, 0.9)'
      }]
    };
  };

  const renderMetricCards = () => {
    const metrics = getMetricCards();

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-xl ${metric.color.replace('bg-', 'bg-opacity-20 bg-')} shadow-sm`}>
                  <IconComponent className={`w-6 h-6 ${metric.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.change)}
                  <span className={`text-sm font-semibold ${getTrendColor(metric.change)}`}>
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
              </div>
        <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
        </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCharts = () => {
    const revenueData = getRevenueChartData();
    const serviceDistributionData = getServiceDistributionData();
    const serviceData = getServicePerformanceData();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trends Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FaChartLine className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            </div>
          <button
              onClick={() => setExpandedView(expandedView === 'revenue' ? null : 'revenue')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              {expandedView === 'revenue' ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
          </button>
        </div>
          {revenueData && (
            <div className={`${expandedView === 'revenue' ? 'h-96' : 'h-64'} transition-all`}>
              <Line 
                data={revenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Revenue (MAD)', font: { weight: 'bold' } },
                      grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                      grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    }
                  },
                  plugins: {
                    legend: { display: true, position: 'top' }
                  }
                }}
              />
      </div>
          )}
        </div>
        
        {/* Service Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaChartPie className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Service Distribution</h3>
            </div>
            <button
              onClick={() => setExpandedView(expandedView === 'distribution' ? null : 'distribution')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              {expandedView === 'distribution' ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </button>
          </div>
          {serviceDistributionData && (
            <div className={`${expandedView === 'distribution' ? 'h-96' : 'h-64'} transition-all`}>
              <Doughnut 
                data={serviceDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { padding: 20 } }
                  }
                }}
            />
          </div>
          )}
          </div>

        {/* Service Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaChartBar className="w-5 h-5 text-purple-600" />
          </div>
              <h3 className="text-lg font-semibold text-gray-900">Top Services by Revenue</h3>
        </div>
            <button
              onClick={() => setExpandedView(expandedView === 'services' ? null : 'services')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              {expandedView === 'services' ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </button>
              </div>
          {serviceData && (
            <div className={`${expandedView === 'services' ? 'h-96' : 'h-64'} transition-all`}>
              <Bar 
                data={serviceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Revenue (MAD)', font: { weight: 'bold' } },
                      grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
          </div>
        )}
      </div>

        {/* Barber Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaCut className="w-5 h-5 text-orange-600" />
        </div>
            <h3 className="text-lg font-semibold text-gray-900">Top Barber Performance</h3>
              </div>
          <div className="space-y-4">
            {analyticsData.performance?.barberPerformance?.filter((barber: any) => 
              barber.name && 
              barber.name.toLowerCase() !== 'admin' && 
              !barber.name.toLowerCase().includes('current')
            ).slice(0, 5).map((barber: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                    'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}>
                    {index + 1}
            </div>
            <div>
                    <p className="font-semibold text-gray-900">{barber.name}</p>
                    <p className="text-sm text-gray-600">{barber.visits} visits • {barber.uniqueClients} clients</p>
            </div>
          </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(barber.revenue)}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(barber.averageValue)} avg</p>
              </div>
            </div>
            ))}
            </div>
          </div>
      </div>
    );
  };

  const renderReservationAnalytics = () => {
    if (!analyticsData.reservations) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FaCalendarWeek className="w-5 h-5 text-indigo-600" />
              </div>
          <h3 className="text-lg font-semibold text-gray-900">Reservation Analytics</h3>
            </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="p-3 bg-blue-500 rounded-lg w-fit mx-auto mb-3 shadow-sm">
              <FaBookmark className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.reservations.overview.totalReservations}</p>
            <p className="text-sm font-medium text-gray-700">Total Reservations</p>
            <p className="text-xs text-gray-500 mt-1">All reservation requests</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="p-3 bg-green-500 rounded-lg w-fit mx-auto mb-3 shadow-sm">
              <FaPercentage className="w-6 h-6 text-white" />
              </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.reservations.overview.conversionRate}%</p>
            <p className="text-sm font-medium text-gray-700">Conversion Rate</p>
            <p className="text-xs text-gray-500 mt-1">Reservations to visits</p>
            </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
            <div className="p-3 bg-yellow-500 rounded-lg w-fit mx-auto mb-3 shadow-sm">
              <FaStopwatch className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.reservations.responseTime.average}h</p>
            <p className="text-sm font-medium text-gray-700">Avg Response Time</p>
            <p className="text-xs text-gray-500 mt-1">Time to confirm reservations</p>
          </div>
        </div>

        {/* Weekly Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FaCalendarWeek className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">Popular Days</h4>
            </div>
            <div className="space-y-3">
              {analyticsData.reservations.weeklyPatterns?.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <span className="text-sm font-semibold text-gray-900">{day.day}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{day.reservations} reservations</span>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{day.conversionRate}%</span>
              </div>
              </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">Popular Time Slots</h4>
            </div>
            <div className="space-y-3">
              {analyticsData.reservations.timeSlots?.slice(0, 5).map((slot: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <span className="text-sm font-semibold text-gray-900">{slot.time}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{slot.reservations} bookings</span>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{slot.conversionRate}%</span>
                </div>
              </div>
              ))}
              </div>
            </div>
          </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FaChartArea className="w-6 h-6 text-white" />
                  </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance insights</p>
                </div>
                  </div>
                  </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportReport('pdf')}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              <FaFileExport className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={() => exportReport('excel')}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              <FaTable className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
                  </div>
                  </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaFilter className="w-5 h-5 text-indigo-600" />
                </div>
            <h2 className="text-lg font-semibold text-gray-900">Advanced Filters & Configuration</h2>
              </div>
          
          {/* Quick Date Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Quick Date Ranges</label>
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleDatePreset(preset.days)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all border border-gray-300 hover:shadow-sm"
                >
                  {preset.label}
                </button>
            ))}
          </div>
        </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
              />
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
              />
                      </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
              >
                <option value="overview">Business Overview</option>
                <option value="financial">Financial Performance</option>
                <option value="services">Service Analytics</option>
                <option value="clients">Client Analysis</option>
                <option value="barbers">Barber Performance</option>
                <option value="loyalty">Loyalty Program</option>
              </select>
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Format</label>
              <select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
              >
                <option value="dashboard">Dashboard</option>
                <option value="chart">Charts Only</option>
                <option value="table">Tables Only</option>
              </select>
          </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.comparison}
                  onChange={(e) => handleFilterChange('comparison', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show Comparisons</span>
              </label>
                        </div>
                      </div>
                      </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <span className="text-lg text-gray-600">Loading analytics data...</span>
          </div>
        </div>
      )}

        {/* Dashboard Content */}
        {!isLoading && analyticsData.overview && (
          <>
            {/* Metric Cards */}
            {filters.format === 'dashboard' && renderMetricCards()}

            {/* Charts Section */}
            {(filters.format === 'dashboard' || filters.format === 'chart') && renderCharts()}

            {/* Reservation Analytics */}
            {filters.format === 'dashboard' && renderReservationAnalytics()}

            {/* Detailed Tables Section */}
            {filters.format === 'table' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <FaTable className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics Tables</h3>
                <p className="text-gray-600">Export to Excel or PDF for detailed tabular data analysis.</p>
        </div>
            )}
          </>
      )}
      </div>
    </div>
  );
} 