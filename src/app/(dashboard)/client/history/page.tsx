'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ClientVisitHistory from '@/components/ui/ClientVisitHistory';
import { FaHistory, FaSpinner } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-4 md:py-6">
      <ClientVisitHistory clientId={session.user.id} />
    </div>
  );
} 