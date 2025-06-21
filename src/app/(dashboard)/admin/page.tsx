'use client';

import { useEffect, useState } from 'react';
import { 
  FaUsers, 
  FaQrcode, 
  FaCut, 
  FaChartLine,
  FaDatabase,
  FaGift,
  FaCalendarAlt
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
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
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
    
    checkDbStatus();
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
          
          {/* Quick Access Cards */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              
              <Link href="/admin/rewards" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-300 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white group-hover:from-red-600 group-hover:to-red-700 transition-all">
                    <FaGift className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Rewards</p>
                    <p className="text-sm text-gray-600">Manage loyalty rewards</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Analytics Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📊 Analytics Preview</h2>
              <button
                onClick={() => setViewMode('analytics')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Full Analytics →
              </button>
            </div>
            
            {/* Basic metrics component here */}
            <DashboardWidgets 
              initialDateRange={{
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              }}
            />
          </div>

          {/* Business Insights */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Today's Business Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-medium text-gray-900">Focus Areas</h4>
                  <p className="text-sm text-gray-600 mt-1">Monitor client retention and service quality</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-medium text-gray-900">Growth Opportunities</h4>
                  <p className="text-sm text-gray-600 mt-1">Expand popular services and reward loyal clients</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-medium text-gray-900">Quick Actions</h4>
                  <p className="text-sm text-gray-600 mt-1">Use the scanner to record visits and redeem rewards</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <DashboardWidgets />
      )}
    </div>
  );
} 