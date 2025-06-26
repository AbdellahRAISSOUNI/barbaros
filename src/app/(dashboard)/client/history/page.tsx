'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ClientVisitHistory from '@/components/ui/ClientVisitHistory';

// Premium Scissor Loading Animation
const ScissorLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="relative">
      {/* Animated Scissors */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 animate-pulse">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="scissorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
            
            {/* Left blade */}
            <g className="animate-spin" style={{ transformOrigin: '24px 32px', animationDuration: '3s' }}>
              <path
                d="M20 20 L28 28 L24 32 L16 24 Z"
                fill="url(#scissorGradient)"
                className="animate-pulse"
              />
              <circle cx="16" cy="20" r="4" fill="url(#scissorGradient)" />
            </g>
            
            {/* Right blade */}
            <g className="animate-spin" style={{ transformOrigin: '40px 32px', animationDuration: '3s', animationDirection: 'reverse' }}>
              <path
                d="M44 20 L36 28 L40 32 L48 24 Z"
                fill="url(#scissorGradient)"
                className="animate-pulse"
              />
              <circle cx="48" cy="20" r="4" fill="url(#scissorGradient)" />
            </g>
            
            {/* Center screw */}
            <circle cx="32" cy="32" r="2" fill="#92400E" />
          </svg>
        </div>
      </div>
      
      {/* Sparkles */}
      <div className="absolute -top-2 -left-2 w-2 h-2 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
      <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute -bottom-2 -left-1 w-1 h-1 bg-amber-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-1 -right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
    </div>
  </div>
);

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <ScissorLoader />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mt-4 mb-2">Loading History...</h2>
          <p className="text-gray-600 text-sm">Please wait while we load your visit history.</p>
        </div>
      </div>
    );
  }

  if (error || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load History</h2>
          <p className="text-gray-600 mb-4 text-sm">{error || 'Please log in to view your visit history.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all transform active:scale-95 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-2 md:px-6 py-2 md:py-6">
      <ClientVisitHistory clientId={session.user.id} />
    </div>
  );
} 