'use client';

import { useEffect, useState } from 'react';
import { 
  FaUsers, 
  FaQrcode, 
  FaCut, 
  FaChartLine,
  FaDatabase,
  FaGift,
  FaCalendarAlt,
  FaCalendarCheck,
  FaBell,
  FaClock,
  FaPhone
} from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import DashboardWidgets from '@/components/admin/analytics/DashboardWidgets';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState({ status: 'loading', message: 'Checking connection...', dbName: '' });
  const [viewMode, setViewMode] = useState<'overview' | 'analytics'>('overview');
  const [reservationStats, setReservationStats] = useState<any>(null);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // Check database status
    const checkDbStatus = async () => {
      try {
        const response = await axios.get('/api/db-status');
        if (response.data.connected) {
          setDbStatus({
            status: 'connected',
            message: 'Connected',
            dbName: response.data.data?.databaseName || 'barbaros'
          });
        } else {
          setDbStatus({
            status: 'error',
            message: response.data.message || 'Connection failed',
            dbName: ''
          });
        }
      } catch (error) {
        setDbStatus({
          status: 'error',
          message: 'Failed to connect to database',
          dbName: ''
        });
      }
    };
    
    // Fetch reservation stats
    const fetchReservationStats = async () => {
      try {
        const response = await fetch('/api/reservations/stats');
        if (response.ok) {
          const data = await response.json();
          setReservationStats(data);
        }
      } catch (error) {
        console.error('Error fetching reservation stats:', error);
      }
    };
    
    checkDbStatus();
    fetchReservationStats();
    
    // Poll for new reservations every 30 seconds
    const interval = setInterval(fetchReservationStats, 30000);
    return () => clearInterval(interval);
  }, [status, router]);
  
  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your barbershop's performance and analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {reservationStats && reservationStats.overview.unread > 0 && (
            <Link
              href="/admin/reservations"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg hover:from-red-600 hover:to-pink-600 transition-all"
            >
              <FaBell className="h-4 w-4 animate-pulse" />
              <span className="font-semibold">{reservationStats.overview.unread} New Reservations</span>
            </Link>
          )}
          
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaChartLine className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaCalendarAlt className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* Database Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <FaDatabase className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-800 font-medium">
                  Database Status: 
                  <span className={
                    dbStatus.status === 'connected' ? 'text-green-500 ml-1' : 
                    dbStatus.status === 'loading' ? 'text-yellow-500 ml-1' : 'text-red-500 ml-1'
                  }>{dbStatus.message}</span>
                </p>
                {dbStatus.dbName && (
                  <p className="text-sm text-gray-500">Database: {dbStatus.dbName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Stats */}
          {reservationStats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
                <Link 
                  href="/admin/reservations"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All →
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{reservationStats.overview.pending}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <FaClock className="h-3 w-3" />
                    Pending
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reservationStats.overview.contacted}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <FaPhone className="h-3 w-3" />
                    Contacted
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reservationStats.overview.confirmed}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <FaCalendarCheck className="h-3 w-3" />
                    Confirmed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{reservationStats.overview.today}</div>
                  <div className="text-sm text-gray-600">Today</div>
                </div>
              </div>
              
              {reservationStats.overview.recent24h > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-blue-800 text-sm">
                    <strong>{reservationStats.overview.recent24h}</strong> new reservations in the last 24 hours
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Access Cards */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/admin/reservations" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-orange-300 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white group-hover:from-orange-600 group-hover:to-orange-700 transition-all">
                    <FaCalendarCheck className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Reservations</p>
                    <p className="text-sm text-gray-600">Manage bookings</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/clients" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                    <FaUsers className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Clients</p>
                    <p className="text-sm text-gray-600">Manage client data</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/services" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:from-green-600 group-hover:to-green-700 transition-all">
                    <FaCut className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Services</p>
                    <p className="text-sm text-gray-600">Manage service offerings</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/scanner" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
                    <FaQrcode className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Scanner</p>
                    <p className="text-sm text-gray-600">Scan client QR codes</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Analytics Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">📊 Quick Stats</h2>
              <button
                onClick={() => setViewMode('analytics')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Analytics →
              </button>
            </div>
            <div className="text-center text-gray-500">
              <p>Click "View Analytics" to see detailed charts and metrics</p>
            </div>
          </div>
        </>
      ) : (
        <DashboardWidgets />
      )}
    </div>
  );
} 