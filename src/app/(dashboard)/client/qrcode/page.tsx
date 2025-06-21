'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';

export default function QRCodePage() {
  const { data: session } = useSession();
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch the client data from the API
        // For now, we'll just use the user ID from the session
        setClientId(session.user.id);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load your QR code. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !clientId) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error || 'Unable to load QR code'}</div>
        <button 
          onClick={() => setIsLoading(true)}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your QR Code</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Show this QR code to your barber when you visit
          </p>
        </div>
        
        <QRCodeDisplay 
          clientId={clientId}
          clientName={session?.user?.name || undefined}
          showDownload={true}
          showShare={true}
          className="mb-6"
        />
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>This QR code is unique to your account.</p>
          <p>Please don't share it with others.</p>
        </div>
      </div>
    </div>
  );
} 