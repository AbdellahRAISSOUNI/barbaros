'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ClientVisitHistory from '@/components/ui/ClientVisitHistory';
import ServiceHistoryChart from '@/components/ui/ServiceHistoryChart';
import { FaHistory, FaChartLine, FaSpinner } from 'react-icons/fa';

export default function VisitHistoryPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
      if (!session?.user?.id) {
        setError('User session not found');
      }
    }
  }, [session, status]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading History...</h2>
          <p className="text-gray-600">Please wait while we load your visit history.</p>
        </div>
      </div>
    );
  }

  if (error || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaHistory className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load History</h2>
          <p className="text-gray-600 mb-4">{error || 'Please log in to view your visit history.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <FaHistory className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Visit History & Analytics</h1>
          <p className="text-gray-600 text-lg">View your complete barbershop visit records, service analytics, and export your data</p>
        </div>
        
        {/* Service Analytics */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <FaChartLine className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Service Analytics</h2>
          </div>
          <ServiceHistoryChart clientId={session.user.id} />
        </div>
        
        {/* Visit History */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <FaHistory className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Visit History</h2>
          </div>
          <ClientVisitHistory clientId={session.user.id} />
        </div>
      </div>
    </div>
  );
} 